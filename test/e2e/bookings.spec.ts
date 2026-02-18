import { test, expect } from '@playwright/test';

test.describe('Buchungen (eingeloggt)', () =>
{
  test('Buchungen-Seite zeigt Überschrift und Inhalt', async ({ page }) =>
  {
    await page.goto('/bookings');
    await expect(page.locator('#bookings-page')).toBeVisible();
    await expect(page.locator('#booking-list-add')).toBeVisible();
  });

  test('Neue Buchung-Button ist sichtbar', async ({ page }) =>
  {
    await page.goto('/bookings');
    await expect(page.locator('#booking-list-add')).toBeVisible();
  });

  test('Buchung erstellen und in Liste sehen', async ({ page }) =>
  {
    test.setTimeout(60_000);
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const placeRes = await page.request.post('/api/camping-places', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Buchungstest-Platz', location: 'Test', size: 50, price: 20, isActive: true },
    });
    const { id: placeId } = await placeRes.json();

    await page.goto('/bookings');
    await page.locator('#booking-list-add').click();
    await expect(page.locator('#booking-customerName')).toBeVisible();

    await page.locator('#booking-customerName').fill('Max Mustermann');
    await page.locator('#booking-customerEmail').fill('max@example.com');
    await page.locator('#booking-guests').fill('2');
    await page.locator('#booking-startDate').fill('2026-07-01');
    await page.locator('#booking-endDate').fill('2026-07-05');

    await page.locator('#booking-place-trigger').click();
    await page.locator(`[role="option"][data-value="${placeId}"]`).waitFor({ state: 'visible' });
    await page.locator(`[role="option"][data-value="${placeId}"]`).click();

    const createBookingResponse = page.waitForResponse(
      (res) => res.url().includes('/api/bookings') && res.request().method() === 'POST' && res.status() === 201
    );
    await page.locator('#booking-submit').click();
    const res = await createBookingResponse;
    const { id: createdBookingId } = await res.json();
    await expect(page.locator(`[data-entity-id="${createdBookingId}"]`)).toBeVisible();
  });
});
