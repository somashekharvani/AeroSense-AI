'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { Eye, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

export interface CanvasContainerProps {
  title: string;
  badge?: string;
  children: ReactNode;
  fallback2D: ReactNode;
  description?: string;
}

export function CanvasContainer({
  title,
  badge,
  children,
  fallback2D,
  description,
}: CanvasContainerProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
      if (!gl) setViewMode('2d');
    } catch {
      setHasWebGL(false);
      setViewMode('2d');
    }

    // 2. Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      if (mq.matches) {
        setViewMode('2d');
      }

      const handler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        if (e.matches) setViewMode('2d');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xl flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground tracking-wide">{title}</h3>
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {badge}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border/60 text-xs">
          <button
            type="button"
            disabled={!hasWebGL}
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              viewMode === '3d'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground disabled:opacity-40'
            }`}
            aria-pressed={viewMode === '3d'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3D View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              viewMode === '2d'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={viewMode === '2d'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2D Accessible</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-4 py-1.5 bg-muted/20 border-b border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>{description}</span>
          {prefersReducedMotion && (
            <span className="flex items-center gap-1 text-amber-400">
              <ShieldAlert className="w-3 h-3" /> Reduced motion active
            </span>
          )}
        </div>
      )}

      {/* Viewport content */}
      <div className="relative w-full h-[380px] md:h-[450px] bg-gradient-to-b from-[#070b12] to-[#04060a] overflow-hidden flex items-center justify-center">
        {viewMode === '3d' && hasWebGL ? (
          children
        ) : (
          <div className="w-full h-full p-4 overflow-y-auto flex items-center justify-center">
            {fallback2D}
          </div>
        )}
      </div>
    </div>
  );
}
