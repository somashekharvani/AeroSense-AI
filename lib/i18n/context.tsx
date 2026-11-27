'use client';

import * as React from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import {
  Locale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALES_INFO,
  isValidLocale,
  getLocaleDirection,
} from './locales';

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => Promise<void>;
  direction: 'ltr' | 'rtl';
  isRtl: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  initialLocale: Locale;
  initialMessages: AbstractIntlMessages;
  children: React.ReactNode;
}

export function LanguageProvider({
  initialLocale,
  initialMessages,
  children,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);
  const [messages, setMessages] = React.useState<AbstractIntlMessages>(initialMessages);

  // Sync html lang and dir on mount or change
  React.useEffect(() => {
    const dir = getLocaleDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    // Set cookie for server request persistence
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale]);

  // Handle URL ?lang= parameter on initial mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang && isValidLocale(urlLang) && urlLang !== locale) {
        changeLanguage(urlLang);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeLanguage = async (newLocale: Locale) => {
    if (newLocale === locale) return;
    try {
      // Dynamic import of new locale JSON
      const newMessages = (await import(`@/messages/${newLocale}.json`)).default;
      setLocaleState(newLocale);
      setMessages(newMessages);

      const dir = getLocaleDirection(newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = dir;
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // Sync with URL query parameter without full page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLocale);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (err) {
      console.error(`Failed to load messages for locale ${newLocale}:`, err);
    }
  };

  const direction = getLocaleDirection(locale);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: changeLanguage,
        direction,
        isRtl: direction === 'rtl',
      }}
    >
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}
