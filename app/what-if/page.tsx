'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Bike,
  Flame,
  Wind,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useSnapshot } from '@/hooks/use-snapshot';
import {
  calculateTransportImpact,
  calculateCookingImpact,
  calculatePurifierImpact,
} from '@/engines/impact';
import { ImpactReceiptCard } from '@/components/impact-receipts/impact-receipt-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WhatIfSimulatorPage() {
  const tNav = useTranslations('nav');
  const { data: snapshot } = useSnapshot();

  const ambientPm25 = snapshot?.fusedAir?.pollutants?.pm25 ?? 140;

  // Scenario 1: Commute Modal Shift
  const [commuteDistanceKm, setCommuteDistanceKm] = React.useState<number>(12);
  const [commuteAlternative, setCommuteAlternative] = React.useState<'metro' | 'bus'>('metro');

  // Scenario 2: Cooking Fuel
  const [cookingHours, setCookingHours] = React.useState<number>(2.0);
  const [cleanFuel, setCleanFuel] = React.useState<'lpg' | 'electric'>('lpg');

  // Scenario 3: Indoor Purifier
  const [purifierRoomVolume, setPurifierRoomVolume] = React.useState<number>(60);
  const [purifierCadr, setPurifierCadr] = React.useState<number>(300);

  // Compute Impact Receipts
  const transitReceipt = React.useMemo(() => {
    return calculateTransportImpact({
      baselineMode: 'petrol_2w',
      alternativeMode: commuteAlternative,
      oneWayDistanceKm: commuteDistanceKm,
      ambientPm25UgM3: ambientPm25,
    });
  }, [commuteDistanceKm, ambientPm25, commuteAlternative]);

  const cookingReceipt = React.useMemo(() => {
    return calculateCookingImpact({
      baselineFuel: 'biomass',
      alternativeFuel: cleanFuel,
      cookingHoursPerDay: cookingHours,
      roomVolumeM3: 60,
    });
  }, [cleanFuel, cookingHours]);

  const purifierReceipt = React.useMemo(() => {
    return calculatePurifierImpact({
      roomVolumeM3: purifierRoomVolume,
      ambientPm25UgM3: ambientPm25,
      runtimeHours: 8,
      cadrM3h: purifierCadr,
    });
  }, [purifierRoomVolume, purifierCadr, ambientPm25]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('whatIf')} — What-If Simulator & Impact Receipts
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate household choices (commute modal shift, cooking fuel, HEPA filtration). Every quantified claim produces an auditable Impact Receipt.
          </p>
        </div>
      </div>

      {/* Scenario 1: Commute Modal Shift */}
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Bike className="h-5 w-5 text-emerald-400" />
              <span>Scenario 1: Daily Commute Modal Shift</span>
            </CardTitle>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              Personal Exposure & Tailpipe Savings
            </span>
          </div>
          <CardDescription className="text-xs">
            Compare riding an open petrol two-wheeler vs riding an air-filtered Metro rail or AC electric bus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                One-Way Commute Distance: <span className="font-mono text-emerald-400 font-bold">{commuteDistanceKm} km</span>
              </label>
              <input
                type="range"
                min="2"
                max="35"
                step="1"
                value={commuteDistanceKm}
                onChange={(e) => setCommuteDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Clean Mass-Transit Alternative</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCommuteAlternative('metro')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    commuteAlternative === 'metro'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Delhi Metro (HEPA)
                </button>
                <button
                  type="button"
                  onClick={() => setCommuteAlternative('bus')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    commuteAlternative === 'bus'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  AC Electric Bus
                </button>
              </div>
            </div>
          </div>

          <ImpactReceiptCard receipt={transitReceipt} defaultExpanded={true} />
        </CardContent>
      </Card>

      {/* Scenario 2: Cooking Fuel Transition */}
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Flame className="h-5 w-5 text-amber-500" />
              <span>Scenario 2: Cooking Fuel Transition</span>
            </CardTitle>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
              Indoor Smoke Elimination
            </span>
          </div>
          <CardDescription className="text-xs">
            Calculate the indoor PM2.5 and CO emission reduction when transitioning from solid fuel chulha to clean LPG or Induction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Clean Transition Alternative</label>
              <select
                value={cleanFuel}
                onChange={(e) => setCleanFuel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
              >
                <option value="lpg">LPG Cylinder (Ujjwala)</option>
                <option value="electric">Electric Induction Cooktop</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Daily Cooking Duration: <span className="font-mono text-amber-400 font-bold">{cookingHours} hrs/day</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={cookingHours}
                onChange={(e) => setCookingHours(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <ImpactReceiptCard receipt={cookingReceipt} defaultExpanded={true} />
        </CardContent>
      </Card>

      {/* Scenario 3: Air Purifier Operation */}
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Wind className="h-5 w-5 text-teal-400" />
              <span>Scenario 3: Indoor HEPA Purifier Operation</span>
            </CardTitle>
            <span className="text-[10px] font-mono uppercase bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">
              Mass-Balance Removal
            </span>
          </div>
          <CardDescription className="text-xs">
            Verify the quantified indoor PM2.5 steady-state drop achieved by operating an appropriately sized HEPA unit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Room Volume: <span className="font-mono text-teal-400 font-bold">{purifierRoomVolume} m³</span>
              </label>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={purifierRoomVolume}
                onChange={(e) => setPurifierRoomVolume(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Purifier CADR: <span className="font-mono text-teal-400 font-bold">{purifierCadr} m³/h</span>
              </label>
              <input
                type="range"
                min="100"
                max="600"
                step="50"
                value={purifierCadr}
                onChange={(e) => setPurifierCadr(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <ImpactReceiptCard receipt={purifierReceipt} defaultExpanded={true} />
        </CardContent>
      </Card>
    </div>
  );
}
