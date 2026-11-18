'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { CalendarCheck, Sparkles, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PlannerPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('planner')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hour-by-hour winter smog navigation routine with verified Impact Receipts for each recommendation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 4 Gemini Integration Target</CardTitle>
          <CardDescription>
            Gemini plans the daily routine referencing strictly validated FactsObjects, backed by the validator and template fallback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Clock className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 4 (Gemini Planner, Impact Receipts, Validator & Fallback).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
