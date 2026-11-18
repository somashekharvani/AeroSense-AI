import { z } from 'zod';

export interface GeocodingResultItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  state?: string;
  country: string;
  countryCode?: string;
}

const GeocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        elevation: z.number().optional(),
        admin1: z.string().optional(),
        country: z.string().optional().default('India'),
        country_code: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

/**
 * Searches locations using Open-Meteo Geocoding API with language preference
 */
export async function searchGeocoding(
  query: string,
  language = 'en',
  count = 6
): Promise<{ ok: boolean; results: GeocodingResultItem[]; error?: string }> {
  if (!query || query.trim().length === 0) {
    return { ok: true, results: [] };
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=${count}&language=${language}&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Geocoding HTTP ${res.status}`);
    }

    const json = await res.json();
    const parsed = GeocodingResponseSchema.parse(json);

    const results: GeocodingResultItem[] = parsed.results.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      elevation: r.elevation,
      state: r.admin1,
      country: r.country,
      countryCode: r.country_code,
    }));

    return { ok: true, results };
  } catch (err: any) {
    return { ok: false, results: [], error: err.message || 'Geocoding request failed' };
  }
}
