import { describe, it, expect } from 'vitest';
import {
  extractNumbersFromText,
  validateGeminiPlanAgainstFacts,
} from '@/lib/validation/fact-validator';
import { FactsObject } from '@/lib/validation/schemas';
import { GeminiPlanResponse } from '@/lib/validation/plan-schema';

describe('Fact Citation & Zero Number Fabrication Validator', () => {
  it('extracts numbers from text accurately, including non-Latin digits', () => {
    expect(extractNumbersFromText('AQI is 157 and PM2.5 is 77.5 ug/m3')).toEqual([157, 77.5]);
    expect(extractNumbersFromText('Temperature is -2.4 degrees')).toEqual([-2.4]);
    // Devanagari numerals: १५७ = 157
    expect(extractNumbersFromText('वायु गुणवत्ता १५७ है')).toEqual([157]);
  });

  const baseFacts: FactsObject = {
    'FACT-AQI-VALUE': {
      id: 'FACT-AQI-VALUE',
      label: 'Indian CPCB NAQI',
      value: 157,
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
    'FACT-INV-SCORE': {
      id: 'FACT-INV-SCORE',
      label: 'Inversion Risk Score',
      value: 60,
      timestamp: '2026-11-18T10:00:00Z',
      source: 'inversion@1.0.0',
    },
  };

  it('validates and approves a clean plan with authorized numbers and valid citations', () => {
    const validPlan: GeminiPlanResponse = {
      summary: 'Current air quality index is 157 with an inversion risk score of 60.',
      dailyDecisionScoreCommentary: 'Actions taken today protect the household during peak hours.',
      hourlyRoutine: [
        {
          timeSlot: '06:00 - 08:00',
          activity: 'Morning routine',
          isOutdoorSafe: false,
          guidance: 'Inversion score 60 warrants caution.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-AQI-VALUE', 'FACT-INV-SCORE'],
        },
        {
          timeSlot: '12:00 - 14:00',
          activity: 'Midday window',
          isOutdoorSafe: true,
          guidance: 'AQI 157 is moderate.',
          windowVentilation: 'brief_natural_ventilation',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          timeSlot: '18:00 - 20:00',
          activity: 'Evening transit',
          isOutdoorSafe: false,
          guidance: 'Maintain indoor sealing.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      recommendations: [
        {
          id: 'REC-1',
          category: 'indoor',
          title: 'Purifier Guidance',
          summary: 'Keep AQI 157 contained.',
          urgency: 'moderate',
          action: 'Run air purifier on medium.',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          id: 'REC-2',
          category: 'commute',
          title: 'Public Transit',
          summary: 'Commute choice',
          urgency: 'low',
          action: 'Take the metro.',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      cleanAirWindow: {
        startHour: '12:00',
        endHour: '14:00',
        reason: 'Optimal midday dispersion.',
        citedFactIds: ['FACT-INV-SCORE'],
      },
      disclaimer: 'Guidance only, not clinical advice.',
    };

    const res = validateGeminiPlanAgainstFacts(validPlan, baseFacts);
    expect(res.isValid).toBe(true);
    expect(res.unauthorizedNumbers).toEqual([]);
    expect(res.unknownFactIds).toEqual([]);
  });

  it('rejects a plan containing fabricated unauthorized numbers', () => {
    const fabricatedPlan: GeminiPlanResponse = {
      summary: 'Current air quality index is 499 with catastrophic PM2.5 of 850 ug/m3.', // 499 & 850 are fabricated
      dailyDecisionScoreCommentary: 'Actions needed.',
      hourlyRoutine: [
        {
          timeSlot: '06:00 - 08:00',
          activity: 'Morning',
          isOutdoorSafe: false,
          guidance: 'High risk.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          timeSlot: '12:00 - 14:00',
          activity: 'Midday',
          isOutdoorSafe: true,
          guidance: 'Safe.',
          windowVentilation: 'brief_natural_ventilation',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          timeSlot: '18:00 - 20:00',
          activity: 'Evening',
          isOutdoorSafe: false,
          guidance: 'Seal.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      recommendations: [
        {
          id: 'REC-1',
          category: 'indoor',
          title: 'Purifier',
          summary: 'Summary',
          urgency: 'moderate',
          action: 'Action',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          id: 'REC-2',
          category: 'commute',
          title: 'Commute',
          summary: 'Summary',
          urgency: 'low',
          action: 'Action',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      cleanAirWindow: {
        startHour: '12:00',
        endHour: '14:00',
        reason: 'Dispersion.',
        citedFactIds: ['FACT-INV-SCORE'],
      },
      disclaimer: 'Guidance only.',
    };

    const res = validateGeminiPlanAgainstFacts(fabricatedPlan, baseFacts);
    expect(res.isValid).toBe(false);
    expect(res.unauthorizedNumbers).toContain(499);
    expect(res.unauthorizedNumbers).toContain(850);
  });

  it('rejects a plan with unknown or hallucinated fact IDs', () => {
    const badCitationPlan: GeminiPlanResponse = {
      summary: 'Current air quality index is 157.',
      dailyDecisionScoreCommentary: 'Commentary.',
      hourlyRoutine: [
        {
          timeSlot: '06:00 - 08:00',
          activity: 'Morning',
          isOutdoorSafe: false,
          guidance: 'Caution.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-IMAGINARY-POLLUTANT-999'], // Hallucinated ID
        },
        {
          timeSlot: '12:00 - 14:00',
          activity: 'Midday',
          isOutdoorSafe: true,
          guidance: 'Safe.',
          windowVentilation: 'brief_natural_ventilation',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          timeSlot: '18:00 - 20:00',
          activity: 'Evening',
          isOutdoorSafe: false,
          guidance: 'Seal.',
          windowVentilation: 'seal_and_purify',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      recommendations: [
        {
          id: 'REC-1',
          category: 'indoor',
          title: 'Title',
          summary: 'Summary',
          urgency: 'moderate',
          action: 'Action',
          citedFactIds: ['FACT-AQI-VALUE'],
        },
        {
          id: 'REC-2',
          category: 'commute',
          title: 'Title',
          summary: 'Summary',
          urgency: 'low',
          action: 'Action',
          citedFactIds: ['FACT-AQI-CATEGORY'],
        },
      ],
      cleanAirWindow: {
        startHour: '12:00',
        endHour: '14:00',
        reason: 'Midday.',
        citedFactIds: ['FACT-INV-SCORE'],
      },
      disclaimer: 'Guidance only.',
    };

    const res = validateGeminiPlanAgainstFacts(badCitationPlan, baseFacts);
    expect(res.isValid).toBe(false);
    expect(res.unknownFactIds).toContain('FACT-IMAGINARY-POLLUTANT-999');
  });
});
