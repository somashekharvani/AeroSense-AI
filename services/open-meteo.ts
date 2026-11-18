import { z } from 'zod';
import { CriteriaPollutants, WeatherHour } from '@/lib/validation/schemas';

export interface OpenMeteoAtmosphereHour extends WeatherHour {
  hourIndex: number;
}

export interface OpenMeteoAirHour {
  timestamp: string;
  hourIndex: number;
  pm25: number;
  pm10: number;
  coMgM3: number; // Converted from µg/m³
  coRawUgM3: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface OpenMeteoClientResult {
  ok: boolean;
  weatherHours?: OpenMeteoAtmosphereHour[];
  currentWeather?: OpenMeteoAtmosphereHour;
  airHours?: OpenMeteoAirHour[];
  currentAir?: OpenMeteoAirHour;
  surfaceElevationM?: number;
  error?: string;
  fetchedAt: string;
  source: 'Open-Meteo European Weather & Atmospheric CAMS Model';
}

const OpenMeteoWeatherResponseSchema = z.object({
  elevation: z.number().default(0),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    wind_direction_10m: z.array(z.number()),
    cloud_cover: z.array(z.number()),
    boundary_layer_height: z.array(z.number()),
    temperature_925hPa: z.array(z.number().nullable().optional()).optional(),
    temperature_925hpa: z.array(z.number().nullable().optional()).optional(),
    geopotential_height_925hPa: z.array(z.number().nullable().optional()).optional(),
    geopotential_height_925hpa: z.array(z.number().nullable().optional()).optional(),
    temperature_850hPa: z.array(z.number().nullable().optional()).optional(),
    temperature_850hpa: z.array(z.number().nullable().optional()).optional(),
    geopotential_height_850hPa: z.array(z.number().nullable().optional()).optional(),
    geopotential_height_850hpa: z.array(z.number().nullable().optional()).optional(),
  }),
});

const OpenMeteoAirResponseSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.number().nullable().optional()),
    pm10: z.array(z.number().nullable().optional()),
    carbon_monoxide: z.array(z.number().nullable().optional()),
    nitrogen_dioxide: z.array(z.number().nullable().optional()),
    sulphur_dioxide: z.array(z.number().nullable().optional()),
    ozone: z.array(z.number().nullable().optional()),
  }),
});

async function fetchWithRetry(url: string, retries = 1, timeoutMs = 8000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      if (attempt === retries) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      // Exponential backoff
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw new Error('Fetch failed after retries');
}

/**
 * Fetches real atmospheric profile and air quality model data from Open-Meteo
 */
export async function fetchOpenMeteoData(
  lat: number,
  lon: number
): Promise<OpenMeteoClientResult> {
  const fetchedAt = new Date().toISOString();
  const source = 'Open-Meteo European Weather & Atmospheric CAMS Model';

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,boundary_layer_height,temperature_925hPa,geopotential_height_925hPa,temperature_850hPa,geopotential_height_850hPa&timezone=auto&past_days=1&forecast_days=3`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto&past_days=1&forecast_days=3`;

    const [weatherRes, airRes] = await Promise.all([
      fetchWithRetry(weatherUrl),
      fetchWithRetry(airUrl),
    ]);

    const weatherJson = await weatherRes.json();
    const airJson = await airRes.json();

    const parsedWeather = OpenMeteoWeatherResponseSchema.parse(weatherJson);
    const parsedAir = OpenMeteoAirResponseSchema.parse(airJson);

    const wHourly = parsedWeather.hourly;
    const aHourly = parsedAir.hourly;
    const elevation = parsedWeather.elevation;

    const weatherHours: OpenMeteoAtmosphereHour[] = [];
    const airHours: OpenMeteoAirHour[] = [];

    const len = Math.min(wHourly.time.length, aHourly.time.length);

    const temp925Arr = wHourly.temperature_925hPa || wHourly.temperature_925hpa;
    const hgt925Arr = wHourly.geopotential_height_925hPa || wHourly.geopotential_height_925hpa;
    const temp850Arr = wHourly.temperature_850hPa || wHourly.temperature_850hpa;
    const hgt850Arr = wHourly.geopotential_height_850hPa || wHourly.geopotential_height_850hpa;

    for (let i = 0; i < len; i++) {
      const timeStr = wHourly.time[i];

      weatherHours.push({
        hourIndex: i,
        timestamp: timeStr,
        temperature2m: wHourly.temperature_2m[i] ?? 20,
        relativeHumidity: wHourly.relative_humidity_2m[i] ?? 50,
        windSpeed10m: wHourly.wind_speed_10m[i] ?? 5,
        windDirection10m: wHourly.wind_direction_10m[i] ?? 0,
        cloudCover: wHourly.cloud_cover[i] ?? 0,
        boundaryLayerHeight: wHourly.boundary_layer_height[i] ?? 500,
        surfaceElevation: elevation,
        pressure925Temp: temp925Arr?.[i] ?? null,
        pressure925Height: hgt925Arr?.[i] ?? null,
        pressure850Temp: temp850Arr?.[i] ?? null,
        pressure850Height: hgt850Arr?.[i] ?? null,
      });

      const rawCoUg = aHourly.carbon_monoxide?.[i] ?? 1000;
      // Unit Conversion: CO in Open-Meteo is µg/m³; CPCB expects mg/m³
      const coMg = Math.round((rawCoUg / 1000) * 100) / 100;

      airHours.push({
        hourIndex: i,
        timestamp: timeStr,
        pm25: aHourly.pm2_5?.[i] ?? 0,
        pm10: aHourly.pm10?.[i] ?? 0,
        coRawUgM3: rawCoUg,
        coMgM3: coMg,
        no2: aHourly.nitrogen_dioxide?.[i] ?? 0,
        so2: aHourly.sulphur_dioxide?.[i] ?? 0,
        o3: aHourly.ozone?.[i] ?? 0,
      });
    }

    // Identify current index based on local hour or nearest index
    const now = new Date();
    let currentIdx = weatherHours.findIndex((h) => new Date(h.timestamp) >= now);
    if (currentIdx === -1) currentIdx = Math.max(0, weatherHours.length - 1);

    return {
      ok: true,
      weatherHours,
      currentWeather: weatherHours[currentIdx],
      airHours,
      currentAir: airHours[currentIdx],
      surfaceElevationM: elevation,
      fetchedAt,
      source,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Failed to fetch Open-Meteo data',
      fetchedAt,
      source,
    };
  }
}
