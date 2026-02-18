# AGENTS.md — Camping Place Manager

## Project Overview

Camping place management application with a React frontend (Vite) and Express backend (Prisma + SQLite).

## Common Commands

### Development

```bash
npm run dev              # Start frontend + backend in parallel
npm run dev:client       # Vite frontend only (port 5173)
npm run dev:server       # Express backend only (port 3001)
```

### Build & Check

```bash
npx tsc -p tsconfig.app.json --noEmit   # Frontend TypeScript check
npx vite build                           # Frontend production build
npm run build                            # Client + server build
npm run lint                             # ESLint
```

### Database

```bash
npm run prisma:generate  # Generate Prisma client (after schema changes)
npm run prisma:push      # Sync schema to SQLite
npm run prisma:studio    # Prisma Studio (data browser)
```

### Tests

```bash
npm test                 # Vitest (all projects: unit, integration, Storybook)
npm run test:unit        # Unit tests only (test/unit/)
npm run test:integration # API integration tests (test/integration/, frontend API + test DB)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Coverage report (Vitest)
npm run test:e2e         # Playwright (E2E tests)
```

- **Unit tests**: `test/unit/**/*.test.{ts,tsx}` (excluding `test/unit/server/`) — Vitest, jsdom, setup: `vitest.setup.unit.ts` (includes `@testing-library/jest-dom`). The API (`client.ts`) is only covered via integration tests. Covers: all entity slices (bookings incl. cross-slice sync, campingPlaces, campingItems, auth), hooks (`useCrud`, `useConfirmDelete`, `useSyncEditFormFromStore`, `useWebSocketSync`, `useFilteredBookings`), shared logic (`bookingPrice`, `dateUtils`, `validateBookingFormSize`).
- **Server unit tests**: `test/unit/server/**/*.test.ts` — Vitest, node. Controllers are tested with mocked service and `ws/broadcast`; assertions ensure `broadcast({ type, payload })` is called after create/update/delete (and booking changeStatus). Middleware tests cover `requireAuth` (401 cases, valid token, expired token) and `errorHandler` (HttpError, generic Error, empty message). Run with all projects (`npm test`) or via the `server-unit` project.
- **Integration tests**: `test/integration/**/*.integration.test.ts` — Vitest, node. Use only the **frontend API modules**; test files must **not** import from the server. Lifecycle (DB clear, test user login) is done via **test API endpoints** (`POST /api/test/clear-db`, `POST /api/test/login`) called from `test/integration/helpers.ts` (`clearDb()`, `loginTestUser()`). The Supertest fetch adapter is installed once in `vitest.setup.integration.ts` (calls `installIntegrationFetch()` from `server/src/test/integrationEnv.ts`). Setup: `vitest.setup.integration.ts`.
- **Test DB**: Integration tests use **only** `data/test.db`. `DATABASE_URL` is set to `file:…/data/test.db` in the integration setup **before** any server code/Prisma is loaded; `.env` is not loaded during tests. The existing database (e.g. `data/dev.db`) is **never modified**.
- **DB cleanup**: Before each test, the test DB is cleared via `POST /api/test/clear-db` (test routes are only mounted when `DATABASE_URL` contains `test.db`).
- **E2E tests**: `test/e2e/**/*.spec.ts` and `test/e2e/0-auth.setup.ts` — Playwright (single project so UI shows all tests). Use **only** `data/test.db`: `test/e2e/globalSetup.ts` sets `DATABASE_URL`, runs `prisma db push`, and seeds one user (`e2e@test.de` / `test1234`) via `server/src/test/seedE2e.ts`. The Playwright `webServer` is started with `DATABASE_URL` pointing to the test DB. Auth state is saved in `test/e2e/.auth/user.json` by the `0-auth.setup.ts` test (runs first in the single project).
- **Test output in .gitignore**: `test-results`, `playwright-report`, `blob-report`, `coverage`, `test/e2e/.auth` are not versioned.

### Storybook

```bash
npm run storybook        # Start Storybook (UI/component docs and isolation)
```

Stories live in `test/storybook/`, mirroring app structure: `components/ui/`, `components/layout/`, `features/<domain>/components/`. They import components via `@/` and `@shared`.

## Architecture Conventions

### Frontend (`src/`)

- **Framework**: React 19 + Vite (no Next.js)
- **State Management**: Redux Toolkit (`src/store/`)
  - One slice per entity using `createEntityAdapter` + `createAsyncThunk`
  - Typed hooks: `useAppDispatch`, `useAppSelector` from `@/store/store`
- **Routing**: React Router v7 (`react-router-dom`). Routes in `src/app/routes.tsx`, app shell in `src/app/App.tsx`. Default route is `/bookings` (no dashboard). Navigation in Topbar: Bookings, Stellplätze, Ausrüstung, Analytics.
- **UI Components**: shadcn/ui (Radix-based) in `src/components/ui/`
- **Styling**: Tailwind CSS v4, theme in `src/styles/theme.css`
- **Icons**: Lucide React
- **Path Aliases**: `@/` → `./src/`, `@shared` → `./shared` (Vite + `tsconfig.app.json`). `tsconfig.app.json` includes `src` and `test` so that files in `test/unit/`, `test/integration/`, and `test/storybook/` resolve these aliases. Shared code (e.g. price calculation) lives in `shared/` and is used by backend and frontend.
- **Types**: Centralized in `src/api/types.ts` — IDs are `number` (SQLite autoincrement)
- **API Client**: `src/api/client.ts` — Fetch wrapper, API proxy via Vite (`/api` → port 3001)
- **Authentication**: JWT token stored in `localStorage` (`auth_token`), automatically attached to all API requests by `client.ts`. Auth state managed in `src/store/authSlice.ts` (employee, token, login/signup/fetchMe thunks, logout). `AuthGuard` component wraps protected routes and redirects to `/login` if unauthenticated. Login/Signup pages are standalone (no AppLayout).
- **Real-time (WebSocket)**: `useWebSocketSync` (in `src/hooks/useWebSocketSync.ts`) connects to `/ws?token=...` (JWT from auth state), receives server events (`bookings/created`, `bookings/updated`, `bookings/deleted`, and same for `campingPlaces`, `campingItems`), and dispatches slice actions (`receiveBookingFromWebSocket`, `receiveBookingDeletedFromWebSocket`, etc.) so lists and entities stay in sync across tabs and users. Reconnects on token change. Used once in `App.tsx`. Vite dev proxy: `/ws` → backend port 3001.

- **Logic: Store vs composables (hooks)**
  - **Store**: Server state (entities, list status, errors), API cache (e.g. `statusChanges` by id). Keep reducers thin (assign payloads); no business rules in the store beyond “what the server returned”. Use `createSelector` for memoized derived data (e.g. `selectActiveCampingPlaces`, `selectActiveCampingItems`, `selectActiveBookings`, `selectBookingsByStatus`) to avoid unnecessary re-renders. Entity slices synced via WebSocket export `receiveUpserted`/`receiveDeleted` (as `receive*FromWebSocket` / `receive*DeletedFromWebSocket`) for the hook to dispatch. `bookingsSlice` also listens for campingPlace/campingItem updates (WS + thunk fulfilled) and patches embedded entity references to keep denormalized data consistent.
  - **Composables (hooks)**: Form state, dialog open/close, submit flow (dispatch + toast + close), and any derivation from form + store (e.g. `useBookingFormDerived`, `useBookingFormItems`). Entity-specific CRUD config (emptyForm, toForm, getPayload, validate) lives in a feature hook (e.g. `useBookingCrud`, `useCampingPlaceCrud`, `useCampingItemCrud`) so pages stay thin and only orchestrate hooks and UI.

### Backend (`server/src/`)

- **Framework**: Express.js. **Entry**: `index.ts` creates the HTTP server from the Express app and attaches a **WebSocket server** (package `ws`) on path `/ws`; see `server/src/ws/broadcast.ts` for client set and `broadcast(data)`.
- **Layers**: Routes → Controllers → Services → Prisma. After successful create/update/delete (and booking status change), controllers call `broadcast({ type: 'bookings/created' | 'bookings/updated' | 'bookings/deleted', payload })` (and same for `campingPlaces`, `campingItems`) so all connected WebSocket clients receive the event.
- **Database**: SQLite via Prisma, DB file at `data/dev.db`
- **Prisma Client**: Singleton in `server/src/prisma/client.ts`
- **Error Handling**: `HttpError` class in `server/src/middleware/error.middleware.ts`. In production (`NODE_ENV=production`), non-HttpError 500s return a generic `'Interner Serverfehler.'` message (actual error is logged server-side); in development, the original error message is returned for debugging.
- **Input Validation**: `server/src/middleware/validate.ts` exports a `validate(body, rules)` helper that checks `required`, `type`, `min`, `max`, and `oneOf` constraints, throwing `HttpError(400)` with German messages. Used in all create controllers and auth endpoints.
- **Authentication**: JWT-based auth via `server/src/middleware/auth.middleware.ts` (`requireAuth` middleware). Auth service in `server/src/services/auth.service.ts` (bcrypt password hashing, JWT token generation/verification). All API routes except `/api/auth/login` and `/api/auth/signup` require a valid `Authorization: Bearer <token>` header. WebSocket connections require a valid JWT token via query parameter (`/ws?token=...`); invalid or missing tokens are rejected with close code `4001`.
- **Imports**: No `.js` extensions in imports (tsx is used for dev)
- **Shared logic**: Use `shared/` at project root (e.g. `shared/bookingPrice.ts`) for code shared with frontend; import via relative path (e.g. `../../../shared/bookingPrice`). Server build includes `shared/`; production entry is `node server/dist/server/src/index.js`.

### File Organization

- **Shared code** (`shared/` at project root): Logic used by both frontend and backend (e.g. `bookingPrice.ts`). Backend imports via relative path; frontend via Vite/tsconfig alias `@shared` → `./shared`.
- **Feature modules** (`src/features/<domain>/`): Page(s) and detail pages in the feature root; UI subcomponents (list cards `*Card.tsx`, form content `*FormContent.tsx`, charts, etc.) in a `components/` subfolder. Hooks and `constants.ts` stay in the root. Pages orchestrate hooks and UI. `src/features/auth/` contains `LoginPage`, `SignupPage`, and `AuthGuard` (standalone pages without AppLayout).
- **App-level components** (`src/components/`): Shared across the app. Use `layout/` for layout (e.g. `AppLayout`, `Topbar`, `PageHeader`, `EmptyState`) and `ui/` for reusable UI (shadcn/ui, Figma-aligned). See `src/components/ui/README.md`.
- **Feature-level components** (`src/features/<domain>/components/`): UI used only in that feature (e.g. `BookingCard`, `CampingPlaceFormContent`, `CampingItemFormContent`, analytics charts). Form dialogs: Pages use `FormDialog` (from `@/components/ui/dialog`) with `*FormContent` as children; the trigger button is rendered by the page. Form content components receive an entity id prop for edit vs create mode (`bookingId`, `campingPlaceId`, `campingItemId`; `null` = create). Do not put feature-specific components in `src/components/`.
- **Hooks** in `src/hooks/`: `use-mobile`, `useConfirmDelete`, `useCrud` (CRUD dialog + form + submit for CRUD pages), `useFetchWhenIdle`, `useOpenEditFromLocationState` (open edit from `location.state`, e.g. from detail page), `useSyncEditFormFromStore` (sync edit form with store on WS updates/deletes), `useWebSocketSync` (WebSocket connection, dispatch receive*FromWebSocket on server events)
- **Feature-level hooks** in `src/features/<domain>/`: CRUD config hooks (`useBookingCrud`, `useCampingPlaceCrud`, `useCampingItemCrud`) and form helpers when needed (e.g. `useBookingFormDerived`, `useBookingFormItems`)
- **Frontend lib** in `src/lib/`: `utils.ts` (e.g. `mergeClasses()`), `dateUtils.ts` (e.g. `toDateInputValue` for date inputs)

## Code Style

- TypeScript strict mode
- Functional React components
- German UI text (labels, buttons, error messages)
- No code comments unless explicitly requested
- `sonner` for toast notifications
- Forms use local `useState`, results are dispatched via Redux thunks

## Key Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Database schema (SQLite) |
| `shared/bookingPrice.ts` | Shared booking total price calculation (frontend + backend) |
| `src/api/types.ts` | All TypeScript interfaces |
| `src/api/client.ts` | Fetch wrapper (api, ApiError), used by all API modules; attaches JWT token |
| `src/api/auth.ts` | Auth API module (login, signup, getMe) |
| `test/integration/*.integration.test.ts` | API integration tests per domain (auth, campingPlaces, campingItems, bookings, analytics); use `./helpers` (clearDb, loginTestUser), no server imports |
| `test/integration/helpers.ts` | clearDb() and loginTestUser() via POST /api/test/clear-db and /api/test/login |
| `server/src/test/clearTestDb.ts` | Clears test DB (Employee, CampingItem, CampingPlace, Booking, etc.); used by test routes and integrationEnv |
| `server/src/test/integrationEnv.ts` | Backend: installIntegrationFetch() (Supertest adapter as global fetch); used by vitest.setup.integration.ts only |
| `server/src/routes/test.routes.ts` | Test-only routes (clear-db, login) when DATABASE_URL contains test.db |
| `server/src/services/auth.service.ts` | Auth service (signup, login, getMe, verifyToken; bcrypt + JWT) |
| `server/src/middleware/auth.middleware.ts` | JWT auth middleware (requireAuth, AuthRequest) |
| `src/store/store.ts` | Redux store configuration |
| `src/store/authSlice.ts` | Auth state (employee, token, login/signup/fetchMe thunks, logout) |
| `src/hooks/useWebSocketSync.ts` | WebSocket connection to `/ws`; dispatches receive*FromWebSocket / receive*DeletedFromWebSocket on server events; used in App.tsx |
| `src/hooks/useSyncEditFormFromStore.ts` | Sync edit form with store; close on delete, update form on entity change |
| `src/app/App.tsx` | App shell (BrowserRouter, Toaster, useWebSocketSync) |
| `src/app/routes.tsx` | Route definitions (public: /login, /signup; protected: all others, default: /bookings) |
| `src/features/auth/LoginPage.tsx` | Employee login page (Card-based form) |
| `src/features/auth/SignupPage.tsx` | Employee signup page (Card-based form) |
| `src/features/auth/AuthGuard.tsx` | Route guard (token check, fetchMe, redirect to /login) |
| `src/components/layout/Topbar.tsx` | Top bar, navigation, dark mode toggle, logout button |
| `src/components/layout/PageHeader.tsx` | Page title + description + optional actions |
| `src/components/layout/EmptyState.tsx` | Empty list state (icon + message) |
| `src/features/bookings/useBookingCrud.ts` | Booking CRUD hook (calcTotalPrice, bookingToForm, validate); uses `@shared/bookingPrice` |
| `src/features/bookings/useFilteredBookings.ts` | Filter state and memoized list by booking status ('' = all); used on BookingsPage |
| `src/lib/dateUtils.ts` | Date helpers (e.g. toDateInputValue for inputs) |
| `server/src/app.ts` | Express app setup |
| `server/src/index.ts` | HTTP server + WebSocket server on path /ws (ws package) |
| `server/src/middleware/validate.ts` | Input validation helper: `validate(body, rules)` — checks required, type, min, max, oneOf; throws HttpError(400) |
| `server/src/ws/broadcast.ts` | WebSocket client set; addClient/removeClient/broadcast(data); controllers call broadcast after CRUD |
| `server/src/routes/index.ts` | API route registry (auth routes public, all others behind requireAuth) |
| `vitest.setup.unit.ts` | Unit test setup (jsdom, jest-dom) |
| `vitest.setup.integration.ts` | Integration setup (DATABASE_URL=test.db, prisma db push, installIntegrationFetch) |
| `test/unit/bookingPrice.test.ts` | Unit tests for calcBookingTotalPrice |
| `test/unit/dateUtils.test.ts` | Unit tests for toDateInputValue |
| `test/unit/bookingsSlice.test.ts` | Unit tests for bookings reducer (incl. cross-slice embedded entity sync) |
| `test/unit/authSlice.test.ts` | Unit tests for auth reducer |
| `test/unit/useWebSocketSync.test.ts` | Unit tests for handleWebSocketMessage (WebSocket message → dispatch) |
| `test/unit/useCrud.test.ts` | Unit tests for CRUD hook (dialog state, submit, validation, errors) |
| `test/unit/useConfirmDelete.test.ts` | Unit tests for confirm-delete hook (confirm, dispatch, toasts) |
| `test/unit/useSyncEditFormFromStore.test.ts` | Unit tests for store-to-form sync (delete→close, update→setForm) |
| `test/unit/useFilteredBookings.test.ts` | Unit tests for status filter hook (all vs. by status) |
| `test/unit/campingPlacesSlice.test.ts` | Unit tests for campingPlaces reducer (CRUD + WS) |
| `test/unit/campingItemsSlice.test.ts` | Unit tests for campingItems reducer (CRUD + WS) |
| `test/unit/server/*.broadcast.test.ts` | Server unit: controller calls broadcast after CRUD |
| `test/unit/server/auth.middleware.test.ts` | Server unit: requireAuth middleware (401, valid token, expired) |
| `test/unit/server/error.middleware.test.ts` | Server unit: errorHandler (HttpError, generic Error) |
| `.env` | `DATABASE_URL`, `PORT`, and `JWT_SECRET` |

## Delete Protection Rule

Camping places and camping items cannot be deleted when active bookings (PENDING, CONFIRMED, PAID) exist. This validation is in the respective services.

## Authentication

- **Backend**: JWT-based authentication. `server/src/services/auth.service.ts` handles signup (bcrypt hash), login (bcrypt compare + JWT sign), and token verification. `server/src/middleware/auth.middleware.ts` exports `requireAuth` middleware that validates the `Authorization: Bearer <token>` header. All routes except `/api/auth/login` and `/api/auth/signup` are protected.
- **Frontend**: `src/store/authSlice.ts` manages auth state (employee, token). On app load, `AuthGuard` checks for a stored token in `localStorage` and validates it via `GET /api/auth/me`. Login/Signup pages (`src/features/auth/`) are standalone (no AppLayout/Topbar). The API client (`src/api/client.ts`) automatically attaches the JWT token to all requests.
- **Environment**: `JWT_SECRET` env var (defaults to a dev fallback). Set a secure value in production.

## Adding a New Entity (Checklist)

1. `prisma/schema.prisma` — Add model → `npm run prisma:push`
2. `src/api/types.ts` — Interface + FormData type
3. `server/src/services/` — Service with CRUD operations (use `shared/` for shared logic if needed)
4. `server/src/controllers/` — Controller
5. `server/src/routes/` — Route file, register in `routes/index.ts`
6. `src/store/` — Slice with EntityAdapter + Thunks, register in `store.ts`. If the entity is embedded in other entities (like CampingPlace in Booking), add cross-slice extraReducers to keep denormalized data in sync.
7. `src/api/<entity>.ts` — API module (used by slice thunks)
8. `src/features/<domain>/` — Feature page; add `*Card.tsx`, `*FormContent.tsx`, optional `constants.ts`/`utils.ts`, and a feature CRUD hook (e.g. `useCampingPlaceCrud`, `useCampingItemCrud`) so the page only orchestrates hooks. Use `FormDialog` + `*FormContent` in the page, `useCrud` or the feature hook, `useConfirmDelete`, `useFetchWhenIdle` (and `useOpenEditFromLocationState` if edit-from-detail is required).
9. `src/app/routes.tsx` — Add route
10. `src/components/layout/Topbar.tsx` — Add navigation entry
11. **Real-time (optional)**: In the entity’s controller, after create/update/delete, call `broadcast({ type: '<entity>/created'|'updated'|'deleted', payload })`. In the slice, add reducers `receiveUpserted` and `receiveDeleted`, export as `receive*FromWebSocket` and `receive*DeletedFromWebSocket`. In `src/hooks/useWebSocketSync.ts`, handle the new event types and dispatch those actions.
