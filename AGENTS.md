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
npm test                 # Vitest (unit tests)
npm run test:watch       # Vitest watch mode
npm run test:e2e         # Playwright (E2E tests)
```

## Architecture Conventions

### Frontend (`src/`)

- **Framework**: React 19 + Vite (no Next.js)
- **State Management**: Redux Toolkit (`src/store/`)
  - One slice per entity using `createEntityAdapter` + `createAsyncThunk`
  - Typed hooks: `useAppDispatch`, `useAppSelector` from `@/store/hooks`
- **Routing**: React Router v7 (`react-router-dom`), routes in `src/app/App.tsx`. Default route is `/bookings` (no dashboard). Navigation in Topbar: Bookings, Stellplätze, Ausrüstung, Analytics.
- **UI Components**: shadcn/ui (Radix-based) in `src/components/ui/`
- **Styling**: Tailwind CSS v4, theme in `src/styles/theme.css`
- **Icons**: Lucide React
- **Path Aliases**: `@/` → `./src/`, `@shared` → `./shared` (Vite + `tsconfig.app.json`). Shared code (e.g. price calculation) lives in `shared/` and is used by backend and frontend.
- **Types**: Centralized in `src/api/types.ts` — IDs are `number` (SQLite autoincrement)
- **API Client**: `src/api/client.ts` — Fetch wrapper, API proxy via Vite (`/api` → port 3001)

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
- **Feature modules** (`src/features/<domain>/`): Page(s), list cards (`*Card.tsx`), form dialogs (`*FormDialog.tsx`), `constants.ts`, optional `utils.ts`, and optional feature hooks (e.g. bookings: `BookingCard`, `BookingFormDialog`, `utils.ts`, `useBookingFormDerived`, `useBookingFormItems`). Pages orchestrate state and compose these components.
- **Layout components** in `src/components/layout/` (e.g. `AppLayout`, `Topbar`, `PageHeader`, `EmptyState`)
- **Reusable UI** in `src/components/ui/` (shadcn)
- **Hooks** in `src/hooks/`: `use-mobile`, `useConfirmDelete`, `useFetchWhenIdle`, `useFormDialog`, `useCrud` (CRUD dialog + form + submit for CRUD pages), `useOpenEditFromLocationState` (open edit from `location.state`, e.g. from detail page)
- **Feature-level hooks** in `src/features/<domain>/` when needed (e.g. `bookings/useBookingFormDerived.ts`, `bookings/useBookingFormItems.ts`)
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
| `src/store/store.ts` | Redux store configuration |
| `src/app/App.tsx` | Router configuration (default route: `/bookings`) |
| `src/components/layout/Topbar.tsx` | Top bar and navigation (Bookings first, no dashboard) |
| `src/components/layout/PageHeader.tsx` | Page title + description + optional actions |
| `src/components/layout/EmptyState.tsx` | Empty list state (icon + message) |
| `src/features/bookings/useBookingCrud.ts` | Booking CRUD hook (calcTotalPrice, bookingToForm, validate); uses `@shared/bookingPrice` |
| `src/lib/dateUtils.ts` | Date helpers (e.g. toDateInputValue for inputs) |
| `server/src/app.ts` | Express app setup |
| `server/src/routes/index.ts` | API route registry |
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
8. `src/features/<domain>/` — Feature page; add `*Card.tsx`, `*FormDialog.tsx`, and optional `constants.ts`/`utils.ts`/feature hooks as needed. Use hooks: `useCrud`, `useConfirmDelete`, `useFetchWhenIdle` (and `useOpenEditFromLocationState` if edit-from-detail is required).
9. `src/app/App.tsx` — Add route
10. `src/components/layout/Topbar.tsx` — Add navigation entry
