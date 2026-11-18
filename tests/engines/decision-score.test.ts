import { describe, it, expect } from 'vitest';
import { calculateDecisionScore } from '@/engines/decision-score';

describe('Clean-Air Decision Score Engine', () => {
  it('returns maximum 100 score and Champion tier when all actions are followed', () => {
    const res = calculateDecisionScore({
      avoidedOutdoorPeakHours: true,
      rescheduledOutdoorExercise: true,
      sealedWindowsDuringSmog: true,
      operatedPurifierOrDIYBox: true,
      cleanCookingFuelUsed: true,
      choseLowEmissionTransit: true,
      woreN95MaskOutdoors: true,
    });

    expect(res.score).toBe(100);
    expect(res.tier).toBe('Clean Air Champion');
    expect(res.totalActionsCount).toBe(7);
  });

  it('returns 0 score when no proactive actions are recorded', () => {
    const res = calculateDecisionScore({
      avoidedOutdoorPeakHours: false,
      rescheduledOutdoorExercise: false,
      sealedWindowsDuringSmog: false,
      operatedPurifierOrDIYBox: false,
      cleanCookingFuelUsed: false,
      choseLowEmissionTransit: false,
      woreN95MaskOutdoors: false,
    });

    expect(res.score).toBe(0);
    expect(res.tier).toBe('Developing Habits');
    expect(res.totalActionsCount).toBe(0);
  });

  it('accurately computes partial scores across categories', () => {
    const res = calculateDecisionScore({
      avoidedOutdoorPeakHours: true, // +20
      rescheduledOutdoorExercise: false,
      sealedWindowsDuringSmog: true, // +10
      operatedPurifierOrDIYBox: true, // +20
      cleanCookingFuelUsed: false,
      choseLowEmissionTransit: true, // +15
      woreN95MaskOutdoors: false,
    });

    // Total = 20 + 10 + 20 + 15 = 65
    expect(res.score).toBe(65);
    expect(res.tier).toBe('Proactive Protector');
    expect(res.breakdown.exposureAvoidance.pointsEarned).toBe(20);
    expect(res.breakdown.indoorMitigation.pointsEarned).toBe(30);
    expect(res.breakdown.sustainableMobility.pointsEarned).toBe(15);
  });
});
