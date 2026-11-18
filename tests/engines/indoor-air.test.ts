import { describe, it, expect } from 'vitest';
import {
  calculateSteadyState,
  calculateTransientStep,
  calculateDecayRateLambda,
  calculateIndoorAir,
} from '@/engines/indoor-air';

describe('Indoor Air Mass-Balance Engine', () => {
  it('converges to steady state over multiple hours', () => {
    // V = 50 m3, a = 0.8, P = 0.8, k = 0.18, CADR = 0, C_out = 200, S = 0
    const vol = 50;
    const a = 0.8;
    const P = 0.8;
    const k = 0.18;
    const cadr = 0;
    const cOut = 200;
    const lambda = calculateDecayRateLambda(a, k, cadr, vol); // 0.8 + 0.18 = 0.98

    const cSteadyState = calculateSteadyState(cOut, P, a, 0, vol, lambda);
    // C_ss = (0.8 * 0.8 * 200) / 0.98 = 128 / 0.98 = 130.6 µg/m³
    expect(cSteadyState).toBeCloseTo(130.6, 0.5);

    // Start with clean air C_0 = 10 µg/m³ and advance hour by hour
    let c = 10;
    for (let h = 0; h < 10; h++) {
      c = calculateTransientStep(c, cSteadyState, lambda, 1.0);
    }

    // After 10 hours, should be virtually identical to steady state
    expect(Math.abs(c - cSteadyState)).toBeLessThan(0.5);
  });

  it('demonstrates that turning on an air purifier never raises concentration', () => {
    const vol = 60;
    const cOut = 180;
    const P = 0.8;
    const a = 0.8;
    const k = 0.18;

    const lambdaNoPurifier = calculateDecayRateLambda(a, k, 0, vol);
    const ssNoPurifier = calculateSteadyState(cOut, P, a, 0, vol, lambdaNoPurifier);

    const lambdaWithPurifier = calculateDecayRateLambda(a, k, 250, vol);
    const ssWithPurifier = calculateSteadyState(cOut, P, a, 0, vol, lambdaWithPurifier);

    expect(ssWithPurifier).toBeLessThan(ssNoPurifier);

    // Over 2 hours from starting C0 = 100
    const cAfterNoPurifier = calculateTransientStep(100, ssNoPurifier, lambdaNoPurifier, 2.0);
    const cAfterWithPurifier = calculateTransientStep(100, ssWithPurifier, lambdaWithPurifier, 2.0);

    expect(cAfterWithPurifier).toBeLessThan(cAfterNoPurifier);
  });

  it('recommends purifier sizing based on 4-5 air changes per hour (ACH)', () => {
    const room = {
      volumeM3: 50, // 50 m³
      leakiness: 'normal' as const,
      windowsOpen: false,
      cadrM3h: 200,
      hasCookingSource: false,
    };

    const res = calculateIndoorAir(room, [
      {
        hourIndex: 0,
        ambientPm25: 150,
        windowsOpen: false,
        purifierOn: true,
        cookingActive: false,
      },
    ]);

    // 4 ACH for 50 m³ = 200 m³/h; 5 ACH = 250 m³/h
    expect(res.purifierSizing.recommendedMinCadrM3h).toBe(200);
    expect(res.purifierSizing.recommendedOptimalCadrM3h).toBe(250);
    expect(res.purifierSizing.achWithCurrentPurifier).toBe(4.0);

    // Corsi-Rosenthal DIY box provides ~510 m³/h (over 10 ACH in 50 m³)
    expect(res.corsiRosenthalEstimate.estimatedCadrM3h).toBe(510);
    expect(res.corsiRosenthalEstimate.achProvidedInThisRoom).toBeGreaterThan(10);
  });

  it('provides sensible ventilate-or-seal recommendations based on ambient delta', () => {
    const room = {
      volumeM3: 40,
      leakiness: 'normal' as const,
      windowsOpen: false,
      cadrM3h: 0,
      hasCookingSource: false,
    };

    // When outdoor is 250 µg/m³ (smog), recommend sealing
    const resSmog = calculateIndoorAir(room, [
      {
        hourIndex: 0,
        ambientPm25: 250,
        windowsOpen: false,
        purifierOn: false,
        cookingActive: false,
      },
    ]);
    expect(resSmog.ventilationRecommendation.shouldVentilateNow).toBe(false);
    expect(resSmog.ventilationRecommendation.reason).toContain('seal');
  });
});
