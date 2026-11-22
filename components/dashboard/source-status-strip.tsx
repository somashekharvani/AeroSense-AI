'use client';

import * as React from 'react';
import {
  Cpu,
  Radio,
  Satellite,
  Navigation,
  Zap,
  Info,
} from 'lucide-react';
import { SnapshotData } from '@/hooks/use-snapshot';
import { formatLocaleDateTime } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  SourceDiagnosticsDialog,
  type DiagnosticSource,
} from './source-diagnostics-dialog';

export function SourceStatusStrip({
  status,
  snapshot,
  className,
  onRefresh,
  isRefreshing,
}: {
  status?: SnapshotData['sourceStatus'];
  snapshot?: SnapshotData | null;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { locale } = useLanguage();
  const tDiag = useTranslations('diagnostics');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<DiagnosticSource>('openMeteo');

  if (!status) return null;

  const handleCardClick = (sourceId: DiagnosticSource) => {
    setSelectedSource(sourceId);
    setDialogOpen(true);
  };

  const items: Array<{
    id: DiagnosticSource;
    name: string;
    subtext: string;
    icon: React.ElementType;
    status: string;
    detail: string;
    statusClass: string;
    dotColor: string;
  }> = [
    {
      id: 'openMeteo',
      name: tDiag('openMeteoName'),
      subtext: tDiag('openMeteoSub'),
      icon: Cpu,
      status: status.openMeteo?.status || 'online',
      detail: status.openMeteo?.lastUpdated
        ? formatLocaleDateTime(status.openMeteo.lastUpdated, locale, {
            hour: '2-digit',
            minute: '2-digit',
          })
        : tDiag('activeGrid'),
      statusClass:
        status.openMeteo?.status === 'online'
          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-950/70 hover:border-emerald-600'
          : 'text-red-400 bg-red-950/40 border-red-800/60 hover:bg-red-950/70',
      dotColor: status.openMeteo?.status === 'online' ? 'bg-emerald-400' : 'bg-red-400',
    },
    {
      id: 'cpcb',
      name: tDiag('cpcbName'),
      subtext: tDiag('cpcbSub'),
      icon: Zap,
      status: 'active',
      detail: status.cpcb?.dominantPollutant
        ? `Dom: ${status.cpcb.dominantPollutant}`
        : tDiag('deterministicEngine'),
      statusClass:
        'text-teal-300 bg-teal-950/40 border-teal-800/60 hover:bg-teal-950/70 hover:border-teal-500',
      dotColor: 'bg-teal-400',
    },
    {
      id: 'waqi',
      name: tDiag('waqiName'),
      subtext: tDiag('waqiSub'),
      icon: Radio,
      status: status.waqi?.status || 'unconfigured',
      detail:
        status.waqi?.status === 'online'
          ? status.waqi.stationName || tDiag('online')
          : status.waqi?.status === 'unconfigured'
          ? tDiag('tokenPending')
          : tDiag('offline'),
      statusClass:
        status.waqi?.status === 'online'
          ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60 hover:bg-cyan-950/70 hover:border-cyan-500'
          : 'text-amber-400 bg-amber-950/40 border-amber-800/60 hover:bg-amber-950/70 hover:border-amber-600',
      dotColor: status.waqi?.status === 'online' ? 'bg-cyan-400' : 'bg-amber-400',
    },
    {
      id: 'nasaFirms',
      name: tDiag('nasaName'),
      subtext: tDiag('nasaSub'),
      icon: Satellite,
      status: status.nasaFirms?.status || 'unconfigured',
      detail:
        status.nasaFirms?.status === 'online'
          ? `${status.nasaFirms.firePointsCount} pts`
          : status.nasaFirms?.status === 'unconfigured'
          ? tDiag('keyPending')
          : tDiag('offline'),
      statusClass:
        status.nasaFirms?.status === 'online'
          ? 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60 hover:bg-indigo-950/70 hover:border-indigo-500'
          : 'text-amber-400 bg-amber-950/40 border-amber-800/60 hover:bg-amber-950/70 hover:border-amber-600',
      dotColor: status.nasaFirms?.status === 'online' ? 'bg-indigo-400' : 'bg-amber-400',
    },
    {
      id: 'drone',
      name: tDiag('droneName'),
      subtext: tDiag('droneSub'),
      icon: Navigation,
      status: 'not_connected',
      detail: tDiag('notConnected'),
      statusClass:
        'text-slate-400 bg-slate-900/40 border-slate-700/60 hover:bg-slate-900/70 hover:border-slate-500',
      dotColor: 'bg-slate-500',
    },
  ];

  return (
    <>
      <div className={cn('space-y-1.5', className)}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {tDiag('stripHeader')}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            {tDiag('stripHint')}
          </span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80"
          aria-label="Provider ingestion status strip"
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCardClick(item.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all duration-200 cursor-pointer shadow-sm group focus:outline-none focus:ring-1 focus:ring-emerald-500/50',
                  item.statusClass
                )}
                aria-label={`View diagnostics for ${item.name}`}
              >
                <div className="p-1.5 rounded-md bg-black/40 shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-white truncate text-[11px] group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0 shadow-sm',
                        item.dotColor
                      )}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{item.detail}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diagnostics Drawer / Modal */}
      <SourceDiagnosticsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialSource={selectedSource}
        snapshot={snapshot}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </>
  );
}
