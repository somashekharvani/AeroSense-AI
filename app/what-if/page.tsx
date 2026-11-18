'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { GitCompare, Sliders, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function WhatIfPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('whatIf')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate everyday choices: two-wheeler vs metro, cooking fuel transitions, and purifier runtime.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 Impact Engine Target</CardTitle>
          <CardDescription>
            Calculates precise inhaled dose reductions and carbon emission delta with auditable Impact Receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Sliders className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 2 (Impact Engine & Decision Score Engine).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
