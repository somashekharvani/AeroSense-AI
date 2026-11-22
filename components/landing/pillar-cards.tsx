'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Activity,
  TrendingUp,
  ShieldAlert,
  Home,
  SlidersHorizontal,
  ArrowUpRight,
  Wind,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PillarCards() {
  const t = useTranslations('pillars');

  const pillars = [
    {
      id: 'know',
      pillarNumber: t('know.number'),
      title: t('know.title'),
      tagline: t('know.tagline'),
      description: t('know.description'),
      href: '/live',
      color: 'text-emerald-400',
      borderHover: 'hover:border-emerald-500/50',
      accentBg: 'bg-emerald-500/10',
      icon: Activity,
      highlights: [t('know.h1'), t('know.h2'), t('know.h3')],
    },
    {
      id: 'predict',
      pillarNumber: t('predict.number'),
      title: t('predict.title'),
      tagline: t('predict.tagline'),
      description: t('predict.description'),
      href: '/forecast',
      color: 'text-teal-400',
      borderHover: 'hover:border-teal-500/50',
      accentBg: 'bg-teal-500/10',
      icon: TrendingUp,
      highlights: [t('predict.h1'), t('predict.h2'), t('predict.h3')],
    },
    {
      id: 'protect',
      pillarNumber: t('protect.number'),
      title: t('protect.title'),
      tagline: t('protect.tagline'),
      description: t('protect.description'),
      href: '/family',
      color: 'text-sky-400',
      borderHover: 'hover:border-sky-500/50',
      accentBg: 'bg-sky-500/10',
      icon: ShieldAlert,
      highlights: [t('protect.h1'), t('protect.h2'), t('protect.h3')],
    },
    {
      id: 'home',
      pillarNumber: t('home.number'),
      title: t('home.title'),
      tagline: t('home.tagline'),
      description: t('home.description'),
      href: '/indoor',
      color: 'text-indigo-400',
      borderHover: 'hover:border-indigo-500/50',
      accentBg: 'bg-indigo-500/10',
      icon: Home,
      highlights: [t('home.h1'), t('home.h2'), t('home.h3')],
    },
    {
      id: 'act',
      pillarNumber: t('act.number'),
      title: t('act.title'),
      tagline: t('act.tagline'),
      description: t('act.description'),
      href: '/what-if',
      color: 'text-amber-400',
      borderHover: 'hover:border-amber-500/50',
      accentBg: 'bg-amber-500/10',
      icon: SlidersHorizontal,
      highlights: [t('act.h1'), t('act.h2'), t('act.h3')],
    },
  ];

  return (
    <section id="pillars" className="space-y-6 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          {t('sectionTag')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {t('sectionTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t('sectionDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.id}
              href={p.href}
              className={cn(
                'group relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#0b131c] to-[#070b10] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between',
                p.borderHover
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    {p.pillarNumber}
                  </span>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
                      p.accentBg,
                      p.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-display">
                    <span>{p.title}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-emerald-400" />
                  </h3>
                  <h4 className={cn('text-xs font-semibold mt-0.5', p.color)}>{p.tagline}</h4>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
              </div>

              <div className="border-t border-slate-800/60 pt-4 mt-5 space-y-1.5">
                {p.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}

        {/* Sixth Card: AI Copilot & Explainability */}
        <Link
          href="/copilot"
          className="group relative rounded-2xl border border-purple-900/40 bg-gradient-to-b from-[#130f24] to-[#080612] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-2xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400">
                {t('copilot.tag')}
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wind className="h-4 w-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5 font-display">
                <span>{t('copilot.title')}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-purple-400" />
              </h3>
              <h4 className="text-xs font-semibold text-purple-400 mt-0.5">
                {t('copilot.tagline')}
              </h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t('copilot.description')}
            </p>
          </div>

          <div className="border-t border-purple-900/40 pt-4 mt-5 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>{t('copilot.h1')}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>{t('copilot.h2')}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>{t('copilot.h3')}</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
