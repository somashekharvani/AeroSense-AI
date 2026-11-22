'use client';

import dynamic from 'next/dynamic';

export const PollutionMap = dynamic(
  () => import('./pollution-map').then((mod) => mod.PollutionMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono">Initializing 3D Spatial Vector Map...</span>
      </div>
    ),
  }
);
