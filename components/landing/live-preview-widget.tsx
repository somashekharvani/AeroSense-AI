'use client';

import * as React from 'react';
import Link from 'next/link';
import { MapPin, Wind, Thermometer, Droplets, ArrowRight, RefreshCw } from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function LivePreviewWidget() {
  const { location, openLocationDialog } = useLocation();
  const { data: snapshot, isLoading, refetch } = useSnapshot();

  const aqi = snapshot?.indianAqi;
  const weather = snapshot?.atmosphere;
  const fused = snapshot?.fusedAir;

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-[#091118] via-[#0b1722] to-[#091118] p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* City Info & Location Trigger */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">{location.name}</h3>
              <button
                type="button"
                onClick={openLocationDialog}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E • CPCB Monitoring Region
            </p>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : aqi ? (
            <>
              {/* AQI Badge */}
              <div className="flex items-center gap-2">
                <AQIBadge aqi={aqi.aqi} category={aqi.category} size="sm" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">Dominant</span>
                  <span className="text-xs font-mono font-bold text-white">{aqi.dominantPollutantName}</span>
                </div>
              </div>

              {/* Weather Stats */}
              {weather && (
                <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-300 border-l border-slate-800 pl-4">
                  <div className="flex items-center gap-1.5" title="Surface Temperature">
                    <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                    <span>{Math.round(weather.temperature2m)}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Wind Velocity">
                    <Wind className="h-3.5 w-3.5 text-sky-400" />
                    <span>{Math.round(weather.windSpeedKmh)} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Relative Humidity">
                    <Droplets className="h-3.5 w-3.5 text-teal-400" />
                    <span>{Math.round(weather.humidityPct)}%</span>
                  </div>
                </div>
              )}

              {/* Confidence Badge */}
              {fused && (
                <div className="hidden lg:block">
                  <ConfidenceBadge level={fused.confidence.level} />
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">Telemetry sync pending...</span>
          )}

          {/* Action CTA to Live Page */}
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all ml-auto md:ml-0"
          >
            <span>Full Live Air</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
