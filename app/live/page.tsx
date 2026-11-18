'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Activity, Radio, AlertTriangle } from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SourceBadge } from '@/components/ui/source-badge';

export default function LiveAirPage() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { location } = useLocation();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('live')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pollutant breakdown, CPCB sub-indices, and multi-source station fusion for {location.name}.
          </p>
        </div>
        <SourceBadge source="station" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 3 Integration Target</CardTitle>
          <CardDescription>
            Live air data services connecting Open-Meteo atmospheric models and CPCB WAQI ground stations will populate this telemetry table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Radio className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 3 (Live Data Services & Source Fusion).</p>
            <p className="text-[11px] text-slate-600">
              Active Coordinates: {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
