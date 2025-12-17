import { test, expect } from '@playwright/test';

test.describe('Home Page', () => 
{
  test('should display welcome message and navigation cards', async ({ page }) => 
  {
    await page.goto('/');

    // Check for main heading
    await expect(page.getByRole('heading', { name: /Welcome to Camping Place Manager/i })).toBeVisible();

    // Check for navigation cards - use specific role selectors to avoid strict mode violations
    await expect(page.getByRole('heading', { name: 'Camping Places' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Camping Items' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });

  test('should navigate to camping places page', async ({ page }) => 
  {
    await page.goto('/');
    await page.getByRole('link', { name: /Manage Places/i }).click();
    await expect(page).toHaveURL(/.*camping-places/);
  });

  test('should navigate to camping items page', async ({ page }) => 
  {
    await page.goto('/');
    await page.getByRole('link', { name: /Manage Items/i }).click();
    await expect(page).toHaveURL(/.*camping-items/);
  });

  test('should navigate to bookings page', async ({ page }) => 
  {
    await page.goto('/');
    await page.getByRole('link', { name: /View Bookings/i }).click();
    await expect(page).toHaveURL(/.*bookings/);
  });

  test('should navigate to analytics page', async ({ page }) => 
  {
    await page.goto('/');
    await page.getByRole('link', { name: /View Analytics/i }).click();
    await expect(page).toHaveURL(/.*analytics/);
  });
});

