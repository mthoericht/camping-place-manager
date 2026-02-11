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
}

/**
 * Configures the environment for API integration tests: creates the Express app,
 * installs a fetch adapter that forwards to the app via Supertest, and returns
 * a clearDb function for use in beforeEach. Call once in beforeAll.
 * @returns Object with clearDb (alias for clearTestDb) for test teardown
 */
export function setupIntegrationTest(): { clearDb: () => Promise<void> }
{
  const app = createApp()
  vi.stubGlobal('fetch', createFetchAdapter(app))
  return { clearDb: clearTestDb }
}
