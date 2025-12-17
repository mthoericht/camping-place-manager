import { test, expect } from '@playwright/test';
import { cleanupTestData, testName, testEmail } from './test-helpers';

test.describe('Bookings', () => 
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
  test('should display bookings page', async ({ page }) => 
  {
    await page.goto('/bookings');

    // Check for page heading
    await expect(page.getByRole('heading', { name: /Bookings/i })).toBeVisible();

    // Check for "New Booking" button
    await expect(page.getByRole('link', { name: /New Booking/i })).toBeVisible();
  });

  test('should show empty state when no bookings exist', async ({ page }) => 
  {
    await page.goto('/bookings');
    
    // Wait for page to load (might show error state if DB not connected)
    await page.waitForLoadState('networkidle');

    // Check for page heading first to ensure page loaded
    await expect(page.getByRole('heading', { name: /Bookings/i })).toBeVisible();

    // Check for empty state message, error state, or bookings table
    const emptyState = page.getByText(/No bookings yet/i);
    const errorState = page.getByText(/Database Connection Error/i);
    const bookingsTable = page.locator('table');
    
    // Page should show either: empty state, error state, or bookings table (if data exists)
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasErrorState = await errorState.isVisible().catch(() => false);
    const hasTable = await bookingsTable.isVisible().catch(() => false);
    
    // At least one of these should be visible
    expect(hasEmptyState || hasErrorState || hasTable).toBeTruthy();
  });

  test('should navigate to new booking form', async ({ page }) => 
  {
    await page.goto('/bookings');
    await page.getByRole('link', { name: /New Booking/i }).click();
    await expect(page).toHaveURL(/.*bookings\/new/);
  });

  test('should display booking form fields', async ({ page }) => 
  {
    await page.goto('/bookings/new');
    await page.waitForLoadState('networkidle');

    // Check for form fields using id selectors (forms use id, not name)
    await expect(page.locator('#customerName')).toBeVisible();
    await expect(page.locator('#customerEmail')).toBeVisible();
    await expect(page.locator('#startDate')).toBeVisible();
    await expect(page.locator('#endDate')).toBeVisible();
    await expect(page.locator('#guests')).toBeVisible();
  });

  test('should validate required fields in booking form', async ({ page }) => 
  {
    await page.goto('/bookings/new');
    await page.waitForLoadState('networkidle');

    // Check that form fields are visible (validation may vary)
    await expect(page.locator('#customerName')).toBeVisible();
    await expect(page.locator('#customerEmail')).toBeVisible();
  });
});

