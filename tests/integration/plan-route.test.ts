import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/plan/route';
import { FactsObject } from '@/lib/validation/schemas';

describe('POST /api/plan Integration Tests', () => {
  const sampleFacts: FactsObject = {
    'FACT-AQI-VALUE': {
      id: 'FACT-AQI-VALUE',
      label: 'Indian CPCB NAQI',
      value: 145,
      timestamp: '2026-11-18T10:00:00Z',
      source: 'indian-aqi@1.0.0',
    },
    'FACT-AQI-CATEGORY': {
      id: 'FACT-AQI-CATEGORY',
      label: 'AQI Category',
      value: 'Moderate',
      timestamp: '2026-11-18T10:00:00Z',
      source: 'indian-aqi@1.0.0',
    },
  };

  it('rejects invalid JSON or out-of-range coordinates with 400', async () => {
    const reqInvalidCoords = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify({ lat: 999, lon: 77.21 }),
    });

    const res = await POST(reqInvalidCoords);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Invalid Request Schema');
  });

  it('accepts valid plan request and returns plan with rate limit headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/plan', {
      method: 'POST',
      body: JSON.stringify({
        lat: 28.61,
        lon: 77.21,
        city: 'New Delhi',
        userQuery: 'What routine should we follow today?',
        familyMembers: [
          {
            id: 'mem-1',
            nickname: 'Priya',
            ageGroup: 'child',
            activityLevel: 'moderate',
            sensitivities: [],
          },
        ],
        facts: sampleFacts,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();

    const data = await res.json();
    expect(data.plan).toBeDefined();
    expect(data.plan.hourlyRoutine.length).toBeGreaterThanOrEqual(3);
    expect(data.plan.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(data.factsUsed).toBeDefined();
    expect(data.isFallback).toBeDefined();
  });
});
