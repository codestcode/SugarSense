'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import i18n from '@/lib/i18n/config';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ToastProvider } from '@/components/common/Toast';
import { AppInitializer } from '@/components/common/AppInitializer';
import { useSettingsStore } from '@/lib/store/settingsStore';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { settings } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    i18n.changeLanguage(settings.language);
  }, [settings.language]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.style.colorScheme = settings.theme;
  }, [settings.theme]);

  if (!mounted) {
    return <div className="min-h-screen bg-transparent text-foreground">{children}</div>;
  }

  const isRTL = settings.language === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-transparent text-foreground"
    >
      <AppInitializer />
      <I18nextProvider i18n={i18n}>
        <ToastProvider>
          <div className="pb-28">
            <div className="sticky top-0 z-30 px-4 pt-4">
              <div className="glass3d mx-auto flex max-w-2xl items-center justify-between rounded-[26px] border border-gray-100 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/70">
                <Link href="/" className="flex items-center gap-3">
                  <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
                    <Image
                      src="/logo.png"
                      alt="SugarSense logo"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-xl object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.22em] text-blue-600 dark:text-blue-300">SUGARSENSE</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Supportive glucose tracking</p>
                  </div>
                </Link>
              </div>
            </div>
            {children}
            <div className="px-4 pt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Made by HabebaEhab</p>
            </div>
          </div>
          <BottomNavigation />
        </ToastProvider>
      </I18nextProvider>
    </div>
  );
}
