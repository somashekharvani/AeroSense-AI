'use client';

import * as React from 'react';
import { Sparkles, MapPin, Globe, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/context';
import { useLocation } from './location-provider';
import { SUPPORTED_LOCALES, LOCALES_INFO, Locale } from '@/lib/i18n/locales';
import { PRESET_CITIES } from '@/lib/location/presets';
import { roundCoordinate } from '@/lib/validation/location';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WelcomeModal() {
  const t = useTranslations('welcome');
  const tCommon = useTranslations('common');
  const { locale, setLocale } = useLanguage();
  const { isFirstVisit, completeFirstVisit, location, setLocation } = useLocation();

  const [step, setStep] = React.useState<1 | 2>(1);

  if (!isFirstVisit) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c131a] p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* App Branding */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/60 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 id="welcome-heading" className="text-xl font-bold font-display text-white">
              {t('welcomeTitle')}
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              {tCommon('tagline')}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
              step === 1
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{t('step1')}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
              step === 2
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-slate-900 border border-slate-800 text-slate-400'
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{t('step2')}</span>
          </div>
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Select your preferred language. All air quality alerts, daily plans, and Impact Receipts
              will render seamlessly in this script.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
              {SUPPORTED_LOCALES.map((code) => {
                const info = LOCALES_INFO[code];
                const isSelected = locale === code;
                return (
                  <button
                    key={code}
                    onClick={() => setLocale(code)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 text-start transition-all cursor-pointer',
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">{info.name}</span>
                        {info.status === 'active' && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{info.englishName}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="emerald"
                size="md"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Location Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Choose your primary city or region. We calculate CPCB AQI, inversion risk, and clean-air windows for this coordinate.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {PRESET_CITIES.map((city) => {
                const isSelected =
                  Math.abs(location.lat - city.lat) < 0.02 &&
                  Math.abs(location.lon - city.lon) < 0.02;
                return (
                  <button
                    key={city.id}
                    onClick={() =>
                      setLocation({
                        id: city.id,
                        name: city.name,
                        state: city.state,
                        country: city.country,
                        lat: roundCoordinate(city.lat),
                        lon: roundCoordinate(city.lon),
                        isCustom: false,
                        savedAt: Date.now(),
                      })
                    }
                    className={cn(
                      'flex flex-col rounded-xl border p-3 text-start transition-all cursor-pointer',
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">{city.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-400">{city.state}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Coordinates are rounded to 2 decimal places to protect your privacy. No personal data leaves this device.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Back to Languages
              </Button>
              <Button variant="emerald" size="lg" onClick={completeFirstVisit}>
                {t('getStarted')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
