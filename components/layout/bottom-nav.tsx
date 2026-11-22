'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Map, Sparkles, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function BottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const items = [
    { href: '/', key: 'home', icon: Sparkles },
    { href: '/overview', key: 'overview', icon: LayoutDashboard },
    { href: '/live', key: 'live', icon: Activity },
    { href: '/map', key: 'map', icon: Map },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/10 bg-[#06090e]/95 backdrop-blur-md px-2 flex items-center justify-around"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 mb-1" />
            <span className="truncate max-w-[58px]">{t(item.key)}</span>
          </Link>
        );
      })}

      {/* Menu Drawer Button */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Open more navigation options"
      >
        <Menu className="h-4 w-4 mb-1" />
        <span>More</span>
      </button>
    </nav>
  );
}
