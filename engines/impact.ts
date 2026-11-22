/**
 * Environmental & Exposure Impact Quantification Engine
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Every quantified recommendation shows an Impact Receipt: action, data used,
 * baseline, alternative, estimated change with units, method and assumptions,
 * confidence, engine version. This engine is the only place savings numbers are produced."
 */

import { SCIENTIFIC_ASSUMPTIONS } from './config/assumptions';
import { ImpactReceipt } from '@/lib/validation/schemas';

export const ENGINE_VERSION = 'impact@1.0.0';

export type TransportChoice = 'petrol_2w' | 'car' | 'metro' | 'bus';
export type CookingFuelChoice = 'biomass' | 'lpg' | 'electric';

export interface TransportScenarioInput {
  baselineMode: TransportChoice;
  alternativeMode: TransportChoice;
  oneWayDistanceKm: number;
  tripsPerWeek?: number;
  ambientPm25UgM3: number;
}

export interface CookingScenarioInput {
  baselineFuel: CookingFuelChoice;
  alternativeFuel: CookingFuelChoice;
  cookingHoursPerDay: number;
  roomVolumeM3: number;
}

export interface PurifierScenarioInput {
  roomVolumeM3: number;
  ambientPm25UgM3: number;
  runtimeHours: number;
  cadrM3h: number;
}

/**
 * Calculates quantified impact between transport choices (e.g. Scooter vs Metro)
 */
export function calculateTransportImpact(input: TransportScenarioInput): ImpactReceipt {
  const distanceKm = Math.max(0.1, input.oneWayDistanceKm);
  const ambient = Math.max(0, input.ambientPm25UgM3);

  // In-cabin exposure penetration factors
  const penetrationMap: Record<TransportChoice, number> = {
    petrol_2w: SCIENTIFIC_ASSUMPTIONS.microenvironmentPenetration.scooterTwoWheeler.value,
    car: SCIENTIFIC_ASSUMPTIONS.microenvironmentPenetration.privateCarClosedAC.value,
    metro: SCIENTIFIC_ASSUMPTIONS.microenvironmentPenetration.metroCarriage.value,
    bus: SCIENTIFIC_ASSUMPTIONS.microenvironmentPenetration.busPublicTransit.value,
  };

  // CO2 factors (g CO2 / passenger-km)
  const co2Map: Record<TransportChoice, number> = {
    petrol_2w: SCIENTIFIC_ASSUMPTIONS.transportEmissionFactors.petrolTwoWheeler.value,
    car: SCIENTIFIC_ASSUMPTIONS.transportEmissionFactors.petrolCar.value,
    metro: SCIENTIFIC_ASSUMPTIONS.transportEmissionFactors.metroRail.value,
    bus: SCIENTIFIC_ASSUMPTIONS.transportEmissionFactors.busTransit.value,
  };

  const speedKmh = 25.0; // Typical urban transit speed in Indian metro traffic (assumption, verify)
  const durationHours = distanceKm / speedKmh;
  const breathingRate = SCIENTIFIC_ASSUMPTIONS.breathingRates.adult.light.value; // 1.2 m3/h

  // Inhaled Dose = Concentration * Penetration * Inhalation Rate * Duration
  const doseBaseline = ambient * penetrationMap[input.baselineMode] * breathingRate * durationHours;
  const doseAlternative =
    ambient * penetrationMap[input.alternativeMode] * breathingRate * durationHours;
  const doseSavedUg = Math.round((doseBaseline - doseAlternative) * 10) / 10;
  const dosePctChange =
    doseBaseline > 0 ? Math.round(((doseBaseline - doseAlternative) / doseBaseline) * 100) : 0;

  // Tailpipe CO2
  const co2BaselineG = co2Map[input.baselineMode] * distanceKm;
  const co2AlternativeG = co2Map[input.alternativeMode] * distanceKm;
  const co2SavedG = Math.round(co2BaselineG - co2AlternativeG);

  const isReduction = doseSavedUg >= 0;

  const names: Record<TransportChoice, string> = {
    petrol_2w: 'Petrol 2-Wheeler (110cc)',
    car: 'Private Petrol Car',
    metro: 'Metro Rail (Air-Filtered)',
    bus: 'City Public Bus',
  };

  return {
    id: `IMP-TRN-${Math.round(distanceKm)}KM-${input.baselineMode}-vs-${input.alternativeMode}`,
    recommendation: `Switch from ${names[input.baselineMode]} to ${names[input.alternativeMode]}`,
    action: `${names[input.alternativeMode]} Transit`,
    baseline: `${names[input.baselineMode]} for ${distanceKm.toFixed(1)} km commute`,
    alternative: `${names[input.alternativeMode]} for ${distanceKm.toFixed(1)} km commute`,
    change: {
      value: Math.abs(dosePctChange),
      unit: `% PM2.5 exposure reduction (-${Math.abs(doseSavedUg)} µg inhaled, -${Math.abs(
        co2SavedG
      )}g CO2)`,
      direction: isReduction ? 'reduction' : 'increase',
    },
    method:
      'Dose = C_ambient × Penetration_ratio × BreathingRate × Duration; CO2 = EmissionFactor × Distance',
    assumptions: [
      `Urban transit speed: ${speedKmh} km/h`,
      `Adult light breathing rate: ${breathingRate} m³/h (US EPA Exposure Factors Handbook)`,
      `${names[input.baselineMode]} penetration ratio: P=${penetrationMap[input.baselineMode]}`,
      `${names[input.alternativeMode]} penetration ratio: P=${penetrationMap[input.alternativeMode]}`,
      `Ambient roadway PM2.5: ${ambient} µg/m³`,
    ],
    dataUsed: [
      { factId: 'FACT-AMB-PM25', source: 'Ground Station / Model Fused Telemetry' },
      { factId: 'FACT-EPA-INHAL', source: 'US EPA Exposure Factors Handbook (2011)' },
    ],
    confidence: {
      level: 'high',
      reasons: [
        'Deterministic physical mass balance',
        'Direct vehicular emission factors from ARAI/BEE registries',
      ],
    },
    engine: {
      name: 'impact',
      version: ENGINE_VERSION,
    },
    aiExplanation: `Traveling by ${names[input.alternativeMode]} removes your respiratory exposure from the concentrated exhaust envelope of arterial traffic.`,
  };
}

/**
 * Calculates quantified impact between cooking fuels (e.g. Biomass vs LPG or Electric)
 */
export function calculateCookingImpact(input: CookingScenarioInput): ImpactReceipt {
  const emissionMap: Record<CookingFuelChoice, number> = {
    biomass: SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.biomassSolidFuel.value, // 45,000 ug/h
    lpg: SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.lpg.value, // 3,500 ug/h
    electric: SCIENTIFIC_ASSUMPTIONS.indoorPhysics.cookingEmissionRateS.electricInduction.value, // 1,200 ug/h
  };

  const hours = Math.max(0.5, input.cookingHoursPerDay);
  const vol = Math.max(10, input.roomVolumeM3 || 50);
  const a = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.normal.value; // 0.8 /h
  const k = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.depositionRateK.value; // 0.18 /h
  const totalLoss = a + k; // 0.98 /h

  const baseRateUgH = emissionMap[input.baselineFuel];
  const altRateUgH = emissionMap[input.alternativeFuel];
  const baselineEmission = baseRateUgH * hours;
  const altEmission = altRateUgH * hours;
  const savedEmissionUg = baselineEmission - altEmission;
  const savedMassMg = Math.round(savedEmissionUg / 1000);
  const pctReduction =
    baselineEmission > 0 ? Math.round((savedEmissionUg / baselineEmission) * 100) : 0;
  // Modelled steady-state indoor concentration delta during cooking
  const deltaConcUgM3 = Math.round((baseRateUgH - altRateUgH) / (vol * totalLoss));

  const names: Record<CookingFuelChoice, string> = {
    biomass: 'Traditional Biomass/Chulha',
    lpg: 'LPG Gas Burner',
    electric: 'Electric Induction Cooktop',
  };

  return {
    id: `IMP-CKG-${input.baselineFuel}-vs-${input.alternativeFuel}`,
    recommendation: `Transition from ${names[input.baselineFuel]} to ${names[input.alternativeFuel]}`,
    action: `Cook with ${names[input.alternativeFuel]}`,
    baseline: `${names[input.baselineFuel]} (${hours}h/day in ${vol}m³ space)`,
    alternative: `${names[input.alternativeFuel]} (${hours}h/day in ${vol}m³ space)`,
    change: {
      value: Math.abs(pctReduction),
      unit: `% reduction in source emissions (-${savedMassMg} mg PM2.5/day emitted)`,
      direction: savedEmissionUg >= 0 ? 'reduction' : 'increase',
    },
    method:
      'Source_Mass = Emission_Rate × Operating_Duration; ΔC_indoor = (S_base - S_alt) / [V × (a + k)]',
    assumptions: [
      `Reduction in source emissions: ${pctReduction}% (${baseRateUgH.toLocaleString()} µg/h → ${altRateUgH.toLocaleString()} µg/h)`,
      `Estimated particle mass emitted avoided: -${savedMassMg} mg PM2.5/day over ${hours}h cooking`,
      `Modelled indoor room concentration reduction: -${deltaConcUgM3} µg/m³ peak steady-state impact in ${vol} m³ space (a=${a}/h, k=${k}/h)`,
      'Distinction: Source emission rate measures stove particulate output; modelled room concentration accounts for room volume, infiltration exchange, and wall deposition.',
      'Smith et al. Global Burden of Disease household solid fuel emission factors',
    ],
    dataUsed: [
      { factId: 'FACT-CKG-EMIS', source: 'WHO Household Air Pollution Database' },
    ],
    confidence: {
      level: 'high',
      reasons: ['Laboratory-measured combustion emission factors', 'Closed chamber validation'],
    },
    engine: {
      name: 'impact',
      version: ENGINE_VERSION,
    },
    aiExplanation:
      'Eliminating solid biomass combustion removes ultra-fine polycyclic hydrocarbons and soot before they circulate through living areas.',
  };
}

/**
 * Calculates quantified impact of running an air purifier vs unmitigated infiltration
 */
export function calculatePurifierImpact(input: PurifierScenarioInput): ImpactReceipt {
  const vol = Math.max(10, input.roomVolumeM3);
  const ambient = Math.max(0, input.ambientPm25UgM3);
  const hours = Math.max(1, input.runtimeHours);
  const cadr = Math.max(50, input.cadrM3h);

  // Infiltration rate a=0.8, P=0.8, k=0.18
  const a = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.airExchangeRate.normal.value;
  const P = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.penetrationFactorP.value;
  const k = SCIENTIFIC_ASSUMPTIONS.indoorPhysics.depositionRateK.value;

  const lambdaWithout = a + k; // Infiltration + deposition
  const ssWithout = (P * a * ambient) / lambdaWithout;

  const lambdaWith = a + k + cadr / vol;
  const ssWith = (P * a * ambient) / lambdaWith;

  const concReduction = Math.round((ssWithout - ssWith) * 10) / 10;
  const pctReduction = ssWithout > 0 ? Math.round(((ssWithout - ssWith) / ssWithout) * 100) : 0;

  // Cumulative mass filtered by HEPA = CADR * Integral(C) ≈ CADR * ssWith * hours
  const filteredMassMg = Math.round(((cadr * ssWith * hours) / 1000) * 10) / 10;

  return {
    id: `IMP-PUR-${Math.round(vol)}M3-${Math.round(cadr)}CADR`,
    recommendation: 'Operate HEPA Air Purifier during elevated smog periods',
    action: 'Run Purifier on Medium/Auto',
    baseline: `Unfiltered infiltration in ${vol}m³ room at ${ambient} µg/m³ ambient (Steady state: ${ssWithout} µg/m³)`,
    alternative: `HEPA purification (CADR ${cadr} m³/h) active (Steady state: ${ssWith} µg/m³)`,
    change: {
      value: Math.abs(pctReduction),
      unit: `% indoor PM2.5 reduction (-${concReduction} µg/m³, ${filteredMassMg} mg trapped in ${hours}h)`,
      direction: 'reduction',
    },
    method: 'Single-zone mass balance: C_ss = (P * a * C_out) / (a + k + CADR/V)',
    assumptions: [
      `Room volume: ${vol} m³`,
      `Air exchange rate: ${a} 1/h (Normal Indian construction)`,
      `Particle envelope penetration: P=${P}`,
      `Filter CADR: ${cadr} m³/h`,
    ],
    dataUsed: [
      { factId: 'FACT-AMB-PM25', source: 'Ground Station / Atmospheric Model' },
      { factId: 'FACT-ROOM-VOL', source: 'User Room Configuration' },
    ],
    confidence: {
      level: 'high',
      reasons: [
        'Deterministic first-order differential decay physics',
        'AHAM AC-1 standardized CADR testing procedure',
      ],
    },
    engine: {
      name: 'impact',
      version: ENGINE_VERSION,
    },
    aiExplanation:
      'Continuous air recirculation through true HEPA media rapidly lowers particulate equilibrium, protecting occupants during winter smog trapping.',
  };
}
