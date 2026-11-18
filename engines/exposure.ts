/**
 * Inhalation Exposure Dose & Personal Budget Engine
 *
 * MATHEMATICAL MODEL:
 * Inhaled particulate mass dose D (in micrograms, µg):
 *
 *   D = ∑ [ C_i × BR_i × (t_i / 60) ]
 *
 * where:
 *   C_i   = PM2.5 concentration in microenvironment i (µg/m³)
 *   BR_i  = Inhalation breathing rate for age & activity level (m³/h)
 *   t_i   = Duration spent in segment i (minutes)
 *
 * CITATION:
 * US EPA (2011) Exposure Factors Handbook, Chapter 6: Inhalation Rates.
 * WHO (2021) Global Air Quality Guidelines (24-hour PM2.5 reference target).
 */

import { SCIENTIFIC_ASSUMPTIONS } from './config/assumptions';
import { FamilyMember } from '@/lib/validation/schemas';

export const ENGINE_VERSION = 'exposure@1.0.0';

export interface ActivitySegment {
  id: string;
  name: string;
  locationType: 'indoor' | 'outdoor' | 'in_transit' | 'school' | 'office';
  activityLevel: 'rest' | 'light' | 'moderate';
  durationMinutes: number;
  pm25Concentration: number; // Microenvironment PM2.5 (µg/m³)
}

export interface SegmentDoseResult {
  id: string;
  name: string;
  locationType: string;
  activityLevel: string;
  durationMinutes: number;
  pm25Concentration: number;
  breathingRateM3h: number;
  inhaledAirVolumeM3: number;
  inhaledDoseUg: number;
  sharePct: number; // % of total daily dose
}

export interface ExposureDoseResult {
  member: FamilyMember;
  totalInhaledDoseUg: number;
  totalInhaledAirVolumeM3: number;
  totalDurationMinutes: number;
  averageInhaledConcentrationUgM3: number;
  segments: SegmentDoseResult[];
  dailyBudget: {
    referenceBudgetUg: number; // WHO based target
    budgetConsumedPct: number; // % of target
    status: 'within_budget' | 'elevated' | 'severe_overload';
  };
  approximateCigaretteEquivalent?: {
    count: number;
    disclaimer: 'Illustrative comparative estimate based on Berkeley Earth ~22 µg/m³ 24h equivalency rule; not a direct medical diagnostic.';
  };
  engine: {
    name: 'exposure';
    version: typeof ENGINE_VERSION;
    citation: 'US EPA Exposure Factors Handbook (2011, Chapter 6)';
  };
}

/**
 * Retrieves the empirical breathing rate for a member profile and exertion state
 */
export function getBreathingRate(
  ageGroup: 'child' | 'adult' | 'elderly',
  activityLevel: 'rest' | 'light' | 'moderate',
  sensitivities: string[] = []
): number {
  const rates = SCIENTIFIC_ASSUMPTIONS.breathingRates[ageGroup] || SCIENTIFIC_ASSUMPTIONS.breathingRates.adult;
  let rate = rates[activityLevel]?.value ?? 1.2;

  // Asthmatic / COPD individuals often experience elevated minute ventilation or hyperventilation during exertion
  if (sensitivities.includes('asthma') || sensitivities.includes('copd')) {
    rate *= 1.1; // 10% elevation assumption, verify
  }

  return Math.round(rate * 100) / 100;
}

/**
 * Computes cumulative inhaled PM2.5 mass dose across scheduled daily segments
 */
export function calculateExposureDose(
  member: FamilyMember,
  schedule: ActivitySegment[],
  includeCigaretteEquiv = true
): ExposureDoseResult {
  let totalDose = 0;
  let totalVolume = 0;
  let totalMinutes = 0;

  const rawSegments: Array<{
    segment: ActivitySegment;
    breathingRate: number;
    volume: number;
    dose: number;
  }> = [];

  for (const seg of schedule) {
    if (seg.durationMinutes <= 0 || seg.pm25Concentration < 0) continue;

    const breathingRate = getBreathingRate(member.ageGroup, seg.activityLevel, member.sensitivities);
    const hours = seg.durationMinutes / 60;
    const volumeM3 = breathingRate * hours;
    const doseUg = seg.pm25Concentration * volumeM3;

    totalDose += doseUg;
    totalVolume += volumeM3;
    totalMinutes += seg.durationMinutes;

    rawSegments.push({
      segment: seg,
      breathingRate,
      volume: volumeM3,
      dose: doseUg,
    });
  }

  // Calculate percentages and finalize segments
  const calculatedSegments: SegmentDoseResult[] = rawSegments.map((item) => {
    const share = totalDose > 0 ? (item.dose / totalDose) * 100 : 0;
    return {
      id: item.segment.id,
      name: item.segment.name,
      locationType: item.segment.locationType,
      activityLevel: item.segment.activityLevel,
      durationMinutes: item.segment.durationMinutes,
      pm25Concentration: Math.round(item.segment.pm25Concentration * 10) / 10,
      breathingRateM3h: item.breathingRate,
      inhaledAirVolumeM3: Math.round(item.volume * 100) / 100,
      inhaledDoseUg: Math.round(item.dose * 10) / 10,
      sharePct: Math.round(share * 10) / 10,
    };
  });

  // Average concentration inhaled
  const avgConc = totalVolume > 0 ? totalDose / totalVolume : 0;

  // Daily Reference Budget (WHO 15 µg/m³ 24h baseline multiplied by typical age ventilation)
  const baseBudgetUg =
    member.ageGroup === 'child'
      ? 120 // 15 µg/m³ * 8 m³/day
      : member.ageGroup === 'elderly'
      ? 180 // 15 µg/m³ * 12 m³/day
      : 216; // 15 µg/m³ * 14.4 m³/day

  const budgetPct = Math.round((totalDose / baseBudgetUg) * 100);

  let budgetStatus: 'within_budget' | 'elevated' | 'severe_overload' = 'within_budget';
  if (budgetPct > 300) {
    budgetStatus = 'severe_overload';
  } else if (budgetPct > 100) {
    budgetStatus = 'elevated';
  }

  // Optional approximate cigarette equivalence
  let cigaretteEquiv: ExposureDoseResult['approximateCigaretteEquivalent'];
  if (includeCigaretteEquiv && totalDose > 0) {
    // Berkeley Earth rule: 22 µg/m³ ambient 24h ≈ 1 cigarette ≈ ~316 µg inhaled PM2.5 mass
    const count = Math.round((totalDose / 316) * 10) / 10;
    cigaretteEquiv = {
      count,
      disclaimer:
        'Illustrative comparative estimate based on Berkeley Earth ~22 µg/m³ 24h equivalency rule; not a direct medical diagnostic.',
    };
  }

  return {
    member,
    totalInhaledDoseUg: Math.round(totalDose * 10) / 10,
    totalInhaledAirVolumeM3: Math.round(totalVolume * 100) / 100,
    totalDurationMinutes: totalMinutes,
    averageInhaledConcentrationUgM3: Math.round(avgConc * 10) / 10,
    segments: calculatedSegments,
    dailyBudget: {
      referenceBudgetUg: baseBudgetUg,
      budgetConsumedPct: budgetPct,
      status: budgetStatus,
    },
    approximateCigaretteEquivalent: cigaretteEquiv,
    engine: {
      name: 'exposure',
      version: ENGINE_VERSION,
      citation: 'US EPA Exposure Factors Handbook (2011, Chapter 6)',
    },
  };
}
