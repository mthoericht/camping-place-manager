import { test, expect } from '@playwright/test'

test.describe('Stellplätze (eingeloggt)', () => 
{
  test('Stellplätze-Seite zeigt Überschrift und Inhalt', async ({ page }) => 
  {
    await page.goto('/camping-places')
    await expect(page.getByRole('heading', { name: 'Stellplätze & Flächen' })).toBeVisible()
    await expect(page.getByText('Verwalten Sie alle verfügbaren Plätze')).toBeVisible()
  })

  test('Neuer Stellplatz-Button ist sichtbar', async ({ page }) => 
  {
    await page.goto('/camping-places')
    await expect(page.getByRole('button', { name: /Neuer Stellplatz/ })).toBeVisible()
  })
})
