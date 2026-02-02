import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface UiState 
{
  theme: Theme;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

const STORAGE_KEY = 'camping-place-manager-ui';

function getStoredTheme(): Theme 
{
  if (typeof window === 'undefined') return 'light';
  try 
  {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) 
    {
      const parsed = JSON.parse(stored) as { theme?: Theme };
      if (parsed.theme === 'dark' || parsed.theme === 'light') return parsed.theme;
    }
  }
  catch 
  {
    // ignore
  }
  return 'light';
}

function persistTheme(theme: Theme): void 
{
  if (typeof window === 'undefined') return;
  try 
  {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed = existing ? (JSON.parse(existing) as Record<string, unknown>) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, theme }));
  }
  catch 
  {
    // ignore
  }
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarCollapsed: false,
  mobileNavOpen: false,

  setTheme: (theme) => 
  {
    persistTheme(theme);
    set({ theme });
  },

  toggleTheme: () => 
  {
    set((state) => 
    {
      const next = state.theme === 'light' ? 'dark' : 'light';
      persistTheme(next);
      return { theme: next };
    });
  },

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
}));

// Hydrate theme from localStorage on client (call from a client component on mount)
export function hydrateUiFromStorage(): void 
{
  const stored = getStoredTheme();
  useUiStore.setState({ theme: stored });
}
