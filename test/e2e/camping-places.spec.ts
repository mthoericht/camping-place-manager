import { test, expect } from '@playwright/test';

test.describe('Stellplätze (eingeloggt)', () => 
{
  test('Stellplätze-Seite zeigt Überschrift und Inhalt', async ({ page }) => 
  {
    await page.goto('/camping-places');
    await expect(page.getByRole('heading', { name: 'Stellplätze & Flächen' })).toBeVisible();
    await expect(page.getByText('Verwalten Sie alle verfügbaren Plätze')).toBeVisible();
  });

  test('Neuer Stellplatz-Button ist sichtbar', async ({ page }) => 
  {
    await page.goto('/camping-places');
    await expect(page.getByRole('button', { name: /Neuer Stellplatz/ })).toBeVisible();
  });

  test('Stellplatz erstellen, bearbeiten und löschen', async ({ page }) => 
  {
    await page.goto('/camping-places');

    await page.getByRole('button', { name: /Neuer Stellplatz/ }).click();
    await expect(page.getByRole('heading', { name: 'Neuer Stellplatz' })).toBeVisible();

    await page.getByLabel('Name').fill('E2E Testplatz');
    await page.getByLabel('Standort').fill('Seeufer');
    await page.getByLabel('Größe (m²)').fill('100');
    await page.getByLabel('Preis pro Nacht (€)').fill('25');

    await page.getByRole('button', { name: 'Erstellen' }).click();
    await expect(page.getByText('E2E Testplatz')).toBeVisible();

    const card = page.locator('[data-slot="card"]', { hasText: 'E2E Testplatz' }).first();
    await card.getByRole('button', { name: 'Bearbeiten' }).click();
    await expect(page.getByRole('heading', { name: 'Stellplatz bearbeiten' })).toBeVisible();

    await page.getByLabel('Name').fill('E2E Testplatz Edited');
    await page.getByRole('button', { name: 'Aktualisieren' }).click();
    await expect(page.getByText('E2E Testplatz Edited')).toBeVisible();

    page.on('dialog', (d) => d.accept());
    const updatedCard = page.locator('[data-slot="card"]', { hasText: 'E2E Testplatz Edited' }).first();
    const deleteBtn = updatedCard.locator('.flex.gap-2 button').last();
    await deleteBtn.click();
    await expect(page.getByText('E2E Testplatz Edited')).not.toBeVisible();
  });
});
