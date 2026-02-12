import { vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import prisma from '../prisma/client'

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

/**
 * Clears all data in the test database so integration tests start from a
 * clean state. Deletes in dependency order: booking items, status changes,
 * bookings, camping places, camping items.
 */
export async function clearTestDb(): Promise<void>
{
  await prisma.bookingItem.deleteMany()
  await prisma.bookingStatusChange.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.campingPlace.deleteMany()
  await prisma.campingItem.deleteMany()
  await prisma.employee.deleteMany()
}

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
 * Configures the environment for API integration tests: creates the Express app,
 * installs a fetch adapter that forwards to the app via Supertest, creates a
 * test user for JWT auth, and returns helper functions for test lifecycle.
 * Call once in beforeAll.
 * @returns Object with clearDb and loginTestUser for test lifecycle
 */
export async function setupIntegrationTest(): Promise<{ clearDb: () => Promise<void>; loginTestUser: () => Promise<string> }>
{
  const app = createApp()
  vi.stubGlobal('fetch', createFetchAdapter(app))
  await loginTestUser()
  return { clearDb: clearTestDb, loginTestUser }
}
