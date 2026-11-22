'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Activity,
  Wind,
  Layers,
  Flame,
  Compass,
  AlertTriangle,
  RefreshCw,
  Info,
  Thermometer,
  Droplets,
  Cloud,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { SourceBadge } from '@/components/ui/source-badge';
import { SourceStatusStrip } from '@/components/dashboard/source-status-strip';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function LiveAirPage() {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { location } = useLocation();
  const { data: snapshot, isLoading, isStale, refetch } = useSnapshot();

  const aqiData = snapshot?.indianAqi;
  const fused = snapshot?.fusedAir;
  const atmosphere = snapshot?.atmosphere;
  const incident = snapshot?.incidentView;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('live')} — Know Your Air
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Indian CPCB NAQI, fused criteria pollutants, and satellite incident downwind estimates for {location.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {fused && (
            <ConfidenceBadge
              level={fused.confidence.level}
              reasons={fused.confidence.reasons}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-emerald-400" />
            <span>{tCommon('refresh')}</span>
          </Button>
        </div>
      </div>

      {/* Source Status Strip */}
      <SourceStatusStrip
        status={snapshot?.sourceStatus}
        snapshot={snapshot}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* Primary AQI & Meteorological Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main CPCB NAQI Card */}
        <Card className="lg:col-span-2 border-emerald-900/40 bg-gradient-to-br from-[#0c151c] to-[#091016]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                <span>Indian National AQI (CPCB)</span>
              </CardTitle>
              {fused && <SourceBadge source={fused.dominantSource} />}
            </div>
            <CardDescription className="text-xs">
              Calculated using the official CPCB linear interpolation formula with 24-hour and 8-hour averaging bands.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : aqiData ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-slate-800/60">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">
                      CPCB Index • {location.name}
                    </span>
                    <AQIBadge aqi={aqiData.aqi} category={aqiData.category} size="lg" />
                  </div>
                  <div className="text-xs sm:text-right text-slate-400">
                    <div>Dominant Pollutant: <span className="font-semibold text-emerald-400">{aqiData.dominantPollutantName}</span></div>
                    <div>Evaluated Pollutants: <span className="font-mono text-white">{aqiData.validPollutantsCount} of 8</span></div>
                    {aqiData.isPartial && (
                      <span className="text-[11px] text-amber-400 mt-1 block">
                        Partial NAQI: {aqiData.partialReason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Criteria Pollutants Sub-Indices Table */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">CRITERIA POLLUTANT SUB-INDICES</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(aqiData.subIndices).map(([key, sub]) => (
                      <div key={key} className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-center">
                        <div className="text-[11px] font-bold text-slate-300">{sub.name}</div>
                        <div className="text-lg font-mono font-bold text-emerald-400 my-0.5">{sub.subIndex}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sub.concentration.toFixed(1)} {sub.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Air quality data unavailable.</div>
            )}
          </CardContent>
        </Card>

        {/* Local Atmospheric & Weather Telemetry */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-5 w-5 text-teal-400" />
              <span>Atmospheric Profile</span>
            </CardTitle>
            <CardDescription className="text-xs">Surface weather & boundary layer dynamics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {atmosphere ? (
              <>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-amber-400" /> Temperature
                  </span>
                  <span className="font-mono font-semibold text-white">{atmosphere.temperature2m.toFixed(1)} °C</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-sky-400" /> Relative Humidity
                  </span>
                  <span className="font-mono font-semibold text-white">{atmosphere.humidityPct}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-emerald-400" /> Wind Velocity
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {atmosphere.windSpeedKmh.toFixed(1)} km/h ({Math.round(atmosphere.windDirectionDeg)}°)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-purple-400" /> Boundary Layer Height
                  </span>
                  <span className="font-mono font-semibold text-white">{Math.round(atmosphere.boundaryLayerHeightM)} m</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cloud className="h-4 w-4 text-slate-400" /> Cloud Cover
                  </span>
                  <span className="font-mono font-semibold text-white">{atmosphere.cloudCoverPct}%</span>
                </div>
              </>
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Incident View: Satellite Fire Points & Downwind Trajectory Cone */}
      <Card className="border-amber-900/30 bg-gradient-to-br from-[#13110e] to-[#0c0f14]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Incident View — Satellite Thermal Points & Smoke Trajectory</CardTitle>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              DOWNWIND ESTIMATE ONLY
            </span>
          </div>
          <CardDescription className="text-xs">
            NASA FIRMS VIIRS satellite thermal detections combined with prevailing wind vectors. Downwind plume cones are scientific estimates, not confirmed fire incidents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {incident ? (
            <>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <p className="leading-relaxed">{incident.smokeTrajectoryNotice}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-400 font-mono">
                  <div>Downwind Vector: <span className="text-amber-400">{incident.downwindSector.downwindBearingDeg}°</span></div>
                  <div>Plume Cone Spread: <span className="text-amber-400">±{incident.downwindSector.spreadAngleDeg}°</span></div>
                  <div>Transport Speed: <span className="text-amber-400">{incident.downwindSector.plumeTransportSpeedKmh} km/h</span></div>
                </div>
              </div>

              {incident.nearbyThermalDetections.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400">
                    Nearby Thermal Anomalies within {incident.searchRadiusKm} km ({incident.nearbyThermalDetections.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {incident.nearbyThermalDetections.slice(0, 4).map((fire, i) => (
                      <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="text-amber-400">FRP: {fire.frpMw} MW</span>
                          <span className="text-[10px] uppercase text-slate-400">{fire.confidence} Conf</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Dist: {fire.distanceKm.toFixed(1)} km • Bearing: {fire.bearingDeg}°
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {fire.satellite} • {fire.acquisitionDate} {fire.acquisitionTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-2">
                  No active satellite thermal anomaly points detected within 100 km radius.
                </div>
              )}
            </>
          ) : (
            <Skeleton className="h-28 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
