import { NextRequest, NextResponse } from 'next/server';
import { LocationQuerySchema } from '@/lib/validation/location';
import { fetchNasaFirmsFires } from '@/services/nasa-firms';
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
  const cacheKey = `fires:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const cached = globalCache.get<any>(cacheKey);

  if (cached.exists && !cached.isStale && cached.data) {
    return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } });
  }

  try {
    const firmsRes = await fetchNasaFirmsFires(lat, lon, 1.5);
    const payload = {
      ok: firmsRes.ok,
      fires: firmsRes.fires,
      count: firmsRes.count,
      error: firmsRes.error,
      timestamp: new Date().toISOString(),
    };

    globalCache.set(cacheKey, payload, CACHE_TTL.FIRES);
    return NextResponse.json(payload, { headers: { 'X-Cache': 'MISS' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Fires error' }, { status: 500 });
  }
}
