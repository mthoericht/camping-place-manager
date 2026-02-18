import { test, expect } from '@playwright/test';

test.describe('Login', () =>
{
  test.use({ storageState: { cookies: [], origins: [] } });

  test('zeigt Login-Seite mit Titel und Formular', async ({ page }) =>
  {
    await page.goto('/login');
    await expect(page.locator('#login-page')).toBeVisible();
    await expect(page.locator('#auth-email')).toBeVisible();
    await expect(page.locator('#auth-password')).toBeVisible();
    await expect(page.locator('#auth-login-submit')).toBeVisible();
  });

  test('Login mit falschem Passwort zeigt Fehlermeldung', async ({ page }) =>
  {
    await page.goto('/login');
    await page.locator('#auth-email').fill('e2e@test.de');
    await page.locator('#auth-password').fill('falsches-passwort');
    await page.locator('#auth-login-submit').click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login mit gültigen Testdaten leitet auf Buchungen weiter', async ({ page }) =>
  {
    await page.goto('/login');
    await page.locator('#auth-email').fill('e2e@test.de');
    await page.locator('#auth-password').fill('test1234');
    await page.locator('#auth-login-submit').click();
    await page.waitForURL(/\/bookings/);
    await expect(page.locator('#bookings-page')).toBeVisible();
  });
});

test.describe('Signup-Link', () =>
{
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Registrieren-Link führt zur Signup-Seite', async ({ page }) =>
  {
    await page.goto('/login');
    await page.locator('#auth-signup-link').click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator('#signup-page')).toBeVisible();
    await expect(page.locator('#auth-email')).toBeVisible();
    await expect(page.locator('#auth-fullName')).toBeVisible();
    await expect(page.locator('#auth-password')).toBeVisible();
  });
});

test.describe('Logout (eingeloggt)', () =>
{
  test('Logout leitet auf Login-Seite weiter', async ({ page }) =>
  {
    await page.goto('/bookings');
    await expect(page.locator('#bookings-page')).toBeVisible();

    await page.locator('#topbar-logout').click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Auth Guard', () =>
{
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Geschützte Route leitet unauthentifiziert auf Login', async ({ page }) =>
  {
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/login/);
  });
});
