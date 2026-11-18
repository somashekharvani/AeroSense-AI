import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { fontVariablesClass } from '@/lib/fonts';
import { DEFAULT_LOCALE, isValidLocale, getLocaleDirection, Locale } from '@/lib/i18n/locales';
import { LanguageProvider } from '@/lib/i18n/context';
import { LocationProvider } from '@/components/location/location-provider';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'AeroSense AI — Clean-Air Decision Engine',
  description:
    'Know the air. Predict the risk. Protect your family. Prove the impact. Deterministic science and AI clean-air routines.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const initialLocale: Locale =
    rawLocale && isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const direction = getLocaleDirection(initialLocale);
  const initialMessages = (await import(`@/messages/${initialLocale}.json`)).default;

  return (
    <html lang={initialLocale} dir={direction} className={fontVariablesClass}>
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <LanguageProvider
          initialLocale={initialLocale}
          initialMessages={initialMessages}
        >
          <LocationProvider>
            <AppShell>{children}</AppShell>
          </LocationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
