export const SUPPORTED_LOCALES = [
  'en',
  'hi',
  'kn',
  'ta',
  'te',
  'ml',
  'mr',
  'bn',
  'gu',
  'pa',
  'ur',
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleInfo {
  code: Locale;
  name: string; // Native name
  englishName: string;
  direction: 'ltr' | 'rtl';
  script: string;
}

export const LOCALES_INFO: Record<Locale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    direction: 'ltr',
    script: 'Latin',
  },
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    direction: 'ltr',
    script: 'Devanagari',
  },
  kn: {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    direction: 'ltr',
    script: 'Kannada',
  },
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    direction: 'ltr',
    script: 'Tamil',
  },
  te: {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    direction: 'ltr',
    script: 'Telugu',
  },
  ml: {
    code: 'ml',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    direction: 'ltr',
    script: 'Malayalam',
  },
  mr: {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    direction: 'ltr',
    script: 'Devanagari',
  },
  bn: {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    direction: 'ltr',
    script: 'Bengali',
  },
  gu: {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    direction: 'ltr',
    script: 'Gujarati',
  },
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    direction: 'ltr',
    script: 'Gurmukhi',
  },
  ur: {
    code: 'ur',
    name: 'اردو',
    englishName: 'Urdu',
    direction: 'rtl',
    script: 'Arabic',
  },
};

export function isValidLocale(code: string): code is Locale {
  return SUPPORTED_LOCALES.includes(code as Locale);
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES_INFO[locale]?.direction ?? 'ltr';
}
