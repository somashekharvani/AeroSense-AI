'use client';

import * as React from 'react';
import Link from 'next/link';
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

interface Pillar {
  id: string;
  pillarNumber: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  color: string;
  borderHover: string;
  accentBg: string;
  icon: React.ElementType;
  highlights: string[];
}

const PILLARS: Pillar[] = [
  {
    id: 'know',
    pillarNumber: 'Pillar 01',
    title: 'Know',
    tagline: 'Live Indian NAQI & Criteria Pollutants',
    description:
      'Fused multi-sensor observations (ground stations, Open-Meteo atmospheric profile, and NASA satellite fire anomalies) computed strictly through official CPCB October 2014 breakpoint interpolation.',
    href: '/live',
    color: 'text-emerald-400',
    borderHover: 'hover:border-emerald-500/50',
    accentBg: 'bg-emerald-500/10',
    icon: Activity,
    highlights: ['CPCB October 2014 Scale', '8 Criteria Pollutants', 'Fused Confidence Scoring'],
  },
  {
    id: 'predict',
    pillarNumber: 'Pillar 02',
    title: 'Predict',
    tagline: '48-Hour Outlook & Inversion Risk',
    description:
      'Atmospheric thermal stability models calculate vertical lapse rates at 925 hPa and 850 hPa geopotential heights. Predicts nocturnal smog lids, boundary layer compression, and honest station backtesting.',
    href: '/forecast',
    color: 'text-teal-400',
    borderHover: 'hover:border-teal-500/50',
    accentBg: 'bg-teal-500/10',
    icon: TrendingUp,
    highlights: ['925 hPa Lapse Rate', 'Nocturnal Smog Compression', 'Backtest MAE & RMSE'],
  },
  {
    id: 'protect',
    pillarNumber: 'Pillar 03',
    title: 'Protect',
    tagline: 'On-Device Family Exposure Budgets',
    description:
      'Calculate personalized inhaled PM2.5 mass doses (µg) using EPA Exposure Factors Handbook ventilation rates. Track daily limits against WHO guideline budgets. Stored strictly in browser IndexedDB.',
    href: '/family',
    color: 'text-sky-400',
    borderHover: 'hover:border-sky-500/50',
    accentBg: 'bg-sky-500/10',
    icon: ShieldAlert,
    highlights: ['EPA Inhaled Mass Dose', 'WHO Daily Allowances', 'Zero Server Data Leakage'],
  },
  {
    id: 'home',
    pillarNumber: 'Pillar 04',
    title: 'Home',
    tagline: 'Indoor PM2.5 Mass-Balance Model',
    description:
      'Solves the first-order differential equation dC/dt = P·a·C_out + S/V - λC in real time. Know when to seal or ventilate, size your air purifier CADR (m³/h), or build a low-cost Corsi-Rosenthal DIY box.',
    href: '/indoor',
    color: 'text-indigo-400',
    borderHover: 'hover:border-indigo-500/50',
    accentBg: 'bg-indigo-500/10',
    icon: Home,
    highlights: ['First-Order Mass Balance ODE', 'Purifier CADR Sizing', 'Corsi-Rosenthal Box Specs'],
  },
  {
    id: 'act',
    pillarNumber: 'Pillar 05',
    title: 'Act',
    tagline: 'What-If Simulator & Impact Receipts',
    description:
      'Simulate switching from a petrol two-wheeler to the Delhi Metro, transitioning cooking fuel from biomass to LPG, or running a HEPA purifier. Every quantified claim produces an auditable Impact Receipt.',
    href: '/what-if',
    color: 'text-amber-400',
    borderHover: 'hover:border-amber-500/50',
    accentBg: 'bg-amber-500/10',
    icon: SlidersHorizontal,
    highlights: ['Auditable Impact Receipts', 'Tailpipe & Inhaled Dose Math', 'Empirical Assumptions Log'],
  },
];

export function PillarCards() {
  return (
    <section id="pillars" className="space-y-6 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          The Five Pillars
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          How AeroSense AI Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Our own deterministic scientific engines execute all the mathematics. Every quantified recommendation produces an auditable Impact Receipt citing raw data, baseline, and scientific methods.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {PILLARS.map((p) => {
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
                AI Copilot
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wind className="h-4 w-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5 font-display">
                <span>Fact-Grounded AI Copilot</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-purple-400" />
              </h3>
              <h4 className="text-xs font-semibold text-purple-400 mt-0.5">
                Gemini 2.5 Flash with Zero Number Fabrication
              </h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini plans and explains, but never invents science. Every answer is audited by a validator that rejects fabricated metrics and falls back to deterministic rules if unverified.
            </p>
          </div>

          <div className="border-t border-purple-900/40 pt-4 mt-5 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>Cites Deterministic Fact IDs</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>Prompt Injection Defense</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-purple-200">
              <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" />
              <span>100% Offline Rule Fallback</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
