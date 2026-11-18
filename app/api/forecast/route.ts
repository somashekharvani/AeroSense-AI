import { NextRequest, NextResponse } from 'next/server';
import { LocationQuerySchema } from '@/lib/validation/location';
import { fetchOpenMeteoData } from '@/services/open-meteo';
import { fetchWaqiStationData } from '@/services/waqi';
import { calculateBacktestMetrics } from '@/engines/forecasting';
import globalCache, { CACHE_TTL } from '@/lib/caching/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get('lat') ?? '28.61';
  const rawLon = searchParams.get('lon') ?? '77.21';
  const lang = searchParams.get('lang') ?? 'en';

  const parseResult = LocationQuerySchema.safeParse({ lat: rawLat, lon: rawLon, lang });
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const { lat, lon } = parseResult.data;
  const cacheKey = `forecast:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = globalCache.get<any>(cacheKey);

  if (cached.exists && !cached.isStale && cached.data) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const [openMeteoRes, waqiRes] = await Promise.all([
      fetchOpenMeteoData(lat, lon),
      fetchWaqiStationData(lat, lon),
    ]);

    const weatherHours = openMeteoRes.weatherHours || [];
    const airHours = openMeteoRes.airHours || [];

    // Backtest comparison: compare model forecast with available station telemetry
    const pairs: Array<{ timestamp: string; forecast: number; observed: number }> = [];

    if (waqiRes.ok && waqiRes.station && typeof waqiRes.station.pollutants.pm25 === 'number') {
      const stationPm25 = waqiRes.station.pollutants.pm25;
      const modelCurrent = openMeteoRes.currentAir?.pm25 ?? 0;
      pairs.push({
        timestamp: waqiRes.station.timestamp,
        forecast: modelCurrent,
        observed: stationPm25,
      });
    }

    const backtest = calculateBacktestMetrics(pairs);

    const payload = {
      coordinates: { lat, lon },
      weatherHours,
      airHours,
      backtest,
      timestamp: new Date().toISOString(),
    };

    globalCache.set(cacheKey, payload, CACHE_TTL.WEATHER);
    return NextResponse.json(payload, { headers: { 'X-Cache': 'MISS' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Forecast error' }, { status: 500 });
  }
}
