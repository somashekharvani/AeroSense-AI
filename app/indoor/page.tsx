'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Home, Wind, Box } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function IndoorAirPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('indoor')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic mass-balance model for indoor PM2.5, purifier sizing, and Corsi-Rosenthal box builder.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 Engine & Phase 5 3D Room Target</CardTitle>
          <CardDescription>
            Deterministic mass balance differential equation solving indoor particulate accumulation, window ventilation windows, and CADR performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Box className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 2 (Indoor Air Mass-Balance Engine) and Phase 5 (3D Cutaway Room Scene).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
