'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Map,
  Users,
  CalendarCheck,
  Home,
  GitCompare,
  TrendingUp,
  Share2,
  Bot,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  key: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', key: 'overview', icon: LayoutDashboard },
  { href: '/live', key: 'live', icon: Activity },
  { href: '/map', key: 'map', icon: Map },
  { href: '/family', key: 'family', icon: Users },
  { href: '/planner', key: 'planner', icon: CalendarCheck },
  { href: '/indoor', key: 'indoor', icon: Home },
  { href: '/what-if', key: 'whatIf', icon: GitCompare },
  { href: '/forecast', key: 'forecast', icon: TrendingUp },
  { href: '/community', key: 'community', icon: Share2 },
  { href: '/copilot', key: 'copilot', icon: Bot },
];

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed md:sticky top-0 md:top-16 z-50 md:z-30 h-full md:h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-white/10 bg-[#06090e] transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto p-4 flex flex-col justify-between',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div>
          {/* Mobile close button */}
          <div className="flex items-center justify-between md:hidden mb-4 pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group cursor-pointer',
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span className="truncate">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Notice */}
        <div className="pt-4 mt-4 border-t border-white/5">
          <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-2.5 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold block mb-0.5">
              Deterministic Engines
            </span>
            <span>All science runs on client & server engines. Zero hallucinated metrics.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
