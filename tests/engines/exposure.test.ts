import { describe, it, expect } from 'vitest';
import { calculateExposureDose, getBreathingRate } from '@/engines/exposure';
import { FamilyMember } from '@/lib/validation/schemas';

describe('Exposure Inhalation & Personal Budget Engine', () => {
  const adultMember: FamilyMember = {
    id: 'adult-1',
    nickname: 'Dev',
    ageGroup: 'adult',
    activityLevel: 'light',
    sensitivities: [],
  };

  const childMember: FamilyMember = {
    id: 'child-1',
    nickname: 'Aanya',
    ageGroup: 'child',
    activityLevel: 'moderate',
    sensitivities: ['asthma'],
  };

  it('calculates zero dose for empty or zero-duration schedules', () => {
    const res = calculateExposureDose(adultMember, []);
    expect(res.totalInhaledDoseUg).toBe(0);
    expect(res.totalDurationMinutes).toBe(0);
    expect(res.segments.length).toBe(0);
  });

  it('accurately computes dose for a single segment', () => {
    // Adult light breathing rate = 1.2 m³/h.
    // 60 minutes in 100 µg/m³ PM2.5 = 100 * 1.2 * 1.0 = 120 µg.
    const res = calculateExposureDose(adultMember, [
      {
        id: 'seg-1',
        name: 'Office Work',
        locationType: 'office',
        activityLevel: 'light',
        durationMinutes: 60,
        pm25Concentration: 100,
      },
    ]);

    expect(res.totalInhaledDoseUg).toBe(120);
    expect(res.totalInhaledAirVolumeM3).toBe(1.2);
    expect(res.segments[0].sharePct).toBe(100);
  });

  it('sums multiple microenvironment segments and calculates relative shares', () => {
    const schedule = [
      {
        id: 'seg-commute',
        name: 'Scooter Commute',
        locationType: 'in_transit' as const,
        activityLevel: 'light' as const, // 1.2 m3/h
        durationMinutes: 30, // 0.5h -> 0.6 m3
        pm25Concentration: 200, // 200 * 0.6 = 120 ug
      },
      {
        id: 'seg-home',
        name: 'Purified Bedroom',
        locationType: 'indoor' as const,
        activityLevel: 'rest' as const, // 0.5 m3/h
        durationMinutes: 480, // 8h -> 4.0 m3
        pm25Concentration: 25, // 25 * 4 = 100 ug
      },
    ];

    const res = calculateExposureDose(adultMember, schedule);
    // Total = 120 + 100 = 220 ug
    expect(res.totalInhaledDoseUg).toBe(220);
    expect(res.segments[0].sharePct).toBeGreaterThan(50); // Commute represents majority share
  });

  it('applies age and sensitivity factors to breathing rate', () => {
    const adultRest = getBreathingRate('adult', 'rest');
    const childRest = getBreathingRate('child', 'rest');
    expect(adultRest).toBeGreaterThan(childRest);

    const normalAdultLight = getBreathingRate('adult', 'light', []);
    const asthmaticAdultLight = getBreathingRate('adult', 'light', ['asthma']);
    expect(asthmaticAdultLight).toBeGreaterThan(normalAdultLight);
  });

  it('evaluates daily budget and returns approximate cigarette equivalent', () => {
    const res = calculateExposureDose(adultMember, [
      {
        id: 'heavy-smog',
        name: 'Outdoor Day',
        locationType: 'outdoor',
        activityLevel: 'light',
        durationMinutes: 480, // 8 hours * 1.2 m3/h = 9.6 m3
        pm25Concentration: 250, // 250 * 9.6 = 2400 ug (Severe overload)
      },
    ]);

    expect(res.dailyBudget.status).toBe('severe_overload');
    expect(res.dailyBudget.budgetConsumedPct).toBeGreaterThan(500);
    expect(res.approximateCigaretteEquivalent).toBeDefined();
    expect(res.approximateCigaretteEquivalent?.count).toBeGreaterThan(5);
  });
});
