import { test, expect } from '@playwright/test';

test.describe('Analytics (eingeloggt)', () => 
{
  test('Analytics-Seite lädt und zeigt Überschrift', async ({ page }) => 
  {
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: 'Analytics & Berichte' })).toBeVisible();
  });

  test('Stat-Karten sind sichtbar', async ({ page }) => 
  {
    await page.goto('/analytics');
    await expect(page.getByText('Gesamtumsatz')).toBeVisible();
    await expect(page.getByText('Gesamtbuchungen')).toBeVisible();
  });
});
