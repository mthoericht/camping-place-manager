import { test, expect } from '@playwright/test'

test.describe('Buchungen (eingeloggt)', () => 
{
  test('Buchungen-Seite zeigt Überschrift und Inhalt', async ({ page }) => 
  {
    await page.goto('/bookings')
    await expect(page.getByRole('heading', { name: 'Buchungen' })).toBeVisible()
    await expect(page.getByText('Verwalten Sie alle Campingplatz-Buchungen')).toBeVisible()
  })

  test('Neue Buchung-Button ist sichtbar', async ({ page }) => 
  {
    await page.goto('/bookings')
    await expect(page.getByRole('button', { name: /Neue Buchung/ })).toBeVisible()
  })
})
