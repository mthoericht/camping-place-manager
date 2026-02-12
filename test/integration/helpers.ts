import { vi } from 'vitest'

/**
 * Clears the test database via POST /api/test/clear-db. Call in beforeEach so each
 * integration test starts from an empty DB. Requires the integration fetch adapter
 * to be installed (vitest.setup.integration.ts).
 */
export async function clearDb(): Promise<void>
{
  const res = await fetch('/api/test/clear-db', { method: 'POST' })
  if (!res.ok) throw new Error(`clear-db failed: ${res.status}`)
}

/**
 * Logs in the default test user (test@test.de / test1234) via POST /api/test/login,
 * stubs global localStorage so the API client attaches the returned JWT to requests,
 * and returns the token. Call after clearDb() in beforeEach for tests that need auth.
 */
export async function loginTestUser(): Promise<string>
{
  const res = await fetch('/api/test/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.de', password: 'test1234' }),
  });

  if (!res.ok) throw new Error(`test login failed: ${res.status}`);

  const { token } = (await res.json()) as { token: string };

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key === 'auth_token' ? token : null),
    setItem: () => {},
    removeItem: () => {},
  });

  return token;
}
