import { describe, it, expect } from 'vitest';
import { generateDeterministicPlan } from '@/engines/fallback-planner';
import { FactsObject } from '@/lib/validation/schemas';
import { GeminiPlanResponseSchema } from '@/lib/validation/plan-schema';
import { validateGeminiPlanAgainstFacts } from '@/lib/validation/fact-validator';

describe('Resilient Deterministic Fallback Planner', () => {
  const sampleFacts: FactsObject = {
    'FACT-AQI-VALUE': {
      id: 'FACT-AQI-VALUE',
      label: 'Indian CPCB NAQI',
      value: 380,
      timestamp: '2026-11-18T10:00:00Z',
      source: 'indian-aqi@1.0.0',
    },
    'FACT-AQI-CATEGORY': {
      id: 'FACT-AQI-CATEGORY',
      label: 'AQI Category',
      value: 'Very Poor',
      timestamp: '2026-11-18T10:00:00Z',
      source: 'indian-aqi@1.0.0',
    },
    'FACT-AQI-DOMINANT': {
      id: 'FACT-AQI-DOMINANT',
      label: 'Dominant Pollutant',
      value: 'PM2.5',
      timestamp: '2026-11-18T10:00:00Z',
      source: 'indian-aqi@1.0.0',
    },
    'FACT-INV-SCORE': {
      id: 'FACT-INV-SCORE',
      label: 'Inversion Score',
      value: 75,
      timestamp: '2026-11-18T10:00:00Z',
      source: 'inversion@1.0.0',
    },
    'FACT-INV-LEVEL': {
      id: 'FACT-INV-LEVEL',
      label: 'Inversion Level',
      value: 'High',
      timestamp: '2026-11-18T10:00:00Z',
      source: 'inversion@1.0.0',
    },
  };

  it('generates a valid, schema-compliant plan without Gemini or network', () => {
    const plan = generateDeterministicPlan({ facts: sampleFacts, targetCity: 'New Delhi' });

    // Must strictly satisfy Zod schema
    const parseRes = GeminiPlanResponseSchema.safeParse(plan);
    expect(parseRes.success).toBe(true);

    expect(plan.summary).toContain('380');
    expect(plan.summary).toContain('Very Poor');
    expect(plan.summary).toContain('High');
    expect(plan.hourlyRoutine.length).toBe(4);
    expect(plan.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(plan.disclaimer).toContain('environmental exposure risk mitigation');
  });

  it('ensures all deterministic outputs pass the fact validator without number fabrication', () => {
    const plan = generateDeterministicPlan({ facts: sampleFacts });
    const validation = validateGeminiPlanAgainstFacts(plan, sampleFacts);

    expect(validation.isValid).toBe(true);
    expect(validation.unauthorizedNumbers).toEqual([]);
    expect(validation.unknownFactIds).toEqual([]);
  });

  it('adjusts morning outdoor safety flag based on severe smog and inversion', () => {
    const severePlan = generateDeterministicPlan({ facts: sampleFacts });
    // In Very Poor / Severe smog, morning outdoor activities must be unsafe
    expect(severePlan.hourlyRoutine[0].isOutdoorSafe).toBe(false);
    expect(severePlan.hourlyRoutine[0].windowVentilation).toBe('seal_and_purify');

    // In Good air quality (AQI 35, Inversion 20)
    const goodFacts: FactsObject = {
      ...sampleFacts,
      'FACT-AQI-VALUE': { ...sampleFacts['FACT-AQI-VALUE'], value: 35 },
      'FACT-AQI-CATEGORY': { ...sampleFacts['FACT-AQI-CATEGORY'], value: 'Good' },
      'FACT-INV-SCORE': { ...sampleFacts['FACT-INV-SCORE'], value: 20 },
      'FACT-INV-LEVEL': { ...sampleFacts['FACT-INV-LEVEL'], value: 'Low' },
    };

    const goodPlan = generateDeterministicPlan({ facts: goodFacts });
    expect(goodPlan.hourlyRoutine[0].isOutdoorSafe).toBe(true);
  });
});
