'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Users, Shield, Plus, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FamilyProtectionPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('family')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized exposure budgets and clean-air window schedules stored securely on this device.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full px-3 py-1">
          <Lock className="h-3.5 w-3.5" />
          <span>Local Device Only</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2 Engine & Phase 6 UI Target</CardTitle>
          <CardDescription>
            The Exposure Engine (Phase 2) will calculate individual inhaled PM2.5 doses across microenvironments based on EPA breathing factors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-3">
            <Shield className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Profiles for Children, Adults, Elderly, and Sensitive members will be managed here.</p>
            <Button variant="outline" size="sm" disabled>
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Add Member (Phase 6)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
