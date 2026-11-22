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
  status: 'active' | 'coming_soon';
}

export const PRIMARY_LOCALES: Locale[] = ['en', 'kn', 'hi'];

export const LOCALES_INFO: Record<Locale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    direction: 'ltr',
    script: 'Latin',
    status: 'active',
  },
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    direction: 'ltr',
    script: 'Devanagari',
    status: 'active',
  },
  kn: {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    direction: 'ltr',
    script: 'Kannada',
    status: 'active',
  },
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    direction: 'ltr',
    script: 'Tamil',
    status: 'coming_soon',
  },
  te: {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    direction: 'ltr',
    script: 'Telugu',
    status: 'coming_soon',
  },
  ml: {
    code: 'ml',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    direction: 'ltr',
    script: 'Malayalam',
    status: 'coming_soon',
  },
  mr: {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    direction: 'ltr',
    script: 'Devanagari',
    status: 'coming_soon',
  },
  bn: {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    direction: 'ltr',
    script: 'Bengali',
    status: 'coming_soon',
  },
  gu: {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    direction: 'ltr',
    script: 'Gujarati',
    status: 'coming_soon',
  },
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    direction: 'ltr',
    script: 'Gurmukhi',
    status: 'coming_soon',
  },
  ur: {
    code: 'ur',
    name: 'اردو',
    englishName: 'Urdu',
    direction: 'rtl',
    script: 'Arabic',
    status: 'coming_soon',
  },
};

export function isValidLocale(code: string): code is Locale {
  return SUPPORTED_LOCALES.includes(code as Locale);
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALES_INFO[locale]?.direction ?? 'ltr';
}
