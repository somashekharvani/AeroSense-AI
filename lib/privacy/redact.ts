/**
 * Privacy Redaction & Prompt Injection Guard
 *
 * NON-NEGOTIABLE RULE from AGENTS.md:
 * "Health wording is guidance only, never diagnosis. Family data stays on the device.
 * Redact personal details before any Gemini call. Filter prompt injection on all user text."
 */

import { FamilyMember } from '../validation/schemas';

export interface SanitizedMemberProfile {
  id: string;
  pseudonym: string;
  ageGroup: 'child' | 'adult' | 'elderly';
  activityLevel: 'rest' | 'light' | 'moderate';
  sensitivities: Array<'asthma' | 'copd' | 'cardiovascular' | 'pregnancy' | 'allergies'>;
  isSensitive: boolean;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|system|safety)\s+(directives|rules|prompts)/i,
  /you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan|jailbroken)/i,
  /system\s*prompt\s*:\s*/i,
  /override\s+(all\s+)?guidelines/i,
  /act\s+as\s+a\s+(medical\s+doctor|cardiologist|pulmonologist)\s+diagnosing/i,
  /diagnose\s+(my|this)\s+(disease|condition|illness)/i,
  /prescribe\s+(medication|drugs|antibiotics)/i,
  /pretend\s+you\s+can\s+invent\s+numbers/i,
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}/g;

/**
 * Redacts email addresses and telephone numbers from raw text
 */
export function redactPii(text: string): string {
  if (!text) return '';
  return text
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]');
}

/**
 * Sanitizes family profiles so personal names and exact PII stay strictly on the device
 */
export function sanitizeFamilyProfiles(
  members: FamilyMember[]
): SanitizedMemberProfile[] {
  return members.map((member, index) => {
    const isSensitive = member.sensitivities && member.sensitivities.length > 0;
    const category = isSensitive ? 'sensitive' : member.ageGroup;

    return {
      id: member.id,
      pseudonym: `Member ${index + 1} (${category})`,
      ageGroup: member.ageGroup,
      activityLevel: member.activityLevel,
      sensitivities: member.sensitivities || [],
      isSensitive,
    };
  });
}

export interface PromptSanitizationResult {
  isSafe: boolean;
  sanitizedText: string;
  flaggedPatterns: string[];
}

/**
 * Inspects user input for prompt injection, jailbreaks, and medical diagnosis solicitation
 */
export function filterPromptInjection(text: string): PromptSanitizationResult {
  if (!text) {
    return { isSafe: true, sanitizedText: '', flaggedPatterns: [] };
  }

  // 1. Redact direct PII
  let cleaned = redactPii(text.trim());

  // 2. Scan for injection patterns
  const flagged: string[] = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      flagged.push(pattern.source);
    }
  }

  if (flagged.length > 0) {
    return {
      isSafe: false,
      sanitizedText: cleaned,
      flaggedPatterns: flagged,
    };
  }

  // Strip excessive markdown / formatting that could alter system JSON output
  cleaned = cleaned.replace(/```/g, "'''");

  return {
    isSafe: true,
    sanitizedText: cleaned,
    flaggedPatterns: [],
  };
}
