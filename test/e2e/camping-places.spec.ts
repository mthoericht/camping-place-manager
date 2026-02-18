import { test, expect } from '@playwright/test';

test.describe('Stellplätze (eingeloggt)', () =>
{
  test('Stellplätze-Seite zeigt Überschrift und Inhalt', async ({ page }) =>
  {
    await page.goto('/camping-places');
    await expect(page.locator('#camping-places-page')).toBeVisible();
    await expect(page.locator('#place-list-add')).toBeVisible();
  });

  test('Neuer Stellplatz-Button ist sichtbar', async ({ page }) =>
  {
    await page.goto('/camping-places');
    await expect(page.locator('#place-list-add')).toBeVisible();
  });

  test('Stellplatz erstellen, bearbeiten und löschen', async ({ page }) =>
  {
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const createRes = await page.request.post('/api/camping-places', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'E2E Testplatz', location: 'Seeufer', size: 100, price: 25, isActive: true },
    });
    const { id: placeId } = await createRes.json();

    await page.goto('/camping-places');
    await expect(page.locator(`[data-entity-id="${placeId}"]`)).toBeVisible();

    await page.locator(`[data-entity-id="${placeId}"] .place-card-edit`).click();
    await expect(page.locator('#place-name')).toBeVisible();
    await page.locator('#place-name').fill('E2E Testplatz Edited');
    await page.locator('#place-submit').click();

    await expect(page.locator(`[data-entity-id="${placeId}"]`)).toBeVisible();

    page.on('dialog', (d) => d.accept());
    await page.locator(`[data-entity-id="${placeId}"] .place-card-delete`).click();
    await expect(page.locator(`[data-entity-id="${placeId}"]`)).not.toBeVisible();
  });
});
