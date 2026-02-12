import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const testDbPath = path.join(process.cwd(), 'data', 'test.db')
const databaseUrl = `file:${testDbPath}`

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: [/0-auth\.setup\.ts/, /\.spec\.ts$/],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'test/e2e/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  },
  globalSetup: './test/e2e/globalSetup.ts',
})
