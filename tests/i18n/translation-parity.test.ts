import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';

function getNestedKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getNestedKeys(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

function getNestedValue(obj: Record<string, any>, keyPath: string): any {
  return keyPath.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

describe('Multilingual Translation Key Parity', () => {
  const messagesDir = path.resolve(__dirname, '../../messages');
  const enRaw = fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8');
  const enMessages = JSON.parse(enRaw);
  const enKeys = getNestedKeys(enMessages);

  it('English source messages file exists and has non-empty keys', () => {
    expect(enKeys.length).toBeGreaterThan(30);
  });

  const otherLocales = SUPPORTED_LOCALES.filter((loc) => loc !== 'en');

  otherLocales.forEach((locale) => {
    describe(`Locale: ${locale}`, () => {
      const filePath = path.join(messagesDir, `${locale}.json`);

      it(`file ${locale}.json exists on disk`, () => {
        expect(fs.existsSync(filePath)).toBe(true);
      });

      it(`contains every key from en.json without missing values`, () => {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const messages = JSON.parse(raw);

        const missingKeys: string[] = [];
        const emptyKeys: string[] = [];

        enKeys.forEach((key) => {
          const val = getNestedValue(messages, key);
          if (val === undefined) {
            missingKeys.push(key);
          } else if (typeof val === 'string' && val.trim() === '') {
            emptyKeys.push(key);
          }
        });

        expect(missingKeys, `Missing keys in ${locale}.json`).toEqual([]);
        expect(emptyKeys, `Empty translation keys in ${locale}.json`).toEqual([]);
      });

      it(`has metadata with needsNativeReview set to true`, () => {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const messages = JSON.parse(raw);
        expect(messages.metadata).toBeDefined();
        expect(messages.metadata.needsNativeReview).toBe(true);
      });
    });
  });
});
