import { vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { clearTestDb } from './clearTestDb'

/**
 * Returns a fetch-like function that forwards HTTP requests to the Express app
 * via Supertest. Used as a replacement for global `fetch` in API integration
 * tests so no real HTTP server is required.
 * @param app - Express app (createApp())
 * @returns Async function with signature (url, init?) => Promise<{ ok, status, json }>
 */
function createFetchAdapter(app: ReturnType<typeof createApp>)
{
  return async (url: string | URL, init?: RequestInit) =>
  {
    const path = typeof url === 'string' && url.startsWith('http')
      ? new URL(url).pathname
      : String(url)
    const method = (init?.method ?? 'GET').toLowerCase()
    const bodyPayload = bodyFromInit(init?.body, method)

    const agent = getSupertestAgent(app)
    let req = agent[method](path).set('Content-Type', 'application/json')
    if (init?.headers)
    {
      const hdrs = init.headers as Record<string, string>
      for (const [k, v] of Object.entries(hdrs))
      {
        req = (req as { set: (k: string, v: string) => typeof req }).set(k, v)
      }
    }
    if (bodyPayload !== undefined)
      req = (req as { send: (b: unknown) => typeof req }).send(bodyPayload)

    const res = (await req) as { status: number; body: unknown }
    return toFetchLikeResponse(res)
  }
}

/**
 * Derives a request body payload from fetch RequestInit. Returns undefined for
 * GET or when body is missing; otherwise parses JSON string or passes through.
 * @param body - Optional body from RequestInit
 * @param method - HTTP method (lowercase)
 * @returns Parsed or raw body, or undefined for GET / no body
 */
function bodyFromInit(body: RequestInit['body'], method: string): unknown
{
  if (body === undefined || method === 'get') return undefined
  return typeof body === 'string' ? JSON.parse(body) : body
}

/**
 * Builds a fetch-like response object from a Supertest response so that the
 * frontend API client (api()) can handle it like a real fetch response.
 * @param res - Supertest response with status and body
 * @returns Object with ok, status, and json() matching fetch response shape
 */
function toFetchLikeResponse(res: { status: number; body: unknown }): FetchLikeResponse
{
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    json: () => Promise.resolve(res.body as Record<string, unknown>)
  }
}

type SupertestAgent = Record<string, (path: string) => { set: (k: string, v: string) => unknown; send?: (b?: unknown) => unknown }>
type FetchLikeResponse = { ok: boolean; status: number; json: () => Promise<Record<string, unknown>> }

/**
 * Returns a Supertest agent for the given Express app, typed for dynamic
 * method dispatch (get, post, patch, delete). Used by the fetch adapter to
 * forward requests without starting an HTTP server.
 * @param app - Express app (createApp())
 * @returns Supertest agent with method(name) and chainable .set() / .send()
 */
function getSupertestAgent(app: ReturnType<typeof createApp>): SupertestAgent
{
  return request(app) as unknown as SupertestAgent
}

export { clearTestDb } from './clearTestDb'

/**
 * Creates a test user via the auth service and stubs `localStorage` so the
 * frontend API client (`client.ts`) attaches the JWT token to all requests.
 * Call after `clearTestDb()` in `beforeEach` to re-create the user.
 * @returns The JWT token string
 */
export async function loginTestUser(): Promise<string>
{
  const { signup, login } = await import('../services/auth.service')
  let token: string
  try
  {
    ;({ token } = await signup({ email: 'test@test.de', fullName: 'Test User', password: 'test1234' }))
  }
  catch
  {
    ;({ token } = await login({ email: 'test@test.de', password: 'test1234' }))
  }
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => key === 'auth_token' ? token : null,
    setItem: () => {},
    removeItem: () => {},
  })
  return token
}

/**
 * Installs the fetch adapter for integration tests so that all fetch() calls
 * go to the Express app via Supertest. Call from vitest.setup.integration.ts
 * so test files never need to import from server. Test files use the test API
 * (POST /api/test/clear-db, POST /api/test/login) for lifecycle.
 */
export function installIntegrationFetch(): void
{
  const app = createApp()
  vi.stubGlobal('fetch', createFetchAdapter(app))
}
