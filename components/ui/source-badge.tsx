import * as React from 'react';
import { Cpu, Radio, Satellite, Navigation, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SourceType = 'model' | 'station' | 'satellite' | 'drone' | 'simulated';

export interface SourceBadgeProps {
  source: SourceType;
  stationName?: string;
  className?: string;
}

export function SourceBadge({ source, stationName, className }: SourceBadgeProps) {
  const configs = {
    model: {
      label: 'Atmospheric Model (Open-Meteo)',
      shortLabel: 'Model',
      icon: Cpu,
      classes: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    },
    station: {
      label: stationName ? `Station: ${stationName}` : 'CPCB Ground Station',
      shortLabel: stationName || 'Station',
      icon: Radio,
      classes: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
    },
    satellite: {
      label: 'NASA VIIRS Satellite',
      shortLabel: 'Satellite',
      icon: Satellite,
      classes: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
    },
    drone: {
      label: 'AeroSense Hardware Drone',
      shortLabel: 'Drone',
      icon: Navigation,
      classes: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    },
    simulated: {
      label: 'SIMULATED DATA (Test / Synthetic)',
      shortLabel: 'SIMULATED',
      icon: AlertOctagon,
      classes:
        'bg-amber-900/40 text-amber-300 border-amber-600/80 font-bold tracking-wider ring-1 ring-amber-500/30',
    },
  };

  const current = configs[source] || configs.model;
  const IconComponent = current.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
        current.classes,
        className
      )}
      title={current.label}
      role="status"
      aria-label={`Source: ${current.label}`}
    >
      <IconComponent className="h-3 w-3 shrink-0" />
      <span>{current.shortLabel}</span>
    </div>
  );
}
