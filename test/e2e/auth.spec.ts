import { test, expect } from '@playwright/test'

test.describe('Login', () => 
{
  test.use({ storageState: { cookies: [], origins: [] } })

  test('zeigt Login-Seite mit Titel und Formular', async ({ page }) => 
  {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Campingplatz Manager' })).toBeVisible()
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Registrieren' })).toBeVisible()
  })

  test('Login mit falschem Passwort zeigt Fehlermeldung', async ({ page }) => 
  {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill('e2e@test.de')
    await page.getByLabel('Passwort').fill('falsches-passwort')
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('Login mit gültigen Testdaten leitet auf Buchungen weiter', async ({ page }) => 
  {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill('e2e@test.de')
    await page.getByLabel('Passwort').fill('test1234')
    await page.getByRole('button', { name: 'Anmelden' }).click()
    await page.waitForURL(/\/bookings/)
    await expect(page.getByRole('heading', { name: 'Buchungen' })).toBeVisible()
  })
})

test.describe('Signup-Link', () => 
{
  test.use({ storageState: { cookies: [], origins: [] } })

  test('Registrieren-Link führt zur Signup-Seite', async ({ page }) => 
  {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Registrieren' }).click()
    await expect(page).toHaveURL(/\/signup/)
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Vollständiger Name')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
  })
})
