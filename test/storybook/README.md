# Storybook – Übersicht und Konventionen

Kurze Erklärung der Storybook-Eigenheiten **in diesem Projekt** (Camping Place Manager): wofür Provider, MemoryRouter, Decorators und weitere Begriffe verwendet werden. Ordner, Komponenten- und Dateinamen beziehen sich auf die hiesige Codebasis.

---

## Was ist Storybook?

Storybook rendert UI-Komponenten isoliert in einer eigenen Umgebung. Jede **Story** ist eine Variante einer Komponente (z. B. „Default“, „Mit Fehler“, „Loading“). Die App läuft nicht – es gibt keinen echten Server, keine echte Navigation – daher müssen Abhängigkeiten (Redux, Router) gezielt nachgebaut werden.

---

## Ordnerstruktur

Stories liegen unter `test/storybook/` und spiegeln die App-Struktur:

- `components/ui/` – Button, Card, Input, Badge, Dialog …
- `components/layout/` – PageHeader, EmptyState
- `features/<domain>/components/` – z. B. BookingCard, BookingFormContent, LoginPage

Eine Story-Datei heißt `*.stories.tsx` und lebt neben der Komponente oder in der gleichen Feature-Struktur.

---

## Provider (Redux)

**Wofür:** Komponenten, die `useAppSelector` oder `useAppDispatch` nutzen, brauchen einen Redux-Store. Ohne `<Provider store={…}>` werfen die Hooks einen Fehler.

**Wo:** Nur in Stories von Seiten/Hooks, die Redux verwenden (z. B. LoginPage, SignupPage). Reine UI-Komponenten (Button, Card) oder Komponenten, die nur Props bekommen (BookingCard, BookingFormContent), brauchen keinen Provider.

**Konvention:** Store so schlank wie nötig. Die Login-/Signup-Stories nutzen nur den Auth-Slice: `configureStore({ reducer: { auth: authReducer } })`. Weitere Slices (bookings, campingPlaces, …) nur einbinden, wenn die Komponente sie wirklich braucht.

```tsx
const store = configureStore({ reducer: { auth: authReducer } });
// In Decorator: <Provider store={store}><Story /></Provider>
```

---

## MemoryRouter (React Router)

**Wofür:** Komponenten, die React-Router-APIs nutzen (`Link`, `Navigate`, `useNavigate`, `useLocation`, `useParams`, `Outlet`), benötigen einen Router-Kontext. Ohne Router schlagen diese Hooks bzw. Komponenten fehl.

**Warum MemoryRouter und nicht BrowserRouter?** Storybook läuft außerhalb des Browsers (bzw. ohne echte URL-Leiste). `MemoryRouter` arbeitet mit einer im Speicher gehaltenen „URL“ und eignet sich für Tests und Storybook. `BrowserRouter` würde die echte History des Tabs nutzen und ist in Storybook unnötig und fehleranfällig.

**Wichtig – nur ein Router:** React erlaubt keinen Router innerhalb eines anderen Routers. Wenn der **Meta-Decorator** bereits `Provider` + `MemoryRouter` um jede Story legt und eine **Story** zusätzlich wieder `MemoryRouter` + Komponente rendert, liegt ein Router im anderen → Fehler. Daher: Entweder der Meta-Decorator stellt nur den Provider (und jede Story, die Router braucht, fügt genau einen MemoryRouter hinzu), oder die Story rendert komplett selbst (Provider + MemoryRouter + Komponente) und umgeht den Meta-Decorator für den Inhalt. Siehe Auth-Stories (LoginPage/SignupPage) als Muster.

```tsx
<MemoryRouter initialEntries={['/login']}>
  <Story />
</MemoryRouter>
```

---

## Decorators

**Wofür:** Decorators wrappen die gerenderte Story mit gemeinsamer UI oder Kontext (Provider, Router, Layout-Container).

- **Meta-Decorators** (`meta.decorators`): gelten für **alle** Stories der Datei. Sie werden zuerst angewendet (die Story wird in sie „reingereicht“).
- **Story-Decorators** (pro `export const XY: Story`): gelten nur für diese eine Story. Sie wrappen das, was der Meta-Decorator bereits um die Story gelegt hat.

**Reihenfolge:** Zuerst wird die Story-Funktion gerendert, dann die Story-Decorators, dann die Meta-Decorators. Das Ergebnis ist also von innen nach außen: Story → Story-Decorator → Meta-Decorator. Wenn der Meta-Decorator einen Router einbaut und der Story-Decorator noch einen Router um die bereits gewrappte Story legt, hat man zwei Router → Fehler. Daher bei Bedarf nur **einen** Ort für den Router wählen (z. B. nur im Meta oder nur in der Story).

**Beispiel:** In den Auth-Stories stellt der Meta-Decorator nur den Provider. Die „Default“-Story fügt einen MemoryRouter hinzu. Die Stories „WithError“ und „Loading“ rendern komplett selbst: Provider + MemoryRouter + Seite (kein weiterer Router).

```tsx
// Meta: für alle Stories
decorators: [(Story) => <Provider store={store}><Story /></Provider>]
// Story: nur diese Story
decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>]
```

---

## Meta (default export)

Das **meta**-Objekt konfiguriert die Komponente und alle ihre Stories:

- **title:** Pfad in der Sidebar, z. B. `'Features/Auth/LoginPage'` oder `'UI/Button'`.
- **component:** Die Komponente, für die Stories geschrieben werden (wird u. a. für Autodocs genutzt).
- **parameters:** Optionen für Layout, Docs, Tests usw. (siehe unten).
- **tags:** z. B. `['autodocs']` – erzeugt automatisch eine Docs-Seite aus den Props.
- **decorators:** Wrapper für alle Stories (z. B. Provider, Router).
- **args:** Standard-Argumente für alle Stories (können pro Story überschrieben werden).
- **argTypes:** Steuerung der Controls (z. B. `variant: { control: 'select', options: ['default', 'destructive'] }`).

Mit `satisfies Meta<typeof Component>` bleibt TypeScript typkorrekt, ohne den Typ von meta zu verändern.

```tsx
const meta = {
  title: 'Features/Auth/LoginPage',
  component: LoginPage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [/* … */],
} satisfies Meta<typeof LoginPage>;
export default meta;
```

---

## Stories (named exports)

Jede **Story** ist ein exportiertes Objekt vom Typ `StoryObj<typeof meta>`:

- **args:** Props, die an die Komponente übergeben werden. Ersetzen oder ergänzen die Meta-args.
- **render:** Optionale eigene Render-Funktion, wenn die Story nicht einfach nur die Komponente mit args rendern soll (z. B. Wrapper mit lokalem State oder Dialog).
- **decorators:** Zusätzliche Wrapper nur für diese Story (z. B. MemoryRouter, fester Store).
- **parameters:** Z. B. `docs: { description: { story: '…' } }` für die Beschreibung in den Docs.

Ohne `render` wird die Komponente mit den zusammengeführten args gerendert.

```tsx
export const Default: StoryObj<typeof meta> = {
  args: { title: 'Buchung' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};
```

---

## Parameters

- **layout: 'centered':** Die Story wird in der Mitte des Canvas zentriert (üblich für Buttons, Cards, Formulare).
- **docs.description / docs.description.story:** Fließtext in der Docs-Tab für die jeweilige Story.
- Weitere Parameter steuern Addons (a11y, Chromatic, Vitest usw.).

Globale Parameter (z. B. Controls-Matcher, a11y) stehen in `.storybook/preview.ts`.

---

## args und argTypes

- **args:** Werte für die Props der Komponente. Erscheinen in den **Controls** und können dort verändert werden (wenn nicht `control: false`).
- **argTypes:** Definiert z. B. `control: 'select'` mit `options`, um Dropdowns statt Freitext zu haben, oder deaktiviert Controls für einzelne Props.

```tsx
args: { variant: 'default', disabled: false }
argTypes: { variant: { control: 'select', options: ['default', 'destructive'] } }
```

---

## fn() (Storybook Test-Utilities)

`import { fn } from 'storybook/test'` liefert eine Mock-Funktion für Callbacks (z. B. `onEdit`, `onDelete`). In Storybook siehst du in der „Actions“-Leiste, wenn die Funktion aufgerufen wurde und mit welchen Argumenten. So kannst du Callback-Props testen, ohne echte Logik auszuführen.

```tsx
import { fn } from 'storybook/test';
// in Story:
args: { onEdit: fn(), onDelete: fn() }
```

---

## Addons (dieses Projekt)

- **@storybook/addon-docs:** Dokumentation und „Docs“-Tab pro Komponente, inkl. Autodocs aus Props.
- **@storybook/addon-a11y:** Prüft Barrierefreiheit (z. B. Kontrast, Labels). In `preview.ts` mit `test: 'todo'` konfiguriert.
- **@storybook/addon-vitest:** Ermöglicht, Stories mit Vitest zu testen.
- **@chromatic-com/storybook:** Optional für visuelle Regressionstests (Chromatic).
- **@storybook/addon-onboarding:** Onboarding für neue Nutzer.

Controls (Props ändern) und Actions (Callback-Aufrufe) sind Teil des Storybook-Kerns.

---

## preview.ts (globale Einstellungen)

In `.storybook/preview.ts` werden u. a.:

- Die App-Styles eingebunden (`../src/styles/index.css`).
- Globale **parameters** gesetzt (z. B. Controls-Matcher für Farben/Daten, a11y-Einstellungen).

Hier werden **keine** globalen Provider oder Router eingebaut; jede Story-Datei kümmert sich selbst um Redux und Router, falls nötig.

---

## Kurz-Checkliste für neue Stories

1. Braucht die Komponente Redux? → `Provider` + `configureStore` mit nur den nötigen Reducern.
2. Braucht die Komponente Router (Link, Navigate, useNavigate …)? → genau **ein** `MemoryRouter` (entweder im Meta-Decorator oder in der Story, nie doppelt).
3. Callbacks (onClick, onEdit, onDelete)? → `fn()` aus `storybook/test` für nachvollziehbare Actions.
4. `meta`: `title`, `component`, `parameters: { layout: 'centered' }`, `tags: ['autodocs']`, ggf. `decorators`/`args`/`argTypes`.
5. Pro Story: `args`, optional `decorators`, `parameters.docs.description.story`, oder eigene `render`-Funktion.
