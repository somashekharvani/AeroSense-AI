'use client';

import * as React from 'react';
import { Database, Cpu, ShieldCheck, Sparkles, FileCheck, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Multi-Source Telemetry Ingestion',
      subtitle: 'Open-Meteo • WAQI CPCB • NASA FIRMS • Drone',
      description:
        'Continuous raw data acquisition from numerical atmospheric models, ground-level CPCB monitoring stations, and NASA VIIRS satellite thermal detections.',
      icon: Database,
      accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    },
    {
      step: '02',
      title: 'Deterministic Scientific Engines',
      subtitle: 'Pure Mathematical Models with Zero LLM Call',
      description:
        'All science is computed deterministically: official CPCB linear interpolation, 925 hPa vertical lapse rates, EPA exposure doses, and indoor mass-balance ODEs.',
      icon: Cpu,
      accent: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    },
    {
      step: '03',
      title: 'Auditable Facts Object Assembly',
      subtitle: 'FACT-AQI-VALUE • FACT-INV-SCORE • FACT-EXP',
      description:
        'Engine outputs are compiled into a strictly typed Facts Object with permanent citation IDs. Numbers not present in this registry can never be cited.',
      icon: FileCheck,
      accent: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    },
    {
      step: '04',
      title: 'Zero-Fabrication Explainable AI',
      subtitle: 'Gemini 2.5 Flash + Audited Impact Receipts',
      description:
        'Gemini plans and explains recommendations while a strict validator rejects hallucinated figures. Every claim outputs an auditable Impact Receipt.',
      icon: ShieldCheck,
      accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 uppercase tracking-wider">
          Architecture & Integrity
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Science Done Deterministically. AI for Explanation.
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Unlike ordinary AI chat applications that hallucinate health figures, AeroSense AI enforces a strict boundary: our mathematical engines calculate the physics, while Gemini only explains the verified results.
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
