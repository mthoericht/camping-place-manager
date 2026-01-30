# Architecture: Server vs. Client

## Overview

The application uses a **separated architecture** for server-side and client-side operations:

- **Service Classes** (`src/lib/server/services/`) → **Server-side** (Node.js)
- **Stores + Hooks** (`src/stores/`, `src/hooks/`) → **Client-side** (Browser)

---

## 🖥️ Service Classes (Server-Side)

### When are Service Classes used?

Service classes are used **ONLY on the server**:

1. ✅ **In Server Components** (Next.js Pages without `'use client'`)
2. ✅ **In API Routes** (`src/app/api/**/route.ts`)
3. ✅ **In Server Actions** (if applicable)

### ❌ NOT used in:
- Client Components (`'use client'`)
- Browser code
- React Hooks

### Examples

#### Server Component (Page)
```typescript
// ✅ src/app/page.tsx - Server Component
import { AnalyticsService } from '@/lib/server/services/AnalyticsService';

export default async function Home() {
  const analytics = await AnalyticsService.getAnalyticsData();
  return <Stats totalPlaces={analytics.totalPlaces} />;
}
```

#### API Route
```typescript
// ✅ src/app/api/bookings/[id]/route.ts
import { BookingService } from '@/lib/server/services/BookingService';

export async function GET(request: NextRequest, { params }) {
  const { id } = await params;
  const booking = await BookingService.getBooking(id);
  return NextResponse.json(booking);
}
```

---

## 🌐 Client-Side Architecture

### Layer Overview

```
Component (UI only)
    ↓
Custom Hook (useBookingForm, useBookingMutations)
    ↓
Store (useCampingPlacesStore) + API (bookingsApi)
    ↓
HTTP Request → API Route → Service → Database
```

### 1. Stores (`src/stores/`)

Stores manage **cached state only** – no mutations:

```typescript
// Store provides: items, loading, error, fetch, getById, getActive, clearCache
const { items, loading, fetch, getById } = useCampingItemsStore();

// Stores are created via factory:
export const useCampingItemsStore = createCachedListStore<CampingItem>({
  fetchAll: () => campingItemsApi.getAll(),
  cacheDurationMs: 5 * 60 * 1000,
});
```

### 2. Mutation Hooks (`src/hooks/use*Mutations.ts`)

CRUD operations + cache invalidation:

```typescript
const { createCampingItem, updateCampingItem, deleteCampingItem } = useCampingItemMutations();

// After mutation, cache is invalidated:
await campingItemsApi.create(data);
invalidateCatalogCaches();
```

### 3. Form Hooks (`src/hooks/useBookingForm.ts`)

Complex form logic (state, derived values, store integration):

```typescript
const {
  formData,
  setField,
  selectedItems,
  updateItemQuantity,
  campingPlaces,
  selectedPlace,
  nights,
  totalPrice,
  totalSize,
  isLoading,
  isSubmitting,
  handleSubmit,
} = useBookingForm(initialData);
```

### 4. Utility Hooks (`src/hooks/useCrudFormActions.ts`)

Reusable submit/delete logic:

```typescript
const { isSubmitting, run, runWithConfirm } = useCrudFormActions({ redirectTo: '/items' });

// Submit:
await run(() => createCampingItem(formData));

// Delete with confirm:
await runWithConfirm('Delete this item?', () => deleteCampingItem(id));
```

### 5. Components (`src/components/`)

**UI rendering only** – all logic in hooks:

```typescript
'use client';

export default function BookingForm({ initialData }) {
  const { formData, setField, handleSubmit, isSubmitting } = useBookingForm(initialData);
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.customerName} onChange={e => setField('customerName', e.target.value)} />
      <button disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

---

## 📊 Data Flow Comparison

### Server-Side Flow
```
Server Component → Service Class → Prisma → MongoDB
```

### Client-Side Flow
```
Component → Hook → Store/API → HTTP → API Route → Service → Prisma → MongoDB
                                                                    ↓
Component ← Hook ← Store/API ← HTTP ← API Route ← Service ← Prisma ← MongoDB
```

---

## 🎯 Decision Matrix

| Scenario | Solution | Why? |
|----------|----------|------|
| **Static page** with data | Service Class | Server-Side Rendering, SEO |
| **Interactive form** | Hook + Store | State management, user feedback |
| **API endpoint** | Service Class | Direct DB access |
| **Dashboard with live updates** | Store | Client-side state, caching |
| **CRUD operations** | Mutation Hook | API call + cache invalidation |
| **Complex form logic** | Form Hook | Derived values, store integration |

---

## ⚠️ Common Mistakes

### ❌ Wrong: Service Class in Client Component
```typescript
'use client';
export default function MyComponent() {
  // ❌ ERROR: Service class cannot be used in browser
  const data = await BookingService.getBookings();
}
```

### ✅ Correct: Hook in Client Component
```typescript
'use client';
export default function MyComponent() {
  const { createBooking } = useBookingMutations();
  const handleSubmit = () => createBooking(formData);
}
```

### ❌ Wrong: Store/Hook in Server Component
```typescript
export default async function MyPage() {
  // ❌ ERROR: Hooks don't work in Server Components
  const { items } = useCampingItemsStore();
}
```

### ✅ Correct: Service Class in Server Component
```typescript
export default async function MyPage() {
  // ✅ CORRECT: Use service class
  const items = await CampingItemService.getCampingItems();
}
```

---

## 📝 Summary

| Aspect | Service Classes | Stores + Hooks |
|--------|----------------|----------------|
| **Location** | Server (Node.js) | Client (Browser) |
| **Usage** | Server Components, API Routes | Client Components |
| **Data Access** | Direct (Prisma → DB) | Via HTTP (API Routes) |
| **State Management** | ❌ No | ✅ Yes (Zustand) |
| **Caching** | ❌ No | ✅ Yes (Store) |
| **Mutations** | ❌ No | ✅ Yes (Hooks) |
| **SEO** | ✅ Yes (SSR) | ❌ No |

**Rules:**
- **Server Component** → Service Class
- **Client Component** → Store (State) + Hook (Mutations/Forms)
- **Components** → UI only, logic in hooks
