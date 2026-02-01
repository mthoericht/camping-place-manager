# AGENTS.md

Camping place management tool: Next.js 15, React 18, TypeScript, Prisma, MongoDB.

## Commands

```bash
npm run dev          # Dev server
npm run build        # Build (includes typecheck)
npm test             # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run db:push      # Push schema to DB
npm run db:start     # Start MongoDB (Node script: scripts/db-start.mjs)
npm run db:stop      # Stop MongoDB (scripts/db-stop.mjs)
npm run db:restart   # Restart MongoDB (scripts/db-restart.mjs)
npm run db:status    # MongoDB/Next.js status + logs (scripts/db-status.mjs)
```

## Architecture

| Layer | Location | Usage |
|-------|----------|-------|
| **Services** | `src/lib/server/services/` | Server-only (API Routes, Server Components) |
| **API Layer** | `src/lib/client/api/` | Client-only (HTTP requests via `createCrudApi`) |
| **Stores** | `src/stores/` | State only (via `createCachedListStore`) |
| **Hooks** | `src/hooks/` | Mutations, form logic, React orchestration |
| **Shared** | `src/lib/shared/` | Types, utilities (both Server & Client) |

**Never** import from `src/lib/server/` in `'use client'` components. All server files use `import 'server-only'` guard.

## Store vs Hook Pattern

- **Stores** (`src/stores/`): Only cached state + selectors (`items`, `loading`, `error`, `fetch`, `getById`, `getActive`)
- **Mutation Hooks** (`src/hooks/use*Mutations.ts`): CRUD operations that call API + invalidate caches
- **Form Hooks** (`src/hooks/useBookingForm.ts`): Complex form logic extraction

```typescript
// Store: state only
const { items, loading, fetch, getById } = useCampingItemsStore();

// Mutations: in separate hook
const { createCampingItem, updateCampingItem } = useCampingItemMutations();

// Form actions: submit/delete flow
const { isSubmitting, run } = useCrudFormActions({ redirectTo: '/items' });
```

## Factory Patterns

```typescript
// API: src/lib/client/api/createCrudApi.ts
export const campingItemsApi = createCrudApi<CampingItem, CampingItemFormData>('/api/camping-items');

// Stores: src/stores/createCachedListStore.ts
export const useCampingItemsStore = createCachedListStore<CampingItem>({
  fetchAll: () => campingItemsApi.getAll(),
  cacheDurationMs: 5 * 60 * 1000,
});
```

## MongoDB ID Handling

```typescript
MongoDbHelper.toObjectId(id)        // String → ObjectId (queries)
MongoDbHelper.extractObjectId(_id)  // ObjectId → String (responses)
MongoDbHelper.extractBookingId(item)
MongoDbHelper.extractCampingPlaceId(booking)
```

## Business Rules

- **Delete CampingPlace / CampingItem**: Blocked if any booking with status `PENDING`, `CONFIRMED`, or `PAID` references the place or item. Implemented in `CampingPlaceService.deleteCampingPlace` and `CampingItemService.deleteCampingItem`.
- **Booking Status**: `PENDING` → `CONFIRMED` → `PAID` → `COMPLETED` (or `→ CANCELLED` at any point). Status is editable via dropdown on booking detail page.

## Code Style

- Allman-style braces (opening brace on new line)
- Path alias: `@/*` → `./src/*`
- Types centralized in `src/lib/shared/types/index.ts`

## Key Files

- `prisma/schema.prisma` - DB schema
- `scripts/db-*.mjs` - MongoDB start/stop/restart/status (Node.js, cross-platform)
- `src/lib/shared/types/index.ts` - Type definitions
- `src/lib/client/api/createCrudApi.ts` - Generic CRUD API factory
- `src/stores/createCachedListStore.ts` - Generic store factory
- `src/stores/cacheInvalidation.ts` - Cross-store cache invalidation
- `src/lib/server/MongoDbHelper.ts` - ID/Date conversion (server-only)
- `src/components/BookingStatusSelect.tsx` - Client-side status dropdown
- `ARCHITECTURE.md` - Detailed docs

## Testing Structure

- **Unit tests**: Co-located in `__tests__/` folders next to source files
  - `src/lib/shared/__tests__/` - Shared utility tests
  - `src/lib/server/__tests__/` - Server utility tests
  - `src/lib/server/services/__tests__/` - Service tests
  - `src/lib/client/api/__tests__/` - API layer tests (http, createCrudApi)
  - `src/stores/__tests__/` - Store tests (factories, fetch/cache)
  - `src/hooks/__tests__/` - Hook tests (mutations)
- **E2E tests**: `e2e/` folder at project root
- All test data must use `TEST_` prefix
