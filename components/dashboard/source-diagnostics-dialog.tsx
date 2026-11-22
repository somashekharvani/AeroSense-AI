'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Radio,
  Satellite,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Zap,
  Flame,
  Wind,
  Layers,
  Thermometer,
  Compass,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { SnapshotData } from '@/hooks/use-snapshot';
import { formatLocaleDateTime } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslations } from 'next-intl';

export type DiagnosticSource = 'openMeteo' | 'cpcb' | 'waqi' | 'nasaFirms' | 'drone';

export interface SourceDiagnosticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSource?: DiagnosticSource;
  snapshot?: SnapshotData | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SourceDiagnosticsDialog({
  open,
  onOpenChange,
  initialSource = 'openMeteo',
  snapshot,
  onRefresh,
  isRefreshing = false,
}: SourceDiagnosticsDialogProps) {
  const { locale } = useLanguage();
  const tDiag = useTranslations('diagnostics');
  const [activeTab, setActiveTab] = React.useState<string>(initialSource);

  // Sync tab when initialSource changes
  React.useEffect(() => {
    if (initialSource) {
      setActiveTab(initialSource);
    }
  }, [initialSource]);

  const sources = snapshot?.sourceStatus;
  const indianAqi = snapshot?.indianAqi;
  const atmosphere = snapshot?.atmosphere;
  const fusedAir = snapshot?.fusedAir;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-w-3xl w-full bg-[#0a1117] border border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl text-slate-100"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900/90 to-emerald-950/20">
          <div className="flex items-start justify-between pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {tDiag('title')}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                {tDiag('subtitle')}
              </p>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="shrink-0 h-8 border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-xs text-slate-200"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-1.5 text-emerald-400 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                {tDiag('syncFeeds')}
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 h-auto p-1.5 bg-slate-950/80 border border-slate-800 rounded-xl gap-1">
              <TabsTrigger
                value="openMeteo"
                className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg data-[state=active]:bg-emerald-950/80 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-800/80"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>{tDiag('openMeteoName')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="cpcb"
                className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg data-[state=active]:bg-teal-950/80 data-[state=active]:text-teal-300 data-[state=active]:border data-[state=active]:border-teal-800/80"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{tDiag('cpcbName')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="waqi"
                className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg data-[state=active]:bg-cyan-950/80 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-800/80"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>{tDiag('waqiName')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="nasaFirms"
                className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg data-[state=active]:bg-indigo-950/80 data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-800/80"
              >
                <Satellite className="h-3.5 w-3.5" />
                <span>{tDiag('nasaName')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="drone"
                className="flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg data-[state=active]:bg-slate-900/90 data-[state=active]:text-slate-200 data-[state=active]:border data-[state=active]:border-slate-700/80"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>{tDiag('droneName')}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OPEN-METEO */}
            <TabsContent value="openMeteo" className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-sm text-white">
                      Open-Meteo European Weather & Air Quality Reanalysis
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-800 bg-emerald-950/60 text-emerald-400 text-xs font-mono"
                  >
                    STATUS: {sources?.openMeteo.status?.toUpperCase() || 'ONLINE'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">Endpoint / Data Service</span>
                    <p className="font-mono text-slate-200 text-[11px] truncate">
                      api.open-meteo.com / air-quality-api
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">Last Telemetry Sync</span>
                    <p className="font-mono text-slate-200 text-[11px]">
                      {sources?.openMeteo.lastUpdated
                        ? formatLocaleDateTime(sources.openMeteo.lastUpdated, locale)
                        : 'Active / Cached'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Atmospheric Variables Ingested:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">Boundary Layer (BLH)</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {atmosphere?.boundaryLayerHeightM ?? 450} m
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">Ambient Temp (2m)</span>
                      <span className="font-bold text-slate-200 text-sm">
                        {atmosphere?.temperature2m ?? 20} °C
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">Relative Humidity</span>
                      <span className="font-bold text-slate-200 text-sm">
                        {atmosphere?.humidityPct ?? 55} %
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">Wind Speed (10m)</span>
                      <span className="font-bold text-teal-400 text-sm">
                        {atmosphere?.windSpeedKmh ?? 5} km/h
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">Wind Bearing</span>
                      <span className="font-bold text-teal-400 text-sm">
                        {atmosphere?.windDirectionDeg ?? 0}°
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                      <span className="text-slate-400 text-[11px] block">CAMS Model Aerosol</span>
                      <span className="font-bold text-indigo-400 text-sm">Active Grid</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-2 text-xs text-slate-300">
                  <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Attribution & Compliance:</span> Data provided by Open-Meteo under CC BY 4.0 license, combining ECMWF IFS atmospheric model with Copernicus Atmosphere Monitoring Service (CAMS) reanalysis.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: CPCB STANDARD */}
            <TabsContent value="cpcb" className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span className="font-semibold text-sm text-white">
                      Indian National AQI (CPCB October 2014) Engine
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-teal-800 bg-teal-950/60 text-teal-300 text-xs font-mono"
                  >
                    DETERMINISTIC ENGINE ACTIVE
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-teal-300">Official Mathematical Formulation:</span>
                    <span className="text-[11px] font-mono text-slate-400">CPCB MoEFCC Table 1 & 2</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded border border-teal-800/40 font-mono text-xs text-teal-200 overflow-x-auto text-center">
                    I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] × (C_p - B_lo) + I_lo
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Sub-index \(I_p\) is computed via piecewise linear interpolation over 7 defined breakpoint bands. The composite Indian AQI is the maximum sub-index across all monitored criteria pollutants.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                    <span className="text-slate-400">Current Computed Index</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white">
                        {indianAqi?.aqi ?? '--'}
                      </span>
                      {indianAqi?.category && (
                        <AQIBadge
                          category={indianAqi.category}
                          aqi={indianAqi.aqi}
                          showNumber={false}
                        />
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                    <span className="text-slate-400">Dominant Pollutant</span>
                    <p className="text-lg font-bold text-teal-300 uppercase">
                      {indianAqi?.dominantPollutant ?? 'PM2.5'}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Dictates the composite CPCB index value.
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider">
                      Sub-Indices Breakdown:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Criteria Rule: Min 3 pollutants incl. PM10/PM2.5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    {indianAqi?.subIndices ? (
                      Object.entries(indianAqi.subIndices).map(([pollutant, item]) => (
                        <div
                          key={pollutant}
                          className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-center"
                        >
                          <span className="text-slate-400 text-[10px] uppercase font-mono block">
                            {pollutant}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {item && typeof item.subIndex === 'number'
                              ? Math.round(item.subIndex)
                              : 'N/A'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-6 text-center text-slate-500 py-2">
                        Sub-indices available upon live telemetry calculation
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Zero Hallucination Guarantee:</span> All AQI numbers in AeroSense AI are computed strictly by deterministic TypeScript engines without neural approximation or LLM hallucination.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: WAQI FEED */}
            <TabsContent value="waqi" className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sources?.waqi.status === 'online'
                          ? 'bg-cyan-400'
                          : sources?.waqi.status === 'unconfigured'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                    <span className="font-semibold text-sm text-white">
                      World Air Quality Index (WAQI) Ground Monitoring Stations
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${
                      sources?.waqi.status === 'online'
                        ? 'border-cyan-800 bg-cyan-950/60 text-cyan-300'
                        : 'border-amber-800 bg-amber-950/60 text-amber-300'
                    }`}
                  >
                    STATUS: {sources?.waqi.status?.toUpperCase() || 'OFFLINE'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">Nearest Ground Station</span>
                    <p className="font-medium text-slate-200 text-xs truncate">
                      {sources?.waqi.stationName || 'No local station linked'}
                    </p>
                    {sources?.waqi.distanceKm !== undefined && (
                      <span className="text-[11px] text-teal-400">
                        {sources.waqi.distanceKm} km from selected coordinates
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">API Configuration Token</span>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-slate-300">
                        {sources?.waqi.status === 'unconfigured'
                          ? 'WAQI_TOKEN Not Configured'
                          : 'Server Environment Configured'}
                      </p>
                      {sources?.waqi.status === 'unconfigured' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Fallback to CAMS numerical atmospheric reanalysis when token is pending.
                    </span>
                  </div>
                </div>

                {sources?.waqi.status === 'unconfigured' && (
                  <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <Info className="h-4 w-4" />
                      <span>How to connect your real-world WAQI station token:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      To stream raw telemetry from CPCB/State PCB continuous ambient air quality stations (CAAQMS), obtain a free API key at{' '}
                      <a
                        href="https://aqicn.org/data-platform/token/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                      >
                        aqicn.org/data-platform/token
                      </a>{' '}
                      and set <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">WAQI_TOKEN=your_token</code> in your <code className="bg-black/40 px-1 py-0.5 rounded text-slate-200">.env.local</code>.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Observed Ground Pollutants:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {fusedAir?.pollutants &&
                      Object.entries(fusedAir.pollutants).map(([name, val]) => (
                        <div
                          key={name}
                          className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40"
                        >
                          <span className="text-slate-400 text-[11px] uppercase block font-mono">
                            {name}
                          </span>
                          <span className="font-bold text-slate-100 text-sm">
                            {val !== null ? `${val} µg/m³` : 'N/A'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: NASA FIRMS */}
            <TabsContent value="nasaFirms" className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        sources?.nasaFirms.status === 'online'
                          ? 'bg-indigo-400'
                          : sources?.nasaFirms.status === 'unconfigured'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                    <span className="font-semibold text-sm text-white">
                      NASA FIRMS (VIIRS 375m Satellite Fire Detection)
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${
                      sources?.nasaFirms.status === 'online'
                        ? 'border-indigo-800 bg-indigo-950/60 text-indigo-300'
                        : 'border-amber-800 bg-amber-950/60 text-amber-300'
                    }`}
                  >
                    STATUS: {sources?.nasaFirms.status?.toUpperCase() || 'OFFLINE'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">Thermal Anomalies Detected</span>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-400" />
                      <span className="text-xl font-bold text-white">
                        {sources?.nasaFirms.firePointsCount ?? 0}
                      </span>
                      <span className="text-slate-400 text-xs">hotspots within 150 km</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1">
                    <span className="text-slate-400">Satellite Sensor</span>
                    <p className="font-medium text-slate-200 text-xs">
                      VIIRS NRT (Suomi NPP & NOAA-20)
                    </p>
                    <span className="text-[11px] text-indigo-400">
                      375m Ground Sample Distance
                    </span>
                  </div>
                </div>

                {sources?.nasaFirms.status === 'unconfigured' && (
                  <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <Info className="h-4 w-4" />
                      <span>NASA Earthdata Map Key Configuration:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      To query live VIIRS NRT active fire points, register a free Map Key at{' '}
                      <a
                        href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
                      >
                        firms.modaps.eosdis.nasa.gov
                      </a>{' '}
                      and set <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">FIRMS_MAP_KEY=your_key</code> in your environment.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <Wind className="h-4 w-4 text-cyan-400" />
                    <span>Gaussian Downwind Dispersion Modeling:</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    AeroSense AI combines thermal fire radiative power (FRP) with 10m wind direction vectors to project downwind particulate smoke dispersion (\(\pm 35^\circ\) cone). In accordance with our scientific transparency guidelines, downwind areas are always explicitly labeled as <span className="font-mono text-amber-300 bg-amber-950/40 px-1 rounded">ESTIMATES</span>.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: AEROSENSE DRONE */}
            <TabsContent value="drone" className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="font-semibold text-sm text-white">
                      AeroSense Autonomous UAV Telemetry Node
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-slate-700 bg-slate-900/60 text-slate-400 text-xs font-mono"
                  >
                    STATUS: NOT CONNECTED
                  </Badge>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Hardware Honesty & Implementation Disclosure:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Physical hardware telemetry shows <strong className="text-white">Not Connected</strong> until a real ESP8266 Wi-Fi handshake packet is received and validated by <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300 font-mono text-[10px]">POST /api/drone/ingest</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-2">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Active Physical Prototype:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Arduino Nano + ESP8266 NodeMCU</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>MQ-135 Gas Sensor (Relative VOC trend only)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>DHT22 Ambient Temp & Humidity</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-2">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Planned Upgrade Payload:
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-center gap-1.5 text-slate-400">
                        <Layers className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span>PMS5003 Laser Optical Particle Counter</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-400">
                        <Compass className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span>TFmini Plus Micro-LiDAR Altimeter</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-400">
                        <Zap className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span>BME680 Environmental VOC/Pressure</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-300 block">
                      Explore the Interactive Drone Lab:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Experience the simulated 3D flight demo with vertical particulate profiling.
                    </span>
                  </div>
                  <Link href="/drone" onClick={() => onOpenChange(false)}>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                    >
                      Open Drone Lab
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
