import * as React from 'react';
import {
  Sparkles,
  ThumbsUp,
  AlertCircle,
  Wind,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface AQIBadgeProps {
  aqi: number;
  category?: AQICategory;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function AQIBadge({
  aqi,
  category,
  showNumber = true,
  size = 'md',
  className,
}: AQIBadgeProps) {
  const cat = category || getAQICategory(aqi);

  const configs: Record<
    AQICategory,
    {
      label: string;
      colorClass: string;
      bgClass: string;
      borderClass: string;
      icon: React.ElementType;
    }
  > = {
    Good: {
      label: 'Good',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-950/60',
      borderClass: 'border-emerald-700/60',
      icon: Sparkles,
    },
    Satisfactory: {
      label: 'Satisfactory',
      colorClass: 'text-lime-400',
      bgClass: 'bg-lime-950/60',
      borderClass: 'border-lime-700/60',
      icon: ThumbsUp,
    },
    Moderate: {
      label: 'Moderate',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-950/60',
      borderClass: 'border-yellow-700/60',
      icon: AlertCircle,
    },
    Poor: {
      label: 'Poor',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-950/60',
      borderClass: 'border-orange-700/60',
      icon: Wind,
    },
    'Very Poor': {
      label: 'Very Poor',
      colorClass: 'text-red-400',
      bgClass: 'bg-red-950/60',
      borderClass: 'border-red-700/60',
      icon: ShieldAlert,
    },
    Severe: {
      label: 'Severe',
      colorClass: 'text-rose-300 font-bold',
      bgClass: 'bg-red-950/90',
      borderClass: 'border-red-600',
      icon: Flame,
    },
  };

  const current = configs[cat];
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2 font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border font-medium transition-colors shadow-sm',
        current.bgClass,
        current.borderClass,
        current.colorClass,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Air Quality Index ${aqi}: ${current.label}`}
    >
      <IconComponent className={cn(size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4', 'shrink-0')} />
      {showNumber && <span className="font-mono font-bold">{aqi}</span>}
      <span>{current.label}</span>
    </div>
  );
}
