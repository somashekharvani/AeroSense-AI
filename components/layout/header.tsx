'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Settings as SettingsIcon, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocation } from '@/components/location/location-provider';
import { LanguageSwitcher } from './language-switcher';
import { cn } from '@/lib/utils';

export function Header({
  onOpenSettings,
  onToggleSidebar,
}: {
  onOpenSettings: () => void;
  onToggleSidebar?: () => void;
}) {
  const tCommon = useTranslations('common');
  const tLocation = useTranslations('location');
  const { location, openLocationDialog } = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#06090e]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger + App Branding */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-950/40 text-white transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-display text-base tracking-tight text-white flex items-center gap-1.5">
                {tCommon('appName')}
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline truncate max-w-[220px]">
                Clean-Air Decision Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Location Chip, Language Switcher, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location Chip */}
          <button
            onClick={openLocationDialog}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
            title={tLocation('changeLocation')}
            aria-label={`Current location: ${location.name}. Click to change.`}
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-start">
              <span className="font-semibold text-white leading-tight max-w-[100px] sm:max-w-[140px] truncate">
                {location.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono hidden md:inline">
                {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
              </span>
            </div>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open settings and privacy"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
