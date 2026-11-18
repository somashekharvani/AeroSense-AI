/**
 * Clean-Air Decision Score Engine
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Clean-Air Decision Score measures calculated household actions only, NEVER health."
 * This score gamifies sustainable mitigation habits and exposure minimization without
 * ever making clinical diagnoses or claims about individual health status.
 */

export const ENGINE_VERSION = 'decision-score@1.0.0';

export interface DecisionActionsInput {
  // Exposure avoidance actions
  avoidedOutdoorPeakHours: boolean; // Stayed indoors during morning/evening inversion spike (max 30 pts)
  rescheduledOutdoorExercise: boolean; // Shifted sports to safe clean-air window (max 10 pts)

  // Indoor protection actions
  sealedWindowsDuringSmog: boolean; // Windows closed when AQI > 200 (max 15 pts)
  operatedPurifierOrDIYBox: boolean; // Ran purifier/Corsi-Rosenthal box during peak hours (max 20 pts)
  cleanCookingFuelUsed: boolean; // Induction or LPG used instead of solid fuel (max 10 pts)

  // Sustainable transport actions
  choseLowEmissionTransit: boolean; // Metro / Bus / Shared vs single-occupancy petrol vehicle (max 15 pts)

  // Protective equipment
  woreN95MaskOutdoors: boolean; // N95/FFP2 respirator worn during Poor/Severe AQI (max 10 pts)
}

export interface DecisionScoreCategoryBreakdown {
  category: string;
  pointsEarned: number;
  maxPoints: number;
  actionsPerformed: string[];
}

export interface DecisionScoreResult {
  score: number; // 0 to 100
  tier: 'Clean Air Champion' | 'Proactive Protector' | 'Mindful Navigator' | 'Developing Habits';
  breakdown: {
    exposureAvoidance: DecisionScoreCategoryBreakdown;
    indoorMitigation: DecisionScoreCategoryBreakdown;
    sustainableMobility: DecisionScoreCategoryBreakdown;
    personalProtection: DecisionScoreCategoryBreakdown;
  };
  totalActionsCount: number;
  disclaimer: 'The Clean-Air Decision Score strictly evaluates quantified household environmental behaviors and emission-reduction actions. It is never a clinical diagnostic or measurement of biological health.';
  engine: {
    name: 'decision-score';
    version: typeof ENGINE_VERSION;
  };
}

/**
 * Calculates daily Clean-Air Decision Score (0-100)
 */
export function calculateDecisionScore(actions: DecisionActionsInput): DecisionScoreResult {
  let score = 0;
  let actionsCount = 0;

  // 1. Exposure Avoidance (Max 30)
  let exposurePts = 0;
  const exposureActions: string[] = [];
  if (actions.avoidedOutdoorPeakHours) {
    exposurePts += 20;
    exposureActions.push('Avoided strenuous outdoor exposure during morning inversion spike');
    actionsCount++;
  }
  if (actions.rescheduledOutdoorExercise) {
    exposurePts += 10;
    exposureActions.push('Rescheduled physical exertion to verified clean-air window');
    actionsCount++;
  }

  // 2. Indoor Mitigation (Max 40)
  let indoorPts = 0;
  const indoorActions: string[] = [];
  if (actions.operatedPurifierOrDIYBox) {
    indoorPts += 20;
    indoorActions.push('Ran HEPA purifier or Corsi-Rosenthal box during smog episode');
    actionsCount++;
  }
  if (actions.sealedWindowsDuringSmog) {
    indoorPts += 10;
    indoorActions.push('Sealed building envelope and weather-stripped windows during poor air');
    actionsCount++;
  }
  if (actions.cleanCookingFuelUsed) {
    indoorPts += 10;
    indoorActions.push('Cooked using clean electric induction or vented LPG');
    actionsCount++;
  }

  // 3. Sustainable Mobility (Max 15)
  let mobilityPts = 0;
  const mobilityActions: string[] = [];
  if (actions.choseLowEmissionTransit) {
    mobilityPts += 15;
    mobilityActions.push('Opted for public metro or shared transit over single-occupant petrol vehicle');
    actionsCount++;
  }

  // 4. Personal Protection (Max 15)
  let protectionPts = 0;
  const protectionActions: string[] = [];
  if (actions.woreN95MaskOutdoors) {
    protectionPts += 15;
    protectionActions.push('Wore certified N95 / FFP2 particulate respirator outdoors');
    actionsCount++;
  }

  score = exposurePts + indoorPts + mobilityPts + protectionPts;
  const finalScore = Math.min(100, Math.max(0, score));

  let tier: DecisionScoreResult['tier'] = 'Developing Habits';
  if (finalScore >= 85) {
    tier = 'Clean Air Champion';
  } else if (finalScore >= 65) {
    tier = 'Proactive Protector';
  } else if (finalScore >= 40) {
    tier = 'Mindful Navigator';
  }

  return {
    score: finalScore,
    tier,
    breakdown: {
      exposureAvoidance: {
        category: 'Exposure Avoidance',
        pointsEarned: exposurePts,
        maxPoints: 30,
        actionsPerformed: exposureActions,
      },
      indoorMitigation: {
        category: 'Indoor Air Mitigation',
        pointsEarned: indoorPts,
        maxPoints: 40,
        actionsPerformed: indoorActions,
      },
      sustainableMobility: {
        category: 'Sustainable Mobility',
        pointsEarned: mobilityPts,
        maxPoints: 15,
        actionsPerformed: mobilityActions,
      },
      personalProtection: {
        category: 'Personal Protection Equipment',
        pointsEarned: protectionPts,
        maxPoints: 15,
        actionsPerformed: protectionActions,
      },
    },
    totalActionsCount: actionsCount,
    disclaimer:
      'The Clean-Air Decision Score strictly evaluates quantified household environmental behaviors and emission-reduction actions. It is never a clinical diagnostic or measurement of biological health.',
    engine: {
      name: 'decision-score',
      version: ENGINE_VERSION,
    },
  };
}
