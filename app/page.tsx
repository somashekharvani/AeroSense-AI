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
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { SourceBadge } from '@/components/ui/source-badge';
import { ImpactReceiptCard } from '@/components/impact-receipts/impact-receipt-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OverviewPage() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tAqi = useTranslations('aqi');
  const { location, openLocationDialog } = useLocation();

  // Demonstration Impact Receipt for Phase 1 Design Verification
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

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0c1820] via-[#091118] to-[#06090e] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 1 Foundation Operational</span>
            </span>
            <SourceBadge source="simulated" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            {tCommon('appName')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {tCommon('tagline')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="emerald" size="md" onClick={openLocationDialog}>
              <span>Selected City: {location.name}</span>
            </Button>
            <div className="text-xs font-mono text-slate-400">
              {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Design System & Badge Showcase Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Wind className="h-5 w-5 text-emerald-400" />
          <span>CPCB 6-Step AQI Scale & System Badges</span>
        </h2>

        {/* 6-step AQI scale demonstration */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <AQIBadge aqi={35} category="Good" />
          <AQIBadge aqi={75} category="Satisfactory" />
          <AQIBadge aqi={150} category="Moderate" />
          <AQIBadge aqi={240} category="Poor" />
          <AQIBadge aqi={360} category="Very Poor" />
          <AQIBadge aqi={445} category="Severe" />
        </div>

        {/* Confidence & Source Badges */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <ConfidenceBadge level="high" />
          <ConfidenceBadge level="medium" />
          <ConfidenceBadge level="low" />
          <SourceBadge source="model" />
          <SourceBadge source="station" />
          <SourceBadge source="satellite" />
          <SourceBadge source="drone" />
          <SourceBadge source="simulated" />
        </div>
      </div>

      {/* Impact Receipt Showcase */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Verifiable Impact Receipt Shell</span>
        </h2>
        <p className="text-xs text-slate-400">
          Every quantified claim made by AeroSense AI is backed by an auditable Impact Receipt
          originating from deterministic scientific equations, never hallucinated by an LLM.
        </p>
        <ImpactReceiptCard receipt={sampleReceipt} defaultExpanded={true} />
      </div>

      {/* Feature Pillar Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Know the Air</span>
            </CardTitle>
            <CardDescription>
              CPCB Indian AQI linear interpolation, fused with Open-Meteo, WAQI stations, and NASA FIRMS satellites.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span>Predict Inversion</span>
            </CardTitle>
            <CardDescription>
              Thermal gradient at 925 and 850 hPa combined with boundary-layer height to identify trapped winter smog lids.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>Family Exposure</span>
            </CardTitle>
            <CardDescription>
              Microenvironment schedule exposure budget for children, adults, elderly, and sensitive individuals.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-400" />
              <span>Indoor Air Model</span>
            </CardTitle>
            <CardDescription>
              Dynamic mass-balance equation computing infiltration, purifier CADR, and window ventilate-or-seal hours.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>What-If Simulator</span>
            </CardTitle>
            <CardDescription>
              Compare alternatives (metro vs bike, cooking fuels, purifiers) with mathematical Impact Receipts.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <span>Hardware Drone</span>
            </CardTitle>
            <CardDescription>
              ESP8266 telemetry ingestion endpoint for vertical particulate profiles, distinct from ambient station feeds.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
