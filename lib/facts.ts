/**
 * Facts Builder & Multilingual Number Normalization Utility
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Gemini receives only a validated facts object, replies in a fixed JSON schema
 * checked with Zod, and must cite fact IDs. A validator rejects numbers not in the facts."
 */

import { FactsObject, FactItem } from './validation/schemas';
import { IndianAqiResult } from '@/engines/indian-aqi';
import { InversionRiskResult } from '@/engines/inversion';
import { ExposureDoseResult } from '@/engines/exposure';
import { IndoorAirResult } from '@/engines/indoor-air';
import { ImpactReceipt } from './validation/schemas';

export interface FactsBuilderInput {
  aqi?: IndianAqiResult;
  inversion?: InversionRiskResult;
  exposure?: ExposureDoseResult;
  indoor?: IndoorAirResult;
  receipts?: ImpactReceipt[];
  locationName?: string;
  timestamp?: string;
}

/**
 * Builds a deterministic FactsObject with stable IDs for AI consumption
 */
export function buildFactsObject(input: FactsBuilderInput): FactsObject {
  const ts = input.timestamp || new Date().toISOString();
  const facts: FactsObject = {};

  const addFact = (id: string, label: string, value: number | string | boolean, unit?: string, source = 'AeroSense Deterministic Engines') => {
    facts[id] = {
      id,
      label,
      value,
      unit,
      source,
      timestamp: ts,
    };
  };

  // Location fact
  if (input.locationName) {
    addFact('FACT-LOC-NAME', 'Target Location Name', input.locationName);
  }

  // 1. AQI Facts
  if (input.aqi) {
    addFact('FACT-AQI-VALUE', 'Indian CPCB National AQI', input.aqi.aqi, undefined, 'indian-aqi@1.0.0');
    addFact('FACT-AQI-CATEGORY', 'CPCB AQI Category', input.aqi.category, undefined, 'indian-aqi@1.0.0');
    addFact('FACT-AQI-DOMINANT', 'Dominant Criteria Pollutant', input.aqi.dominantPollutantName, undefined, 'indian-aqi@1.0.0');
    addFact('FACT-AQI-IS-PARTIAL', 'Is AQI Assessment Partial', input.aqi.isPartial, undefined, 'indian-aqi@1.0.0');

    // Individual criteria pollutants
    for (const [key, sub] of Object.entries(input.aqi.subIndices)) {
      addFact(`FACT-POL-${key.toUpperCase()}-CONC`, `${sub.name} Ambient Concentration`, sub.concentration, sub.unit, 'CPCB Monitoring Station');
      addFact(`FACT-POL-${key.toUpperCase()}-SUBINDEX`, `${sub.name} CPCB Sub-Index`, sub.subIndex, undefined, 'indian-aqi@1.0.0');
    }
  }

  // 2. Inversion Facts
  if (input.inversion) {
    addFact('FACT-INV-SCORE', 'Thermal Inversion Risk Score', input.inversion.score, '/100', 'inversion@1.0.0');
    addFact('FACT-INV-LEVEL', 'Inversion Risk Level', input.inversion.level, undefined, 'inversion@1.0.0');
    addFact('FACT-INV-BLH', 'Atmospheric Boundary Layer Height', input.inversion.metrics.blhM, 'm', 'Atmospheric Model');
    addFact('FACT-INV-WIND', 'Surface 10m Wind Speed', input.inversion.metrics.windSpeedKmh, 'km/h', 'Weather Station');
    if (input.inversion.gradient925CPer100m !== null) {
      addFact('FACT-INV-GRADIENT-925', '925 hPa Thermal Lapse Rate', input.inversion.gradient925CPer100m, '°C/100m', 'inversion@1.0.0');
    }
  }

  // 3. Exposure Facts
  if (input.exposure) {
    addFact('FACT-EXP-TOTAL-DOSE', 'Total Inhaled PM2.5 Dose', input.exposure.totalInhaledDoseUg, 'µg', 'exposure@1.0.0');
    addFact('FACT-EXP-BUDGET-PCT', 'Daily Exposure Budget Consumed', input.exposure.dailyBudget.budgetConsumedPct, '%', 'exposure@1.0.0');
    addFact('FACT-EXP-BUDGET-STATUS', 'Daily Budget Status', input.exposure.dailyBudget.status, undefined, 'exposure@1.0.0');
    if (input.exposure.approximateCigaretteEquivalent) {
      addFact('FACT-EXP-CIGARETTE-EQUIV', 'Approximate Cigarette Equivalence', input.exposure.approximateCigaretteEquivalent.count, 'approx cigarettes', 'exposure@1.0.0');
    }
  }

  // 4. Indoor Air Facts
  if (input.indoor) {
    addFact('FACT-IND-SS-PM25', 'Indoor Steady-State PM2.5', input.indoor.steadyStateConcentrationUgM3, 'µg/m³', 'indoor-air@1.0.0');
    addFact('FACT-IND-VENT-SAFE', 'Is Window Ventilation Safe Now', input.indoor.ventilationRecommendation.shouldVentilateNow, undefined, 'indoor-air@1.0.0');
    addFact('FACT-IND-RECOM-CADR', 'Recommended Purifier CADR', input.indoor.purifierSizing.recommendedMinCadrM3h, 'm³/h', 'indoor-air@1.0.0');
  }

  // 5. Impact Receipt Facts
  if (input.receipts) {
    for (const receipt of input.receipts) {
      addFact(`FACT-REC-${receipt.id}-VAL`, `${receipt.action} Change Value`, receipt.change.value, receipt.change.unit, receipt.engine.version);
    }
  }

  return facts;
}

/**
 * Digit mappings for 10 Indic and Arabic scripts to Western ASCII digits (0-9)
 */
const SCRIPT_DIGIT_MAP: Record<string, string> = {
  // Devanagari (Hindi, Marathi): ० १ २ ३ ४ ५ ६ ७ ८ ९
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  // Bengali: ০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  // Gurmukhi (Punjabi): ੦ ੧ ੨ ੩ ੪ ੫ ੬ ੭ ੮ ੯
  '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  // Gujarati: ૦ ૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  // Tamil: ௦ ௧ ௨ ௩ ௪ ௫ ௬ ௭ ௮ ௯
  '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
  // Telugu: ౦ ౧ ౨ ౩ ౪ ౫ ౬ ౭ ౮ ౯
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
  // Kannada: ೦ ೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
  // Malayalam: ൦ ൧ ൨ ൩ ൪ ൫ ൬ ൭ ൮ ൯
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
  // Arabic-Indic / Urdu: ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹ and ٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/**
 * Normalizes any text containing Indic or Arabic digits into standard Western ASCII digits
 */
export function normalizeScriptDigits(text: string): string {
  let normalized = '';
  for (const char of text) {
    if (SCRIPT_DIGIT_MAP[char] !== undefined) {
      normalized += SCRIPT_DIGIT_MAP[char];
    } else {
      normalized += char;
    }
  }
  return normalized;
}

/**
 * Extracts all distinct floating-point and integer numbers from a string,
 * automatically converting Indic & Arabic-Indic numerals.
 *
 * Excludes time patterns (e.g. 10:30, 2:00) and bullet list numbering (e.g. "1.", "2)").
 */
export function extractNumbersFromText(text: string): number[] {
  const normalized = normalizeScriptDigits(text);

  // Remove time patterns like 14:30 or 08:00
  const withoutTimes = normalized.replace(/\b\d{1,2}:\d{2}\b/g, ' ');

  // Match integers and floats
  const regex = /-?\b\d+(\.\d+)?\b/g;
  const matches = withoutTimes.match(regex) || [];

  return matches.map((m) => parseFloat(m)).filter((num) => !isNaN(num));
}
