'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ForecastPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('forecast')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            48-hour atmospheric outlook, temperature inversion risk timeline, and station backtesting for {location.name}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 & Phase 3 Forecasting Target</CardTitle>
          <CardDescription>
            Atmospheric vertical gradient (925 & 850 hPa) calculations and historical error metrics (MAE, RMSE, Bias).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <BarChart3 className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 2 (Inversion & Forecasting Engines) and Phase 3 (Open-Meteo Atmosphere Client).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
