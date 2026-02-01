# Camping Place Manager

A modern camping place management application built with Next.js, React, TypeScript, MongoDB, and Prisma.

## Features

- 🏕️ **Camping Place Management**: Add, edit, and manage camping places
- 🎒 **Camping Items Management**: Manage camping equipment and items inventory
- 📅 **Booking System**: Handle customer bookings and reservations
- 📊 **Analytics Dashboard**: Comprehensive insights into your camping business
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🗄️ **Database**: MongoDB with Prisma ORM for data management
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: MongoDB
- **ORM**: Prisma
- **Testing**: Jest (unit tests), Playwright (e2e tests)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/mthoericht/camping-place-manager.git
cd camping-place-manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Update the `DATABASE_URL` in `.env` with your MongoDB connection string:

```
DATABASE_URL="mongodb://localhost:27017/camping-place-manager"
```

5. Generate Prisma client:

```bash
npm run db:generate
```

6. Push the database schema:

```bash
npm run db:push
```

7. Start MongoDB (Node.js script in `scripts/`):

```bash
npm run db:start
```

8. Start the development server:

```bash
npm run dev
```

9. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### CampingPlace

- `id`: Unique identifier
- `name`: Name of the camping place
- `description`: Description of the place
- `location`: Location/address
- `size`: Size in square meters (m²)
- `price`: Price per night (€)
- `amenities`: Array of available amenities
- `isActive`: Whether the place is available for booking
- `createdAt`/`updatedAt`: Timestamps

### CampingItem

- `id`: Unique identifier
- `name`: Name of the camping item
- `category`: Item category (Tent, Van, Trailer, Pavilion/Awning, etc.)
- `size`: Size in square meters
- `description`: Description of the item
- `isActive`: Whether the item is available for booking
- `createdAt`/`updatedAt`: Timestamps

### Booking

- `id`: Unique identifier
- `campingPlaceId`: Reference to camping place
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `customerPhone`: Customer's phone (optional)
- `startDate`/`endDate`: Booking dates
- `guests`: Number of guests
- `totalPrice`: Total booking price (€)
- `status`: Booking status (PENDING, CONFIRMED, PAID, CANCELLED, COMPLETED)
- `notes`: Additional notes
- `createdAt`/`updatedAt`: Timestamps

### BookingItem

- `id`: Unique identifier
- `bookingId`: Reference to booking
- `campingItemId`: Reference to camping item
- `quantity`: Number of items booked
- `createdAt`/`updatedAt`: Timestamps

### BookingStatusChange (timeline)

- `id`: Unique identifier
- `bookingId`: Reference to booking
- `status`: Status at change time (PENDING, CONFIRMED, PAID, CANCELLED, COMPLETED)
- `changedAt`: When the status was set (used for Booking Timeline on detail page)

## Camping Items Management

The camping items management system allows you to maintain an inventory of camping equipment and items that can be rented out to customers.

### Features

- **Add Items**: Create new camping items with name, category, size, and description
- **Edit Items**: Update existing item details and availability status
- **Delete Items**: Remove items from inventory with confirmation
- **View Details**: Detailed view of individual camping items
- **Category Management**: Predefined categories including Tent, Van, Trailer, Pavilion/Awning
- **Status Tracking**: Mark items as active/inactive for availability

### Available Categories

- Tent
- Van
- Trailer
- Pavilion/Awning

### Delete Protection

Camping places and camping items cannot be deleted if they have **active or planned bookings** (status `PENDING`, `CONFIRMED`, or `PAID`). Cancel or complete those bookings first; then deletion is allowed.

### Navigation

Access camping items management through:
- Main navigation bar: "Camping Items"
- Homepage dashboard: "Manage Items" card
- Direct URL: `/camping-items`

## Available Scripts

### Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint errors automatically

### Testing

- `npm test`: Run unit tests (Jest)
- `npm run test:watch`: Run unit tests in watch mode
- `npm run test:coverage`: Generate test coverage report
- `npm run test:e2e`: Run end-to-end tests (Playwright)
- `npm run test:e2e:ui`: Run e2e tests with Playwright UI
- `npm run test:e2e:headed`: Run e2e tests in headed mode (visible browser)
- `npm run test:e2e:install`: Install Playwright browsers
- `npm run test:all`: Run both unit and e2e tests

**Note**: For detailed information about e2e testing, test data management, and the TEST_ prefix requirement, see [e2e/README.md](./e2e/README.md).

### Database Management

- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open Prisma Studio

### MongoDB Management (Node.js scripts in `scripts/`)

- `npm run db:start`: Start MongoDB (`scripts/db-start.mjs`)
- `npm run db:stop`: Stop MongoDB (`scripts/db-stop.mjs`)
- `npm run db:restart`: Restart MongoDB (`scripts/db-restart.mjs`)
- `npm run db:status`: Check MongoDB and Next.js status, show recent logs (`scripts/db-status.mjs`)

## Quick Start Guide

1. **Clone and install:**

   ```bash
   git clone https://github.com/mthoericht/camping-place-manager.git
   cd camping-place-manager
   npm install
   ```

2. **Set up environment:**

   ```bash
   # Create .env with your MongoDB connection
   echo 'DATABASE_URL="mongodb://localhost:27017/camping-place-manager"' > .env
   ```

3. **Start services:**

   ```bash
   npm run db:start       # Start MongoDB
   npm run db:push        # Sync database schema
   npm run dev           # Start development server
   ```

4. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create your first camping place
   - Add camping items to your inventory
   - Make a test booking
   - View analytics dashboard

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (server-side)
│   │   ├── camping-items/ # Camping items API endpoints
│   │   ├── camping-places/# Camping places API endpoints
│   │   └── bookings/      # Bookings API endpoints
│   ├── camping-items/     # Camping items management pages
│   ├── camping-places/    # Camping places pages
│   ├── bookings/          # Bookings pages
│   ├── analytics/         # Analytics dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components (UI only)
│   ├── ui/                # Base UI components
│   ├── CampingItemForm.tsx
│   ├── CampingPlaceForm.tsx
│   ├── BookingForm.tsx
│   └── BookingStatusSelect.tsx  # Status dropdown (uses bookingsApi.updateStatus)
├── hooks/                 # Custom React hooks
│   ├── __tests__/         # Hook tests
│   ├── useBookingForm.ts      # Booking form logic
│   ├── useBookingMutations.ts # Booking CRUD operations
│   ├── useCampingItemMutations.ts
│   ├── useCampingPlaceMutations.ts
│   └── useCrudFormActions.ts  # Generic form submit/delete flow
├── lib/                   # Utility functions and services
│   ├── client/            # Client-side code
│   │   └── api/           # Client-side API services
│   │       ├── createCrudApi.ts  # Generic CRUD API factory
│   │       ├── http.ts           # HTTP utilities (fetchJson)
│   │       ├── bookingsApi.ts
│   │       ├── campingItemsApi.ts
│   │       └── campingPlacesApi.ts
│   ├── server/            # Server-side utilities
│   │   ├── __tests__/
│   │   ├── MongoDbHelper.ts
│   │   ├── prisma.ts
│   │   └── services/      # Server-side service classes
│   │       ├── __tests__/
│   │       ├── AnalyticsService.ts
│   │       ├── BookingService.ts
│   │       ├── CampingItemService.ts
│   │       └── CampingPlaceService.ts
│   └── shared/            # Shared utilities
│       ├── __tests__/
│       ├── DateUtil.ts
│       └── types/
│           └── index.ts   # Centralized type definitions
└── stores/                # Zustand stores (state only, no mutations)
    ├── __tests__/
    ├── cacheInvalidation.ts      # Cross-store cache invalidation
    ├── createCachedListStore.ts  # Generic store factory
    ├── useCampingItemsStore.ts
    └── useCampingPlacesStore.ts
```

## Architecture

The application follows a layered architecture pattern with clear separation of concerns:

### Client-Side Architecture

1. **Components** (`src/components/`)
   - React components for UI rendering only
   - Delegate all logic to custom hooks
   - Example: `BookingForm` uses `useBookingForm` hook

2. **Custom Hooks** (`src/hooks/`)
   - **Form Hooks** (`useBookingForm`): Encapsulate form state, derived values, and submit logic
   - **Mutation Hooks** (`use*Mutations`): CRUD operations + cache invalidation
   - **Utility Hooks** (`useCrudFormActions`): Reusable submit/delete flow with redirect

3. **Stores** (`src/stores/`)
   - Zustand stores for cached state only (no mutations)
   - Created via `createCachedListStore` factory
   - Provide: `items`, `loading`, `error`, `fetch`, `getById`, `getActive`, `clearCache`

4. **API Layer** (`src/lib/client/api/`)
   - Created via `createCrudApi` factory
   - Centralized HTTP utilities in `http.ts` (`fetchJson`, `HttpError`)
   - Type-safe CRUD operations

### Server-Side Architecture

1. **API Routes** (`src/app/api/`)
   - Next.js API route handlers
   - Handle HTTP requests and responses
   - Validate input and call service classes

2. **Service Classes** (`src/lib/server/services/`)
   - Business logic layer
   - Database operations using Prisma
   - Data transformation and validation
   - Available services:
     - `AnalyticsService`: Analytics and reporting data
     - `BookingService`: Booking management operations
     - `CampingItemService`: Camping items CRUD operations
     - `CampingPlaceService`: Camping places CRUD operations

3. **Database** (MongoDB via Prisma)
   - Data persistence layer
   - Managed through Prisma ORM

### Data Flow

```
User Action → Component → Hook → Store/API → API Route → Service → Database
                                                                  ↓
User Feedback ← Component ← Hook ← Store/API ← API Route ← Service ← Database
```

**Example: Creating a Booking**
1. User fills form → `BookingForm` component
2. Submit → `useBookingForm` hook calls `useBookingMutations.createBooking()`
3. Mutation hook calls `bookingsApi.create()` (HTTP POST)
4. API route calls `BookingService.createBooking()` (Prisma)
5. Success → `invalidateCatalogCaches()` clears related store caches
6. Redirect via `useCrudFormActions`

### Type System

The application uses a centralized type system located in `src/lib/shared/types/`:

1. **Shared Types** (`src/lib/shared/types/index.ts`)
   - Single source of truth for all type definitions
   - Eliminates redundancy and ensures consistency
   - Separates client-side types (with `Date` timestamps) from server-side types (with `string` timestamps)
   - Includes base interfaces, form data types, and entity types

2. **Type Organization**
   - **Client-side types**: Used in API services and stores (e.g., `CampingItem`, `CampingPlace`, `Booking`)
   - **Server-side types**: Used in service classes (e.g., `CampingItemServer`, `CampingPlaceServer`, `BookingServer`)
   - **Form data types**: Used for form inputs (e.g., `CampingItemFormData`, `BookingFormData`)
   - **Shared types**: Common interfaces like `ApiError` and `BaseEntity`

3. **Type Re-exports**
   - API services re-export types for convenience
   - Service classes re-export types with original names for backward compatibility
   - Stores import types from API services

This type system provides:
- **Type Safety**: Full TypeScript support across all layers
- **Consistency**: Shared base interfaces ensure uniform data structures
- **Maintainability**: Type changes in one place propagate throughout the application
- **Clarity**: Clear distinction between client and server-side data structures

This architecture provides:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes are isolated to specific layers
- **Reusability**: API services can be used across different components
- **Type Safety**: Centralized type definitions ensure consistency

## Testing

This project includes comprehensive test coverage with both unit tests and end-to-end (e2e) tests.

### Unit Tests

Unit tests are written using Jest and React Testing Library. They are organized in `__tests__/` folders co-located with the code they test, following Jest best practices:

- **Utility functions** (`DateUtil`, `MongoDbHelper`) - Located in `src/lib/shared/__tests__/` and `src/lib/server/__tests__/`
- **Service classes** (`AnalyticsService`, `BookingService`, `CampingPlaceService`, `CampingItemService`) - Located in `src/lib/server/services/__tests__/`
- **API layer** (`http`, `createCrudApi`, `bookingsApi`) - Located in `src/lib/client/api/__tests__/`
- **Store factories** (`createCachedListStore`, `useCampingItemsStore`, `useCampingPlacesStore`) - Located in `src/stores/__tests__/`
- **Custom hooks** (`useBookingMutations`, `useCampingItemMutations`, `useCampingPlaceMutations`) - Located in `src/hooks/__tests__/`
- **Components** (`BookingStatusSelect`) - Located in `src/components/__tests__/`

Tests are organized by layer:
- **API tests**: Mock `fetch`, test HTTP utilities and CRUD factory
- **Store tests**: Mock API layer, test fetch/cache/selectors
- **Hook tests**: Mock API + cache invalidation, test mutations

Run unit tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### End-to-End Tests

E2E tests are written using Playwright and test the full application flow across multiple browsers (Chromium, Firefox, WebKit).

**Important**: All e2e tests use a **"TEST_" prefix** for test data to ensure database safety and automatic cleanup. See [e2e/README.md](./e2e/README.md) for detailed information about:
- Test data management with TEST_ prefix
- Automatic cleanup procedures
- Helper functions
- Running and debugging tests

Run e2e tests with:
```bash
npm run test:e2e
```

For more details, see the [E2E Tests Documentation](./e2e/README.md).

## Development Guidelines

### Adding New Features

When adding new features that require API calls:

1. **Define Types** (`src/lib/shared/types/index.ts`)
   - Add new interfaces to the shared types file
   - Follow pattern: `EntityBase`, `Entity` (client), `EntityServer` (server), `EntityFormData`

2. **Create API Service** (`src/lib/client/api/`)
   - Use `createCrudApi` factory for standard CRUD
   - Import types from `@/lib/shared/types`
   ```typescript
   export const myEntityApi = createCrudApi<MyEntity, MyEntityFormData>('/api/my-entity');
   ```

3. **Create Store** (`src/stores/`)
   - Use `createCachedListStore` factory
   ```typescript
   export const useMyEntityStore = createCachedListStore<MyEntity>({
     fetchAll: () => myEntityApi.getAll(),
     cacheDurationMs: 5 * 60 * 1000,
   });
   ```

4. **Create Mutation Hook** (`src/hooks/`)
   - Create `useMyEntityMutations` for CRUD operations
   - Call `invalidateCatalogCaches()` after mutations

5. **Create Form Hook** (if complex form logic)
   - Create `useMyEntityForm` if form has derived values, store dependencies, or complex state

6. **Update Components** (`src/components/`)
   - Use hooks for all logic, component only renders
   - Use `useCrudFormActions` for submit/delete flow

7. **Write Tests**
   - Store tests: mock API, test fetch/cache
   - Hook tests: mock API + cache invalidation
   - Service tests: mock Prisma

### Code Organization

- **Types** (`src/lib/shared/types/`): Centralized type definitions - single source of truth
- **API Layer** (`src/lib/client/api/`): HTTP requests via `createCrudApi` factory
- **Stores** (`src/stores/`): Cached state only via `createCachedListStore` factory
- **Hooks** (`src/hooks/`): Mutations, form logic, React orchestration
- **Components** (`src/components/`): UI rendering only, delegate all logic to hooks
- **Services** (`src/lib/server/services/`): Server-side business logic and database operations

### Type Definitions Best Practices

1. **Always use shared types**: Import from `@/lib/shared/types` instead of defining types locally
2. **Use appropriate type variants**:
   - Client-side: Use types with `Date` timestamps (e.g., `CampingItem`)
   - Server-side: Use types with `string` timestamps (e.g., `CampingItemServer`)
   - Forms: Use form data types (e.g., `CampingItemFormData`)
3. **Extend base interfaces**: When creating new entity types, extend from base interfaces
4. **Re-export for convenience**: API services and stores should re-export types they use
5. **Maintain backward compatibility**: Service classes re-export types with original names

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the architecture guidelines
4. **Write tests** for new features (unit tests for stores/services, e2e tests for user flows)
5. **Run all tests** (`npm run test:all`) before submitting
6. Ensure all tests pass and there are no linting errors
7. Submit a pull request

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
