import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/snapshot/route';
import globalCache from '@/lib/caching/cache';
import * as openMeteo from '@/services/open-meteo';
import * as waqi from '@/services/waqi';
import * as firms from '@/services/nasa-firms';

describe('GET /api/snapshot Integration Tests', () => {
  beforeEach(() => {
    globalCache.clear();
    vi.restoreAllMocks();
  });

  it('rejects invalid latitude and longitude query parameters with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/snapshot?lat=999&lon=999');
    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Invalid Coordinates');
  });

  it('fetches, computes fusion and returns snapshot payload with X-Cache: MISS', async () => {
    // Mock openMeteo
    vi.spyOn(openMeteo, 'fetchOpenMeteoData').mockResolvedValue({
      ok: true,
      currentWeather: {
        timestamp: '2026-11-18T10:00:00Z',
        hourIndex: 10,
        temperature2m: 22,
        relativeHumidity: 55,
        windSpeed10m: 8.5,
        windDirection10m: 310,
        boundaryLayerHeight: 450,
        cloudCover: 10,
        pressure925Temp: 18,
        pressure925Height: 760,
        pressure850Temp: 14,
        pressure850Height: 1450,
        surfaceElevation: 215,
      },
      currentAir: {
        timestamp: '2026-11-18T10:00:00Z',
        hourIndex: 10,
        pm25: 120,
        pm10: 210,
        coMgM3: 1.2,
        coRawUgM3: 1200,
        no2: 45,
        so2: 15,
        o3: 35,
      },
      weatherHours: [],
      airHours: [],
      surfaceElevationM: 215,
      fetchedAt: '2026-11-18T10:00:00Z',
      source: 'Open-Meteo European Weather & Atmospheric CAMS Model',
    });

    // Mock waqi
    vi.spyOn(waqi, 'fetchWaqiStationData').mockResolvedValue({
      ok: true,
      station: {
        stationId: 101,
        stationName: 'Anand Vihar, Delhi - DPCC',
        lat: 28.65,
        lon: 77.31,
        distanceKm: 8.4,
        aqi: 280,
        dominantPollutant: 'pm25',
        timestamp: '2026-11-18 10:00',
        pollutants: {
          pm25: 140,
          pm10: 240,
        },
        attributions: [],
      },
      fetchedAt: '2026-11-18T10:00:00Z',
      source: 'WAQI CPCB Ground Station Telemetry',
    });

    // Mock FIRMS
    vi.spyOn(firms, 'fetchNasaFirmsFires').mockResolvedValue({
      ok: true,
      fires: [],
      count: 0,
      fetchedAt: '2026-11-18T10:00:00Z',
      source: 'NASA FIRMS VIIRS NRT Satellite Thermal Anomaly Sensor',
    });

    const req = new NextRequest('http://localhost:3000/api/snapshot?lat=28.61&lon=77.21');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBe('MISS');

    const body = await res.json();
    expect(body.coordinates.lat).toBe(28.61);
    expect(body.coordinates.lon).toBe(77.21);
    expect(body.indianAqi).toBeDefined();
    expect(body.indianAqi.aqi).toBeGreaterThan(0);
    expect(body.inversionRisk).toBeDefined();
    expect(body.inversionRisk.score).toBeGreaterThanOrEqual(0);
    expect(body.sourceStatus.drone.status).toBe('not_connected');

    // Second call should HIT the memory cache
    const cachedReq = new NextRequest('http://localhost:3000/api/snapshot?lat=28.61&lon=77.21');
    const cachedRes = await GET(cachedReq);
    expect(cachedRes.status).toBe(200);
    expect(cachedRes.headers.get('X-Cache')).toBe('HIT');
  });

  it('serves stale cache with X-Cache: STALE if upstream fails after cache expires', async () => {
    // Seed the cache as expired
    const testKey = 'snapshot:28.61:77.21';
    globalCache.set(testKey, { sampleData: 'stale-ok' }, -10); // already expired

    // Mock openMeteo to fail
    vi.spyOn(openMeteo, 'fetchOpenMeteoData').mockRejectedValue(new Error('Upstream timeout'));

    const req = new NextRequest('http://localhost:3000/api/snapshot?lat=28.61&lon=77.21');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Cache')).toBe('STALE');
    const data = await res.json();
    expect(data.isStale).toBe(true);
    expect(data.sampleData).toBe('stale-ok');
  });
});
