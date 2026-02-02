'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/stores/useUiStore';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/camping-places', label: 'Camping Places', icon: '🏕️' },
  { href: '/camping-items', label: 'Camping Items', icon: '🎒' },
  { href: '/bookings', label: 'Bookings', icon: '📅' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
];

const linkBase =
  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors';
const linkActive =
  'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
const linkInactive =
  'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

export default function Sidebar() 
{
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => 
  {
    if (!mobileNavOpen) return;
    const handleEscape = (e: KeyboardEvent) => 
    {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:z-30 lg:h-screen
          bg-white dark:bg-gray-900 border-r dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-3 border-b dark:border-gray-700 shrink-0">
          {!collapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              🏕️ Camping
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <span className="text-xl">→</span>
            ) : (
              <span className="text-xl">←</span>
            )}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => 
          {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                <span className="text-lg shrink-0" aria-hidden>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
          aria-hidden="true"
          onClick={closeMobileNav}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-64
          bg-white dark:bg-gray-900 border-r dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation"
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-700">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            🏕️ Camping
          </span>
          <button
            type="button"
            onClick={closeMobileNav}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => 
          {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={`${linkBase} ${isActive ? linkActive : linkInactive}`}
              >
                <span className="text-lg shrink-0" aria-hidden>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
