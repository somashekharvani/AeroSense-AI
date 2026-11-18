'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Users, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CommunityPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('community')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Community air advisories for housing societies and schools with shareable cards and WhatsApp distribution.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 4 Community Advisory Target</CardTitle>
          <CardDescription>
            Deterministic facts transformed into structured community advisory cards with verifiable QR links and WhatsApp sharing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Users className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 4 (Advisory Generator API & Share Card Render).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
