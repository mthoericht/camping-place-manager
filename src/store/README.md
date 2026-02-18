# Redux Store – Übersicht und Konventionen

Kurze Erklärung der Redux-Toolkit-Eigenheiten **in diesem Projekt** (Camping Place Manager): wofür Slices, Thunks, EntityAdapter, Hooks und Typen verwendet werden. Dateien und Slice-Namen (auth, bookings, …) beziehen sich auf die hiesige Codebasis.

---

## Was ist der Store?

Der Store hält den zentralen Anwendungszustand (Server-Daten, UI-Zustand, Auth). Komponenten lesen mit `useAppSelector` und ändern mit `useAppDispatch` (Thunks oder Actions). Redux Toolkit (RTK) vereinfacht Setup, Slices und asynchrone Logik.

---

## Ordnerstruktur

- **store.ts** – Erstellung des Stores (`configureStore`), Export von `RootState`, `AppDispatch` sowie der typisierten Hooks `useAppDispatch` und `useAppSelector`.
- **types.ts** – Gemeinsame Typen (z. B. `LoadingStatus`).
- **\*Slice.ts** – Ein Slice pro Domäne: auth, bookings, campingPlaces, campingItems, analytics, ui.

Die App bindet den Store einmal in `main.tsx` ein:

```tsx
<Provider store={store}><App /></Provider>
```

---

## configureStore und Root-State

**store.ts** baut den Store mit `configureStore` und einem Objekt aus Reducern. Die Keys (`auth`, `bookings`, …) sind die Slice-Namen und erscheinen im State unter `state.auth`, `state.bookings` usw.

**RootState** und **AppDispatch** werden aus dem Store abgeleitet:

- `RootState = ReturnType<typeof store.getState>` – Typ des kompletten States (wichtig für Selectors und typisierte Hooks).
- `AppDispatch = typeof store.dispatch` – Typ der Dispatch-Funktion (für Thunks und Actions).

```tsx
export const store = configureStore({ reducer: { auth: authReducer, bookings: bookingsReducer /* … */ } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Neue Slices: Reducer in `store.ts` registrieren und ggf. in Selectors weiterverwenden.

---

## useAppDispatch und useAppSelector (store.ts)

Statt `useDispatch` und `useSelector` von `react-redux` werden die typisierten Varianten aus **store.ts** verwendet:

- **useAppDispatch()** – liefert `AppDispatch`; damit sind Thunk-Aufrufe und Action-Typen korrekt.
- **useAppSelector(selector)** – der Selector erhält automatisch `RootState`; Rückgabetyp wird aus dem Selector abgeleitet.

So bleiben Typen beim Lesen und Dispatchen durchgängig stimmig. Neue Komponenten sollten nur diese Hooks importieren.

```tsx
import { useAppDispatch, useAppSelector } from '@/store/store';

const dispatch = useAppDispatch();
const bookings = useAppSelector(bookingsSelectors.selectAll);
dispatch(fetchBookings());
```

---

## createSlice – Grundaufbau

Jeder Slice wird mit **createSlice** definiert:

- **name:** Eindeutiger Slice-Name (z. B. `'bookings'`). Präfix für alle generierten Action-Types (inkl. der Thunk-Lifecycle-Actions).
- **initialState:** Startzustand des Slices. Bei EntityAdapter: `adapter.getInitialState({ … })`.
- **reducers:** Synchrone Reducer (z. B. `logout`, `clearError`). Erzeugen Action Creator; diese exportieren: `export const { logout } = slice.actions`.
- **extraReducers:** Reagieren auf externe Actions. In diesem Projekt fast ausschließlich auf Thunk-Lifecycle: `builder.addCase(thunk.pending, …)`, `.addCase(thunk.fulfilled, …)`, `.addCase(thunk.rejected, …)`.

Export: `export default slice.reducer` (für `store.ts`) und `export const { action1, action2 } = slice.actions` für synchrone Actions.

```tsx
const slice = createSlice({
  name: 'auth',
  initialState: { employee: null, token: null, status: 'idle', error: null },
  reducers: { logout: (state) => { state.token = null; state.employee = null; } },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => { state.token = action.payload.token; /* … */ });
  },
});
export default slice.reducer;
export const { logout } = slice.actions;
```

---

## Immer und „Mutation“ im Reducer

Redux Toolkit nutzt **Immer**. In Reducern darf „mutierend“ geschrieben werden (`state.status = 'loading'`), Immer erzeugt daraus ein neues State-Objekt. So bleibt der Code lesbar, ohne manuell zu kopieren. Nur innerhalb von Reducern (reducers/extraReducers) – außerhalb niemals State direkt ändern.

```tsx
builder.addCase(fetchBookings.pending, (state) => {
  state.status = 'loading';
  state.error = null;
});
```

---

## createAsyncThunk – asynchrone Aktionen

Für API-Calls und andere asynchrone Aktionen wird **createAsyncThunk** verwendet:

- **Typ:** `createAsyncThunk<ReturnType, ArgType, { rejectValue: string }>(typePrefix, payloadCreator)`.
  - **ReturnType:** Das, was der Thunk bei Erfolg zurückgibt (wird zu `action.payload` in fulfilled). Z. B. `Booking[]`, `Booking`, `number` (bei delete: Id).
  - **ArgType:** Argument beim Aufruf, z. B. `void`, `number` (id), `BookingFormData`, `{ id: number; data: Partial<BookingFormData> }`.
  - **rejectValue:** Typ von `action.payload` bei rejected – hier immer `string`, damit die Fehlermeldung typensicher aus dem State gelesen werden kann.
- **typePrefix:** Eindeutiger String, z. B. `'bookings/fetchAll'`. Daraus werden die Action-Types `bookings/fetchAll/pending`, `…/fulfilled`, `…/rejected`.
- **payloadCreator:** Async-Funktion `(arg, { rejectWithValue, … }) => Promise<ReturnType>`. Bei Fehler im catch `return rejectWithValue(message)` verwenden (nicht `throw`), damit die Meldung in `action.payload` landet.

Im **extraReducers** die drei Fälle abdecken:

- **pending:** Liste-Thunks: `status = 'loading'`, `error = null`. Mutations (create/update/delete): nur `mutationError = null`, damit der List-Status unverändert bleibt.
- **fulfilled:** Rückgabe des Thunks ist `action.payload`. Entität/Liste per Adapter in den State schreiben (setAll, addOne, upsertOne, removeOne); bei removeOne ist `action.payload` die Id.
- **rejected:** `error` bzw. `mutationError = action.payload ?? action.error.message ?? 'Fehler'`. `action.payload` ist gesetzt, wenn im Thunk `rejectWithValue(msg)` verwendet wurde.

```tsx
const fetchBookings = createAsyncThunk<Booking[], Record<string, string> | undefined, { rejectValue: string }>(
  'bookings/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await bookingsApi.fetchBookings(filters);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Fehler');
    }
  }
);
// extraReducers: pending → state.status='loading', state.error=null; fulfilled → adapter.setAll(state, action.payload); rejected → state.error=action.payload ?? 'Fehler'
```

---

## createEntityAdapter – Listen von Entitäten

Für Listen von Objekten mit **eindeutiger Id** (Bookings, CampingPlaces, CampingItems) wird **createEntityAdapter** genutzt. Der Adapter speichert die Liste **normalisiert**: statt eines Arrays gibt es `state.ids` (Reihenfolge der Ids) und `state.entities` (Map `id → Entität`). So lassen sich einzelne Entitäten per Id effizient lesen und aktualisieren.

- **createEntityAdapter&lt;Entity&gt;()** – Erwartet Entitäten mit Feld `id` (Standard; anderes Id-Feld ist konfigurierbar).
- **initialState:** `adapter.getInitialState({ status: 'idle', error: null, mutationError: null, … })` – der Adapter legt `ids: []` und `entities: {}` an; alle weiteren Slice-Felder (status, error, mutationError, ggf. statusChanges) werden als zweites Argument übergeben und liegen im gleichen State-Objekt.
- **Adapter-Methoden als Reducer:** Die Methoden haben die Signatur `(state, action) => void`. Sie lesen die nötigen Daten aus `action.payload`. Daher kann man sie direkt als Reducer übergeben, z. B. `.addCase(createBooking.fulfilled, adapter.addOne)` – Redux ruft dann `adapter.addOne(state, action)` auf.

**Welche Methode wann:**

| Thunk / Aktion   | fulfilled payload     | Adapter-Methode | Erklärung |
|------------------|------------------------|-----------------|-----------|
| fetchAll         | `Booking[]`            | **setAll**      | Gesamte Liste ersetzen (z. B. nach Filter). |
| fetchById        | `Booking`              | **upsertOne**   | Eine Entität einfügen oder aktualisieren. |
| create           | `Booking` (neu von Server) | **addOne**  | Nur hinzufügen (Id existiert vorher nicht). |
| update / changeStatus | `Booking`         | **upsertOne**   | Bestehende Entität aktualisieren. |
| delete           | `number` (id)          | **removeOne**   | Payload ist die Id; ggf. zusätzliches Slice-State aufräumen (z. B. `delete state.statusChanges[action.payload]`). |

**addOne vs. upsertOne:** `addOne` fügt genau eine neue Entität hinzu (für Create). `upsertOne` fügt ein oder ersetzt eine bestehende (für FetchById, Update, Statusänderung). Bei Create liefert der Server die neue Id; `addOne` reicht. Bei Update soll die vorhandene Entität aktualisiert werden → `upsertOne`.

**Selectors:** `adapter.getSelectors((state: RootState) => state.bookings)` liefert u. a. `selectAll` (Entitäten in Reihenfolge von `ids`), `selectById(id)`, `selectIds`, `selectEntities`. Export als z. B. `bookingsSelectors`; in Komponenten `useAppSelector(bookingsSelectors.selectAll)` oder `useAppSelector(bookingsSelectors.selectById(id))`.

**Memoized Selectors:** Für häufig abgeleitete Daten (z. B. nur aktive Entitäten, Filterung nach Status) werden `createSelector`-basierte Selectors exportiert. Diese werden nur neu berechnet, wenn sich die Eingabedaten ändern, und verhindern so unnötige Re-Renders. Beispiele: `selectActiveCampingPlaces`, `selectActiveCampingItems`, `selectActiveBookings`, `selectBookingsByStatus`. Bei `selectBookingsByStatus(state, status)` bedeutet `status` optional: `null`/`undefined` = alle Buchungen, ansonsten Filter nach diesem Status.

```tsx
const adapter = createEntityAdapter<Booking>();
const initialState = adapter.getInitialState({
  status: 'idle' as LoadingStatus,
  error: null as string | null,
  mutationError: null as string | null,
  statusChanges: {} as Record<number, BookingStatusChange[]>,
});

// extraReducers – Beispiele aus bookingsSlice:
.addCase(fetchBookings.fulfilled, (state, action) => {
  state.status = 'succeeded';
  adapter.setAll(state, action.payload);
})
.addCase(createBooking.fulfilled, adapter.addOne)
.addCase(updateBooking.fulfilled, adapter.upsertOne)
.addCase(deleteBooking.fulfilled, (state, action) => {
  adapter.removeOne(state, action.payload);
  delete state.statusChanges[action.payload];
})

export const bookingsSelectors = adapter.getSelectors((s: RootState) => s.bookings);
```

Zusätzliche Slice-Felder (z. B. `statusChanges` pro Booking) liegen außerhalb des Adapters im gleichen State und werden in eigenen `addCase`-Zweigen gepflegt.

---

## Slice-Typen im Projekt

- **auth:** Kein EntityAdapter. State: employee, token, status, error. Thunks: login, signup, fetchMe. Reducers: logout, clearError. Spezial: Token in localStorage, Initialisierung aus localStorage.
- **bookings, campingPlaces, campingItems:** EntityAdapter + status/error/mutationError. CRUD-Thunks; bei bookings zusätzlich changeBookingStatus und fetchBookingStatusChanges (statusChanges pro id).
- **analytics:** Kein Adapter. State: data, status, error. Ein Thunk: fetchAnalytics.
- **ui:** Nur synchrone Reducer (sidebarCollapsed, mobileNavOpen, theme). Keine Thunks.

---

## LoadingStatus und types.ts

**LoadingStatus** = `'idle' | 'loading' | 'succeeded' | 'failed'` wird in mehreren Slices für `status` verwendet. Liegt in **types.ts**, damit alle Slices den gleichen Typ nutzen und keine Zirkelimporte entstehen.

```ts
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
```

---

## Konventionen in Kürze

1. **Immer nur** `useAppDispatch` und `useAppSelector` aus `@/store/store` verwenden.
2. **Async-Logik** nur in createAsyncThunk; API-Calls in den Thunks, keine fetches direkt in Komponenten für Store-Daten.
3. **Fehlerbehandlung:** In Thunks `rejectWithValue` mit Fehlermeldung; in extraReducers `action.payload ?? action.error.message ?? 'Fehler'` für Anzeige.
4. **Entity-Listen:** createEntityAdapter nutzen; zusätzliche Felder (status, error, mutationError, statusChanges) im getInitialState bzw. in extraReducers pflegen.
5. **Reducer schlank halten:** Nur „was der Server zurückgibt / was die Aktion bedeutet“ in den State schreiben; keine Geschäftslogik im Reducer (z. B. Preisberechnung in shared/ oder Komponenten).
6. **Neue Slice:** createSlice (ggf. mit createEntityAdapter), Thunks exportieren, Reducer in store.ts registrieren, Selectors exportieren und in Komponenten über die Hooks nutzen.
