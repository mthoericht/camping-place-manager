import { test, expect } from '@playwright/test';

test.describe('Camping-Ausrüstung (eingeloggt)', () =>
{
  test('Camping-Ausrüstung-Seite zeigt Überschrift und Inhalt', async ({ page }) =>
  {
    await page.goto('/camping-items');
    await expect(page.locator('#camping-items-page')).toBeVisible();
    await expect(page.locator('#item-list-add')).toBeVisible();
  });

  test('Neues Camping-Item-Button ist sichtbar', async ({ page }) =>
  {
    await page.goto('/camping-items');
    await expect(page.locator('#item-list-add')).toBeVisible();
  });

  test('Camping-Item erstellen, bearbeiten und löschen', async ({ page }) =>
  {
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const createRes = await page.request.post('/api/camping-items', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'E2E Testzelt', category: 'Tent', size: 15, isActive: true },
    });
    const { id: itemId } = await createRes.json();

    await page.goto('/camping-items');
    await expect(page.locator(`[data-entity-id="${itemId}"]`)).toBeVisible();

    await page.locator(`[data-entity-id="${itemId}"] .item-card-edit`).click();
    await expect(page.locator('#item-name')).toBeVisible();
    await page.locator('#item-name').fill('E2E Testzelt Edited');
    await page.locator('#item-submit').click();

    await expect(page.locator(`[data-entity-id="${itemId}"]`)).toBeVisible();

    page.on('dialog', (d) => d.accept());
    await page.locator(`[data-entity-id="${itemId}"] .item-card-delete`).click();
    await expect(page.locator(`[data-entity-id="${itemId}"]`)).not.toBeVisible();
  });
});
