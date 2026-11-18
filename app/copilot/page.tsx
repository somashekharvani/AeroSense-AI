'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Bot, MessageSquare, Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CopilotPage() {
  const tNav = useTranslations('nav');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('copilot')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic tool-calling Clean-Air Copilot answering in your language with auditable calculation links.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 4 Copilot Tool-Calling Target</CardTitle>
          <CardDescription>
            Gemini function-calling mapped to deterministic engine tools (getSnapshot, estimateExposure, simulateIndoorAir, runWhatIf).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 space-y-2">
            <Terminal className="h-8 w-8 text-slate-600 mx-auto" />
            <p>Awaiting Phase 4 (Streaming AI Copilot with Engine Tool-Calling & Safety Filter).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
