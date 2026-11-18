'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileCheck2,
  TrendingDown,
  TrendingUp,
  Cpu,
  Database,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceBadge, ConfidenceLevel } from '@/components/ui/confidence-badge';

export interface ImpactReceiptProps {
  receipt: {
    id: string;
    action: string;
    baseline: string;
    alternative: string;
    change: {
      value: number | string;
      unit: string;
      direction: 'reduction' | 'increase' | 'neutral';
    };
    method: string;
    assumptions: string[];
    dataUsed: Array<{
      factId: string;
      source: string;
      timestamp?: string;
    }>;
    confidence: {
      level: ConfidenceLevel;
      reasons: string[];
    };
    engine: {
      name: string;
      version: string;
    };
    aiExplanation?: string;
  };
  defaultExpanded?: boolean;
  className?: string;
}

export function ImpactReceiptCard({
  receipt,
  defaultExpanded = false,
  className,
}: ImpactReceiptProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const isGoodReduction = receipt.change.direction === 'reduction';

  return (
    <div
      className={cn(
        'rounded-xl border border-emerald-900/40 bg-gradient-to-b from-[#0e181e] to-[#0a1117] p-4 text-slate-200 shadow-lg transition-all',
        className
      )}
    >
      {/* Receipt Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Impact Receipt
              </span>
              <span className="text-[10px] text-slate-500 font-mono">#{receipt.id}</span>
            </div>
            <h4 className="text-sm font-semibold text-white">{receipt.action}</h4>
          </div>
        </div>
        <ConfidenceBadge
          level={receipt.confidence.level}
          reasons={receipt.confidence.reasons}
        />
      </div>

      {/* Primary Impact Stat Callout */}
      <div className="my-3 flex items-center justify-between rounded-lg bg-black/40 border border-white/5 p-3">
        <div>
          <div className="text-xs text-slate-400">Calculated Change</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {isGoodReduction ? '-' : '+'}
              {receipt.change.value}
            </span>
            <span className="text-xs text-slate-300 font-medium">{receipt.change.unit}</span>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
            isGoodReduction
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
          )}
        >
          {isGoodReduction ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5" />
          )}
          <span>{receipt.change.direction}</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
        <div className="rounded-md bg-slate-900/60 border border-slate-800/60 p-2">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
            Baseline
          </span>
          <span className="font-medium text-slate-300">{receipt.baseline}</span>
        </div>
        <div className="rounded-md bg-emerald-950/30 border border-emerald-800/30 p-2">
          <span className="text-[10px] uppercase font-semibold text-emerald-500 block mb-0.5">
            Alternative
          </span>
          <span className="font-medium text-emerald-200">{receipt.alternative}</span>
        </div>
      </div>

      {/* Expand/Collapse Scientific Proof Drawer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-md py-1 px-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        <span>Scientific Audit & Assumptions</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 pt-3 border-t border-white/5 text-xs text-slate-400 animate-in fade-in-50 duration-200">
          {/* Method */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Method</span>
            </div>
            <p className="text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/60 font-mono text-[11px]">
              {receipt.method}
            </p>
          </div>

          {/* Assumptions */}
          {receipt.assumptions && receipt.assumptions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                <span>Model Assumptions</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-400">
                {receipt.assumptions.map((assump, idx) => (
                  <li key={idx}>{assump}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Used */}
          {receipt.dataUsed && receipt.dataUsed.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                <Database className="h-3.5 w-3.5 text-sky-400" />
                <span>Data & Fact IDs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {receipt.dataUsed.map((data, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    <span>{data.factId}</span>
                    <span className="text-slate-500">({data.source})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional AI Explanation */}
          {receipt.aiExplanation && (
            <div className="rounded-md bg-indigo-950/20 border border-indigo-900/40 p-2.5">
              <div className="flex items-center gap-1 text-indigo-300 font-semibold mb-1">
                <Info className="h-3.5 w-3.5" />
                <span>AI Plain-Language Context</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {receipt.aiExplanation}
              </p>
            </div>
          )}

          {/* Engine Signature */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>
              Engine: <strong className="text-slate-400">{receipt.engine.name}</strong>@
              {receipt.engine.version}
            </span>
            <span>Deterministic Verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
