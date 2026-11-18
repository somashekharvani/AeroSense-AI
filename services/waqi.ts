import { z } from 'zod';
import { CriteriaPollutants } from '@/lib/validation/schemas';

export interface WaqiStationData {
  stationId: number;
  stationName: string;
  lat: number;
  lon: number;
  distanceKm?: number;
  aqi: number;
  dominantPollutant: string;
  pollutants: CriteriaPollutants;
  timestamp: string;
  attributions: Array<{ name: string; url: string }>;
}

export interface WaqiClientResult {
  ok: boolean;
  station?: WaqiStationData;
  nearbyStations?: WaqiStationData[];
  error?: string;
  fetchedAt: string;
  source: 'WAQI CPCB Ground Station Telemetry';
}

const WaqiFeedResponseSchema = z.object({
  status: z.string(),
  data: z.union([
    z.string(), // e.g. "Unknown station"
    z.object({
      idx: z.number(),
      aqi: z.number(),
      city: z.object({
        name: z.string(),
        geo: z.array(z.number()),
        url: z.string().optional(),
      }),
      dominentpol: z.string().optional().default('pm25'),
      iaqi: z.record(z.string(), z.object({ v: z.number() })).optional().default({}),
      time: z.object({
        iso: z.string().optional(),
        s: z.string().optional(),
      }),
      attributions: z.array(z.object({ name: z.string(), url: z.string() })).optional().default([]),
    }),
  ]),
});

/**
 * Calculates Haversine distance in kilometers between two lat/lon coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fetches nearest ground monitoring station from WAQI
 */
export async function fetchWaqiStationData(
  lat: number,
  lon: number,
  customToken?: string
): Promise<WaqiClientResult> {
  const fetchedAt = new Date().toISOString();
  const source = 'WAQI CPCB Ground Station Telemetry';
  const token = customToken || process.env.WAQI_TOKEN;

  if (!token) {
    return {
      ok: false,
      error: 'WAQI_TOKEN is not configured in environment variables',
      fetchedAt,
      source,
    };
  }

  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`WAQI API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const parsed = WaqiFeedResponseSchema.parse(json);

    if (parsed.status !== 'ok' || typeof parsed.data === 'string') {
      return {
        ok: false,
        error: typeof parsed.data === 'string' ? parsed.data : 'WAQI returned status error',
        fetchedAt,
        source,
      };
    }

    const data = parsed.data;
    const stationLat = data.city.geo[0];
    const stationLon = data.city.geo[1];
    const dist = calculateDistanceKm(lat, lon, stationLat, stationLon);

    const iaqi = data.iaqi;
    const pollutants: CriteriaPollutants = {
      pm25: iaqi.pm25?.v ?? null,
      pm10: iaqi.pm10?.v ?? null,
      no2: iaqi.no2?.v ?? null,
      so2: iaqi.so2?.v ?? null,
      co: iaqi.co?.v ?? null, // In WAQI feed, CO is reported in mg/m3 or sub-index
      o3: iaqi.o3?.v ?? null,
    };

    const stationData: WaqiStationData = {
      stationId: data.idx,
      stationName: data.city.name,
      lat: stationLat,
      lon: stationLon,
      distanceKm: dist,
      aqi: data.aqi,
      dominantPollutant: data.dominentpol,
      pollutants,
      timestamp: data.time.iso || data.time.s || fetchedAt,
      attributions: data.attributions,
    };

    return {
      ok: true,
      station: stationData,
      fetchedAt,
      source,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Failed to connect to WAQI station service',
      fetchedAt,
      source,
    };
  }
}
