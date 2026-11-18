'use client';

import * as React from 'react';
import { ShieldAlert, ExternalLink, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const tCommon = useTranslations('common');

  return (
    <footer className="w-full border-t border-white/10 bg-[#06090e] py-8 px-4 sm:px-6 text-xs text-slate-400 mt-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Medical & Guidance Notice Banner */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-amber-200">Guidance Notice</h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {tCommon('disclaimer')}
            </p>
          </div>
        </div>

        {/* Data Sources and Attributions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
            <span className="font-semibold text-slate-300">Data Sources:</span>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <span>Open-Meteo</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://waqi.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <span>WAQI CPCB Feeds</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <span>NASA FIRMS VIIRS</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="text-slate-500 font-mono text-[10px]">
            AeroSense AI • PromptWars Challenge 6
          </div>
        </div>
      </div>
    </footer>
  );
}
