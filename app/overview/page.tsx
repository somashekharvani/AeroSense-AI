'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  Wind,
  Layers,
  ShieldCheck,
  Calendar,
  Home,
  Sliders,
  TrendingDown,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Flame,
  Activity,
  Compass,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { SourceBadge } from '@/components/ui/source-badge';
import { SourceStatusStrip } from '@/components/dashboard/source-status-strip';
import { BacktestPanel } from '@/components/dashboard/backtest-panel';
import { ImpactReceiptCard } from '@/components/impact-receipts/impact-receipt-card';
import { AtmosphereScene } from '@/components/three';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function OverviewDashboardPage() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tAqi = useTranslations('aqi');
  const { location, openLocationDialog } = useLocation();
  const { data: snapshot, isLoading, error, isStale, refetch } = useSnapshot();

  // Demonstration Impact Receipt
  const sampleReceipt = {
    id: 'DEMO-001',
    action: 'Metro Commute vs Petrol 2-Wheeler',
    baseline: '12 km commute via 110cc Petrol Scooter in peak smog',
    alternative: 'Delhi Metro Blue Line transit (HEPA air-filtered carriage)',
    change: {
      value: 78,
      unit: '% PM2.5 exposure reduction (-142 µg dose)',
      direction: 'reduction' as const,
    },
    method: 'Dose = ∑ (Microenvironment Concentration × Ventilation Rate × Duration)',
    assumptions: [
      'Scooter rider breathing rate: 1.5 m³/h (light exertion)',
      'Subway car in-cabin filtration penetration ratio: P = 0.22',
      'Ambient PM2.5 baseline: 245 µg/m³ (CPCB Very Poor)',
    ],
    dataUsed: [
      { factId: 'FACT-DEL-PM25', source: 'CPCB Anand Vihar Station' },
      { factId: 'FACT-MET-VENT', source: 'EPA Exposure Factors Handbook' },
    ],
    confidence: {
      level: 'high' as const,
      reasons: ['Validated physical dose balance', 'Direct station telemetry feed'],
    },
    engine: {
      name: 'impact',
      version: '1.0.0',
    },
    aiExplanation:
      'Taking the metro avoids the concentrated exhaust plume on the arterial ring road, drastically lowering peak inhaled particulate mass.',
  };

  const aqiData = snapshot?.indianAqi;
  const invData = snapshot?.inversionRisk;
  const fused = snapshot?.fusedAir;
  const atmosphere = snapshot?.atmosphere;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0c1820] via-[#091118] to-[#06090e] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deterministic Environmental Engine Live</span>
            </span>
            {fused && <SourceBadge source={fused.dominantSource} />}
            {isStale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 text-xs text-amber-300 font-medium">
                Cached Stale
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              {tCommon('appName')} — Environmental Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {tCommon('tagline')}
            </p>
          </div>

          {/* Location Action & Refresh */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="emerald" size="md" onClick={openLocationDialog}>
              <span>Selected City: {location.name}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5 text-xs"
              aria-label="Refresh environmental snapshot"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              <span>{tCommon('refresh')}</span>
            </Button>
            <div className="text-xs font-mono text-slate-400">
              {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Provider Ingestion Status Strip */}
      <SourceStatusStrip
        status={snapshot?.sourceStatus}
        snapshot={snapshot}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* Primary Telemetry Cards: Live Indian AQI & Inversion Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Indian CPCB AQI Card */}
        <Card className="border-emerald-900/40 bg-gradient-to-br from-[#0c151c] to-[#091016]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-base">Indian National AQI (CPCB)</CardTitle>
              </div>
              {fused && (
                <ConfidenceBadge
                  level={fused.confidence.level}
                  reasons={fused.confidence.reasons}
                />
              )}
            </div>
            <CardDescription className="text-xs">
              Computed strictly from CPCB October 2014 breakpoint interpolation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aqiData ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">
                      CPCB Index • {location.name}
                    </span>
                    <AQIBadge aqi={aqiData.aqi} category={aqiData.category} size="lg" />
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-slate-400 block mb-0.5">
                      Dominant Pollutant
                    </span>
                    <span className="text-lg font-bold font-mono text-white">
                      {aqiData.dominantPollutantName}
                    </span>
                  </div>
                </div>

                {aqiData.isPartial && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-950/40 border border-amber-800/60 p-2.5 text-xs text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{aqiData.partialReason}</span>
                  </div>
                )}

                {fused?.disagreement && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/60 p-2.5 text-xs text-red-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{fused.disagreementReason}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Telemetry unavailable for this coordinate.</div>
            )}
          </CardContent>
        </Card>

        {/* Live Inversion Risk Card */}
        <Card className="border-teal-900/40 bg-gradient-to-br from-[#0c151c] to-[#091016]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-teal-400" />
                <CardTitle className="text-base">Atmospheric Inversion Risk</CardTitle>
              </div>
              {invData && (
                <ConfidenceBadge
                  level={invData.confidence.level}
                  reasons={invData.confidence.reasons}
                />
              )}
            </div>
            <CardDescription className="text-xs">
              Physical risk score based on 925 hPa lapse rate and boundary-layer height.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : invData ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Inversion Risk Score</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-white">
                        {invData.score}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ 100</span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-xs font-semibold',
                          invData.level === 'High'
                            ? 'bg-red-950/80 text-red-300 border border-red-800'
                            : invData.level === 'Moderate'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        )}
                      >
                        {invData.level} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-slate-400 block mb-0.5">Boundary Layer</span>
                    <span className="text-sm font-mono text-white">
                      {atmosphere ? `${Math.round(atmosphere.boundaryLayerHeightM)} m` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  {invData.reasons.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Inversion assessment unavailable.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3D Atmospheric Inversion & Smog Dynamics Experience */}
      <AtmosphereScene
        pm25={snapshot?.fusedAir?.pollutants?.pm25 ?? 75}
        aqi={aqiData?.aqi ?? 150}
        boundaryLayerHeightM={atmosphere?.boundaryLayerHeightM ?? 400}
        inversionScore={invData?.score ?? 45}
        windSpeedKmh={atmosphere?.windSpeedKmh ?? 6}
      />

      {/* Criteria Pollutants Breakdown Grid */}
      {aqiData?.subIndices && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Wind className="h-4 w-4 text-emerald-400" />
            <span>Criteria Pollutant Sub-Indices (CPCB NAQI)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.entries(aqiData.subIndices).map(([key, sub]) => (
              <div
                key={key}
                className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{sub.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {sub.concentration.toFixed(1)} {sub.unit}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {sub.subIndex}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{sub.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Calibration Backtest Panel */}
      <BacktestPanel />

      {/* Verifiable Impact Receipt Showcase */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Verifiable Impact Receipt Shell</span>
        </h2>
        <p className="text-xs text-slate-400">
          Every quantified claim made by AeroSense AI is backed by an auditable Impact Receipt
          originating from deterministic scientific equations, never hallucinated by an LLM.
        </p>
        <ImpactReceiptCard receipt={sampleReceipt} defaultExpanded={false} />
      </div>
    </div>
  );
}
