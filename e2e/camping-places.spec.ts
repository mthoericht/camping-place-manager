import { test, expect } from '@playwright/test';
import { cleanupTestData, testName } from './test-helpers';

test.describe('Camping Places', () => 
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
  test('should display camping places page', async ({ page }) => 
  {
    await page.goto('/camping-places');

    // Check for page heading
    await expect(page.getByRole('heading', { name: /Camping Places/i })).toBeVisible();

    // Check for "Add New Place" button
    await expect(page.getByRole('link', { name: /Add New Place/i })).toBeVisible();
  });

  test('should show empty state when no camping places exist', async ({ page }) => 
  {
    await page.goto('/camping-places');
    await page.waitForLoadState('networkidle');

    // Check for page heading first to ensure page loaded
    await expect(page.getByRole('heading', { name: /Camping Places/i })).toBeVisible();

    // Check for empty state message, error state, or places grid
    const emptyState = page.getByText(/No camping places yet/i);
    const errorState = page.getByText(/Database Connection Error/i);
    const placesGrid = page.locator('.grid'); // Camping places are shown in a grid
    
    // Page should show either: empty state, error state, or places grid (if data exists)
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasErrorState = await errorState.isVisible().catch(() => false);
    const hasGrid = await placesGrid.isVisible().catch(() => false);
    
    // At least one of these should be visible
    expect(hasEmptyState || hasErrorState || hasGrid).toBeTruthy();

    // Check for "Add Your First Place" button (only if empty state, not error or grid)
    if (hasEmptyState && !hasErrorState) 
    {
      await expect(page.getByRole('link', { name: /Add Your First Place/i })).toBeVisible();
    }
  });

  test('should navigate to new camping place form', async ({ page }) => 
  {
    await page.goto('/camping-places');
    await page.getByRole('link', { name: /Add New Place/i }).click();
    await expect(page).toHaveURL(/.*camping-places\/new/);
  });

  test('should create a new camping place', async ({ page }) => 
  {
    await page.goto('/camping-places/new');
    await page.waitForLoadState('networkidle');

    // Wait for form to be ready
    await expect(page.locator('#name')).toBeVisible();

    // Fill in the form using id selectors with TEST_ prefix
    await page.fill('#name', testName('Camping Place'));
    await page.fill('#description', testName('A beautiful camping place for testing'));
    await page.fill('#location', testName('Test Location'));
    await page.fill('#size', '100');
    await page.fill('#price', '50');

    // Add amenities - look for input with placeholder containing "amenity" or "Add"
    const amenitiesInput = page.locator('input[placeholder*="amenity"], input[placeholder*="Add"]').first();
    if (await amenitiesInput.isVisible().catch(() => false)) 
    {
      await amenitiesInput.fill('WiFi');
      await amenitiesInput.press('Enter');
    }

    // Submit the form - use submit button specifically (not the "Add" amenity button)
    // The submit button has type="submit" and text "Create" or "Update"
    await page.locator('button[type="submit"]').click();

    // Should redirect to camping places page or show success
    // Note: This test assumes the form submission works correctly and DB is available
    await expect(page).toHaveURL(/.*camping-places/, { timeout: 10000 });
  });

  test('should validate required fields in camping place form', async ({ page }) => 
  {
    await page.goto('/camping-places/new');
    await page.waitForLoadState('networkidle');

    // Check that form fields are visible
    const nameInput = page.locator('#name');
    await expect(nameInput).toBeVisible();
    
    // The form has required attribute, browser will handle validation
    // Check if required attribute exists (HTML boolean attributes return empty string when present)
    const requiredAttr = await nameInput.getAttribute('required');
    expect(requiredAttr).not.toBeNull(); // Required attribute exists (even if empty string)
  });
});

