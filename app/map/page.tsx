'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Map, Layers, Flame } from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SourceBadge } from '@/components/ui/source-badge';

export default function PollutionMapPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('map')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            MapLibre GL visualization of ground stations, NASA FIRMS fire detections, and estimated downwind smoke cones.
          </p>
        </div>
        <SourceBadge source="satellite" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 3 & Phase 5 Integration Target</CardTitle>
          <CardDescription>
            Interactive MapLibre vector map layer with station markers and Incident View downwind sector cones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Flame className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 3 (FIRMS API) and Phase 5 (3D Pollution Map Scene).</p>
            <p className="text-[11px] text-slate-600">
              Centering on: {location.name} ({location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
