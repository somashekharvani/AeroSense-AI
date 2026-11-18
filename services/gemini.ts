/**
 * Google Gemini AI Planning Service with Deterministic Fallback
 *
 * NON-NEGOTIABLE RULES from AGENTS.md:
 * 1. "Our own deterministic engines do all the science. Gemini only plans and explains."
 * 2. "Every quantified recommendation shows an Impact Receipt... The app must keep working
 *     if Gemini is unavailable."
 * 3. "Gemini receives only a validated facts object, replies in a fixed JSON schema checked
 *     with Zod, and must cite fact IDs. A validator rejects numbers not in the facts and falls back to a template."
 * 4. "Health wording is guidance only, never diagnosis. Family data stays on the device.
 *     Redact personal details before any Gemini call. Filter prompt injection on all user text."
 */

import { GoogleGenAI } from '@google/genai';
import { FactsObject } from '@/lib/validation/schemas';
import {
  GeminiPlanResponse,
  GeminiPlanResponseSchema,
} from '@/lib/validation/plan-schema';
import { validateGeminiPlanAgainstFacts } from '@/lib/validation/fact-validator';
import { generateDeterministicPlan } from '@/engines/fallback-planner';
import {
  SanitizedMemberProfile,
  filterPromptInjection,
} from '@/lib/privacy/redact';

export interface GeneratePlanOptions {
  facts: FactsObject;
  familyProfiles?: SanitizedMemberProfile[];
  userQuery?: string;
  targetCity?: string;
  timeoutMs?: number;
}

export interface PlanGenerationResult {
  plan: GeminiPlanResponse;
  isFallback: boolean;
  fallbackReason?: string;
  validationErrors?: string[];
  modelUsed?: string;
  generatedAt: string;
}

const SYSTEM_INSTRUCTION = `
You are AeroSense AI, a Clean-Air Planning Engine designed for urban air pollution and winter smog management.
Your role is STRICTLY to PLAN and EXPLAIN based on validated scientific engine facts.

CRITICAL NON-NEGOTIABLE CONSTRAINTS:
1. ZERO NUMBER INVENTIONS:
   - You MUST NOT fabricate, estimate, or invent ANY air quality concentrations, AQI values, savings percentages, temperatures, or boundary layer heights.
   - Every quantified number you write MUST be directly present in the provided FACTS dictionary.
   - Any number not present in the FACTS dictionary will cause the response to be rejected by our automated validator.
2. STRICT FACT CITATION:
   - Every hourly slot and recommendation MUST populate "citedFactIds" with the exact string ID(s) from the FACTS dictionary supporting that advice (e.g. ["FACT-AQI-VALUE", "FACT-INV-SCORE"]).
3. GUIDANCE ONLY — NO MEDICAL DIAGNOSIS:
   - Provide exposure mitigation routines (mask usage, indoor sealing, modal transit shifts, HEPA scheduling).
   - NEVER diagnose diseases, recommend medications, or offer clinical prognosis.
4. STRICT JSON:
   - Return strictly valid JSON conforming to the requested schema.
`;

/**
 * Generates an hourly routine and actionable plan using Gemini with strict deterministic fallback
 */
export async function generateCleanAirPlan(
  options: GeneratePlanOptions
): Promise<PlanGenerationResult> {
  const {
    facts,
    familyProfiles = [],
    userQuery = '',
    targetCity = 'Current Location',
    timeoutMs = 9000,
  } = options;

  const generatedAt = new Date().toISOString();
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // 1. Check for prompt injection or medical solicitation in user query
  const promptCheck = filterPromptInjection(userQuery);
  if (!promptCheck.isSafe) {
    const fallbackPlan = generateDeterministicPlan({ facts, targetCity });
    return {
      plan: fallbackPlan,
      isFallback: true,
      fallbackReason: `User prompt flagged for policy violation: ${promptCheck.flaggedPatterns.join(', ')}`,
      generatedAt,
    };
  }

  // 2. Check if Gemini API key is configured
  if (!apiKey) {
    const fallbackPlan = generateDeterministicPlan({ facts, targetCity });
    return {
      plan: fallbackPlan,
      isFallback: true,
      fallbackReason: 'GEMINI_API_KEY is not configured. Served deterministic fallback plan.',
      generatedAt,
    };
  }

  // 3. Prepare Prompt with verified Facts Dictionary & Demographic Profiles
  const prompt = `
FACTS DICTIONARY (Authorized numbers and engine outputs):
${JSON.stringify(facts, null, 2)}

HOUSEHOLD PROFILES (Anonymized demographic categories only):
${JSON.stringify(familyProfiles, null, 2)}

USER CONTEXT / QUERY:
${promptCheck.sanitizedText || 'Generate an optimal 24-hour routine and high-priority action recommendations for this household.'}

TARGET LOCATION: ${targetCity}

Please formulate the 24-hour clean air routine, clean air window, and priority household recommendations.
`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Abort controller for timeout enforcement
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const rawText = response.text;

    if (!rawText) {
      throw new Error('Gemini returned an empty response');
    }

    // 4. Parse JSON and validate with Zod
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      throw new Error('Failed to parse Gemini output as valid JSON');
    }

    const zodResult = GeminiPlanResponseSchema.safeParse(parsedJson);
    if (!zodResult.success) {
      throw new Error(`Gemini response failed Zod schema: ${zodResult.error.message}`);
    }

    const geminiPlan = zodResult.data;

    // 5. Strict Fact Citation & Number Fabrication Verification
    const validation = validateGeminiPlanAgainstFacts(geminiPlan, facts);

    if (!validation.isValid) {
      const fallbackPlan = generateDeterministicPlan({ facts, targetCity });
      return {
        plan: fallbackPlan,
        isFallback: true,
        fallbackReason: `Gemini plan rejected by zero-number-fabrication validator. Reasons: ${validation.reasons.join('; ')}`,
        validationErrors: validation.reasons,
        modelUsed: modelName,
        generatedAt,
      };
    }

    // Success! Validated plan from Gemini adhering to all rules
    return {
      plan: geminiPlan,
      isFallback: false,
      modelUsed: modelName,
      generatedAt,
    };
  } catch (err: any) {
    // Graceful fallback to deterministic template on any network or API error
    const fallbackPlan = generateDeterministicPlan({ facts, targetCity });
    return {
      plan: fallbackPlan,
      isFallback: true,
      fallbackReason: `Gemini execution failure: ${err.message || 'Unknown error'}. Served deterministic fallback plan.`,
      generatedAt,
    };
  }
}
