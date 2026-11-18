import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  calculateIndianAqi,
  getCategoryFromAqi,
} from '@/engines/indian-aqi';

describe('Indian CPCB National AQI Engine', () => {
  describe('CPCB Breakpoint Sub-Index Calculations', () => {
    it('calculates PM2.5 on exact band edges', () => {
      // 0-30 -> Good (0-50)
      expect(calculateSubIndex('pm25', 0).subIndex).toBe(0);
      expect(calculateSubIndex('pm25', 30).subIndex).toBe(50);
      expect(calculateSubIndex('pm25', 30).category).toBe('Good');

      // 31-60 -> Satisfactory (51-100)
      expect(calculateSubIndex('pm25', 60).subIndex).toBe(100);
      expect(calculateSubIndex('pm25', 60).category).toBe('Satisfactory');

      // 61-90 -> Moderate (101-200)
      expect(calculateSubIndex('pm25', 90).subIndex).toBe(200);
      expect(calculateSubIndex('pm25', 90).category).toBe('Moderate');

      // 91-120 -> Poor (201-300)
      expect(calculateSubIndex('pm25', 120).subIndex).toBe(300);
      expect(calculateSubIndex('pm25', 120).category).toBe('Poor');

      // 121-250 -> Very Poor (301-400)
      expect(calculateSubIndex('pm25', 250).subIndex).toBe(400);
      expect(calculateSubIndex('pm25', 250).category).toBe('Very Poor');
    });

    it('interpolates intermediate concentrations linearly', () => {
      // Midway between 31 and 60 (approx 45 µg/m³) -> ~75 sub-index (Satisfactory)
      const res = calculateSubIndex('pm25', 45);
      expect(res.subIndex).toBeGreaterThanOrEqual(74);
      expect(res.subIndex).toBeLessThanOrEqual(76);
      expect(res.category).toBe('Satisfactory');
    });

    it('handles concentration above top breakpoint (Severe)', () => {
      const res = calculateSubIndex('pm25', 380);
      expect(res.subIndex).toBe(500);
      expect(res.category).toBe('Severe');

      const extreme = calculateSubIndex('pm25', 600);
      expect(extreme.subIndex).toBe(500);
      expect(extreme.category).toBe('Severe');
    });

    it('verifies monotonicity: higher concentration never lowers sub-index', () => {
      let previousSubIndex = -1;
      for (let conc = 0; conc <= 400; conc += 5) {
        const { subIndex } = calculateSubIndex('pm25', conc);
        expect(subIndex).toBeGreaterThanOrEqual(previousSubIndex);
        previousSubIndex = subIndex;
      }
    });

    it('calculates PM10, NO2, and CO sub-indices correctly', () => {
      expect(calculateSubIndex('pm10', 50).subIndex).toBe(50);
      expect(calculateSubIndex('pm10', 100).subIndex).toBe(100);

      expect(calculateSubIndex('no2', 40).subIndex).toBe(50);
      expect(calculateSubIndex('no2', 80).subIndex).toBe(100);

      expect(calculateSubIndex('co', 1.0).subIndex).toBe(50);
      expect(calculateSubIndex('co', 2.0).subIndex).toBe(100);
    });
  });

  describe('Overall AQI & Completeness Rules', () => {
    it('selects highest sub-index as overall AQI and dominant pollutant', () => {
      const res = calculateIndianAqi({
        pm25: 150, // Sub-index ~323 (Very Poor)
        pm10: 80,  // Sub-index ~80 (Satisfactory)
        no2: 30,   // Sub-index ~38 (Good)
      });

      expect(res.dominantPollutant).toBe('pm25');
      expect(res.aqi).toBeGreaterThan(300);
      expect(res.category).toBe('Very Poor');
      expect(res.isPartial).toBe(false);
    });

    it('flags partial when fewer than 3 pollutants are provided', () => {
      const res = calculateIndianAqi({
        pm25: 85,
        no2: 25,
      });

      expect(res.isPartial).toBe(true);
      expect(res.partialReason).toContain('Minimum 3 pollutants required');
      expect(res.aqi).toBeGreaterThan(0); // Computes best estimate but marks partial
    });

    it('flags partial when no Particulate Matter (PM2.5 or PM10) is provided', () => {
      const res = calculateIndianAqi({
        no2: 45,
        so2: 30,
        co: 1.5,
      });

      expect(res.isPartial).toBe(true);
      expect(res.hasParticulateMatter).toBe(false);
      expect(res.partialReason).toContain('particulate matter');
    });

    it('respects 16h completeness threshold on input metadata', () => {
      const res = calculateIndianAqi({
        pm25: { value: 75, validHoursCount: 12 }, // Fails 16h rule
        pm10: { value: 120, validHoursCount: 20 },
        no2: { value: 35, validHoursCount: 18 },
      });

      expect(res.subIndices.pm25.isCompletenessMet).toBe(false);
      expect(res.subIndices.pm10.isCompletenessMet).toBe(true);
    });
  });
});
