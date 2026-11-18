import { NextRequest, NextResponse } from 'next/server';
import { LocationQuerySchema } from '@/lib/validation/location';
import { fetchWaqiStationData } from '@/services/waqi';
import globalCache, { CACHE_TTL } from '@/lib/caching/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get('lat') ?? '28.61';
  const rawLon = searchParams.get('lon') ?? '77.21';

  const parseResult = LocationQuerySchema.safeParse({ lat: rawLat, lon: rawLon, lang: 'en' });
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const { lat, lon } = parseResult.data;
  const cacheKey = `stations:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = globalCache.get<any>(cacheKey);

  if (cached.exists && !cached.isStale && cached.data) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const waqiRes = await fetchWaqiStationData(lat, lon);
    const payload = {
      ok: waqiRes.ok,
      station: waqiRes.station || null,
      error: waqiRes.error,
      timestamp: new Date().toISOString(),
    };

    globalCache.set(cacheKey, payload, CACHE_TTL.STATIONS);
    return NextResponse.json(payload, { headers: { 'X-Cache': 'MISS' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Stations error' }, { status: 500 });
  }
}
