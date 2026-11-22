'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Wind, Shield, Database, ExternalLink, Heart } from 'lucide-react';

export function LandingFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-slate-800/80 bg-[#04070b] text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wind className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-base font-extrabold text-white font-display">AeroSense AI</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {t('tagline')}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
              {t('mission')}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-display">
              {t('coreIntelligence')}
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/overview" className="hover:text-emerald-400 transition-colors">
                  {t('telemetryDashboard')}
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-emerald-400 transition-colors">
                  {t('pillar1')}
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="hover:text-teal-400 transition-colors">
                  {t('pillar2')}
                </Link>
              </li>
              <li>
                <Link href="/family" className="hover:text-sky-400 transition-colors">
                  {t('pillar3')}
                </Link>
              </li>
              <li>
                <Link href="/indoor" className="hover:text-indigo-400 transition-colors">
                  {t('pillar4')}
                </Link>
              </li>
              <li>
                <Link href="/what-if" className="hover:text-amber-400 transition-colors">
                  {t('pillar5')}
                </Link>
              </li>
              <li>
                <Link href="/drone" className="hover:text-cyan-400 transition-colors">
                  {t('droneLab')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources & Provenance */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-display">
              {t('scientificSources')}
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>{t('openMeteoSource')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://waqi.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>{t('waqiSource')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://firms.modaps.eosdis.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>{t('nasaSource')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">{t('cpcbStandard')}</span>
              </li>
              <li>
                <span className="text-slate-500">{t('epaStandard')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Health Disclaimers */}
        <div className="border-t border-slate-800/60 pt-6 space-y-2 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-400">{t('healthNoticeLabel')}</strong> {t('healthNoticeText')}
          </p>
          <p>
            <strong className="text-slate-400">{t('privacyAssuranceLabel')}</strong> {t('privacyAssuranceText')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-600 gap-2">
            <span>{t('copyright')}</span>
            <span>{t('subCopyright')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
