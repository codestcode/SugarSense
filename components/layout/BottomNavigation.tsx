'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Home, Plus, History, BarChart3, Settings, Sparkles, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home, activeClassName: 'bg-blue-600 text-white shadow-[0_10px_24px_-14px_rgba(37,99,235,0.9)] dark:bg-blue-500 dark:text-slate-950' },
    { path: '/add', label: t('nav.add'), icon: Plus, activeClassName: 'bg-emerald-600 text-white shadow-[0_10px_24px_-14px_rgba(5,150,105,0.9)] dark:bg-emerald-400 dark:text-slate-950' },
    { path: '/add?mode=scan', label: 'Scan', icon: Camera, activeClassName: 'bg-cyan-600 text-white shadow-[0_10px_24px_-14px_rgba(8,145,178,0.9)] dark:bg-cyan-400 dark:text-slate-950' },
    { path: '/history', label: t('nav.history'), icon: History, activeClassName: 'bg-violet-600 text-white shadow-[0_10px_24px_-14px_rgba(124,58,237,0.9)] dark:bg-violet-400 dark:text-slate-950' },
    { path: '/stats', label: t('nav.stats'), icon: BarChart3, activeClassName: 'bg-amber-500 text-white shadow-[0_10px_24px_-14px_rgba(245,158,11,0.95)] dark:bg-amber-300 dark:text-slate-950' },
    { path: '/ai', label: 'AI', icon: Sparkles, activeClassName: 'bg-sky-600 text-white shadow-[0_10px_24px_-14px_rgba(2,132,199,0.95)] dark:bg-sky-400 dark:text-slate-950' },
    { path: '/settings', label: t('nav.settings'), icon: Settings, activeClassName: 'bg-slate-900 text-white shadow-[0_10px_24px_-14px_rgba(15,23,42,0.95)] dark:bg-white dark:text-slate-950' },
  ];

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:bottom-4 sm:px-4">
      <div className="glass3d mx-auto max-w-2xl rounded-[24px] border border-gray-100 bg-white/80 p-1.5 sm:rounded-[28px] sm:p-2 dark:border-white/10 dark:bg-zinc-950/75">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none sm:gap-2">
        {navItems.map(({ path, label, icon: Icon, activeClassName }) => (
          <Link
            key={path}
            href={path}
            className={cn(
              'flex min-w-[58px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px] px-2 py-2 text-[11px] font-medium transition-all duration-200 sm:min-w-[72px] sm:gap-1 sm:rounded-[22px] sm:px-3 sm:py-3 sm:text-xs',
              isActive(path)
                ? activeClassName
                : 'text-gray-600 hover:bg-black/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
            )}
          >
            <Icon size={18} className="sm:h-5 sm:w-5" />
            <span className="text-[11px] font-medium sm:text-xs">{label}</span>
          </Link>
        ))}
        </div>
      </div>
    </nav>
  );
};
