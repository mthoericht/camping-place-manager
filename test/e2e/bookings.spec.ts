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

  test('Buchung erstellen und in Liste sehen', async ({ page }) => 
  {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    await page.request.post('/api/camping-places', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Buchungstest-Platz', location: 'Test', size: 50, price: 20, isActive: true },
    })

    await page.goto('/bookings')
    await page.getByRole('button', { name: /Neue Buchung/ }).click()
    await expect(page.getByRole('heading', { name: 'Neue Buchung erstellen' })).toBeVisible()

    await page.getByLabel('Gast Name').fill('Max Mustermann')
    await page.getByLabel('E-Mail').fill('max@example.com')
    await page.getByLabel('Anzahl Gäste').fill('2')
    await page.getByLabel('Check-in').fill('2026-07-01')
    await page.getByLabel('Check-out').fill('2026-07-05')

    await page.locator('button', { hasText: 'Stellplatz wählen' }).click()
    await page.getByRole('option', { name: /Buchungstest-Platz/ }).click()

    await page.getByRole('button', { name: 'Erstellen' }).click()
    await expect(page.getByText('Max Mustermann')).toBeVisible()
  })
})
