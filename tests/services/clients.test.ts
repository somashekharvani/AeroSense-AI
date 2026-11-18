import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseFirmsCsv } from '@/services/nasa-firms';
import { calculateDistanceKm } from '@/services/waqi';

describe('Third-Party Service Clients & Parser Validation', () => {
  const fixturesDir = path.resolve(__dirname, '../fixtures');

  it('safely parses NASA FIRMS VIIRS CSV fixture', () => {
    const csvContent = fs.readFileSync(path.join(fixturesDir, 'nasa-firms.csv'), 'utf-8');
    const fires = parseFirmsCsv(csvContent);

    expect(fires.length).toBe(4);
    expect(fires[0].latitude).toBe(29.125);
    expect(fires[0].longitude).toBe(76.85);
    expect(fires[0].confidence).toBe('nominal');
    expect(fires[0].isThermalDetection).toBe(true);
    expect(fires[1].confidence).toBe('high');
    expect(fires[2].confidence).toBe('low');
  });

  it('handles empty or malformed CSV gracefully', () => {
    expect(parseFirmsCsv('')).toEqual([]);
    expect(parseFirmsCsv('some,random,header\n1,2,3')).toEqual([]);
  });

  it('accurately computes Haversine distances in kilometers', () => {
    // Delhi (28.61, 77.21) to Noida (28.53, 77.39) is approx 20 km
    const dist = calculateDistanceKm(28.61, 77.21, 28.53, 77.39);
    expect(dist).toBeGreaterThan(15);
    expect(dist).toBeLessThan(25);

    // Distance to same point is 0
    expect(calculateDistanceKm(28.61, 77.21, 28.61, 77.21)).toBe(0);
  });
});
