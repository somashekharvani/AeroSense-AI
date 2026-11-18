import {
  Outfit,
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Malayalam,
  Noto_Sans_Bengali,
  Noto_Sans_Gujarati,
  Noto_Sans_Gurmukhi,
  Noto_Naskh_Arabic,
} from 'next/font/google';
import { Locale } from './i18n/locales';

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoKannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  variable: '--font-kannada',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  variable: '--font-tamil',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  variable: '--font-telugu',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-malayalam',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  variable: '--font-gujarati',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi'],
  variable: '--font-gurmukhi',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const fontVariablesClass = [
  outfit.variable,
  plusJakartaSans.variable,
  notoDevanagari.variable,
  notoKannada.variable,
  notoTamil.variable,
  notoTelugu.variable,
  notoMalayalam.variable,
  notoBengali.variable,
  notoGujarati.variable,
  notoGurmukhi.variable,
  notoNaskhArabic.variable,
].join(' ');

export function getScriptFontFamily(locale: Locale): string {
  switch (locale) {
    case 'hi':
    case 'mr':
      return 'var(--font-devanagari), var(--font-body), sans-serif';
    case 'kn':
      return 'var(--font-kannada), var(--font-body), sans-serif';
    case 'ta':
      return 'var(--font-tamil), var(--font-body), sans-serif';
    case 'te':
      return 'var(--font-telugu), var(--font-body), sans-serif';
    case 'ml':
      return 'var(--font-malayalam), var(--font-body), sans-serif';
    case 'bn':
      return 'var(--font-bengali), var(--font-body), sans-serif';
    case 'gu':
      return 'var(--font-gujarati), var(--font-body), sans-serif';
    case 'pa':
      return 'var(--font-gurmukhi), var(--font-body), sans-serif';
    case 'ur':
      return 'var(--font-arabic), var(--font-body), sans-serif';
    default:
      return 'var(--font-body), sans-serif';
  }
}
