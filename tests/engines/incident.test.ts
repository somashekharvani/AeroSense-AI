import { describe, it, expect } from 'vitest';
import {
  calculateBearingDeg,
  isBearingInSector,
  calculateIncidentView,
  IncidentInput,
} from '@/engines/incident';
import { NasaFirePoint } from '@/services/nasa-firms';
import { WaqiStationData } from '@/services/waqi';

describe('Incident & Downwind Sector Engine', () => {
  it('accurately computes directional bearings between points', () => {
    // Delhi center ~ (28.61, 77.21)
    // Directly north (29.61, 77.21) -> bearing ~ 0 / 360
    const bearingNorth = calculateBearingDeg(28.61, 77.21, 29.61, 77.21);
    expect(bearingNorth).toBe(0);

    // Directly south (27.61, 77.21) -> bearing ~ 180
    const bearingSouth = calculateBearingDeg(28.61, 77.21, 27.61, 77.21);
    expect(bearingSouth).toBe(180);

    // East (28.61, 78.21) -> bearing ~ 90
    const bearingEast = calculateBearingDeg(28.61, 77.21, 28.61, 78.21);
    expect(bearingEast).toBeGreaterThanOrEqual(88);
    expect(bearingEast).toBeLessThanOrEqual(92);

    // West (28.61, 76.21) -> bearing ~ 270
    const bearingWest = calculateBearingDeg(28.61, 77.21, 28.61, 76.21);
    expect(bearingWest).toBeGreaterThanOrEqual(268);
    expect(bearingWest).toBeLessThanOrEqual(272);
  });

  it('correctly checks if bearing is in sector, including around 0/360 boundary', () => {
    // Center 10 deg, spread 20 deg -> [-10 deg (350), 30 deg]
    expect(isBearingInSector(15, 10, 20)).toBe(true);
    expect(isBearingInSector(5, 10, 20)).toBe(true);
    expect(isBearingInSector(355, 10, 20)).toBe(true); // wrapped
    expect(isBearingInSector(345, 10, 20)).toBe(false);
    expect(isBearingInSector(35, 10, 20)).toBe(false);

    // Center 180 deg, spread 30 deg -> [150, 210]
    expect(isBearingInSector(170, 180, 30)).toBe(true);
    expect(isBearingInSector(205, 180, 30)).toBe(true);
    expect(isBearingInSector(140, 180, 30)).toBe(false);
  });

  it('calculates downwind trajectory correctly across different wind directions', () => {
    const dummyStations: WaqiStationData[] = [
      {
        stationId: 1,
        stationName: 'Station South',
        lat: 28.2, // South of 28.6
        lon: 77.21,
        aqi: 220,
        dominantPollutant: 'pm25',
        pollutants: { pm25: 140 },
        timestamp: '2026-11-18 10:00',
        attributions: [],
      },
      {
        stationId: 2,
        stationName: 'Station North',
        lat: 29.0, // North of 28.6
        lon: 77.21,
        aqi: 150,
        dominantPollutant: 'pm25',
        pollutants: { pm25: 90 },
        timestamp: '2026-11-18 10:00',
        attributions: [],
      },
    ];

    const dummyFires: NasaFirePoint[] = [
      {
        latitude: 28.7,
        longitude: 77.25,
        brightnessTempK: 330,
        acquisitionDate: '2026-11-18',
        acquisitionTime: '0600',
        satellite: 'VIIRS',
        confidence: 'high',
        frpMw: 15,
        dayNight: 'D',
        isThermalDetection: true,
      },
    ];

    // Case 1: Wind from North (0 deg) -> Smoke travels South (180 deg)
    const northWindInput: IncidentInput = {
      targetLat: 28.6,
      targetLon: 77.21,
      windDirectionDeg: 0,
      windSpeedKmh: 15,
      fireDetections: dummyFires,
      stations: dummyStations,
    };

    const resNorth = calculateIncidentView(northWindInput);
    expect(resNorth.downwindSector.downwindBearingDeg).toBe(180);
    expect(resNorth.isEstimate).toBe(true);
    // Station South should be in the downwind sector
    const southStationIds = resNorth.stationsInDownwindSector.map((s) => s.stationId);
    expect(southStationIds).toContain(1);
    expect(southStationIds).not.toContain(2);

    // Case 2: Wind from South (180 deg) -> Smoke travels North (0 deg)
    const southWindInput: IncidentInput = {
      ...northWindInput,
      windDirectionDeg: 180,
    };
    const resSouth = calculateIncidentView(southWindInput);
    expect(resSouth.downwindSector.downwindBearingDeg).toBe(0);
    const northStationIds = resSouth.stationsInDownwindSector.map((s) => s.stationId);
    expect(northStationIds).toContain(2);
    expect(northStationIds).not.toContain(1);
  });

  it('handles zero-fire edge case and low-wind stagnation', () => {
    // 0 fires
    const zeroFireInput: IncidentInput = {
      targetLat: 28.6,
      targetLon: 77.21,
      windDirectionDeg: 315, // NW wind (common Delhi winter smog)
      windSpeedKmh: 12,
      fireDetections: [],
      stations: [],
    };

    const zeroRes = calculateIncidentView(zeroFireInput);
    expect(zeroRes.nearbyThermalDetections.length).toBe(0);
    expect(zeroRes.smokeTrajectoryNotice).toContain('No significant satellite thermal anomaly');

    // Calm wind (< 4 km/h) with fires
    const calmWindInput: IncidentInput = {
      targetLat: 28.6,
      targetLon: 77.21,
      windDirectionDeg: 270,
      windSpeedKmh: 2.5,
      fireDetections: [
        {
          latitude: 28.62,
          longitude: 77.22,
          brightnessTempK: 320,
          acquisitionDate: '2026-11-18',
          acquisitionTime: '0600',
          satellite: 'VIIRS',
          confidence: 'nominal',
          frpMw: 10,
          dayNight: 'D',
          isThermalDetection: true,
        },
      ],
      stations: [],
    };

    const calmRes = calculateIncidentView(calmWindInput);
    expect(calmRes.smokeTrajectoryNotice).toContain('stagnation');
  });
});
