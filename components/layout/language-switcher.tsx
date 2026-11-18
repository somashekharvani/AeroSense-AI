'use client';

import * as React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { SUPPORTED_LOCALES, LOCALES_INFO, Locale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = LOCALES_INFO[locale] || LOCALES_INFO.en;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="font-medium">{currentInfo.name}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute end-0 mt-2 w-48 rounded-xl border border-slate-700/80 bg-[#0c131a] p-1.5 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-100 max-h-80 overflow-y-auto"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-white/5 mb-1">
            Select Language (11)
          </div>
          {SUPPORTED_LOCALES.map((code) => {
            const info = LOCALES_INFO[code];
            const isSelected = locale === code;
            return (
              <button
                key={code}
                role="menuitem"
                onClick={() => {
                  setLocale(code);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer text-start',
                  isSelected
                    ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm leading-tight">{info.name}</span>
                  <span className="text-[10px] text-slate-500">{info.englishName}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
