# Architektur: Service-Klassen vs. Stores

## Übersicht

Die Anwendung verwendet eine **getrennte Architektur** für Server- und Client-seitige Operationen:

- **Service-Klassen** (`src/lib/server/services/`) → **Server-seitig** (Node.js)
- **Stores** (`src/stores/`) → **Client-seitig** (Browser)

---

## 🖥️ Service-Klassen (Server-Side)

### Wann werden Service-Klassen verwendet?

Service-Klassen werden **NUR auf dem Server** verwendet:

1. ✅ **In Server Components** (Next.js Pages ohne `'use client'`)
2. ✅ **In API Routes** (`src/app/api/**/route.ts`)
3. ✅ **In Server Actions** (falls vorhanden)

### ❌ NICHT verwendet in:
- Client Components (`'use client'`)
- Browser-Code
- React Hooks

### Beispiele

#### Beispiel 1: Server Component (Page)
```typescript
// ✅ src/app/page.tsx - Server Component
import { AnalyticsService } from '@/lib/server/services/AnalyticsService';

export default async function Home() {
  // Direkter Aufruf der Service-Klasse auf dem Server
  const analytics = await AnalyticsService.getAnalyticsData();
  
  return <Stats totalPlaces={analytics.totalPlaces} />;
}
```

#### Beispiel 2: API Route
```typescript
// ✅ src/app/api/bookings/[id]/route.ts - API Route
import { BookingService } from '@/lib/server/services/BookingService';

export async function GET(request: NextRequest, { params }) {
  const { id } = await params;
  
  // Service-Klasse wird direkt aufgerufen
  const booking = await BookingService.getBooking(id);
  
  return NextResponse.json(booking);
}
```

#### Beispiel 3: Server Component mit Daten
```typescript
// ✅ src/app/bookings/[id]/page.tsx - Server Component
import { BookingService } from '@/lib/server/services/BookingService';

export default async function BookingDetailsPage({ params }) {
  const { id } = await params;
  
  // Service-Klasse wird direkt aufgerufen
  const booking = await BookingService.getBookingFromAPI(id);
  
  if (!booking) {
    notFound();
  }
  
  return <div>{/* Booking Details */}</div>;
}
```

### Vorteile von Service-Klassen:
- ✅ Direkter Datenbankzugriff (kein HTTP-Overhead)
- ✅ Schneller (kein Netzwerk-Latency)
- ✅ Sicher (läuft nur auf dem Server)
- ✅ SEO-freundlich (Server-Side Rendering)

---

## 🌐 Stores (Client-Side)

### Wann werden Stores verwendet?

Stores werden **NUR im Browser** verwendet:

1. ✅ **In Client Components** (`'use client'`)
2. ✅ **Für interaktive UI** (Forms, Buttons, etc.)
3. ✅ **Für State Management** (Caching, Loading States)

### ❌ NICHT verwendet in:
- Server Components
- API Routes
- Server Actions

### Beispiele

#### Beispiel 1: Client Component mit Store
```typescript
// ✅ src/components/BookingForm.tsx - Client Component
'use client';

import { useBookingsStore } from '@/stores/useBookingsStore';
import { useCampingPlacesStore } from '@/stores/useCampingPlacesStore';

export default function BookingForm() {
  // Store wird im Browser verwendet
  const { createBooking, updateBooking } = useBookingsStore();
  const { fetchCampingPlaces, campingPlaces } = useCampingPlacesStore();
  
  useEffect(() => {
    // Daten werden über HTTP-Request geladen
    fetchCampingPlaces();
  }, []);
  
  const handleSubmit = async () => {
    // Store-Methode macht HTTP-Request zur API
    await createBooking(formData);
  };
  
  return <form>{/* Form UI */}</form>;
}
```

#### Beispiel 2: Store-Implementierung
```typescript
// ✅ src/stores/useCampingPlacesStore.ts
import { create } from 'zustand';
import { campingPlacesApi } from '@/lib/client/api/campingPlacesApi';

export const useCampingPlacesStore = create((set, get) => ({
  campingPlaces: [],
  loading: false,
  error: null,
  
  // Store-Methode ruft API Service auf
  fetchCampingPlaces: async () => {
    set({ loading: true });
    
    // API Service macht HTTP-Request
    const places = await campingPlacesApi.getAll();
    
    set({ campingPlaces: places, loading: false });
  },
}));
```

#### Beispiel 3: API Service (Client-Side)
```typescript
// ✅ src/lib/client/api/campingPlacesApi.ts - Client-Side API Service
export const campingPlacesApi = {
  // Macht HTTP-Request zur API Route
  getAll: async () => {
    const response = await fetch('/api/camping-places');
    return response.json();
  },
};
```

### Vorteile von Stores:
- ✅ Interaktivität (React Hooks, State)
- ✅ Caching (verhindert unnötige Requests)
- ✅ Loading States (UI-Feedback)
- ✅ Client-Side Navigation (kein Page Reload)

---

## 📊 Datenfluss-Vergleich

### Server-Side Flow (Service-Klassen)
```
Server Component
    ↓
Service-Klasse (BookingService)
    ↓
Prisma → MongoDB
    ↓
Daten zurück zur Component
```

**Beispiel:**
```typescript
// Server Component
const booking = await BookingService.getBooking(id);
// ✅ Direkt, schnell, kein HTTP
```

### Client-Side Flow (Stores)
```
Client Component
    ↓
Store (useBookingsStore)
    ↓
API Service (bookingsApi)
    ↓
HTTP Request → API Route
    ↓
Service-Klasse (BookingService)
    ↓
Prisma → MongoDB
    ↓
HTTP Response zurück
    ↓
Store aktualisiert State
    ↓
Component re-rendert
```

**Beispiel:**
```typescript
// Client Component
const { fetchBookings } = useBookingsStore();
await fetchBookings();
// ✅ Über HTTP, mit Caching, Loading States
```

---

## 🎯 Entscheidungsmatrix

| Szenario | Lösung | Warum? |
|----------|--------|--------|
| **Statische Seite** mit Daten | Service-Klasse | Server-Side Rendering, SEO |
| **Interaktive Form** | Store | State Management, User Feedback |
| **API Endpoint** | Service-Klasse | Direkter DB-Zugriff |
| **Dashboard mit Live-Updates** | Store | Client-Side State, Caching |
| **Analytics/Reports** | Service-Klasse | Server-Side, keine Interaktivität |
| **CRUD-Operationen** (Form Submit) | Store | User Interaction, Loading States |

---

## 🔍 Konkrete Code-Beispiele

### Beispiel: Booking anzeigen

#### Server Component (Service-Klasse)
```typescript
// src/app/bookings/[id]/page.tsx
export default async function BookingDetailsPage({ params }) {
  const { id } = await params;
  
  // ✅ Service-Klasse direkt aufrufen
  const booking = await BookingService.getBookingFromAPI(id);
  
  return <BookingDetails booking={booking} />;
}
```

#### Client Component (Store)
```typescript
// src/components/BookingForm.tsx
'use client';

export default function BookingForm() {
  const { createBooking } = useBookingsStore();
  
  const handleSubmit = async () => {
    // ✅ Store-Methode verwenden
    await createBooking(formData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Beispiel: Liste anzeigen

#### Server Component
```typescript
// src/app/camping-places/page.tsx
export default async function CampingPlacesPage() {
  // ✅ Service-Klasse direkt aufrufen
  const places = await CampingPlaceService.getCampingPlaces();
  
  return <CampingPlacesList places={places} />;
}
```

#### Client Component
```typescript
// src/components/CampingPlaceForm.tsx
'use client';

export default function CampingPlaceForm() {
  const { fetchCampingPlaces, campingPlaces } = useCampingPlacesStore();
  
  useEffect(() => {
    // ✅ Store-Methode verwenden
    fetchCampingPlaces();
  }, []);
  
  return <form>{/* Form mit campingPlaces */}</form>;
}
```

---

## ⚠️ Häufige Fehler

### ❌ Falsch: Service-Klasse in Client Component
```typescript
'use client';

export default function MyComponent() {
  // ❌ FEHLER: Service-Klasse kann nicht im Browser verwendet werden
  const data = await BookingService.getBookings();
}
```

### ✅ Richtig: Store in Client Component
```typescript
'use client';

export default function MyComponent() {
  // ✅ RICHTIG: Store verwenden
  const { bookings, fetchBookings } = useBookingsStore();
  
  useEffect(() => {
    fetchBookings();
  }, []);
}
```

### ❌ Falsch: Store in Server Component
```typescript
export default async function MyPage() {
  // ❌ FEHLER: Stores funktionieren nicht in Server Components
  const { bookings } = useBookingsStore();
}
```

### ✅ Richtig: Service-Klasse in Server Component
```typescript
export default async function MyPage() {
  // ✅ RICHTIG: Service-Klasse verwenden
  const bookings = await BookingService.getBookings();
}
```

---

## 📝 Zusammenfassung

| Aspekt | Service-Klassen | Stores |
|--------|----------------|--------|
| **Ort** | Server (Node.js) | Client (Browser) |
| **Verwendung** | Server Components, API Routes | Client Components |
| **Datenzugriff** | Direkt (Prisma → DB) | Über HTTP (API Routes) |
| **State Management** | ❌ Nein | ✅ Ja (Zustand) |
| **Caching** | ❌ Nein | ✅ Ja |
| **Loading States** | ❌ Nein | ✅ Ja |
| **Interaktivität** | ❌ Nein | ✅ Ja |
| **SEO** | ✅ Ja (SSR) | ❌ Nein |

**Regel:** 
- **Server Component** → Service-Klasse
- **Client Component** → Store

