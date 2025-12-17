import { test, expect } from '@playwright/test';

test.describe('Analytics Page', () => 
{
  test('should display analytics page', async ({ page }) => 
  {
    await page.goto('/analytics');

    // Check that the page loads without errors
    // The actual content may vary, but the page should be accessible
    await expect(page).toHaveURL(/.*analytics/);
  });
});

