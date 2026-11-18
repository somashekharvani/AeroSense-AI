'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Layers,
  Wind,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BacktestPanel } from '@/components/dashboard/backtest-panel';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ForecastOutlookPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();

  const [forecastData, setForecastData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadForecast() {
      setLoading(true);
      try {
        const res = await fetch(`/api/forecast?lat=${location.lat}&lon=${location.lon}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setForecastData(json);
        }
      } catch (err) {
        console.error('Failed to load forecast', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadForecast();
    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lon]);

  const airHours = forecastData?.airHours || [];
  const weatherHours = forecastData?.weatherHours || [];

  // Identify peak PM2.5 spike period in next 24 hours
  const next24Air = airHours.slice(0, 24);
  const peakAirHour = next24Air.reduce(
    (max: any, cur: any) => (!max || cur.pm25 > max.pm25 ? cur : max),
    null
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-teal-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('forecast')} — 48-Hour Atmospheric Outlook
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            48-hour forward projection combining European CAMS atmospheric model with boundary-layer compression physics for {location.name}.
          </p>
        </div>
      </div>

      {/* Atmospheric Spike Alert Banner */}
      {peakAirHour && (
        <div className="rounded-xl p-4 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Predicted Peak Smog Compression Spike
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Expected at <span className="font-semibold text-white">{new Date(peakAirHour.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> reaching <span className="font-mono font-bold text-amber-400">{Math.round(peakAirHour.pm25)} µg/m³ PM2.5</span>.
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            <span>Model: CAMS Atmosphere Reanalysis</span>
          </div>
        </div>
      )}

      {/* 48-Hour Hourly Outlook Strip */}
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-400" />
              <span>Hourly Particulate Concentration (Next 48 Hours)</span>
            </CardTitle>
            <span className="text-[10px] text-slate-400 font-mono">Horizontal Scroll</span>
          </div>
          <CardDescription className="text-xs">
            Hourly predicted PM2.5 and PM10 concentrations based on boundary-layer dynamics and European atmospheric models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : airHours.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {airHours.slice(0, 48).map((hour: any, idx: number) => {
                  const time = new Date(hour.timestamp);
                  const hourLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isNight = time.getHours() < 6 || time.getHours() > 20;

                  return (
                    <div
                      key={idx}
                      className={`w-24 p-2.5 rounded-lg border text-center space-y-1.5 shrink-0 ${
                        isNight
                          ? 'bg-slate-950/80 border-slate-800/60'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-slate-400">{hourLabel}</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {Math.round(hour.pm25)}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">µg/m³ PM2.5</div>
                      <div className="text-[10px] text-slate-400">
                        PM10: {Math.round(hour.pm10)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-4">No outlook hours available.</div>
          )}
        </CardContent>
      </Card>

      {/* Boundary Layer Height Compression vs Dispersion Timeline */}
      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            <span>Boundary Layer Height (BLH) Evolution</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Boundary layer compression below 350m traps emissions aloft, driving rapid surface concentration build-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : weatherHours.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {weatherHours.slice(0, 48).map((w: any, idx: number) => {
                  const time = new Date(w.timestamp);
                  const hourLabel = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const blh = Math.round(w.boundaryLayerHeight);
                  const isCompressed = blh <= 300;

                  return (
                    <div
                      key={idx}
                      className={`w-24 p-2.5 rounded-lg border text-center space-y-1.5 shrink-0 ${
                        isCompressed
                          ? 'bg-amber-950/30 border-amber-800/40'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-slate-400">{hourLabel}</div>
                      <div className={`text-sm font-bold font-mono ${isCompressed ? 'text-amber-400' : 'text-purple-400'}`}>
                        {blh}m
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {isCompressed ? 'Trap Lid' : 'Dispersing'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {Math.round(w.windSpeed10m)} km/h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-4">Atmospheric boundary layer forecast unavailable.</div>
          )}
        </CardContent>
      </Card>

      {/* Model Backtest Calibration Panel */}
      <BacktestPanel />
    </div>
  );
}
