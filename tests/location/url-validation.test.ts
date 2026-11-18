import { describe, it, expect } from 'vitest';
import { LocationQuerySchema, roundCoordinate } from '@/lib/validation/location';

describe('Location URL Query & Coordinate Validation', () => {
  it('correctly parses and rounds valid coordinates to 2 decimal places', () => {
    const result = LocationQuerySchema.safeParse({
      lat: '28.613929',
      lon: '77.209021',
      lang: 'hi',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBe(28.61);
      expect(result.data.lon).toBe(77.21);
      expect(result.data.lang).toBe('hi');
    }
  });

  it('defaults language to en if omitted', () => {
    const result = LocationQuerySchema.safeParse({
      lat: 12.9716,
      lon: 77.5946,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBe(12.97);
      expect(result.data.lon).toBe(77.59);
      expect(result.data.lang).toBe('en');
    }
  });

  it('rejects latitudes outside [-90, 90]', () => {
    const resultHigh = LocationQuerySchema.safeParse({
      lat: 91.5,
      lon: 77.21,
    });
    expect(resultHigh.success).toBe(false);

    const resultLow = LocationQuerySchema.safeParse({
      lat: -95.0,
      lon: 77.21,
    });
    expect(resultLow.success).toBe(false);
  });

  it('rejects longitudes outside [-180, 180]', () => {
    const result = LocationQuerySchema.safeParse({
      lat: 28.61,
      lon: 185.0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid or unsupported languages', () => {
    const result = LocationQuerySchema.safeParse({
      lat: 28.61,
      lon: 77.21,
      lang: 'french',
    });
    expect(result.success).toBe(false);
  });

  it('accurately rounds coordinates with roundCoordinate()', () => {
    expect(roundCoordinate(28.6139)).toBe(28.61);
    expect(roundCoordinate(77.209)).toBe(77.21);
    expect(roundCoordinate(12.9716)).toBe(12.97);
    expect(roundCoordinate(-33.8688)).toBe(-33.87);
  });
});
