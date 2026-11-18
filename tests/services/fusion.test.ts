import { describe, it, expect } from 'vitest';
import { fuseAirData, calculateObservationQuality } from '@/lib/fusion';
import { WaqiStationData } from '@/services/waqi';
import { OpenMeteoAirHour } from '@/services/open-meteo';

describe('Multi-Source Fusion Engine', () => {
  const mockModelAir: OpenMeteoAirHour = {
    timestamp: '2026-11-18T04:00:00Z',
    hourIndex: 4,
    pm25: 140,
    pm10: 220,
    coMgM3: 1.8,
    coRawUgM3: 1800,
    no2: 55,
    so2: 15,
    o3: 20,
  };

  const createMockStation = (
    pm25: number,
    distKm: number,
    name = 'Station A'
  ): WaqiStationData => ({
    stationId: 101,
    stationName: name,
    lat: 28.62,
    lon: 77.22,
    distanceKm: distKm,
    aqi: 200,
    dominantPollutant: 'pm25',
    pollutants: {
      pm25,
      pm10: pm25 * 1.5,
      no2: 45,
      so2: 12,
      co: 1.5,
      o3: 18,
    },
    timestamp: '2026-11-18T04:00:00Z',
    attributions: [{ name: 'CPCB', url: 'http://cpcb.gov.in' }],
  });

  it('maintains High confidence when station and model agree', () => {
    const station = createMockStation(145, 4.5); // 145 vs 140 (agreement)
    const fused = fuseAirData({
      targetLat: 28.61,
      targetLon: 77.21,
      modelAir: mockModelAir,
      stations: [station],
    });

    expect(fused.disagreement).toBe(false);
    expect(fused.confidence.level).toBe('high');
    expect(fused.dominantSource).toBe('station');
    expect(fused.pollutants.pm25).toBeCloseTo(145, 1);
  });

  it('detects significant divergence between station and model (> 35% delta)', () => {
    const station = createMockStation(240, 5.0); // 240 vs 140 (100 ug divergence)
    const fused = fuseAirData({
      targetLat: 28.61,
      targetLon: 77.21,
      modelAir: mockModelAir,
      stations: [station],
    });

    expect(fused.disagreement).toBe(true);
    expect(fused.confidence.level).toBe('medium');
    expect(fused.disagreementReason).toContain('diverge');
  });

  it('falls back to model when no ground stations are co-located', () => {
    const fused = fuseAirData({
      targetLat: 28.61,
      targetLon: 77.21,
      modelAir: mockModelAir,
      stations: [], // No stations
    });

    expect(fused.dominantSource).toBe('model');
    expect(fused.pollutants.pm25).toBe(140);
    expect(fused.confidence.level).toBe('medium');
    expect(fused.confidence.reasons.some((r) => r.includes('no ground station'))).toBe(true);
  });

  it('penalizes quality score for stale and distant station observations', () => {
    // Fresh close station: age = 0h, distance = 2km
    const qFresh = calculateObservationQuality(2, 0, 5);
    // Stale distant station: age = 6h, distance = 60km
    const qStale = calculateObservationQuality(60, 6, 2);

    expect(qFresh).toBeGreaterThan(0.7);
    expect(qStale).toBeLessThan(0.35);
  });
});
