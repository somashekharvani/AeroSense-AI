import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { generateCleanAirPlan } from '@/services/gemini';
import { sanitizeFamilyProfiles } from '@/lib/privacy/redact';
import { buildFactsObject } from '@/lib/facts';
import { fetchOpenMeteoData } from '@/services/open-meteo';
import { fetchWaqiStationData } from '@/services/waqi';
import { fuseAirData } from '@/lib/fusion';
import { calculateIndianAqi } from '@/engines/indian-aqi';
import { calculateInversionRisk } from '@/engines/inversion';
import { FamilyMemberSchema, FactsObjectSchema } from '@/lib/validation/schemas';

const PlanRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  city: z.string().optional().default('Current Location'),
  userQuery: z.string().optional().default(''),
  familyMembers: z.array(FamilyMemberSchema).optional().default([]),
  facts: FactsObjectSchema.optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = PlanRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid Request Schema', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { lat, lon, city, userQuery, familyMembers, facts: clientFacts } = parseResult.data;

  // 1. Sanitize family profiles for privacy before LLM
  const sanitizedProfiles = sanitizeFamilyProfiles(familyMembers);

  // 2. Prepare facts: use client-supplied facts or fetch and compute deterministically
  let facts = clientFacts;
  if (!facts || Object.keys(facts).length === 0) {
    try {
      const [openMeteoRes, waqiRes] = await Promise.all([
        fetchOpenMeteoData(lat, lon),
        fetchWaqiStationData(lat, lon),
      ]);

      const stations = waqiRes.ok && waqiRes.station ? [waqiRes.station] : [];
      const fusedAir = fuseAirData({
        targetLat: lat,
        targetLon: lon,
        modelAir: openMeteoRes.currentAir,
        stations,
      });

      const indianAqi = calculateIndianAqi(fusedAir.pollutants);
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

      facts = buildFactsObject({
        aqi: indianAqi,
        inversion: inversionRisk,
        locationName: city,
      });
    } catch {
      // If live upstream fails, generate minimal baseline facts
      facts = buildFactsObject({
        locationName: city,
      });
    }
  }

  // 3. Generate plan via Gemini with strict fallback
  const planResult = await generateCleanAirPlan({
    facts,
    familyProfiles: sanitizedProfiles,
    userQuery,
    targetCity: city,
  });

  return NextResponse.json(
    {
      ...planResult,
      factsUsed: facts,
    },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      },
    }
  );
}
