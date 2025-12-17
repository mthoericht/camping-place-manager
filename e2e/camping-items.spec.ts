import { test, expect } from '@playwright/test';
import { cleanupTestData, testName } from './test-helpers';

test.describe('Camping Items', () => 
{
  // Clean up test data after all tests in this suite
  test.afterAll(async ({ browser }) => 
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await cleanupTestData(page);
    await context.close();
  });

  // Clean up after each test that creates data
  test.afterEach(async ({ page }) => 
  {
    // Clean up any test data created during this test
    await cleanupTestData(page);
  });
  test('should display camping items page', async ({ page }) => 
  {
    await page.goto('/camping-items');
    await page.waitForLoadState('networkidle');

    // Check for page heading
    await expect(page.getByRole('heading', { name: /Camping Items/i })).toBeVisible();
  });

  test('should show empty state when no camping items exist', async ({ page }) => 
  {
    await page.goto('/camping-items');
    await page.waitForLoadState('networkidle');

    // Check for empty state or "Add New Item" button
    const addButton = page.getByRole('link', { name: /Add|New/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new camping item form', async ({ page }) => 
  {
    await page.goto('/camping-items');
    await page.waitForLoadState('networkidle');
    
    const addButton = page.getByRole('link', { name: /Add|New/i }).first();
    await addButton.click();
    await expect(page).toHaveURL(/.*camping-items\/new/);
  });
});

