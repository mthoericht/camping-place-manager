import { test, expect } from '@playwright/test';

test.describe('Analytics (eingeloggt)', () =>
{
  test('Analytics-Seite lädt und zeigt Überschrift', async ({ page }) =>
  {
    await page.goto('/analytics');
    await expect(page.locator('#analytics-page')).toBeVisible();
  });

  test('Stat-Karten sind sichtbar', async ({ page }) =>
  {
    await page.goto('/analytics');
    await expect(page.locator('#analytics-page')).toBeVisible();
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible();
  });
});
