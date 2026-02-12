import { test as setup } from '@playwright/test'
import { getE2eAuthToken } from './authApi'

const authFile = 'test/e2e/.auth/user.json'
const baseURL = 'http://localhost:5173'

setup('login and save auth state', async ({ page }) =>
{
  setup.setTimeout(60_000)
  await page.goto('/login')

  const token = await getE2eAuthToken(baseURL)

  await page.evaluate((t) => localStorage.setItem('auth_token', t), token)
  await page.goto('/bookings')
  await page.context().storageState({ path: authFile })
})
