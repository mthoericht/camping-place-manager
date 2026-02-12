# Camping Place Manager

A modern camping place management application built with React, TypeScript, Express, SQLite, and Prisma.

## Features

- 🏕️ **Camping Place Management**: Add, edit, and manage camping places
- 🎒 **Camping Items Management**: Manage camping equipment and items inventory
- 📅 **Booking System**: Handle customer bookings and reservations (default view), including status timeline
- 📊 **Analytics**: Revenue, occupancy, and statistics
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
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken), bcrypt (bcryptjs)
- **Unit Tests**: Vitest (jsdom, `@testing-library/jest-dom`)
- **Integration Tests**: Vitest + Supertest (API gegen Express, Test-DB `data/test.db`)
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
- `changedAt`: Timestamp of the status change (used for timeline on booking detail page)

#### Employee

- `id`: Auto-increment integer
- `email`: Unique email address
- `fullName`: Full name of the employee
- `password`: Bcrypt-hashed password
- `createdAt`/`updatedAt`: Timestamps

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
- `npm run test:unit` — Unit tests only (`shared/**/*.test.ts`, `src/**/*.test.{ts,tsx}`)
- `npm run test:integration` — API integration tests only (`server/**/*.integration.test.ts`, uses `data/test.db`)
- `npm run test:watch` — Vitest watch mode
- `npm run test:coverage` — Test coverage report
- `npm run test:e2e` — E2E tests (Playwright)
- `npm run test:e2e:ui` — E2E tests with Playwright UI
- `npm run test:e2e:install` — Install Playwright browsers

**Test database:** Integration tests use a separate SQLite file `data/test.db`. The setup (`vitest.setup.integration.ts`) sets `DATABASE_URL` to this file before any server code runs, so the development database (`data/dev.db`) is **never modified**. Before each integration test, the test DB is cleared so tests are isolated. Test output directories (`test-results`, `playwright-report`, `blob-report`, `coverage`) are in `.gitignore`.

### Storybook

- `npm run storybook` — Start Storybook (component docs; stories in `src/components/ui/`, `src/components/layout/`, `src/features/*/components/`)

## Project Structure

```
├── shared/                      # Code shared by frontend and backend
│   ├── bookingPrice.ts          # calcBookingTotalPrice (nights × price)
│   └── bookingPrice.test.ts     # Unit tests for bookingPrice
├── prisma/
│   └── schema.prisma            # Database schema (SQLite)
├── data/
│   ├── .gitkeep                 # Folder tracked empty; DB files gitignored
│   ├── dev.db                   # Development database (created on first run)
│   └── test.db                  # Integration test database (created by test setup)
├── server/
│   └── src/
│       ├── index.ts             # Server entry point
│       ├── app.ts               # Express app setup
│       ├── api.integration.test.ts  # API integration tests (Supertest, test DB)
│       ├── prisma/
│       │   └── client.ts        # Prisma client singleton
│       ├── middleware/
│       │   ├── error.middleware.ts
│       │   ├── auth.middleware.ts
│       ├── routes/
│       │   ├── index.ts         # Route registry
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
│   │   ├── store.ts             # Redux store (configureStore)
│   │   ├── hooks.ts             # Typed useAppDispatch / useAppSelector
│   │   ├── bookingsSlice.ts
│   │   ├── bookingsSlice.test.ts # Unit tests for bookings reducer
│   │   ├── campingPlacesSlice.ts
│   │   ├── campingItemsSlice.ts
│   │   ├── analyticsSlice.ts
│   │   ├── authSlice.ts         # Auth state (employee, token, login/signup/logout)
│   │   └── uiSlice.ts           # UI state (theme, sidebar, mobile nav)
│   ├── lib/
│   │   ├── dateUtils.ts
│   │   └── dateUtils.test.ts    # Unit tests for dateUtils
│   ├── hooks/
│   │   ├── use-mobile.ts        # Mobile breakpoint (responsive)
│   │   ├── useConfirmDelete.ts  # Confirm dialog + delete + toast
│   │   ├── useFetchWhenIdle.ts  # Dispatch fetch when slice status is idle
│   │   ├── useFormDialog.ts     # Create-only dialog (open/close, form state)
│   │   ├── useCrud.ts           # CRUD dialog + submit (openCreate, openEdit, form, handleSubmit)
│   │   └── useOpenEditFromLocationState.ts  # Open edit from location.state (e.g. detail → list)
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
│   ├── lib/
│   │   ├── utils.ts             # cn() utility
│   │   └── dateUtils.ts         # toDateInputValue (ISO → YYYY-MM-DD)
│   └── styles/
│       ├── index.css            # CSS entry point
│       ├── tailwind.css         # Tailwind v4 setup
│       ├── theme.css            # Design tokens (light/dark)
│       └── fonts.css
├── .env                         # Environment variables
├── vitest.setup.unit.ts         # Unit test setup (jsdom, @testing-library/jest-dom)
├── vitest.setup.integration.ts  # Integration setup (DATABASE_URL=test.db, prisma db push)
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
- **Stack**: Radix UI (`@radix-ui/react-*`), `class-variance-authority` (cva), `cn()` from `@/lib/utils`.
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
   - Normalized state for performant selectors
   - UI slice for theme, sidebar state, and mobile navigation

3. **API Layer** (`src/api/`)
   - `client.ts`: Central fetch wrapper with error handling (`ApiError`), JSON, and base URL
   - Entity modules (`bookings.ts`, `campingPlaces.ts`, `campingItems.ts`, `analytics.ts`, `auth.ts`): All HTTP calls for that domain; used by Redux thunks only
   - `types.ts`: Single source of truth for TypeScript interfaces and form data types

4. **Custom Hooks** (`src/hooks/`)
   - `useConfirmDelete`: Confirm dialog, dispatch delete thunk, success/error toasts
   - `useFetchWhenIdle`: Dispatch a fetch thunk when the slice status is `idle`
   - `useFormDialog`: Create-only dialog (open/close, form state)
   - `useCrud`: CRUD dialog + form state + submit (openCreate, openEdit, form, handleSubmit, optional validate); used by all CRUD pages
   - `useOpenEditFromLocationState`: Open edit dialog when navigating with `location.state` (e.g. from booking detail page)
   - `use-mobile`: Breakpoint hook for responsive behaviour
   - **Feature-level hooks** (e.g. `src/features/bookings/`): `useBookingFormDerived` (selectedPlace, totalItemSize, sizeError), `useBookingFormItems` (addItem, removeItem for booking items)

5. **Shared & lib**
   - `shared/`: Code used by both frontend and backend (e.g. `bookingPrice.ts` for total price calculation). Frontend resolves `@shared` via Vite/tsconfig to `./shared`.
   - `src/lib/`: Frontend-only utilities (e.g. `dateUtils.ts` for `toDateInputValue`, `utils.ts` for `cn()`).

6. **Authentication** (`src/features/auth/`)
   - `LoginPage` and `SignupPage`: Standalone pages (no AppLayout) with Card-based forms
   - `AuthGuard`: Wraps protected routes, verifies JWT token via `/api/auth/me`, redirects to `/login` if unauthenticated
   - JWT token stored in `localStorage` (`auth_token`), automatically attached to all API requests by `client.ts`
   - `authSlice`: Manages employee session, login/signup thunks, logout action

### Server Architecture

1. **Routes** (`server/src/routes/`) — Define HTTP endpoints and delegate to controllers
2. **Controllers** (`server/src/controllers/`) — Request/response handling, parameter parsing
3. **Services** (`server/src/services/`) — Business logic and Prisma database operations; use `shared/` for domain logic shared with the client (e.g. booking total price)
4. **Database** (SQLite via Prisma) — File-based, no external database required

Production server entry after build: `node server/dist/server/src/index.js` (see `npm run start`).

### Data Flow

```
User → React Component → Redux Thunk → fetch(/api/...) → Express Route → Controller → Service → Prisma → SQLite
                                                                                                            ↓
User ← React Component ← Redux Store ← Response ← Express Route ← Controller ← Service ← Prisma ← SQLite
```

Authentication: Login → authSlice thunk → POST /api/auth/login → JWT token → localStorage → Authorization header on all subsequent requests

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
| GET    | `/api/bookings/:id/status-changes`| Get status history       |
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
