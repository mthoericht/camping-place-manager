import { test, expect } from '@playwright/test'

test.describe('Camping-Ausrüstung (eingeloggt)', () => 
{
  test('Camping-Ausrüstung-Seite zeigt Überschrift und Inhalt', async ({ page }) => 
  {
    await page.goto('/camping-items')
    await expect(page.getByRole('heading', { name: 'Camping-Ausrüstung' })).toBeVisible()
    await expect(page.getByText('Verwalten Sie verfügbare Camping-Items')).toBeVisible()
  })

  test('Neues Camping-Item-Button ist sichtbar', async ({ page }) => 
  {
    await page.goto('/camping-items')
    await expect(page.getByRole('button', { name: /Neues Camping-Item/ })).toBeVisible()
  })

  test('Camping-Item erstellen, bearbeiten und löschen', async ({ page }) => 
  {
    await page.goto('/camping-items')

    await page.getByRole('button', { name: /Neues Camping-Item/ }).click()
    await expect(page.getByRole('heading', { name: 'Neues Camping-Item' })).toBeVisible()

    await page.getByLabel('Name').fill('E2E Testzelt')
    await page.getByLabel('Größe (m²)').fill('15')

    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('E2E Testzelt')).toBeVisible()

    const card = page.locator('[data-slot="card"]', { hasText: 'E2E Testzelt' }).first()
    await card.getByRole('button', { name: 'Bearbeiten' }).click()
    await expect(page.getByRole('heading', { name: 'Camping-Item bearbeiten' })).toBeVisible()

    await page.getByLabel('Name').fill('E2E Testzelt Edited')
    await page.getByRole('button', { name: 'Aktualisieren' }).click()
    await expect(page.getByText('E2E Testzelt Edited')).toBeVisible()

    page.on('dialog', (d) => d.accept())
    const updatedCard = page.locator('[data-slot="card"]', { hasText: 'E2E Testzelt Edited' }).first()
    const deleteBtn = updatedCard.locator('.flex.gap-2 button').last()
    await deleteBtn.click()
    await expect(page.getByText('E2E Testzelt Edited')).not.toBeVisible()
  })
})
