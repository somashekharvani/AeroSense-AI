/**
 * Indian CPCB National Air Quality Index (NAQI) Deterministic Engine
 *
 * OFFICIAL CITATION & REFERENCE:
 * Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change,
 * Government of India: "National Air Quality Index" (NAQI), October 2014.
 * Document URL: http://www.cpcb.nic.in/upload/NAQI_FINAL_REPORT.pdf
 *
 * MATHEMATICAL FORMULATION:
 * For a given pollutant concentration C within breakpoint band [B_LO, B_HI]
 * corresponding to AQI sub-index band [I_LO, I_HI]:
 *
 *   I = ((I_HI - I_LO) / (B_HI - B_LO)) * (C - B_LO) + I_LO
 *
 * OVERALL AQI RULE:
 *   AQI = max(I_1, I_2, ..., I_n)
 *
 * COMPLETENESS & MINIMUM POLLUTANT RULES:
 * 1. 24-hour average for PM2.5, PM10, NO2, SO2, NH3, Pb requires >= 16 valid hours.
 * 2. 8-hour average for CO, O3 requires >= 6 valid hours.
 * 3. An overall AQI can only be calculated if at least three pollutants are monitored,
 *    of which at least one MUST be PM2.5 or PM10. If this condition is not met,
 *    the result is flagged as `isPartial: true`.
 */

import {
  CPCB_POLLUTANT_CONFIGS,
  AQI_CATEGORY_BANDS,
  CpcbAqiCategory,
} from './config/cpcb-breakpoints';
import { CriteriaPollutants } from '@/lib/validation/schemas';

export const ENGINE_VERSION = 'indian-aqi@1.0.0';

export interface PollutantSubIndex {
  pollutant: string;
  name: string;
  concentration: number;
  unit: string;
  subIndex: number;
  category: CpcbAqiCategory;
  isCompletenessMet: boolean;
  validHoursCount: number;
}

export interface IndianAqiResult {
  aqi: number;
  category: CpcbAqiCategory;
  dominantPollutant: string;
  dominantPollutantName: string;
  subIndices: Record<string, PollutantSubIndex>;
  isPartial: boolean;
  partialReason?: string;
  validPollutantsCount: number;
  hasParticulateMatter: boolean;
  engine: {
    name: 'indian-aqi';
    version: typeof ENGINE_VERSION;
    citation: 'CPCB NAQI Guidelines (2014)';
  };
}

export interface PollutantInputWithMetadata {
  value: number;
  validHoursCount?: number;
}

export type PollutantsInput = {
  [K in keyof CriteriaPollutants]?: number | PollutantInputWithMetadata | null;
};

/**
 * Calculates the sub-index for a single pollutant based on CPCB breakpoints
 */
export function calculateSubIndex(
  pollutantKey: string,
  concentration: number
): { subIndex: number; category: CpcbAqiCategory } {
  const config = CPCB_POLLUTANT_CONFIGS[pollutantKey.toLowerCase()];
  if (!config) {
    throw new Error(`Unknown pollutant key: ${pollutantKey}`);
  }

  // Handle negative or zero concentrations
  if (concentration <= 0) {
    return { subIndex: 0, category: 'Good' };
  }

  const bands = config.bands;

  // Find corresponding breakpoint band
  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];
    // Check if within band
    if (concentration <= band.cHigh) {
      // Linear interpolation inside band
      const slope = (band.iHigh - band.iLow) / (band.cHigh - band.cLow);
      const subIndex = Math.round(slope * (concentration - band.cLow) + band.iLow);
      return {
        subIndex: Math.max(band.iLow, Math.min(band.iHigh, subIndex)),
        category: getCategoryFromAqi(subIndex),
      };
    }
  }

  // Concentration exceeds the highest breakpoint band (Severe category)
  const topBand = bands[bands.length - 1];
  const slope = (topBand.iHigh - topBand.iLow) / (topBand.cHigh - topBand.cLow);
  const extrapolated = Math.round(slope * (concentration - topBand.cLow) + topBand.iLow);
  // Cap at 500 per standard CPCB scale representation
  const subIndex = Math.min(500, Math.max(topBand.iHigh, extrapolated));
  return {
    subIndex,
    category: 'Severe',
  };
}

/**
 * Maps an AQI numeric score to its CPCB NAQI category
 */
export function getCategoryFromAqi(aqi: number): CpcbAqiCategory {
  for (const band of AQI_CATEGORY_BANDS) {
    if (aqi <= band.max) {
      return band.category;
    }
  }
  return 'Severe';
}

/**
 * Computes overall Indian National Air Quality Index (NAQI) from criteria pollutants
 */
export function calculateIndianAqi(input: PollutantsInput): IndianAqiResult {
  const subIndices: Record<string, PollutantSubIndex> = {};
  let maxSubIndex = 0;
  let dominantPollutant = 'pm25';
  let dominantPollutantName = 'PM2.5';
  let validPollutantsCount = 0;
  let hasParticulateMatter = false;

  for (const [key, rawVal] of Object.entries(input)) {
    if (rawVal === null || rawVal === undefined) continue;

    const config = CPCB_POLLUTANT_CONFIGS[key.toLowerCase()];
    if (!config) continue;

    let concentration: number;
    let validHours: number = config.averagingHours; // Default to full hours if unspecified

    if (typeof rawVal === 'number') {
      concentration = rawVal;
    } else if (typeof rawVal === 'object' && 'value' in rawVal) {
      concentration = rawVal.value;
      if (rawVal.validHoursCount !== undefined) {
        validHours = rawVal.validHoursCount;
      }
    } else {
      continue;
    }

    if (isNaN(concentration) || concentration < 0) continue;

    const isCompletenessMet = validHours >= config.minValidHours;
    const { subIndex, category } = calculateSubIndex(key, concentration);

    subIndices[key] = {
      pollutant: key,
      name: config.name,
      concentration,
      unit: config.unit,
      subIndex,
      category,
      isCompletenessMet,
      validHoursCount: validHours,
    };

    if (key.toLowerCase() === 'pm25' || key.toLowerCase() === 'pm10') {
      hasParticulateMatter = true;
    }

    validPollutantsCount++;

    // Track highest sub-index
    if (subIndex > maxSubIndex) {
      maxSubIndex = subIndex;
      dominantPollutant = key;
      dominantPollutantName = config.name;
    }
  }

  // CPCB Rule: At least 3 pollutants with at least one PM
  const isPartial = validPollutantsCount < 3 || !hasParticulateMatter;
  let partialReason: string | undefined;

  if (validPollutantsCount === 0) {
    partialReason = 'No valid pollutant data provided';
  } else if (!hasParticulateMatter) {
    partialReason = 'CPCB rule: At least one particulate matter (PM2.5 or PM10) required for AQI';
  } else if (validPollutantsCount < 3) {
    partialReason = `CPCB rule: Minimum 3 pollutants required (only ${validPollutantsCount} available)`;
  }

  return {
    aqi: maxSubIndex,
    category: getCategoryFromAqi(maxSubIndex),
    dominantPollutant,
    dominantPollutantName,
    subIndices,
    isPartial,
    partialReason,
    validPollutantsCount,
    hasParticulateMatter,
    engine: {
      name: 'indian-aqi',
      version: ENGINE_VERSION,
      citation: 'CPCB NAQI Guidelines (2014)',
    },
  };
}
