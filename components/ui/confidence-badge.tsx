import * as React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  reasons?: string[];
  className?: string;
  showIcon?: boolean;
}

export function ConfidenceBadge({
  level,
  reasons,
  className,
  showIcon = true,
}: ConfidenceBadgeProps) {
  const configs = {
    high: {
      label: 'High Confidence',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
    },
    medium: {
      label: 'Medium Confidence',
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
      icon: AlertCircle,
      iconColor: 'text-amber-400',
    },
    low: {
      label: 'Low Confidence',
      badgeClass: 'bg-red-950/60 text-red-300 border-red-700/60',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
    },
  };

  const current = configs[level] || configs.medium;
  const IconComponent = current.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        current.badgeClass,
        className
      )}
      title={reasons && reasons.length > 0 ? reasons.join(' • ') : current.label}
      role="status"
      aria-label={`Confidence level: ${current.label}`}
    >
      {showIcon && <IconComponent className={cn('h-3.5 w-3.5 shrink-0', current.iconColor)} />}
      <span>{current.label}</span>
    </div>
  );
}
