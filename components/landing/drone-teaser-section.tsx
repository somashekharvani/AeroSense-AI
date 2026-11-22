'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Navigation, Radio, Cpu, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { SourceBadge } from '@/components/ui/source-badge';

export function DroneTeaserSection() {
  const t = useTranslations('droneTeaser');

  return (
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0c1320] via-[#080d16] to-[#05080c] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden relative">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Information */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Navigation className="h-3.5 w-3.5" />
              {t('badge')}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono">
              {t('statusNotConnected')}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-[10px] text-amber-300 font-mono">
              {t('demoSimulated')}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {t('title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Architecture Flow Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1 text-slate-300">
            <span className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              {t('step1')}
            </span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              {t('step2')}
            </span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              {t('step3')}
            </span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              {t('step4')}
            </span>
          </div>

          {/* Honesty note */}
          <p className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-3">
            {t('honestyNote')}
          </p>

          <div className="pt-2">
            <Link
              href="/drone"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all hover:gap-3"
            >
              <span>{t('exploreLab')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Graphical Box */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>{t('telemetryTitle')}</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {t('simulatedDemoBadge')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{t('altitudeLabel')}</span>
              <span className="text-base font-bold text-cyan-300">{t('altitudeValue')}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{t('batteryLabel')}</span>
              <span className="text-base font-bold text-emerald-300">{t('batteryValue')}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{t('mq135Label')}</span>
              <span className="text-base font-bold text-amber-300">{t('mq135Elevated')}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{t('hardwareStateLabel')}</span>
              <span className="text-base font-bold text-slate-400">{t('statusNotConnected')}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>{t('disclaimer')}</span>
          </div>
        </div>
      </div>

      {/* Decorative ambient background glow */}
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
    </section>
  );
}
