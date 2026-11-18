'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  Award,
  ShieldCheck,
  School,
  Heart,
  HardHat,
  Trash,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { calculateDecisionScore, DecisionActionsInput } from '@/engines/decision-score';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CommunityAdvisoryPage() {
  const tNav = useTranslations('nav');

  const [actions, setActions] = React.useState<DecisionActionsInput>({
    avoidedOutdoorPeakHours: true,
    rescheduledOutdoorExercise: true,
    sealedWindowsDuringSmog: true,
    operatedPurifierOrDIYBox: true,
    cleanCookingFuelUsed: true,
    choseLowEmissionTransit: true,
    woreN95MaskOutdoors: true,
  });

  const scoreResult = React.useMemo(() => {
    return calculateDecisionScore(actions);
  }, [actions]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('community')} — Clean-Air Decision Score & Advisories
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures calculated household proactive decisions and actions only, never personal health or clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Clean-Air Decision Score Hero */}
      <Card className="border-emerald-900/40 bg-gradient-to-br from-[#0c161d] to-[#080f15]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-emerald-400" />
              <span>Household Clean-Air Decision Score</span>
            </CardTitle>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {scoreResult.tier} TIER
            </span>
          </div>
          <CardDescription className="text-xs">
            Objective quantification of emission-reduction and exposure-mitigation choices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs text-slate-400">Total Decision Score</div>
              <div className="text-4xl font-extrabold font-mono text-emerald-400">
                {scoreResult.score} <span className="text-base text-slate-500 font-sans">/ 100</span>
              </div>
              <div className="text-xs text-slate-300">
                Tier: <span className="capitalize font-bold text-white">{scoreResult.tier}</span> ({scoreResult.score >= 80 ? 'Exceptional emission reduction' : 'Good household mitigation'})
              </div>
            </div>

            {/* Checklist of toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.avoidedOutdoorPeakHours}
                  onChange={(e) => setActions({ ...actions, avoidedOutdoorPeakHours: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">Avoided Peak Inversion Hours</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.rescheduledOutdoorExercise}
                  onChange={(e) => setActions({ ...actions, rescheduledOutdoorExercise: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">Midday Clean-Air Sports Window</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.sealedWindowsDuringSmog}
                  onChange={(e) => setActions({ ...actions, sealedWindowsDuringSmog: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">Peak Smog Window Sealing</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.operatedPurifierOrDIYBox}
                  onChange={(e) => setActions({ ...actions, operatedPurifierOrDIYBox: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">HEPA or Corsi-Rosenthal Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.cleanCookingFuelUsed}
                  onChange={(e) => setActions({ ...actions, cleanCookingFuelUsed: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">Clean Cooking (LPG/Induction)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.choseLowEmissionTransit}
                  onChange={(e) => setActions({ ...actions, choseLowEmissionTransit: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">Low-Emission Transit (Metro/Bus)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                <input
                  type="checkbox"
                  checked={actions.woreN95MaskOutdoors}
                  onChange={(e) => setActions({ ...actions, woreN95MaskOutdoors: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300">N95 Respirator on Transit</span>
              </label>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            {scoreResult.disclaimer}
          </div>
        </CardContent>
      </Card>

      {/* Community Action & Advisory Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Vulnerable Group & Sectoral Advisories</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schools Card */}
          <Card className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <School className="h-5 w-5 text-sky-400" />
                <span>Schools & Educational Institutions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• Move morning physical education classes and outdoor assemblies indoors during morning inversion (06:00 - 09:30).</p>
              <p>• Ensure classroom cross-ventilation is conducted strictly during midday solar boundary layer expansion (12:00 - 15:00).</p>
              <p>• Distribute N95/FFP2 masks for children commuting on open school buses or rickshaws.</p>
            </CardContent>
          </Card>

          {/* Elderly & Cardiac/Pulmonary Card */}
          <Card className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-400" />
                <span>Senior Citizens & Sensitive Groups</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• Postpone early morning outdoor walks (5:30 - 8:30 AM) when nocturnal ground radiational cooling causes severe surface emission stagnation.</p>
              <p>• Keep indoor bedroom doors sealed with an operational air purifier running on sleep setting overnight.</p>
              <p>• Carry prescribed emergency bronchodilator inhalers during essential travel.</p>
            </CardContent>
          </Card>

          {/* Construction & Urban Work Card */}
          <Card className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <HardHat className="h-5 w-5 text-amber-400" />
                <span>Construction Sites & Fugitive Dust</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• Deploy anti-smog water cannons and continuous fine misting during concrete cutting, demolition, and earthmoving.</p>
              <p>• Cover all loose sand, aggregate, and demolition debris stockpiles with tarpaulin sheeting.</p>
              <p>• Mandate wheel washing for heavy transit dumpers departing site perimeters.</p>
            </CardContent>
          </Card>

          {/* Solid Waste & Biomass Protection */}
          <Card className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Trash className="h-5 w-5 text-emerald-400" />
                <span>Municipal Solid Waste & Biomass Disposal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• Zero tolerance for open roadside leaf, garden trim, and plastic garbage burning.</p>
              <p>• Report open fires to municipal control rooms; open burning produces dense polycyclic aromatic hydrocarbons (PAHs).</p>
              <p>• Support localized community leaf composting and organic biomass pits.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
