/**
 * Atmospheric Thermal Inversion Risk Engine
 *
 * METEOROLOGICAL SCIENCE:
 * In a normal troposphere, temperature decreases with altitude at the lapse rate (~0.65°C / 100m).
 * A thermal inversion occurs when warm air overlies cooler surface air (dT/dz > 0).
 * This creates a stable atmospheric "lid" that traps particulate matter and vehicular emissions,
 * driving catastrophic winter smog episodes across the Indo-Gangetic Plain.
 *
 * NON-NEGOTIABLE RULE:
 * Inversion is an atmospheric RISK SCORE with physical evidence, NEVER a confirmed fact.
 */

import { SCIENTIFIC_ASSUMPTIONS } from './config/assumptions';

export const ENGINE_VERSION = 'inversion@1.0.0';

export interface InversionInput {
  surfaceTempC: number;
  surfaceElevationM: number; // Station / grid elevation above sea level
  boundaryLayerHeightM: number;
  windSpeed10mKmh: number;
  cloudCoverPct: number; // 0-100
  localHour: number; // 0-23
  pressure925?: {
    tempC: number;
    geopotentialHeightM: number;
  } | null;
  pressure850?: {
    tempC: number;
    geopotentialHeightM: number;
  } | null;
}

export type InversionRiskLevel = 'Low' | 'Moderate' | 'High';

export interface InversionRiskResult {
  score: number; // 0 to 100
  level: InversionRiskLevel;
  gradient925CPer100m: number | null;
  gradient850CPer100m: number | null;
  maxInversionGradient: number;
  hasPositiveGradient: boolean;
  reasons: string[]; // Translation keys / reason identifiers
  confidence: {
    level: 'high' | 'medium' | 'low';
    score: number;
    reasons: string[];
  };
  metrics: {
    surfaceTempC: number;
    surfaceElevationM: number;
    blhM: number;
    windSpeedKmh: number;
    cloudCoverPct: number;
    heightAboveGround925M: number | null;
    heightAboveGround850M: number | null;
  };
  disclaimer: 'Inversion risk is a probabilistic physical estimate based on atmospheric lapse rates and boundary-layer dynamics, not a direct sounding confirmation.';
  engine: {
    name: 'inversion';
    version: typeof ENGINE_VERSION;
  };
}

/**
 * Calculates thermal lapse rate (°C / 100m) between surface and aloft pressure level
 * Positive value = Inversion (temperature increases with altitude)
 * Negative value = Normal lapse (temperature decreases with altitude)
 */
export function calculateLapseRate(
  surfaceTempC: number,
  surfaceElevM: number,
  aloftTempC: number,
  aloftHeightM: number
): { gradientCPer100m: number; heightAboveGroundM: number } {
  const heightAboveGroundM = aloftHeightM - surfaceElevM;
  if (heightAboveGroundM <= 50) {
    // If aloft level is too close to ground or below ground, cannot evaluate gradient
    return { gradientCPer100m: 0, heightAboveGroundM: Math.max(1, heightAboveGroundM) };
  }

  // Gradient = ((T_aloft - T_surface) / dz) * 100
  const gradientCPer100m = ((aloftTempC - surfaceTempC) / heightAboveGroundM) * 100;
  return {
    gradientCPer100m: Math.round(gradientCPer100m * 100) / 100,
    heightAboveGroundM: Math.round(heightAboveGroundM),
  };
}

/**
 * Computes composite Inversion Risk Score (0-100)
 */
export function calculateInversionRisk(input: InversionInput): InversionRiskResult {
  const reasons: string[] = [];
  const confidenceReasons: string[] = [];

  let gradient925: number | null = null;
  let gradient850: number | null = null;
  let heightAgl925: number | null = null;
  let heightAgl850: number | null = null;
  let maxGradient = -999;
  let dataPointsCount = 0;

  // 1. Evaluate 925 hPa Thermal Gradient (~750m AGL)
  if (input.pressure925) {
    const res925 = calculateLapseRate(
      input.surfaceTempC,
      input.surfaceElevationM,
      input.pressure925.tempC,
      input.pressure925.geopotentialHeightM
    );
    gradient925 = res925.gradientCPer100m;
    heightAgl925 = res925.heightAboveGroundM;
    maxGradient = Math.max(maxGradient, gradient925);
    dataPointsCount++;
  } else {
    confidenceReasons.push('Missing 925 hPa pressure level data');
  }

  // 2. Evaluate 850 hPa Thermal Gradient (~1500m AGL)
  if (input.pressure850) {
    const res850 = calculateLapseRate(
      input.surfaceTempC,
      input.surfaceElevationM,
      input.pressure850.tempC,
      input.pressure850.geopotentialHeightM
    );
    gradient850 = res850.gradientCPer100m;
    heightAgl850 = res850.heightAboveGroundM;
    maxGradient = Math.max(maxGradient, gradient850);
    dataPointsCount++;
  } else {
    confidenceReasons.push('Missing 850 hPa pressure level data');
  }

  const hasPositiveGradient = maxGradient > 0;

  // Component Scores (0 to 100 scale)
  let score = 0;

  // A. Temperature Inversion Gradient Factor (Weight: 45%)
  if (dataPointsCount > 0) {
    if (maxGradient > 1.5) {
      // Very strong inversion (> 1.5°C rise per 100m)
      score += 45;
      reasons.push('Strong positive thermal gradient capping pollutants aloft');
    } else if (maxGradient > 0.5) {
      score += 35;
      reasons.push('Moderate thermal inversion layer detected aloft');
    } else if (maxGradient > 0) {
      score += 25;
      reasons.push('Weak temperature inversion layer present');
    } else if (maxGradient > -0.3) {
      // Near isothermal (stagnant)
      score += 15;
      reasons.push('Near-isothermal atmospheric stability inhibiting vertical mixing');
    } else {
      reasons.push('Normal negative lapse rate promoting convective dispersion');
    }
  } else {
    // If pressure level data is missing, estimate baseline from BLH and nocturnal radiational cooling
    score += 10;
  }

  // B. Boundary Layer Height Factor (Weight: 25%)
  // CPCB & IMD winter thresholds: BLH < 350m is a compression trap
  const blh = input.boundaryLayerHeightM;
  if (blh <= 200) {
    score += 25;
    reasons.push(`Severely compressed boundary layer (${Math.round(blh)}m) trapping ground emissions`);
  } else if (blh <= 400) {
    score += 18;
    reasons.push(`Low boundary layer height (${Math.round(blh)}m) restricting mixing volume`);
  } else if (blh <= 700) {
    score += 8;
  } else {
    reasons.push(`Deep convective boundary layer (${Math.round(blh)}m) aiding vertical venting`);
  }

  // C. Surface Wind Speed Mechanical Dispersion (Weight: 15%)
  // Wind speed in km/h: < 8 km/h (~2.2 m/s) is calm
  const windKmh = input.windSpeed10mKmh;
  if (windKmh < 4) {
    score += 15;
    reasons.push('Near-calm surface winds preventing horizontal dispersion');
  } else if (windKmh < 8) {
    score += 10;
    reasons.push('Light stagnant winds below 8 km/h');
  } else if (windKmh < 15) {
    score += 4;
  } else {
    reasons.push(`Brisk surface winds (${Math.round(windKmh)} km/h) aiding mechanical mixing`);
  }

  // D. Nocturnal Radiational Cooling Timing (Weight: 15%)
  // Clear night / early morning (20:00 to 08:00) with low cloud cover
  const isNocturnal = input.localHour >= 20 || input.localHour <= 8;
  const isClearSky = input.cloudCoverPct < 30;

  if (isNocturnal && isClearSky) {
    score += 15;
    reasons.push('Intense nocturnal ground radiational cooling under clear skies');
  } else if (isNocturnal) {
    score += 8;
    reasons.push('Nighttime ground cooling cycle');
  } else if (isClearSky && (input.localHour === 9 || input.localHour === 10)) {
    score += 5;
    reasons.push('Residual morning inversion prior to thermal breakup');
  }

  // Clamp composite score to [0, 100]
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Risk Level
  let level: InversionRiskLevel;
  if (finalScore >= 60) {
    level = 'High';
  } else if (finalScore >= 35) {
    level = 'Moderate';
  } else {
    level = 'Low';
  }

  // Confidence assessment
  let confLevel: 'high' | 'medium' | 'low';
  let confScore = 1.0;

  if (dataPointsCount === 2) {
    confLevel = 'high';
    confidenceReasons.push('Complete vertical pressure profile (925 & 850 hPa)');
  } else if (dataPointsCount === 1) {
    confLevel = 'medium';
    confScore = 0.7;
    confidenceReasons.push('Single pressure level available');
  } else {
    confLevel = 'low';
    confScore = 0.4;
    confidenceReasons.push('Model estimated from surface BLH and wind speed only');
  }

  return {
    score: finalScore,
    level,
    gradient925CPer100m: gradient925,
    gradient850CPer100m: gradient850,
    maxInversionGradient: maxGradient === -999 ? 0 : maxGradient,
    hasPositiveGradient,
    reasons,
    confidence: {
      level: confLevel,
      score: confScore,
      reasons: confidenceReasons,
    },
    metrics: {
      surfaceTempC: input.surfaceTempC,
      surfaceElevationM: input.surfaceElevationM,
      blhM: input.boundaryLayerHeightM,
      windSpeedKmh: input.windSpeed10mKmh,
      cloudCoverPct: input.cloudCoverPct,
      heightAboveGround925M: heightAgl925,
      heightAboveGround850M: heightAgl850,
    },
    disclaimer:
      'Inversion risk is a probabilistic physical estimate based on atmospheric lapse rates and boundary-layer dynamics, not a direct sounding confirmation.',
    engine: {
      name: 'inversion',
      version: ENGINE_VERSION,
    },
  };
}
