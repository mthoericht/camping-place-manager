import { useUiStore } from '../useUiStore';

describe('useUiStore', () => 
{
  beforeEach(() => 
  {
    useUiStore.setState({
      theme: 'light',
      sidebarCollapsed: false,
      mobileNavOpen: false,
    });
  });

  describe('theme', () => 
  {
    it('should set theme', () => 
    {
      useUiStore.getState().setTheme('dark');
      expect(useUiStore.getState().theme).toBe('dark');

      useUiStore.getState().setTheme('light');
      expect(useUiStore.getState().theme).toBe('light');
    });

    it('should toggle theme from light to dark', () => 
    {
      useUiStore.getState().setTheme('light');
      useUiStore.getState().toggleTheme();
      expect(useUiStore.getState().theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => 
    {
      useUiStore.getState().setTheme('dark');
      useUiStore.getState().toggleTheme();
      expect(useUiStore.getState().theme).toBe('light');
    });
  });

  describe('sidebar', () => 
  {
    it('should set sidebar collapsed state', () => 
    {
      useUiStore.getState().setSidebarCollapsed(true);
      expect(useUiStore.getState().sidebarCollapsed).toBe(true);

      useUiStore.getState().setSidebarCollapsed(false);
      expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    });

    it('should toggle sidebar', () => 
    {
      expect(useUiStore.getState().sidebarCollapsed).toBe(false);
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarCollapsed).toBe(true);
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('mobileNav', () => 
  {
    it('should set mobile nav open state', () => 
    {
      useUiStore.getState().setMobileNavOpen(true);
      expect(useUiStore.getState().mobileNavOpen).toBe(true);

      useUiStore.getState().setMobileNavOpen(false);
      expect(useUiStore.getState().mobileNavOpen).toBe(false);
    });

    it('should toggle mobile nav', () => 
    {
      expect(useUiStore.getState().mobileNavOpen).toBe(false);
      useUiStore.getState().toggleMobileNav();
      expect(useUiStore.getState().mobileNavOpen).toBe(true);
      useUiStore.getState().toggleMobileNav();
      expect(useUiStore.getState().mobileNavOpen).toBe(false);
    });
  });
});
