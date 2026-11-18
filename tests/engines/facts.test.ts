import { describe, it, expect } from 'vitest';
import {
  buildFactsObject,
  normalizeScriptDigits,
  extractNumbersFromText,
} from '@/lib/facts';
import { calculateIndianAqi } from '@/engines/indian-aqi';
import { calculateInversionRisk } from '@/engines/inversion';

describe('Facts Builder & Number Normalization Engine', () => {
  it('builds a structured FactsObject with stable IDs from engine outputs', () => {
    const aqi = calculateIndianAqi({
      pm25: 145,
      pm10: 95,
      no2: 40,
    });

    const inversion = calculateInversionRisk({
      surfaceTempC: 10,
      surfaceElevationM: 200,
      boundaryLayerHeightM: 250,
      windSpeed10mKmh: 4,
      cloudCoverPct: 10,
      localHour: 4,
      pressure925: { tempC: 13, geopotentialHeightM: 950 },
    });

    const facts = buildFactsObject({
      aqi,
      inversion,
      locationName: 'Delhi Central',
    });

    expect(facts['FACT-LOC-NAME'].value).toBe('Delhi Central');
    expect(facts['FACT-AQI-VALUE'].value).toBe(aqi.aqi);
    expect(facts['FACT-AQI-CATEGORY'].value).toBe(aqi.category);
    expect(facts['FACT-INV-SCORE'].value).toBe(inversion.score);
    expect(facts['FACT-INV-LEVEL'].value).toBe(inversion.level);
    expect(facts['FACT-POL-PM25-CONC'].value).toBe(145);
  });

  describe('Multilingual Native Script Digit Normalization', () => {
    it('normalizes Devanagari numerals (०-९)', () => {
      expect(normalizeScriptDigits('पीएम २.५ का स्तर १४२ है')).toBe('पीएम 2.5 का स्तर 142 है');
    });

    it('normalizes Bengali numerals (০-৯)', () => {
      expect(normalizeScriptDigits('পিএম ২.৫ মাত্রা ১৫৬')).toBe('পিএম 2.5 মাত্রা 156');
    });

    it('normalizes Kannada numerals (೦-೯)', () => {
      expect(normalizeScriptDigits('ಪಿಎಂ ೨.೫ ಮಟ್ಟ ೧೪೦')).toBe('ಪಿಎಂ 2.5 ಮಟ್ಟ 140');
    });

    it('normalizes Gujarati numerals (૦-૯)', () => {
      expect(normalizeScriptDigits('પીએમ ૨.૫ માત્રા ૧૨૦')).toBe('પીએમ 2.5 માત્રા 120');
    });

    it('normalizes Gurmukhi numerals (੦-੯)', () => {
      expect(normalizeScriptDigits('ਪੀਐਮ ੨.੫ ਪੱਧਰ ੧੮੦')).toBe('ਪੀਐਮ 2.5 ਪੱਧਰ 180');
    });

    it('normalizes Arabic-Indic / Urdu numerals (۰-۹)', () => {
      expect(normalizeScriptDigits('پی ایم ۲.۵ کی سطح ۲۰۰ ہے')).toBe('پی ایم 2.5 کی سطح 200 ہے');
    });

    it('extracts numbers accurately from sentences containing Indic digits', () => {
      const extracted = extractNumbersFromText('दिल्ली में एक्यूआई ३४५ दर्ज किया गया और पीएम २.५ स्तर १५०.५ था');
      expect(extracted).toContain(345);
      expect(extracted).toContain(150.5);
    });

    it('filters out time strings so 14:30 is not extracted as a random number', () => {
      const extracted = extractNumbersFromText('Meeting at 14:30 with PM2.5 level 85');
      expect(extracted).toContain(85);
      expect(extracted).not.toContain(14);
      expect(extracted).not.toContain(30);
    });
  });
});
