import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'emerald' | 'amber' | 'red' | 'blue' | 'muted';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    outline: 'border-slate-700 text-slate-300 bg-transparent',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    red: 'bg-red-950/60 text-red-300 border-red-800/60',
    blue: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    muted: 'bg-slate-900/60 text-slate-400 border-slate-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
