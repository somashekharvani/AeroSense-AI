'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  MapPin,
  Flame,
  Radio,
  Wind,
  Layers,
  Filter,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { AQIBadge } from '@/components/ui/aqi-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PollutionMapPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();
  const { data: snapshot } = useSnapshot();

  const [activeFilter, setActiveFilter] = React.useState<'all' | 'stations' | 'fires'>('all');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  const incident = snapshot?.incidentView;
  const stations = incident?.stationsInDownwindSector || [];
  const fires = incident?.nearbyThermalDetections || [];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('map')} — Spatial Air & Incident Map
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial distribution of ground monitoring stations, NASA FIRMS satellite thermal points, and downwind dispersion estimates around {location.name}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('stations')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeFilter === 'stations' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stations ({stations.length})
          </button>
          <button
            onClick={() => setActiveFilter('fires')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeFilter === 'fires' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal Points ({fires.length})
          </button>
        </div>
      </div>

      {/* Downwind Estimate Banner */}
      <div className="rounded-xl p-3 bg-amber-950/20 border border-amber-800/30 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Downwind smoke sectors are scientific estimates calculated from prevailing wind vectors ($\pm 35^\circ$ dispersion cone). Satellite fire points are thermal anomalies, not confirmed ground incidents.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
          {incident?.downwindSector ? `Transport: ${incident.downwindSector.downwindBearingDeg}°` : 'Calm'}
        </span>
      </div>

      {/* Interactive Map Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spatial Radar Map Representation */}
        <div className="lg:col-span-2 relative h-[450px] rounded-2xl bg-gradient-to-b from-[#060b13] to-[#03060a] border border-slate-800 overflow-hidden flex items-center justify-center p-6 shadow-2xl">
          {/* Concentric distance radar rings */}
          <div className="absolute h-96 w-96 rounded-full border border-slate-800/80 pointer-events-none" />
          <div className="absolute h-64 w-64 rounded-full border border-slate-800/60 pointer-events-none" />
          <div className="absolute h-32 w-32 rounded-full border border-slate-800/40 pointer-events-none" />

          {/* Compass Axis Lines */}
          <div className="absolute inset-x-0 h-px bg-slate-800/40 top-1/2 pointer-events-none" />
          <div className="absolute inset-y-0 w-px bg-slate-800/40 left-1/2 pointer-events-none" />

          {/* Compass Cardinal Indicators */}
          <span className="absolute top-3 text-[10px] font-mono text-slate-500">NORTH (0°)</span>
          <span className="absolute bottom-3 text-[10px] font-mono text-slate-500">SOUTH (180°)</span>
          <span className="absolute right-3 text-[10px] font-mono text-slate-500">EAST (90°)</span>
          <span className="absolute left-3 text-[10px] font-mono text-slate-500">WEST (270°)</span>

          {/* Center Target (User Location) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="text-[11px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded mt-1 border border-emerald-500/30">
              {location.name} (Target)
            </span>
          </div>

          {/* Render Nearby Satellite Thermal Points */}
          {(activeFilter === 'all' || activeFilter === 'fires') &&
            fires.map((fire: any, i: number) => {
              // Convert bearing and distance into polar coordinates
              const rad = ((fire.bearingDeg - 90) * Math.PI) / 180;
              const distScale = Math.min(160, (fire.distanceKm / 100) * 160);
              const x = Math.cos(rad) * distScale;
              const y = Math.sin(rad) * distScale;

              return (
                <button
                  key={`fire-${i}`}
                  onClick={() => setSelectedItem({ type: 'fire', data: fire })}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute z-20 group p-1"
                  title={`Satellite Fire Detection: ${fire.distanceKm.toFixed(1)} km`}
                >
                  <div className="h-3 w-3 rounded-full bg-amber-500 group-hover:scale-150 transition-transform shadow-[0_0_8px_#f59e0b]" />
                </button>
              );
            })}

          {/* Render Nearby Downwind Ground Stations */}
          {(activeFilter === 'all' || activeFilter === 'stations') &&
            stations.map((st: any, i: number) => {
              const rad = ((st.bearingDeg - 90) * Math.PI) / 180;
              const distScale = Math.min(160, (st.distanceKm / 100) * 160);
              const x = Math.cos(rad) * distScale;
              const y = Math.sin(rad) * distScale;

              return (
                <button
                  key={`st-${i}`}
                  onClick={() => setSelectedItem({ type: 'station', data: st })}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute z-20 group p-1"
                  title={`Ground Station: ${st.stationName}`}
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-teal-400 group-hover:scale-150 transition-transform shadow-[0_0_8px_#2dd4bf]" />
                </button>
              );
            })}
        </div>

        {/* Selected Item Detail Sidebar */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              <span>Spatial Entity Details</span>
            </CardTitle>
            <CardDescription className="text-xs">Click on any map node to inspect verified sensor attributes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {selectedItem ? (
              <div className="space-y-3">
                {selectedItem.type === 'fire' ? (
                  <>
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <Flame className="h-4 w-4" />
                      <span>NASA FIRMS VIIRS Thermal Detection</span>
                    </div>
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Distance from Target:</span>
                        <span className="text-white">{selectedItem.data.distanceKm.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Compass Bearing:</span>
                        <span className="text-white">{selectedItem.data.bearingDeg}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Fire Radiative Power:</span>
                        <span className="text-amber-400 font-bold">{selectedItem.data.frpMw} MW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Detection Confidence:</span>
                        <span className="text-white capitalize">{selectedItem.data.confidence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Satellite:</span>
                        <span className="text-slate-300">{selectedItem.data.satellite}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-teal-400 font-bold">
                      <Radio className="h-4 w-4" />
                      <span>{selectedItem.data.stationName}</span>
                    </div>
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Reported AQI:</span>
                        <span className="text-emerald-400 font-bold">{selectedItem.data.aqi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Dominant Pollutant:</span>
                        <span className="text-white uppercase">{selectedItem.data.dominantPollutant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-sans">Downwind Sector:</span>
                        <span className="text-emerald-400">Yes (In Plume Path)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-12">
                Click any node on the spatial radar to inspect verified sensor and satellite telemetry.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
