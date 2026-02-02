'use client';

import { useEffect } from 'react';
import { useUiStore, hydrateUiFromStorage } from '@/stores/useUiStore';
import Sidebar from './Sidebar';

interface AppShellProps 
{
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) 
{
  const theme = useUiStore((s) => s.theme);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);

  useEffect(() => 
  {
    hydrateUiFromStorage();
  }, []);

  useEffect(() => 
  {
    const root = document.documentElement;
    if (theme === 'dark') 
    {
      root.classList.add('dark');
    }
    else 
    {
      root.classList.remove('dark');
    }
  }, [theme]);

  const mainMarginClass = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      {/* Main area - offset by sidebar on desktop */}
      <div className={`transition-[margin] duration-300 ease-in-out ${mainMarginClass}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMobileNav}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open menu"
              >
                <span className="text-xl">☰</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                🏕️ Camping Place Manager
              </h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
