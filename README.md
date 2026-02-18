# Camping Place Manager

A modern camping place management application built with React, TypeScript, Express, SQLite, and Prisma.

## Features

- 🏕️ **Camping Place Management**: Add, edit, and manage camping places
- 🎒 **Camping Items Management**: Manage camping equipment and items inventory
- 📅 **Booking System**: Handle customer bookings and reservations (default view), filter by status, place (incl. inactive), and search by name/email/phone, including status timeline
- 📊 **Analytics**: Revenue, occupancy, and statistics
- 🔄 **Real-time Updates**: WebSocket sync so list and entity data stay in sync across tabs and users (create/update/delete for bookings, camping places, and camping items)
- 🎨 **Modern UI**: Responsive interface with Tailwind CSS and dark mode
- 📱 **Responsive Design**: Top bar navigation on desktop, hamburger menu and slide-out drawer on mobile
- 🗄️ **Database**: SQLite with Prisma ORM
- 🔐 **Authentication**: Employee login/signup with JWT tokens and bcrypt password hashing

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Backend**: Express.js, Node.js
- **Real-time**: WebSocket (`ws`) on path `/ws?token=...` (JWT-authenticated); server broadcasts create/update/delete events; frontend syncs Redux state via `useWebSocketSync`
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken), bcrypt (bcryptjs)
- **Unit Tests**: Vitest (jsdom, `@testing-library/jest-dom`)
- **Integration Tests**: Vitest (frontend API only, no server imports; test API `/api/test/clear-db`, `/api/test/login`; Test-DB `data/test.db`)
- **E2E Tests**: Playwright

## Quick Start

1. **Clone and install:**

   ```bash
   git clone https://github.com/mthoericht/camping-place-manager.git
   cd camping-place-manager
   npm install
   ```

2. **Set up the database:**

   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

3. **Configure environment** (optional):

   Create a `.env` file (or use the existing one). For production, set a secure JWT secret:

   ```
   JWT_SECRET=your-secure-secret-key
   ```

4. **Start the application:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Frontend: [http://localhost:5173](http://localhost:5173) (opens on Bookings by default)
   - API: [http://localhost:3001/api](http://localhost:3001/api)
   - WebSocket: `ws://localhost:5173/ws?token=...` in dev (proxied to backend); JWT-authenticated real-time updates for bookings, camping places, and camping items

## Database

The SQLite database is stored at `data/dev.db`. The `data/` folder is committed empty (only `data/.gitkeep`); `data/*` is in `.gitignore` so the database file and other contents are not versioned. The `DATABASE_URL` in `.env` configures the path (relative to the `prisma/` directory):

```
DATABASE_URL="file:../data/dev.db"
```

### Schema

#### CampingPlace

- `id`: Auto-increment integer
- `name`: Name of the camping place
- `description`: Description (optional)
- `location`: Location/address
- `size`: Size in square meters (m²)
- `price`: Price per night (€)
- `amenities`: Comma-separated amenities
- `isActive`: Whether the place is available for booking
- `createdAt`/`updatedAt`: Timestamps

#### CampingItem

- `id`: Auto-increment integer
- `name`: Name of the item
- `category`: Category (Tent, Van, Trailer, Pavilion, Other)
- `size`: Size in square meters
- `description`: Description (optional)
- `isActive`: Whether the item is available for booking
- `createdAt`/`updatedAt`: Timestamps

#### Booking

- `id`: Auto-increment integer
- `campingPlaceId`: Reference to camping place
- `customerName`, `customerEmail`, `customerPhone`: Customer data
- `startDate`/`endDate`: Booking period
- `guests`: Number of guests
- `totalPrice`: Total price (€)
- `status`: Status (PENDING, CONFIRMED, PAID, CANCELLED, COMPLETED)
- `notes`: Notes (optional)
- `createdAt`/`updatedAt`: Timestamps

#### BookingItem

- `id`: Auto-increment integer
- `bookingId`: Reference to booking
- `campingItemId`: Reference to camping item
- `quantity`: Number of items

#### BookingStatusChange

- `id`: Auto-increment integer
- `bookingId`: Reference to booking
- `status`: Status at time of change
- `changedAt`: Timestamp of the status change (defaults to `now()`, used for timeline on booking detail page)
- `employeeId`: Optional reference to the employee who made the change (from JWT on status change / create)
- `employee`: Optional relation; API returns `{ id, fullName }` for display in the status timeline

#### Employee

- `id`: Auto-increment integer
- `email`: Unique email address
- `fullName`: Full name of the employee
- `password`: Bcrypt-hashed password
- `createdAt`/`updatedAt`: Timestamps
- `bookingStatusChanges`: Relation to status changes made by this employee

### Delete Protection

Camping places and camping items cannot be deleted while **active bookings** (status `PENDING`, `CONFIRMED`, or `PAID`) exist. Cancel or complete those bookings first; then deletion is allowed.

## Available Scripts

### Development

- `npm run dev` — Start frontend (Vite, port 5173) and backend (Express, port 3001) in parallel
- `npm run dev:client` — Start frontend only
- `npm run dev:server` — Start backend only
- `npm run build` — Production build (client + server)
- `npm run start` — Run production server (`node server/dist/server/src/index.js`)
- `npm run preview` — Preview production build
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run clean` — Remove `node_modules`
- `npm run install:clean` — Clean and reinstall dependencies

### Database

- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:push` — Sync schema to database
- `npm run prisma:studio` — Open Prisma Studio (data browser)

### Tests

- `npm test` — All Vitest projects (unit, integration, Storybook)
- `npm run test:unit` — Unit tests only (`test/unit/**/*.test.{ts,tsx}`)
- `npm run test:integration` — API integration tests only (`test/integration/**/*.integration.test.ts`, uses `data/test.db`)
- `npm run test:watch` — Vitest watch mode
- `npm run test:coverage` — Test coverage report
- `npm run test:e2e` — E2E tests (Playwright)
- `npm run test:e2e:ui` — E2E tests with Playwright UI
- `npm run test:e2e:install` — Install Playwright browsers

**Test database:** Integration tests use a separate SQLite file `data/test.db`. The setup (`vitest.setup.integration.ts`) sets `DATABASE_URL` to this file, runs `prisma db push`, and installs the Supertest fetch adapter; test files use `test/integration/helpers.ts` (`clearDb()`, `loginTestUser()`) which call the test API (`POST /api/test/clear-db`, `POST /api/test/login`), so the development database (`data/dev.db`) is **never modified**. **E2E tests (Playwright)** use the same `data/test.db`: `globalSetup` (`test/e2e/globalSetup.ts`) runs `prisma db push` and seeds a test user (`e2e@test.de` / `test1234`); the `webServer` is started with `DATABASE_URL` pointing to the test DB. The auth setup (`test/e2e/0-auth.setup.ts`) runs first in the single Playwright project and saves auth state to `test/e2e/.auth/user.json`. **Before running `npm run test:e2e`, stop `npm run dev`** so the E2E server can start on port 5173. Test output directories (`test-results`, `playwright-report`, `blob-report`, `coverage`, `test/e2e/.auth`) are in `.gitignore`.

### Storybook

- `npm run storybook` — Start Storybook (component docs; stories in `test/storybook/`, mirroring app structure)

## Project Structure

```
├── test/                        # All tests and Storybook stories
│   ├── unit/                    # Unit tests (Vitest, jsdom + server-unit node)
│   │   ├── authSlice.test.ts
│   │   ├── bookingsSlice.test.ts    # Includes cross-slice sync (embedded entity updates)
│   │   ├── bookingPrice.test.ts
│   │   ├── campingItemsSlice.test.ts
│   │   ├── campingPlacesSlice.test.ts
│   │   ├── dateUtils.test.ts
│   │   ├── useConfirmDelete.test.ts
│   │   ├── useCrud.test.ts
│   │   ├── useSyncEditFormFromStore.test.ts
│   │   ├── useWebSocketSync.test.ts
│   │   ├── validateBookingFormSize.test.ts
│   │   └── server/                  # Server unit tests (Vitest, node)
│   │       ├── auth.middleware.test.ts
│   │       ├── error.middleware.test.ts
│   │       ├── bookings.controller.broadcast.test.ts
│   │       ├── campingItems.controller.broadcast.test.ts
│   │       └── campingPlaces.controller.broadcast.test.ts
│   ├── integration/             # API integration tests (Vitest, frontend API + test DB, no server imports)
│   │   ├── helpers.ts           # clearDb(), loginTestUser() via POST /api/test/clear-db, /api/test/login
│   │   ├── auth.integration.test.ts
│   │   ├── bookings.integration.test.ts
│   │   ├── campingPlaces.integration.test.ts
│   │   ├── campingItems.integration.test.ts
│   │   └── analytics.integration.test.ts
│   ├── e2e/                     # E2E tests (Playwright, single project)
│   │   ├── globalSetup.ts       # DATABASE_URL, prisma db push, seedE2e
│   │   ├── 0-auth.setup.ts      # Login and save auth state (runs first)
│   │   ├── authApi.ts           # getE2eAuthToken for setup
│   │   ├── auth.spec.ts
│   │   ├── analytics.spec.ts
│   │   ├── bookings.spec.ts
│   │   ├── camping-items.spec.ts
│   │   └── camping-places.spec.ts
│   └── storybook/               # Storybook stories (mirror src: components/, features/)
│       ├── components/ui/
│       ├── components/layout/
│       └── features/<domain>/components/
├── shared/                      # Code shared by frontend and backend
│   └── bookingPrice.ts          # calcBookingTotalPrice (nights × price)
├── prisma/
│   └── schema.prisma            # Database schema (SQLite)
├── data/
│   ├── .gitkeep                 # Folder tracked empty; DB files gitignored
│   ├── dev.db                   # Development database (created on first run)
│   └── test.db                  # Integration test database (created by test setup)
├── server/
│   └── src/
│       ├── index.ts             # HTTP server + WebSocket server on path /ws
│       ├── app.ts               # Express app setup
│       ├── ws/
│       │   └── broadcast.ts     # WebSocket client set; broadcast(data) to all clients
│       ├── test/
│       │   ├── clearTestDb.ts      # Clear test DB (used by test routes)
│       │   └── integrationEnv.ts   # installIntegrationFetch() for Vitest integration setup
│       ├── prisma/
│       │   └── client.ts        # Prisma client singleton
│       ├── middleware/
│       │   ├── error.middleware.ts
│       │   ├── auth.middleware.ts
│       │   ├── validate.ts
│       ├── routes/
│       │   ├── index.ts         # Route registry (+ test.routes when DATABASE_URL contains test.db)
│       │   ├── test.routes.ts   # Test-only: POST /api/test/clear-db, /api/test/login
│       │   ├── campingPlaces.routes.ts
│       │   ├── campingItems.routes.ts
│       │   ├── bookings.routes.ts
│       │   ├── analytics.routes.ts
│       │   ├── auth.routes.ts
│       ├── controllers/
│       │   ├── campingPlaces.controller.ts
│       │   ├── campingItems.controller.ts
│       │   ├── bookings.controller.ts
│       │   ├── analytics.controller.ts
│       │   ├── auth.controller.ts
│       └── services/
│           ├── campingPlaces.service.ts
│           ├── campingItems.service.ts
│           ├── bookings.service.ts
│           ├── analytics.service.ts
│           ├── auth.service.ts
├── src/
│   ├── main.tsx                 # React entry point
│   ├── app/
│   │   ├── App.tsx              # BrowserRouter, Toaster, AppRoutes
│   │   └── routes.tsx           # Route definitions
│   ├── api/
│   │   ├── client.ts            # Fetch wrapper (ApiError, JSON)
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── bookings.ts          # Booking API calls
│   │   ├── campingPlaces.ts     # Camping places API calls
│   │   ├── campingItems.ts      # Camping items API calls
│   │   ├── analytics.ts         # Analytics API calls
│   │   ├── auth.ts              # Auth API calls (login, signup, me)
│   ├── store/
│   │   ├── store.ts             # Redux store, useAppDispatch, useAppSelector
│   │   ├── bookingsSlice.ts
│   │   ├── campingPlacesSlice.ts
│   │   ├── campingItemsSlice.ts
│   │   ├── analyticsSlice.ts
│   │   ├── authSlice.ts         # Auth state (employee, token, login/signup/logout)
│   │   └── uiSlice.ts           # UI state (theme, sidebar, mobile nav)
│   ├── lib/
│   │   ├── dateUtils.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-mobile.ts        # Mobile breakpoint (responsive)
│   │   ├── useConfirmDelete.ts  # Confirm dialog + delete + toast
│   │   ├── useCrud.ts           # CRUD dialog + submit (openCreate, openEdit, form, handleSubmit)
│   │   ├── useFetchWhenIdle.ts  # Dispatch fetch when slice status is idle
│   │   ├── useOpenEditFromLocationState.ts  # Open edit from location.state (e.g. detail → list)
│   │   ├── useSyncEditFormFromStore.ts  # Sync edit form when entity updated/deleted via WebSocket
│   │   └── useWebSocketSync.ts  # WebSocket connection; dispatches receive*FromWebSocket on server events
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── bookings/
│   │   │   ├── constants.ts
│   │   │   ├── useBookingCrud.ts
│   │   │   ├── useBookingFormDerived.ts
│   │   │   ├── useBookingFormItems.ts
│   │   │   ├── BookingsPage.tsx
│   │   │   ├── BookingDetailPage.tsx
│   │   │   └── components/
│   │   │       ├── BookingCard.tsx
│   │   │       └── BookingFormContent.tsx
│   │   ├── campingPlaces/
│   │   │   ├── useCampingPlaceCrud.ts
│   │   │   ├── CampingPlacesPage.tsx
│   │   │   └── components/
│   │   │       ├── CampingPlaceCard.tsx
│   │   │       └── CampingPlaceFormContent.tsx
│   │   ├── campingItems/
│   │   │   ├── constants.ts
│   │   │   ├── useCampingItemCrud.ts
│   │   │   ├── CampingItemsPage.tsx
│   │   │   └── components/
│   │   │       ├── CampingItemCard.tsx
│   │   │       └── CampingItemFormContent.tsx
│   │   └── analytics/
│   │       ├── AnalyticsPage.tsx
│   │       └── components/
│   │           ├── StatCard.tsx
│   │           ├── RevenueByMonthChart.tsx
│   │           ├── BookingsByStatusChart.tsx
│   │           └── RevenueByPlaceChart.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx    # Layout wrapper
│   │   │   ├── Topbar.tsx       # Top bar, navigation (Bookings first), dark mode
│   │   │   ├── PageHeader.tsx   # Page title + description + optional actions
│   │   │   └── EmptyState.tsx   # Empty list state (icon + message)
│   │   └── ui/                  # shadcn/ui components (Radix-based)
│   └── styles/
│       ├── index.css            # CSS entry point
│       ├── tailwind.css         # Tailwind v4 setup
│       ├── theme.css            # Design tokens (light/dark)
│       └── fonts.css
├── .env                         # Environment variables
├── vitest.setup.unit.ts         # Unit test setup (jsdom, @testing-library/jest-dom)
├── vitest.setup.integration.ts  # Integration setup (DATABASE_URL=test.db, prisma db push, installIntegrationFetch)
├── index.html                   # HTML entry point (favicon: tent icon)
├── public/
│   └── favicon.svg              # Tent icon favicon
├── .storybook/                  # Storybook config (main.ts, preview.ts)
├── package.json
├── vite.config.ts               # Vite config + API proxy + @shared alias
├── tsconfig.json                # TypeScript project references
├── tsconfig.app.json            # TypeScript for frontend (+ @shared path)
└── tsconfig.server.json         # TypeScript for backend (includes shared/)
```

## UI Components

All components in `src/components/ui/` are part of the shared UI library and correspond to the **Figma design system** (Campingplatz-Manager Figma preset).

- **Source**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives + Tailwind CSS), aligned with the Figma preset.
- **Stack**: Radix UI (`@radix-ui/react-*`), `class-variance-authority` (cva), `mergeClasses()` from `@/lib/utils`.
- **Styling**: Theme and tokens from `src/styles/theme.css`; components use semantic classes (e.g. `bg-primary`, `text-popover-foreground`).

When adding or changing UI elements, keep them consistent with the Figma design and this component set. See also `src/components/ui/README.md`.

## Architecture

### Client Architecture

1. **Feature Pages** (`src/features/`)
   - One or more pages per feature (e.g. `BookingsPage`, `BookingDetailPage`)
   - Page components orchestrate state, hooks, and feature subcomponents
   - Feature UI lives in a `components/` subfolder: list cards (`*Card.tsx`), form content (`*FormContent.tsx`), analytics charts. Pages use `FormDialog` + `*FormContent`; the trigger button is rendered by the page (e.g. in `PageHeader`).
   - Hooks and `constants.ts` in the feature root (e.g. `useBookingCrud`, `useCampingPlaceCrud`, `useCampingItemCrud`)
   - Use layout components (`PageHeader`, `EmptyState`) and custom hooks

2. **Redux Store** (`src/store/`)
   - One slice per entity using `createEntityAdapter` + `createAsyncThunk`
   - `authSlice`: Auth state (employee, token, login/signup/logout)
   - Thunks call into the API layer (`src/api/*.ts`), not the fetch client directly
   - Normalized state for performant selectors; memoized derived selectors via `createSelector` (e.g. `selectActiveCampingPlaces`, `selectActiveBookings`)
   - Cross-slice sync: `bookingsSlice` listens for camping place and item updates (via WebSocket or thunk) and patches embedded entity references in bookings
   - UI slice for theme, sidebar state, and mobile navigation

3. **API Layer** (`src/api/`)
   - `client.ts`: Central fetch wrapper with error handling (`ApiError`), JSON, and base URL
   - Entity modules (`bookings.ts`, `campingPlaces.ts`, `campingItems.ts`, `analytics.ts`, `auth.ts`): All HTTP calls for that domain; used by Redux thunks only
   - `types.ts`: Single source of truth for TypeScript interfaces and form data types

4. **Custom Hooks** (`src/hooks/`)
   - `useConfirmDelete`: Confirm dialog, dispatch delete thunk, success/error toasts
   - `useFetchWhenIdle`: Dispatch a fetch thunk when the slice status is `idle`
   - `useWebSocketSync`: Connects to `ws://…/ws?token=...` (JWT from auth state), parses server events (e.g. `bookings/created`, `bookings/updated`, `bookings/deleted`), dispatches slice actions (`receiveBookingFromWebSocket`, `receiveBookingDeletedFromWebSocket`, etc.) so Redux state stays in sync across tabs and users; reconnects on token change or disconnect
   - `useSyncEditFormFromStore`: Syncs an open edit form with the Redux store — closes the dialog when the entity is deleted, or updates the form when the entity is modified (e.g. via WebSocket)
   - `useCrud`: CRUD dialog + form state + submit (openCreate, openEdit, form, handleSubmit, optional validate); used by all CRUD pages
   - `useOpenEditFromLocationState`: Open edit dialog when navigating with `location.state` (e.g. from booking detail page)
   - `use-mobile`: Breakpoint hook for responsive behaviour
   - **Feature-level hooks** (e.g. `src/features/bookings/`): `useFilteredBookings` (status, place, search by name/email/phone), `useBookingFormDerived` (selectedPlace, totalItemSize, sizeError), `useBookingFormItems` (addItem, removeItem for booking items)

5. **Shared & lib**
   - `shared/`: Code used by both frontend and backend (e.g. `bookingPrice.ts` for total price calculation). Frontend resolves `@shared` via Vite/tsconfig to `./shared`.
   - `src/lib/`: Frontend-only utilities (e.g. `dateUtils.ts` for `toDateInputValue`, `utils.ts` for `mergeClasses()`).

6. **Authentication** (`src/features/auth/`)
   - `LoginPage` and `SignupPage`: Standalone pages (no AppLayout) with Card-based forms
   - `AuthGuard`: Wraps protected routes, verifies JWT token via `/api/auth/me`, redirects to `/login` if unauthenticated
   - JWT token stored in `localStorage` (`auth_token`), automatically attached to all API requests by `client.ts`
   - `authSlice`: Manages employee session, login/signup thunks, logout action

### Server Architecture

1. **HTTP + WebSocket** (`server/src/index.ts`) — Creates the HTTP server from the Express app and attaches a WebSocket server on path `/ws`. Clients connect with a JWT token (`/ws?token=...`); connections without a valid token are rejected (close code `4001`). The server keeps a set of authenticated connections and broadcasts JSON messages on create/update/delete (see `server/src/ws/broadcast.ts`).
2. **Routes** (`server/src/routes/`) — Define HTTP endpoints and delegate to controllers
3. **Controllers** (`server/src/controllers/`) — Request/response handling, input validation (via `validate()` from `server/src/middleware/validate.ts`), parameter parsing; after successful create/update/delete (and booking status change), call `broadcast({ type, payload })` so all WebSocket clients receive the event
4. **Services** (`server/src/services/`) — Business logic and Prisma database operations; use `shared/` for domain logic shared with the client (e.g. booking total price)
5. **Database** (SQLite via Prisma) — File-based, no external database required

Production server entry after build: `node server/dist/server/src/index.js` (see `npm run start`).

### Data Flow

```
User → React Component → Redux Thunk → fetch(/api/...) → Express Route → Controller → Service → Prisma → SQLite
                                                                                                            ↓
User ← React Component ← Redux Store ← Response ← Express Route ← Controller ← Service ← Prisma ← SQLite
```

Authentication: Login → authSlice thunk → POST /api/auth/login → JWT token → localStorage → Authorization header on all subsequent requests.

Real-time: After any create/update/delete (bookings, camping places, camping items), the server broadcasts a WebSocket message. The frontend hook `useWebSocketSync` receives it and dispatches the corresponding Redux action (e.g. `receiveBookingFromWebSocket`), so all connected clients see the change without a full refetch.

### API Endpoints

| Method | Path                              | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/auth/signup`                | Register new employee    |
| POST   | `/api/auth/login`                 | Login (returns JWT token)|
| GET    | `/api/auth/me`                    | Get current employee (requires auth) |
| GET    | `/api/camping-places`             | List all camping places  |
| POST   | `/api/camping-places`             | Create camping place     |
| GET    | `/api/camping-places/:id`         | Get camping place        |
| PATCH  | `/api/camping-places/:id`         | Update camping place     |
| DELETE | `/api/camping-places/:id`         | Delete camping place     |
| GET    | `/api/camping-items`              | List all camping items   |
| POST   | `/api/camping-items`              | Create camping item      |
| GET    | `/api/camping-items/:id`          | Get camping item         |
| PATCH  | `/api/camping-items/:id`          | Update camping item      |
| DELETE | `/api/camping-items/:id`          | Delete camping item      |
| GET    | `/api/bookings`                   | List bookings (filterable) |
| POST   | `/api/bookings`                   | Create booking           |
| GET    | `/api/bookings/:id`               | Get booking details      |
| PATCH  | `/api/bookings/:id`               | Update booking           |
| DELETE | `/api/bookings/:id`               | Delete booking           |
| POST   | `/api/bookings/:id/status`        | Change booking status    |
| GET    | `/api/bookings/:id/status-changes`| Get status history (each entry may include employee who made the change) |
| GET    | `/api/bookings/:id/items`         | Get booking items        |
| POST   | `/api/bookings/:id/items`         | Add item to booking      |
| DELETE | `/api/bookings/:id/items/:itemId` | Remove item from booking |
| GET    | `/api/analytics`                  | Get analytics data       |

All endpoints except `/api/auth/signup` and `/api/auth/login` require a valid JWT token in the `Authorization: Bearer <token>` header.

## Adding New Features

1. **Extend Prisma schema** (`prisma/schema.prisma`) → `npm run prisma:push`
2. **Define types** (`src/api/types.ts`) — Interface + FormData type
3. **Create backend**: Service → Controller → Route, register in `routes/index.ts`
4. **Add API module** (`src/api/<entity>.ts`) — Functions that call `api()` from `client.ts` for each endpoint
5. **Create Redux slice** (`src/store/`) with Entity Adapter + Thunks that use the API module, register in `store.ts`
6. **Create feature** (`src/features/<domain>/`): add page(s), optional feature CRUD hook (e.g. `useCampingPlaceCrud`), and `components/` (e.g. `*Card.tsx`, `*FormContent.tsx`). Use `FormDialog` + `*FormContent` in the page; the trigger button is rendered by the page. Use shared hooks (`useConfirmDelete`, `useFetchWhenIdle`, `useCrud` or feature hook, `useOpenEditFromLocationState` where needed) and layout components (`PageHeader`, `EmptyState`)
7. **Add route** in `src/app/routes.tsx` and navigation entry in `src/components/layout/Topbar.tsx`
8. **Write tests** (Vitest for unit, Playwright for E2E)

## License

This project is licensed under the GNU General Public License v3.0.
