/**
 * Resilient Deterministic Fallback Routine & Advisory Planner
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "The app must keep working (dashboard and engines) if Gemini is unavailable."
 * "A validator rejects numbers not in the facts and falls back to a template."
 */

import { FactsObject } from '@/lib/validation/schemas';
import { GeminiPlanResponse, HourlyRoutineItem, RecommendationItem } from '@/lib/validation/plan-schema';

export const ENGINE_VERSION = 'fallback-planner@1.0.0';

export interface FallbackPlannerInput {
  facts: FactsObject;
  targetCity?: string;
}

/**
 * Deterministically generates a verified routine and action plan directly from facts
 * Operates 100% offline with zero LLM and zero network dependencies.
 */
export function generateDeterministicPlan(input: FallbackPlannerInput): GeminiPlanResponse {
  const { facts } = input;

  const aqiVal = typeof facts['FACT-AQI-VALUE']?.value === 'number' ? facts['FACT-AQI-VALUE'].value : 100;
  const aqiCategory = String(facts['FACT-AQI-CATEGORY']?.value || 'Moderate');
  const dominantPol = String(facts['FACT-AQI-DOMINANT']?.value || 'PM2.5');
  const invScore = typeof facts['FACT-INV-SCORE']?.value === 'number' ? facts['FACT-INV-SCORE'].value : 40;
  const invLevel = String(facts['FACT-INV-LEVEL']?.value || 'Moderate');

  const isSevereOrPoor = ['Poor', 'Very Poor', 'Severe'].includes(aqiCategory) || aqiVal > 200;
  const isHighInversion = invScore >= 60 || invLevel === 'High';

  // 1. Summary
  const summary = `Ambient air quality is currently ${aqiCategory} with an Indian NAQI of ${aqiVal}. Atmospheric inversion risk is ${invLevel} (score ${invScore}/100), driven primarily by ${dominantPol}.`;

  // 2. Commentary
  const dailyDecisionScoreCommentary = isSevereOrPoor
    ? `Elevated particulate concentrations necessitate proactive indoor exposure containment and avoiding non-essential outdoor exertion during nocturnal and early morning stagnation hours.`
    : `Air quality conditions permit standard outdoor routines, though vulnerable groups should maintain awareness during evening peak vehicular commute periods.`;

  // 3. Hourly Routine Items
  const citedFactIdsBase = ['FACT-AQI-VALUE', 'FACT-AQI-CATEGORY', 'FACT-INV-SCORE'];

  const morningSlot: HourlyRoutineItem = {
    timeSlot: '06:00 - 09:00',
    activity: 'Morning Commute & Exercise Window',
    isOutdoorSafe: !isSevereOrPoor && !isHighInversion,
    guidance: isHighInversion
      ? `Nocturnal ground cooling traps emissions aloft near surface. Shift aerobic workouts indoors and keep windows sealed.`
      : `Moderate morning boundary layer allows light exercise. Sensitive groups should monitor breathing comfort.`,
    windowVentilation: isHighInversion || isSevereOrPoor ? 'seal_and_purify' : 'brief_natural_ventilation',
    citedFactIds: citedFactIdsBase,
  };

  const middaySlot: HourlyRoutineItem = {
    timeSlot: '12:00 - 15:00',
    activity: 'Afternoon Natural Ventilation & Errand Window',
    isOutdoorSafe: !['Severe'].includes(aqiCategory),
    guidance: `Solar radiation expands the atmospheric boundary layer, promoting vertical dispersion. Optimal time for necessary outdoor tasks or brief cross-ventilation if indoor PM2.5 exceeds ambient levels.`,
    windowVentilation: aqiVal > 300 ? 'seal_and_purify' : 'brief_natural_ventilation',
    citedFactIds: citedFactIdsBase,
  };

  const eveningSlot: HourlyRoutineItem = {
    timeSlot: '17:00 - 20:00',
    activity: 'Evening Commute & Transit Routine',
    isOutdoorSafe: !isSevereOrPoor,
    guidance: `Peak rush-hour emissions coincide with declining surface temperatures. Prefer electrified mass transit (Metro/Electric Bus) to reduce personal intake and vehicular output.`,
    windowVentilation: 'seal_and_purify',
    citedFactIds: citedFactIdsBase,
  };

  const nightSlot: HourlyRoutineItem = {
    timeSlot: '21:00 - 06:00',
    activity: 'Overnight Rest & Bedroom Containment',
    isOutdoorSafe: false,
    guidance: `Overnight thermal inversion frequently compresses surface air. Operate air purifiers on low/sleep setting with bedroom doors and windows firmly sealed.`,
    windowVentilation: 'seal_and_purify',
    citedFactIds: citedFactIdsBase,
  };

  const hourlyRoutine: HourlyRoutineItem[] = [morningSlot, middaySlot, eveningSlot, nightSlot];

  // 4. Recommendations
  const recommendations: RecommendationItem[] = [
    {
      id: 'REC-INDOOR-CONTAINMENT',
      category: 'indoor',
      title: 'Indoor Air Sealing and Recirculation',
      summary: `Maintain clean indoor microenvironments during ${aqiCategory} conditions.`,
      urgency: isSevereOrPoor ? 'critical' : 'moderate',
      action: 'Close all external balcony doors and windows. Run HEPA filtration on auto-mode.',
      citedFactIds: citedFactIdsBase,
    },
    {
      id: 'REC-TRANSIT-CHOICE',
      category: 'commute',
      title: 'Transit Mode Substitution',
      summary: 'Reduce exposure along congested arterial road corridors.',
      urgency: isSevereOrPoor ? 'moderate' : 'low',
      action: 'Substitute open two-wheeler travel with air-filtered Metro rail or AC electric bus.',
      citedFactIds: ['FACT-AQI-VALUE'],
    },
    {
      id: 'REC-COOKING-VENTILATION',
      category: 'indoor',
      title: 'Kitchen Source Isolation',
      summary: 'Prevent internal PM2.5 spikes from domestic high-heat frying.',
      urgency: 'moderate',
      action: 'Run range hood exhaust fan during cooking and keep living room doors partitioned.',
      citedFactIds: ['FACT-AQI-DOMINANT'],
    },
  ];

  // 5. Clean Air Window
  const cleanAirWindow = {
    startHour: '12:00',
    endHour: '15:00',
    reason: 'Boundary layer thermal expansion provides maximum daily atmospheric dilution.',
    citedFactIds: ['FACT-INV-SCORE'],
  };

  // 6. Disclaimer
  const disclaimer = 'AeroSense AI recommendations provide environmental exposure risk mitigation guidance and do not constitute medical diagnosis or clinical treatment advice.';

  return {
    summary,
    dailyDecisionScoreCommentary,
    hourlyRoutine,
    recommendations,
    cleanAirWindow,
    disclaimer,
  };
}
