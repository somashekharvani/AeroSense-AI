import { NextRequest, NextResponse } from 'next/server';
import { LocationQuerySchema, roundCoordinate } from '@/lib/validation/location';
import { checkRateLimit } from '@/lib/security/rate-limit';
import globalCache, { CACHE_TTL } from '@/lib/caching/cache';
import { fetchOpenMeteoData } from '@/services/open-meteo';
import { fetchWaqiStationData } from '@/services/waqi';
import { fetchNasaFirmsFires } from '@/services/nasa-firms';
import { fuseAirData } from '@/lib/fusion';
import { calculateIndianAqi } from '@/engines/indian-aqi';
import { calculateInversionRisk } from '@/engines/inversion';
import { calculateIncidentView } from '@/engines/incident';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded. Please retry in a few moments.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get('lat') ?? '28.61';
  const rawLon = searchParams.get('lon') ?? '77.21';
  const lang = searchParams.get('lang') ?? 'en';

  const parseResult = LocationQuerySchema.safeParse({ lat: rawLat, lon: rawLon, lang });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid Coordinates', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const lat = parseResult.data.lat;
  const lon = parseResult.data.lon;

  const cacheKey = `snapshot:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = globalCache.get<any>(cacheKey);

  // If cached and fresh, return immediately
  if (cached.exists && !cached.isStale && cached.data) {
    return NextResponse.json(cached.data, {
      headers: {
        'X-Cache': 'HIT',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  }

  try {
    // Concurrent fetch from providers
    const [openMeteoRes, waqiRes, firmsRes] = await Promise.all([
      fetchOpenMeteoData(lat, lon),
      fetchWaqiStationData(lat, lon),
      fetchNasaFirmsFires(lat, lon, 1.2),
    ]);

    // Data Fusion
    const stations = waqiRes.ok && waqiRes.station ? [waqiRes.station] : [];
    const fusedAir = fuseAirData({
      targetLat: lat,
      targetLon: lon,
      modelAir: openMeteoRes.currentAir,
      stations,
    });

    // Indian CPCB NAQI calculation
    const indianAqi = calculateIndianAqi(fusedAir.pollutants);

    // Inversion Risk Engine
    const currentW = openMeteoRes.currentWeather;
    const localHour = currentW ? new Date(currentW.timestamp).getHours() : new Date().getHours();

    const inversionRisk = calculateInversionRisk({
      surfaceTempC: currentW?.temperature2m ?? 18,
      surfaceElevationM: openMeteoRes.surfaceElevationM ?? 200,
      boundaryLayerHeightM: currentW?.boundaryLayerHeight ?? 400,
      windSpeed10mKmh: currentW?.windSpeed10m ?? 6,
      cloudCoverPct: currentW?.cloudCover ?? 10,
      localHour,
      pressure925:
        currentW &&
        typeof currentW.pressure925Temp === 'number' &&
        typeof currentW.pressure925Height === 'number'
          ? {
              tempC: currentW.pressure925Temp,
              geopotentialHeightM: currentW.pressure925Height,
            }
          : null,
      pressure850:
        currentW &&
        typeof currentW.pressure850Temp === 'number' &&
        typeof currentW.pressure850Height === 'number'
          ? {
              tempC: currentW.pressure850Temp,
              geopotentialHeightM: currentW.pressure850Height,
            }
          : null,
    });

    // Incident View
    const incidentView = calculateIncidentView({
      targetLat: lat,
      targetLon: lon,
      windDirectionDeg: currentW?.windDirection10m ?? 0,
      windSpeedKmh: currentW?.windSpeed10m ?? 5,
      fireDetections: firmsRes.fires,
      stations,
    });

    // Source Status Strip
    const sourceStatus = {
      openMeteo: {
        status: openMeteoRes.ok ? ('online' as const) : ('offline' as const),
        label: 'Open-Meteo European Weather & Air Quality API',
        lastUpdated: openMeteoRes.fetchedAt,
        error: openMeteoRes.error,
      },
      cpcb: {
        status: 'active' as const,
        label: 'CPCB National Air Quality Standard Engine',
        methodology: 'Central Pollution Control Board (October 2014) Breakpoint Interpolation',
        dominantPollutant: indianAqi.dominantPollutant,
        aqi: indianAqi.aqi,
        category: indianAqi.category,
        subIndicesCount: Object.keys(indianAqi.subIndices).length,
        hasSufficientData: !indianAqi.isPartial,
        lastUpdated: new Date().toISOString(),
      },
      waqi: {
        status: waqiRes.ok
          ? ('online' as const)
          : !process.env.WAQI_TOKEN
          ? ('unconfigured' as const)
          : ('offline' as const),
        label: 'WAQI CPCB Ground Monitoring Station Feeds',
        stationName: waqiRes.station?.stationName,
        distanceKm: waqiRes.station?.distanceKm,
        lastUpdated: waqiRes.fetchedAt,
        attributions: waqiRes.station?.attributions || [],
        error: waqiRes.error,
      },
      nasaFirms: {
        status: firmsRes.ok
          ? ('online' as const)
          : !process.env.FIRMS_MAP_KEY
          ? ('unconfigured' as const)
          : ('offline' as const),
        label: 'NASA FIRMS VIIRS Active Fire Satellites',
        firePointsCount: firmsRes.count,
        lastUpdated: firmsRes.fetchedAt,
        error: firmsRes.error,
      },
      drone: {
        status: 'not_connected' as const,
        label: 'AeroSense Hardware Drone Telemetry',
        badge: 'Not Connected',
        note: 'Hardware telemetry offline. Awaiting ESP8266 ingest handshake (Phase 7 demo).',
      },
    };

    const snapshotPayload = {
      coordinates: { lat, lon },
      fusedAir,
      indianAqi,
      inversionRisk,
      atmosphere: {
        temperature2m: currentW?.temperature2m ?? 20,
        humidityPct: currentW?.relativeHumidity ?? 50,
        windSpeedKmh: currentW?.windSpeed10m ?? 5,
        windDirectionDeg: currentW?.windDirection10m ?? 0,
        boundaryLayerHeightM: currentW?.boundaryLayerHeight ?? 450,
        cloudCoverPct: currentW?.cloudCover ?? 0,
        surfaceElevationM: openMeteoRes.surfaceElevationM ?? 200,
      },
      incidentView,
      sourceStatus,
      isStale: false,
      timestamp: new Date().toISOString(),
    };

    // Cache the good response
    globalCache.set(cacheKey, snapshotPayload, CACHE_TTL.SNAPSHOT);

    return NextResponse.json(snapshotPayload, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (err: any) {
    // If upstream failed but we have stale cache, return stale cache!
    if (cached.exists && cached.data) {
      return NextResponse.json(
        { ...cached.data, isStale: true },
        { headers: { 'X-Cache': 'STALE' } }
      );
    }

    return NextResponse.json(
      { error: 'Snapshot Service Error', message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
