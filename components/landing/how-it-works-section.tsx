'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Database, Cpu, ShieldCheck, Sparkles, FileCheck, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      step: t('step1.num'),
      title: t('step1.title'),
      subtitle: t('step1.subtitle'),
      description: t('step1.desc'),
      icon: Database,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      step: t('step2.num'),
      title: t('step2.title'),
      subtitle: t('step2.subtitle'),
      description: t('step2.desc'),
      icon: Cpu,
      accent: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    },
    {
      step: t('step3.num'),
      title: t('step3.title'),
      subtitle: t('step3.subtitle'),
      description: t('step3.desc'),
      icon: FileCheck,
      accent: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    },
    {
      step: t('step4.num'),
      title: t('step4.title'),
      subtitle: t('step4.subtitle'),
      description: t('step4.desc'),
      icon: ShieldCheck,
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 uppercase tracking-wider">
          {t('sectionTag')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {t('sectionTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t('sectionDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative rounded-2xl border border-slate-800 bg-[#091118]/80 p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{s.step}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${s.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white font-display">{s.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{s.subtitle}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
