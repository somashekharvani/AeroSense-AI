import { describe, it, expect } from 'vitest';
import { calculateInversionRisk, calculateLapseRate } from '@/engines/inversion';

describe('Atmospheric Thermal Inversion Engine', () => {
  it('detects a strong winter smog inversion night as High Risk', () => {
    // Delhi December midnight: surface cold (8°C), 925 hPa warm (14°C at 760m AGL),
    // BLH compressed to 180m, calm wind (3 km/h), clear sky (10%), midnight (02:00)
    const result = calculateInversionRisk({
      surfaceTempC: 8.0,
      surfaceElevationM: 215.0,
      boundaryLayerHeightM: 180.0,
      windSpeed10mKmh: 3.0,
      cloudCoverPct: 10.0,
      localHour: 2,
      pressure925: {
        tempC: 14.0,
        geopotentialHeightM: 975.0, // 760m above ground
      },
      pressure850: {
        tempC: 11.0,
        geopotentialHeightM: 1550.0,
      },
    });

    expect(result.level).toBe('High');
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.hasPositiveGradient).toBe(true);
    expect(result.gradient925CPer100m).toBeGreaterThan(0.5);
    expect(result.confidence.level).toBe('high');
    expect(result.reasons.some((r) => r.includes('thermal gradient') || r.includes('inversion'))).toBe(true);
  });

  it('detects a well-mixed windy afternoon as Low Risk', () => {
    // Sunny windy summer/monsoon afternoon: surface hot (34°C), aloft cold (22°C),
    // deep BLH (1800m), brisk wind (22 km/h), 14:00
    const result = calculateInversionRisk({
      surfaceTempC: 34.0,
      surfaceElevationM: 215.0,
      boundaryLayerHeightM: 1800.0,
      windSpeed10mKmh: 22.0,
      cloudCoverPct: 40.0,
      localHour: 14,
      pressure925: {
        tempC: 25.0,
        geopotentialHeightM: 980.0,
      },
      pressure850: {
        tempC: 18.0,
        geopotentialHeightM: 1560.0,
      },
    });

    expect(result.level).toBe('Low');
    expect(result.score).toBeLessThan(35);
    expect(result.hasPositiveGradient).toBe(false);
  });

  it('lowers confidence when pressure level data is missing', () => {
    const result = calculateInversionRisk({
      surfaceTempC: 12.0,
      surfaceElevationM: 200.0,
      boundaryLayerHeightM: 250.0,
      windSpeed10mKmh: 5.0,
      cloudCoverPct: 15.0,
      localHour: 4,
      pressure925: null, // Missing 925
      pressure850: null, // Missing 850
    });

    expect(result.confidence.level).toBe('low');
    expect(result.confidence.reasons).toContain('Missing 925 hPa pressure level data');
    expect(result.confidence.reasons).toContain('Missing 850 hPa pressure level data');
  });

  it('calculates lapse rate accurately using geopotential height above ground level', () => {
    // Surface: 10°C at 200m ASL. Aloft: 15°C at 700m ASL.
    // Height difference dz = 500m. dT = +5°C. Lapse rate = (5 / 500) * 100 = +1.0 °C / 100m.
    const res = calculateLapseRate(10.0, 200.0, 15.0, 700.0);
    expect(res.heightAboveGroundM).toBe(500);
    expect(res.gradientCPer100m).toBe(1.0);
  });
});
