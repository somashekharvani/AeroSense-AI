/**
 * Fact Citation & Zero Number Fabrication Validator
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Never invent readings, savings or citations. Every number shown comes from an engine
 * or a validated API response and carries unit, source and timestamp.
 * Gemini receives only a validated facts object, replies in a fixed JSON schema checked
 * with Zod, and must cite fact IDs. A validator rejects numbers not in the facts and falls back to a template."
 */

import { FactsObject } from './schemas';
import { GeminiPlanResponse } from './plan-schema';
import { normalizeNumerals } from '@/lib/facts';

export interface FactValidationResult {
  isValid: boolean;
  unauthorizedNumbers: number[];
  unknownFactIds: string[];
  reasons: string[];
}

/**
 * Universal allowable temporal and structural constants
 * e.g., clock hours 0-24, minutes 15/30/45/60, percentage base 100, current year
 */
const ALLOWED_STRUCTURAL_NUMBERS = new Set<number>([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 30, 45, 60, 100, 2026, 2027
]);

/**
 * Extracts all numeric values from a string, supporting negative numbers and decimals
 */
export function extractNumbersFromText(text: string): number[] {
  if (!text) return [];

  // Normalize Indian and non-Latin numerals to ASCII digits first
  const normalized = normalizeNumerals(text);

  // Match standalone numbers, e.g. 157, 77.5, -0.4, but not words with numbers attached
  const regex = /(?:^|[^\w.])(-?\d+(?:\.\d+)?)(?:[^\w.]|$)/g;
  const numbers: number[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) {
      numbers.push(val);
    }
  }

  return numbers;
}

/**
 * Checks whether a number is in the allowed set or close to an engine fact value
 */
function isNumberAuthorized(
  num: number,
  factValues: Set<number>,
  roundedFactValues: Set<number>
): boolean {
  if (ALLOWED_STRUCTURAL_NUMBERS.has(num)) {
    return true;
  }

  if (factValues.has(num) || roundedFactValues.has(Math.round(num))) {
    return true;
  }

  // Check tolerance for floating point rounding (e.g., 77.5 vs 77 or 78, or 0.08)
  for (const fVal of factValues) {
    if (Math.abs(num - fVal) < 0.1) {
      return true;
    }
    // Also check if LLM rounded a float to an integer (e.g. 77.5 -> 78 or 77)
    if (Math.abs(num - Math.round(fVal)) === 0) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a GeminiPlanResponse against the authorized FactsObject
 */
export function validateGeminiPlanAgainstFacts(
  plan: GeminiPlanResponse,
  facts: FactsObject
): FactValidationResult {
  const factValues = new Set<number>();
  const roundedFactValues = new Set<number>();
  const knownFactIds = new Set<string>(Object.keys(facts));

  // 1. Gather all authorized numbers from the facts object
  for (const fact of Object.values(facts)) {
    if (typeof fact.value === 'number') {
      factValues.add(fact.value);
      roundedFactValues.add(Math.round(fact.value));
      roundedFactValues.add(Math.floor(fact.value));
      roundedFactValues.add(Math.ceil(fact.value));
    } else if (typeof fact.value === 'string') {
      const extracted = extractNumbersFromText(fact.value);
      for (const n of extracted) {
        factValues.add(n);
        roundedFactValues.add(Math.round(n));
      }
    }
  }

  const unauthorizedNumbers: number[] = [];
  const unknownFactIds: string[] = [];
  const reasons: string[] = [];

  // Helper to validate text chunks
  const validateTextChunk = (text: string, context: string) => {
    const nums = extractNumbersFromText(text);
    for (const n of nums) {
      if (!isNumberAuthorized(n, factValues, roundedFactValues)) {
        if (!unauthorizedNumbers.includes(n)) {
          unauthorizedNumbers.push(n);
          reasons.push(`Unauthorized fabricated number ${n} found in ${context}`);
        }
      }
    }
  };

  // Helper to validate cited fact IDs
  const validateCitations = (citedIds: string[], context: string) => {
    for (const id of citedIds) {
      if (!knownFactIds.has(id)) {
        if (!unknownFactIds.includes(id)) {
          unknownFactIds.push(id);
          reasons.push(`Unrecognized fact citation ID "${id}" in ${context}`);
        }
      }
    }
  };

  // 2. Validate Root Fields
  validateTextChunk(plan.summary, 'summary');
  validateTextChunk(plan.dailyDecisionScoreCommentary, 'dailyDecisionScoreCommentary');

  // 3. Validate Clean Air Window
  validateTextChunk(plan.cleanAirWindow.reason, 'cleanAirWindow.reason');
  validateCitations(plan.cleanAirWindow.citedFactIds, 'cleanAirWindow');

  // 4. Validate Hourly Routine Items
  plan.hourlyRoutine.forEach((item, idx) => {
    validateTextChunk(item.guidance, `hourlyRoutine[${idx}].guidance`);
    validateTextChunk(item.activity, `hourlyRoutine[${idx}].activity`);
    validateCitations(item.citedFactIds, `hourlyRoutine[${idx}]`);
  });

  // 5. Validate Recommendations
  plan.recommendations.forEach((item, idx) => {
    validateTextChunk(item.title, `recommendations[${idx}].title`);
    validateTextChunk(item.summary, `recommendations[${idx}].summary`);
    validateTextChunk(item.action, `recommendations[${idx}].action`);
    validateCitations(item.citedFactIds, `recommendations[${idx}]`);
  });

  const isValid = unauthorizedNumbers.length === 0 && unknownFactIds.length === 0;

  return {
    isValid,
    unauthorizedNumbers,
    unknownFactIds,
    reasons,
  };
}
