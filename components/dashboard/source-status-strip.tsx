'use client';

import * as React from 'react';
import { Cpu, Radio, Satellite, Navigation, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { SnapshotData } from '@/hooks/use-snapshot';
import { formatLocaleDateTime } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export function SourceStatusStrip({
  status,
  className,
}: {
  status?: SnapshotData['sourceStatus'];
  className?: string;
}) {
  const { locale } = useLanguage();

  if (!status) return null;

  const items = [
    {
      id: 'openMeteo',
      name: 'Open-Meteo',
      icon: Cpu,
      status: status.openMeteo.status,
      detail: status.openMeteo.lastUpdated
        ? formatLocaleDateTime(status.openMeteo.lastUpdated, locale, {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Active',
      statusClass:
        status.openMeteo.status === 'online'
          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
          : 'text-red-400 bg-red-950/60 border-red-800/60',
    },
    {
      id: 'waqi',
      name: 'CPCB WAQI',
      icon: Radio,
      status: status.waqi.status,
      detail:
        status.waqi.status === 'online'
          ? status.waqi.stationName || 'Online'
          : status.waqi.status === 'unconfigured'
          ? 'Token Pending'
          : 'Offline',
      statusClass:
        status.waqi.status === 'online'
          ? 'text-teal-400 bg-teal-950/60 border-teal-800/60'
          : 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    },
    {
      id: 'nasaFirms',
      name: 'NASA FIRMS',
      icon: Satellite,
      status: status.nasaFirms.status,
      detail:
        status.nasaFirms.status === 'online'
          ? `${status.nasaFirms.firePointsCount} points`
          : status.nasaFirms.status === 'unconfigured'
          ? 'Key Pending'
          : 'Offline',
      statusClass:
        status.nasaFirms.status === 'online'
          ? 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60'
          : 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    },
    {
      id: 'drone',
      name: 'AeroSense Drone',
      icon: Navigation,
      status: 'not_connected',
      detail: 'Not Connected',
      statusClass: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs',
        className
      )}
      aria-label="Provider ingestion status strip"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isOnline = item.status === 'online';

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors',
              item.statusClass
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white truncate text-[11px]">{item.name}</span>
                {isOnline ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate">{item.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
