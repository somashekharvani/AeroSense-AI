/**
 * Indoor PM2.5 Mass-Balance Differential Equation Engine
 *
 * PHYSICAL GOVERNING EQUATION:
 * The concentration of fine particulate matter C(t) inside a single-zone volume V satisfies
 * the mass balance first-order differential equation:
 *
 *   dC/dt = P * a * C_out + (S / V) - (a + k + CADR / V) * C
 *
 * where:
 *   V     = Room air volume (m³)
 *   C_out = Outdoor ambient PM2.5 concentration (µg/m³)
 *   a     = Air exchange / infiltration rate (1/h)
 *   P     = Envelope particulate penetration factor (dimensionless, 0 <= P <= 1)
 *   k     = Indoor surface deposition rate (1/h)
 *   S     = Indoor emission source rate (µg/h, e.g. cooking, smoking, incense)
 *   CADR  = Clean Air Delivery Rate of mechanical air filtration (m³/h)
 *
 * STEADY-STATE CONCENTRATION:
 * Setting dC/dt = 0 gives:
 *
 *   C_ss = (P * a * C_out + S / V) / (a + k + CADR / V)
 *
 * TRANSIENT ANALYTICAL SOLUTION:
 * For constant parameters over time interval t (in hours):
 *
 *   C(t) = C_ss + (C_0 - C_ss) * exp( -λ * t )
 *   where total removal rate λ = a + k + CADR / V
 *
 * CITATIONS:
 * Nazaroff, W. W. (2004) Indoor electric and particulate mass balance dynamics.
 * Thatcher, T. L. and Layton, D. W. (1995) Deposition, resuspension, and penetration of particles.
 */

import { SCIENTIFIC_ASSUMPTIONS } from './config/assumptions';

export const ENGINE_VERSION = 'indoor-air@1.0.0';

export interface RoomPhysicalParams {
  volumeM3: number;
  leakiness: 'sealed' | 'normal' | 'drafty';
  windowsOpen: boolean;
  cadrM3h: number; // 0 if purifier is OFF
  hasCookingSource: boolean;
  cookingFuelType?: 'lpg' | 'biomass' | 'electric';
}

export interface IndoorHourInput {
  hourIndex: number;
  ambientPm25: number; // Outdoor PM2.5 (µg/m³)
  windowsOpen: boolean;
  purifierOn: boolean;
  cookingActive: boolean;
}

export interface IndoorTimelinePoint {
  hourIndex: number;
  outdoorPm25: number;
  indoorPm25: number;
  steadyStatePm25: number;
  windowsOpen: boolean;
  purifierOn: boolean;
  cookingActive: boolean;
  cleanAirAction: 'seal_and_purify' | 'ventilate_safely' | 'normal_operation';
}

export interface IndoorAirResult {
  roomVolumeM3: number;
  parametersUsed: {
    airExchangeRateA: number; // 1/h
    penetrationFactorP: number;
    depositionRateK: number; // 1/h
    effectiveCadrM3h: number; // m³/h
    sourceEmissionRateUgH: number; // µg/h
    totalDecayRateLambda: number; // 1/h
  };
  steadyStateConcentrationUgM3: number;
  timeline: IndoorTimelinePoint[];
  ventilationRecommendation: {
    shouldVentilateNow: boolean;
    reason: string;
    bestVentilationHours: number[]; // Hours where outdoor air is cleaner than indoor or acceptable
  };
  purifierSizing: {
    roomVolumeM3: number;
    recommendedMinCadrM3h: number; // For 4 air changes per hour (ACH = 4)
    recommendedOptimalCadrM3h: number; // For 5 air changes per hour (ACH = 5)
    achWithCurrentPurifier: number;
  };
  corsiRosenthalEstimate: {
    estimatedCadrM3h: number;
    achProvidedInThisRoom: number;
    assumptionNotice: 'Estimated CADR based on 20-inch box fan with 4x MERV-13 filters (~510 m³/h / 300 CFM)';
  };
  engine: {
    name: 'indoor-air';
    version: typeof ENGINE_VERSION;
  };
}

/**
 * Computes the total removal coefficient λ = a + k + CADR / V
 */
export function calculateDecayRateLambda(
  a: number,
  k: number,
  cadr: number,
  volumeM3: number
): number {
  return a + k + cadr / volumeM3;
}

/**
 * Computes steady-state indoor PM2.5 concentration:
 * C_ss = (P * a * C_out + S / V) / λ
 */
export function calculateSteadyState(
  cOut: number,
  P: number,
  a: number,
  S: number,
  volumeM3: number,
  lambda: number
): number {
  if (lambda <= 0) return cOut;
  const numerator = P * a * cOut + S / volumeM3;
  return Math.max(0, Math.round((numerator / lambda) * 10) / 10);
}

/**
 * Computes transient concentration after duration tHours:
 * C(t) = C_ss + (C0 - C_ss) * exp(-λ * t)
 */
export function calculateTransientStep(
  c0: number,
  cSteadyState: number,
  lambda: number,
  tHours: number
): number {
  if (tHours <= 0) return c0;
  const cT = cSteadyState + (c0 - cSteadyState) * Math.exp(-lambda * tHours);
  return Math.max(0, Math.round(cT * 10) / 10);
}

/**
 * Simulates indoor air PM2.5 dynamics, purifier sizing, and window ventilation guidance
 */
export function calculateIndoorAir(
  room: RoomPhysicalParams,
  timelineInputs: IndoorHourInput[],
  initialIndoorPm25 = 45.0
): IndoorAirResult {
  const vol = Math.max(10, room.volumeM3);

  // Infiltration rate 'a'
  let a: number;
  if (room.windowsOpen) {
    a = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.windowsOpen.value;
  } else if (room.leakiness === 'sealed') {
    a = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.sealed.value;
  } else {
    a = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.normal.value;
  }

  const P = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.penetrationFactorP.value;
  const k = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.depositionRateK.value;
  const cadr = room.cadrM3h;

  // Emission source S (µg/h)
  let S = 0;
  if (room.hasCookingSource) {
    const fuel = room.cookingFuelType || 'lpg';
    if (fuel === 'biomass') {
      S = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.biomassSolidFuel.value;
    } else if (fuel === 'electric') {
      S = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.electricInduction.value;
    } else {
      S = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.lpg.value;
    }
  }

  const lambda = calculateDecayRateLambda(a, k, cadr, vol);
  const baselineOutdoor = timelineInputs.length > 0 ? timelineInputs[0].ambientPm25 : 150;
  const steadyState = calculateSteadyState(baselineOutdoor, P, a, S, vol, lambda);

  // Run piece-wise dynamic 24h simulation
  const timeline: IndoorTimelinePoint[] = [];
  let currentConc = initialIndoorPm25;
  const bestVentilationHours: number[] = [];

  for (const step of timelineInputs) {
    // Dynamic parameters for this specific hour
    let stepA = a;
    if (step.windowsOpen) {
      stepA = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.windowsOpen.value;
    } else {
      stepA =
        room.leakiness === 'sealed'
          ? SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.sealed.value
          : SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.normal.value;
    }

    const stepCadr = step.purifierOn ? (cadr > 0 ? cadr : 250) : 0;
    const stepS = step.cookingActive
      ? SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.lpg.value
      : 0;

    const stepLambda = calculateDecayRateLambda(stepA, k, stepCadr, vol);
    const stepSteadyState = calculateSteadyState(
      step.ambientPm25,
      P,
      stepA,
      stepS,
      vol,
      stepLambda
    );

    // Compute end-of-hour concentration
    currentConc = calculateTransientStep(currentConc, stepSteadyState, stepLambda, 1.0);

    // Determine clean air action
    let action: IndoorTimelinePoint['cleanAirAction'] = 'normal_operation';
    if (step.ambientPm25 > 120 || step.ambientPm25 > currentConc) {
      action = 'seal_and_purify';
    } else if (step.ambientPm25 < 40 && step.ambientPm25 < currentConc) {
      action = 'ventilate_safely';
      bestVentilationHours.push(step.hourIndex);
    }

    timeline.push({
      hourIndex: step.hourIndex,
      outdoorPm25: step.ambientPm25,
      indoorPm25: currentConc,
      steadyStatePm25: stepSteadyState,
      windowsOpen: step.windowsOpen,
      purifierOn: step.purifierOn,
      cookingActive: step.cookingActive,
      cleanAirAction: action,
    });
  }

  // Purifier sizing standards (ASHRAE / AHAM recommended 4-5 air changes per hour)
  const recommendedMinCadr = Math.round(vol * 4); // 4 ACH
  const recommendedOptimalCadr = Math.round(vol * 5); // 5 ACH
  const achWithCurrent = Math.round((cadr / vol) * 10) / 10;

  // Corsi-Rosenthal Box Performance Estimation
  const crCadr = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.corsiRosenthalCadr.value;
  const crAch = Math.round((crCadr / vol) * 10) / 10;

  // Real-time ventilate-or-seal decision
  const latestOutdoor = timelineInputs.length > 0 ? timelineInputs[0].ambientPm25 : 150;
  const shouldVentilate = latestOutdoor < 35 && latestOutdoor < currentConc;
  const ventReason = shouldVentilate
    ? `Outdoor air (${latestOutdoor} µg/m³) is cleaner than indoor air (${Math.round(currentConc)} µg/m³). Safe to open windows for cross-ventilation.`
    : latestOutdoor > 100
    ? `Severe outdoor smog (${latestOutdoor} µg/m³). Keep all windows tightly sealed and run purifier to minimize infiltration.`
    : `Outdoor air is at ${latestOutdoor} µg/m³. Keep windows closed; run purifier on auto mode.`;

  return {
    roomVolumeM3: vol,
    parametersUsed: {
      airExchangeRateA: Math.round(a * 100) / 100,
      penetrationFactorP: P,
      depositionRateK: k,
      effectiveCadrM3h: cadr,
      sourceEmissionRateUgH: S,
      totalDecayRateLambda: Math.round(lambda * 100) / 100,
    },
    steadyStateConcentrationUgM3: steadyState,
    timeline,
    ventilationRecommendation: {
      shouldVentilateNow: shouldVentilate,
      reason: ventReason,
      bestVentilationHours,
    },
    purifierSizing: {
      roomVolumeM3: vol,
      recommendedMinCadrM3h: recommendedMinCadr,
      recommendedOptimalCadrM3h: recommendedOptimalCadr,
      achWithCurrentPurifier: achWithCurrent,
    },
    corsiRosenthalEstimate: {
      estimatedCadrM3h: crCadr,
      achProvidedInThisRoom: crAch,
      assumptionNotice:
        'Estimated CADR based on 20-inch box fan with 4x MERV-13 filters (~510 m³/h / 300 CFM)',
    },
    engine: {
      name: 'indoor-air',
      version: ENGINE_VERSION,
    },
  };
}
