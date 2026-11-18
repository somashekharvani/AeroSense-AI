'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Home,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { useSnapshot } from '@/hooks/use-snapshot';
import {
  calculateIndoorAir,
  RoomPhysicalParams,
  IndoorHourInput,
} from '@/engines/indoor-air';
import { IndoorRoomScene } from '@/components/three';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function IndoorAirPage() {
  const tNav = useTranslations('nav');
  const { data: snapshot } = useSnapshot();

  const [lengthM, setLengthM] = React.useState<number>(5);
  const [widthM, setWidthM] = React.useState<number>(4);
  const [heightM, setHeightM] = React.useState<number>(3);
  const [leakiness, setLeakiness] = React.useState<'sealed' | 'normal' | 'drafty'>('normal');
  const [cadrM3h, setCadrM3h] = React.useState<number>(300);
  const [windowsOpen, setWindowsOpen] = React.useState<boolean>(false);
  const [hasCooking, setHasCooking] = React.useState<boolean>(false);

  const roomVolumeM3 = lengthM * widthM * heightM;
  const ambientPm25 = snapshot?.fusedAir?.pollutants?.pm25 ?? 120;

  // Run Indoor Air Mass-Balance Engine
  const indoorResult = React.useMemo(() => {
    const roomParams: RoomPhysicalParams = {
      volumeM3: roomVolumeM3,
      leakiness,
      windowsOpen,
      cadrM3h,
      hasCookingSource: hasCooking,
    };

    const timeline: IndoorHourInput[] = Array.from({ length: 24 }, (_, i) => ({
      hourIndex: i,
      ambientPm25,
      windowsOpen,
      purifierOn: cadrM3h > 0,
      cookingActive: hasCooking && (i === 8 || i === 13 || i === 20),
    }));

    return calculateIndoorAir(roomParams, timeline);
  }, [ambientPm25, roomVolumeM3, leakiness, cadrM3h, windowsOpen, hasCooking]);

  const sizingResult = indoorResult.purifierSizing;
  const crBox = indoorResult.corsiRosenthalEstimate;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('indoor')} — Home Air & Mass-Balance
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            First-order physical mass-balance model ($V \frac{"dC"}{"dt"} = P \cdot a \cdot V \cdot C_{"out"} - \dots$), purifier sizing, and Corsi-Rosenthal DIY box guidance.
          </p>
        </div>
      </div>

      {/* 3D Indoor Room Cutaway Scene */}
      <IndoorRoomScene
        outdoorPm25={ambientPm25}
        indoorPm25={Math.round(indoorResult.steadyStateConcentrationUgM3)}
        roomVolumeM3={roomVolumeM3}
        initialCadrM3h={cadrM3h}
      />

      {/* Ventilate-or-Seal Decision Card */}
      <div
        className={`rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          indoorResult.ventilationRecommendation.shouldVentilateNow
            ? 'bg-emerald-950/30 border-emerald-800/40'
            : 'bg-amber-950/30 border-amber-800/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              indoorResult.ventilationRecommendation.shouldVentilateNow
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {indoorResult.ventilationRecommendation.shouldVentilateNow ? (
              <Wind className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Ventilate-or-Seal Decision
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {indoorResult.ventilationRecommendation.shouldVentilateNow
                ? 'OPEN WINDOWS: Brief Cross-Ventilation Recommended'
                : 'SEAL WINDOWS: Maintain Sealed Enclosure & Purify'}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {indoorResult.ventilationRecommendation.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Room Configuration & Mass-Balance Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Room Parameters Configurator */}
        <Card className="border-slate-800/80 bg-slate-900/60 md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-5 w-5 text-teal-400" />
              <span>Room Parameters</span>
            </CardTitle>
            <CardDescription className="text-xs">Physical geometry and enclosure tighteness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Length (m)</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={lengthM}
                  onChange={(e) => setLengthM(Number(e.target.value) || 2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Width (m)</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={widthM}
                  onChange={(e) => setWidthM(Number(e.target.value) || 2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Height (m)</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={heightM}
                  onChange={(e) => setHeightM(Number(e.target.value) || 2)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-center"
                />
              </div>
            </div>

            <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex justify-between font-mono text-[11px]">
              <span className="text-slate-400">Total Volume:</span>
              <span className="text-emerald-400 font-bold">{roomVolumeM3} m³</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Enclosure Leakiness</label>
              <select
                value={leakiness}
                onChange={(e) => setLeakiness(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white"
              >
                <option value="sealed">Sealed (Weatherstripped, AC)</option>
                <option value="normal">Normal (Standard residential)</option>
                <option value="drafty">Drafty (Older build, loose seams)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Air Purifier CADR: <span className="text-emerald-400 font-mono">{cadrM3h} m³/h</span>
              </label>
              <input
                type="range"
                min="0"
                max="600"
                step="50"
                value={cadrM3h}
                onChange={(e) => setCadrM3h(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={windowsOpen}
                  onChange={(e) => setWindowsOpen(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-300">Windows Open</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCooking}
                  onChange={(e) => setHasCooking(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-300">Cooking Stove Active</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Steady-State Model Results & Purifier Sizing */}
        <Card className="border-slate-800/80 bg-slate-900/60 md:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              <span>Mass-Balance Steady-State Solution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Derived from EPA indoor aerosol decay equations: $\lambda = a + k + \frac{"CADR"}{"V"}$
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Outdoor Baseline</div>
                <div className="text-xl font-mono font-bold text-slate-300 my-1">{ambientPm25}</div>
                <div className="text-[9px] text-slate-500">µg/m³ PM2.5</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Indoor Steady-State</div>
                <div className="text-2xl font-mono font-bold text-emerald-400 my-0.5">
                  {Math.round(indoorResult.steadyStateConcentrationUgM3)}
                </div>
                <div className="text-[9px] text-slate-500">µg/m³ PM2.5</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Total Removal Rate ($\lambda$)</div>
                <div className="text-xl font-mono font-bold text-teal-400 my-1">
                  {indoorResult.parametersUsed.totalDecayRateLambda.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-500">air changes / hour</div>
              </div>
            </div>

            {/* Sizing & Corsi-Rosenthal DIY Box Guide */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-emerald-400" />
                <span>HEPA & Corsi-Rosenthal Box Sizing</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  Recommended Minimum CADR: <span className="font-mono font-bold text-emerald-400">{sizingResult.recommendedMinCadrM3h} m³/h</span> (for 4 ACH).
                </div>
                <div>
                  DIY 4-Filter Corsi-Rosenthal CADR: <span className="font-mono font-bold text-teal-400">{crBox.estimatedCadrM3h} m³/h</span>.
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                A DIY Corsi-Rosenthal box constructed with four MERV-13 filters and a standard 20-inch box fan delivers equivalent clean air delivery to commercial purifiers at approximately 1/4 the upfront cost.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
