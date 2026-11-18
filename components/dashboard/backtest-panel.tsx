'use client';

import * as React from 'react';
import { BarChart3, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BacktestMetrics } from '@/engines/forecasting';

export function BacktestPanel({
  metrics,
  className,
}: {
  metrics?: BacktestMetrics;
  className?: string;
}) {
  const hasEnoughData = metrics && metrics.sampleCount >= 2;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-sm">Forecast Backtest Calibration</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Deterministic Evaluation
          </span>
        </div>
        <CardDescription className="text-xs">
          Statistical validation comparing Open-Meteo atmospheric forecast against actual CPCB ground station telemetry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasEnoughData ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center space-y-2">
            <Info className="h-6 w-6 text-slate-500 mx-auto" />
            <p className="text-xs font-medium text-slate-300">
              Not enough data to validate yet.
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Evaluation metrics (MAE, RMSE, Bias) require co-located ground monitoring readings across multiple hourly windows.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Mean Abs Error (MAE)
                </span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {metrics.mae} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </span>
              </div>

              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  RMSE
                </span>
                <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                  {metrics.rmse} <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </span>
              </div>

              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Mean Bias
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                  {metrics.bias > 0 ? `+${metrics.bias}` : metrics.bias}{' '}
                  <span className="text-xs font-normal text-slate-400">µg/m³</span>
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/40 border border-white/5 p-2.5 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{metrics.evaluationNote}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
