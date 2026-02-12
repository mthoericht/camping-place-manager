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
npm test                 # Vitest (alle Projekte: Unit, Integration, Storybook)
npm run test:unit        # Nur Unit-Tests (shared, src/lib, src/store)
npm run test:integration # API-Integrationstests (Frontend-API + Test-DB)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Coverage-Report (Vitest)
npm run test:e2e         # Playwright (E2E tests)
```

- **Unit-Tests**: `src/**/*.test.{ts,tsx}`, `shared/**/*.test.ts` — Vitest, jsdom, Setup: `vitest.setup.unit.ts` (u. a. `@testing-library/jest-dom`). Die API (client.ts) wird nur über die Integrationstests abgedeckt.
- **Integrationstests**: `src/api/**/*.integration.test.ts` — Vitest, node. Nutzen nur die **Frontend-API-Module** und eine Backend-Setup-Funktion; keine direkten Imports von Express/Prisma in der Testdatei. Das Backend stellt `server/src/test/integrationEnv.ts` bereit: `setupIntegrationTest()` (legt Supertest-Adapter als `fetch` ein) und `clearTestDb()` (leert die Test-DB). Die Testdatei ruft `setupIntegrationTest()` in `beforeAll` und `clearDb()` in `beforeEach` auf. Setup: `vitest.setup.integration.ts`.
- **Test-DB**: Integrationstests nutzen **nur** `data/test.db`. `DATABASE_URL` wird im Integration-Setup auf `file:…/data/test.db` gesetzt, **bevor** Server-Code/Prisma geladen wird; `.env` wird beim Testlauf nicht geladen. Die bestehende Datenbank (z. B. `data/dev.db`) wird **nicht verändert**.
- **DB-Aufräumen**: Vor jedem Test wird die Test-DB über die vom Backend bereitgestellte Funktion `clearTestDb()` geleert (BookingItem, BookingStatusChange, Booking, CampingPlace, CampingItem).
- **Test-Ausgabe in .gitignore**: `test-results`, `playwright-report`, `blob-report`, `coverage` werden nicht versioniert.

### Storybook

```bash
npm run storybook        # Start Storybook (UI/component docs and isolation)
```

Stories live next to components: `*.stories.tsx` in `src/components/ui/`, `src/components/layout/`, and `src/features/<domain>/components/`.

## Architecture Conventions

### Frontend (`src/`)

- **Framework**: React 19 + Vite (no Next.js)
- **State Management**: Redux Toolkit (`src/store/`)
  - One slice per entity using `createEntityAdapter` + `createAsyncThunk`
  - Typed hooks: `useAppDispatch`, `useAppSelector` from `@/store/hooks`
- **Routing**: React Router v7 (`react-router-dom`). Routes in `src/app/routes.tsx`, app shell in `src/app/App.tsx`. Default route is `/bookings` (no dashboard). Navigation in Topbar: Bookings, Stellplätze, Ausrüstung, Analytics.
- **UI Components**: shadcn/ui (Radix-based) in `src/components/ui/`
- **Styling**: Tailwind CSS v4, theme in `src/styles/theme.css`
- **Icons**: Lucide React
- **Path Aliases**: `@/` → `./src/`, `@shared` → `./shared` (Vite + `tsconfig.app.json`). Shared code (e.g. price calculation) lives in `shared/` and is used by backend and frontend.
- **Types**: Centralized in `src/api/types.ts` — IDs are `number` (SQLite autoincrement)
- **API Client**: `src/api/client.ts` — Fetch wrapper, API proxy via Vite (`/api` → port 3001)

- **Logic: Store vs composables (hooks)**
  - **Store**: Server state (entities, list status, errors), API cache (e.g. `statusChanges` by id). Keep reducers thin (assign payloads); no business rules in the store beyond “what the server returned”. Optional: memoized selectors (e.g. `selectActivePlaces`) if the same derived list is used in many places.
  - **Composables (hooks)**: Form state, dialog open/close, submit flow (dispatch + toast + close), and any derivation from form + store (e.g. `useBookingFormDerived`, `useBookingFormItems`). Entity-specific CRUD config (emptyForm, toForm, getPayload, validate) lives in a feature hook (e.g. `useBookingCrud`, `useCampingPlaceCrud`, `useCampingItemCrud`) so pages stay thin and only orchestrate hooks and UI.

### Backend (`server/src/`)

- **Framework**: Express.js
- **Layers**: Routes → Controllers → Services → Prisma
- **Database**: SQLite via Prisma, DB file at `data/dev.db`
- **Prisma Client**: Singleton in `server/src/prisma/client.ts`
- **Error Handling**: `HttpError` class in `server/src/middleware/error.middleware.ts`
- **Imports**: No `.js` extensions in imports (tsx is used for dev)
- **Shared logic**: Use `shared/` at project root (e.g. `shared/bookingPrice.ts`) for code shared with frontend; import via relative path (e.g. `../../../shared/bookingPrice`). Server build includes `shared/`; production entry is `node server/dist/server/src/index.js`.

### File Organization

- **Shared code** (`shared/` at project root): Logic used by both frontend and backend (e.g. `bookingPrice.ts`). Backend imports via relative path; frontend via Vite/tsconfig alias `@shared` → `./shared`.
- **Feature modules** (`src/features/<domain>/`): Page(s) and detail pages in the feature root; UI subcomponents (list cards `*Card.tsx`, form content `*FormContent.tsx`, charts, etc.) in a `components/` subfolder. Hooks and `constants.ts` stay in the root. Pages orchestrate hooks and UI.
- **App-level components** (`src/components/`): Shared across the app. Use `layout/` for layout (e.g. `AppLayout`, `Topbar`, `PageHeader`, `EmptyState`) and `ui/` for reusable UI (shadcn/ui, Figma-aligned). See `src/components/ui/README.md`.
- **Feature-level components** (`src/features/<domain>/components/`): UI used only in that feature (e.g. `BookingCard`, `CampingPlaceFormContent`, `CampingItemFormContent`, analytics charts). Form dialogs: Pages use `FormDialog` (from `@/components/ui/dialog`) with `*FormContent` as children; the trigger button is rendered by the page. Form content components receive an entity id prop for edit vs create mode (`bookingId`, `campingPlaceId`, `campingItemId`; `null` = create). Do not put feature-specific components in `src/components/`.
- **Hooks** in `src/hooks/`: `use-mobile`, `useConfirmDelete`, `useFetchWhenIdle`, `useFormDialog`, `useCrud` (CRUD dialog + form + submit for CRUD pages), `useOpenEditFromLocationState` (open edit from `location.state`, e.g. from detail page)
- **Feature-level hooks** in `src/features/<domain>/`: CRUD config hooks (`useBookingCrud`, `useCampingPlaceCrud`, `useCampingItemCrud`) and form helpers when needed (e.g. `useBookingFormDerived`, `useBookingFormItems`)
- **Frontend lib** in `src/lib/`: `utils.ts` (e.g. `cn()`), `dateUtils.ts` (e.g. `toDateInputValue` for date inputs)

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
| `src/api/client.ts` | Fetch wrapper (api, ApiError), von allen API-Modulen genutzt |
| `src/api/*.integration.test.ts` | API-Integrationstests pro Bereich (campingPlaces, campingItems, bookings, analytics) |
| `server/src/test/integrationEnv.ts` | Backend: Setup für API-Integrationstests (Express, Prisma, Supertest-Adapter, clearTestDb) |
| `src/store/store.ts` | Redux store configuration |
| `src/app/App.tsx` | App shell (BrowserRouter, Toaster) |
| `src/app/routes.tsx` | Route definitions (default: `/bookings`) |
| `src/components/layout/Topbar.tsx` | Top bar and navigation (Bookings first, no dashboard) |
| `src/components/layout/PageHeader.tsx` | Page title + description + optional actions |
| `src/components/layout/EmptyState.tsx` | Empty list state (icon + message) |
| `src/features/bookings/useBookingCrud.ts` | Booking CRUD hook (calcTotalPrice, bookingToForm, validate); uses `@shared/bookingPrice` |
| `src/lib/dateUtils.ts` | Date helpers (e.g. toDateInputValue for inputs) |
| `server/src/app.ts` | Express app setup |
| `server/src/routes/index.ts` | API route registry |
| `vitest.setup.unit.ts` | Unit-Test-Setup (jsdom, jest-dom) |
| `vitest.setup.integration.ts` | Integration-Setup (DATABASE_URL=test.db, prisma db push) |
| `shared/bookingPrice.test.ts` | Unit-Tests für calcBookingTotalPrice |
| `src/lib/dateUtils.test.ts` | Unit-Tests für toDateInputValue |
| `src/store/bookingsSlice.test.ts` | Unit-Tests für bookings-Reducer |
| `.env` | `DATABASE_URL` and `PORT` |

## Delete Protection Rule

Camping places and camping items cannot be deleted when active bookings (PENDING, CONFIRMED, PAID) exist. This validation is in the respective services.

## Adding a New Entity (Checklist)

1. `prisma/schema.prisma` — Add model → `npm run prisma:push`
2. `src/api/types.ts` — Interface + FormData type
3. `server/src/services/` — Service with CRUD operations (use `shared/` for shared logic if needed)
4. `server/src/controllers/` — Controller
5. `server/src/routes/` — Route file, register in `routes/index.ts`
6. `src/store/` — Slice with EntityAdapter + Thunks, register in `store.ts`
7. `src/api/<entity>.ts` — API module (used by slice thunks)
8. `src/features/<domain>/` — Feature page; add `*Card.tsx`, `*FormContent.tsx`, optional `constants.ts`/`utils.ts`, and a feature CRUD hook (e.g. `useCampingPlaceCrud`, `useCampingItemCrud`) so the page only orchestrates hooks. Use `FormDialog` + `*FormContent` in the page, `useCrud` or the feature hook, `useConfirmDelete`, `useFetchWhenIdle` (and `useOpenEditFromLocationState` if edit-from-detail is required).
9. `src/app/routes.tsx` — Add route
10. `src/components/layout/Topbar.tsx` — Add navigation entry
