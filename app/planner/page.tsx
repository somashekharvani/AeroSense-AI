'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  Wind,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { useLocation } from '@/components/location/location-provider';
import { useSnapshot } from '@/hooks/use-snapshot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlannerPage() {
  const tNav = useTranslations('nav');
  const { location } = useLocation();
  const { data: snapshot } = useSnapshot();

  const [planResult, setPlanResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedFactId, setSelectedFactId] = React.useState<string | null>(null);

  const fetchPlan = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          city: location.name,
          userQuery: 'Plan the optimal 24-hour clean air routine for our household.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlanResult(data);
      }
    } catch (err) {
      console.error('Failed to fetch plan', err);
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon, location.name]);

  React.useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const plan = planResult?.plan;
  const isFallback = planResult?.isFallback;
  const factsUsed = planResult?.factsUsed || {};

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white font-display">
              {tNav('planner')} — Clean-Air Routine & Decisions
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24-hour personalized routine and household actions planned strictly from verified scientific engine facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {planResult && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isFallback
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isFallback ? 'Deterministic Engine Fallback' : `Gemini Verified (${planResult.modelUsed || 'AI'})`}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlan}
            className="border-slate-800 bg-slate-900/60 text-xs h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-emerald-400" />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : plan ? (
        <>
          {/* Executive Briefing Card */}
          <Card className="border-emerald-900/40 bg-gradient-to-br from-[#0a141c] to-[#070e14]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Executive Air Quality Briefing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-slate-300">
              <p>{plan.summary}</p>
              <p className="text-slate-400 italic">{plan.dailyDecisionScoreCommentary}</p>
            </CardContent>
          </Card>

          {/* Clean Air Window Card */}
          {plan.cleanAirWindow && (
            <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Optimal Clean-Air Ventilation & Errand Window
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {plan.cleanAirWindow.startHour} — {plan.cleanAirWindow.endHour}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{plan.cleanAirWindow.reason}</div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {plan.cleanAirWindow.citedFactIds?.map((id: string) => (
                  <button
                    key={id}
                    onClick={() => setSelectedFactId(id)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40 transition-colors"
                  >
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 24-Hour Routine Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Recommended 24-Hour Routine</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.hourlyRoutine?.map((slot: any, idx: number) => (
                <Card key={idx} className="border-slate-800/80 bg-slate-900/60">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400">{slot.timeSlot}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          slot.isOutdoorSafe
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {slot.isOutdoorSafe ? 'Outdoor Safe' : 'Stay Indoors'}
                      </span>
                    </div>
                    <CardTitle className="text-sm text-white">{slot.activity}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-slate-300 leading-relaxed">{slot.guidance}</p>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px]">
                      <span className="text-slate-400">
                        Ventilation: <span className="font-semibold text-white capitalize">{slot.windowVentilation.replace(/_/g, ' ')}</span>
                      </span>
                      <div className="flex gap-1">
                        {slot.citedFactIds?.map((id: string) => (
                          <button
                            key={id}
                            onClick={() => setSelectedFactId(id)}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-700"
                          >
                            #{id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Priority Recommendations */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Priority Household Recommendations</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.recommendations?.map((rec: any) => (
                <Card key={rec.id} className="border-slate-800/80 bg-slate-900/60 flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-500">{rec.category}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          rec.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-400'
                            : rec.urgency === 'moderate'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {rec.urgency}
                      </span>
                    </div>
                    <CardTitle className="text-sm text-white">{rec.title}</CardTitle>
                    <CardDescription className="text-xs">{rec.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-emerald-300">
                      {rec.action}
                    </div>
                    <div className="flex gap-1 flex-wrap pt-1">
                      {rec.citedFactIds?.map((id: string) => (
                        <button
                          key={id}
                          onClick={() => setSelectedFactId(id)}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-700"
                        >
                          #{id}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Legal / Health Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-500 text-center leading-relaxed">
            {plan.disclaimer}
          </div>
        </>
      ) : (
        <div className="text-xs text-slate-500 text-center py-8">Unable to generate plan.</div>
      )}

      {/* Fact Citation Inspection Modal */}
      {selectedFactId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-400" />
                <h3 className="font-mono text-sm font-bold text-white">{selectedFactId}</h3>
              </div>
              <button
                onClick={() => setSelectedFactId(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            {factsUsed[selectedFactId] ? (
              <div className="space-y-2 text-xs">
                <div className="text-slate-400">Label: <span className="text-white font-medium">{factsUsed[selectedFactId].label}</span></div>
                <div className="text-slate-400">
                  Value:{' '}
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {factsUsed[selectedFactId].value} {factsUsed[selectedFactId].unit || ''}
                  </span>
                </div>
                <div className="text-slate-400">Source: <span className="font-mono text-slate-300">{factsUsed[selectedFactId].source}</span></div>
                <div className="text-slate-400 text-[10px]">Timestamp: {factsUsed[selectedFactId].timestamp}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Fact details not found in active facts registry.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
