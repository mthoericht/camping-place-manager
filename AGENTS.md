# AGENTS.md

Camping place management tool: Next.js 15, React 18, TypeScript, Prisma, MongoDB.

## Commands

```bash
npm run dev          # Dev server
npm run build        # Build (includes typecheck)
npm test             # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run db:push      # Push schema to DB
```

## Architecture

| Layer | Location | Usage |
|-------|----------|-------|
| **Services** | `src/lib/services/` | Server-only (API Routes, Server Components) |
| **API Services** | `src/lib/api/` | Client-only (HTTP requests) |
| **Stores** | `src/stores/` | Client-only (`'use client'` components) |

**Never** import services in `'use client'` components.

## MongoDB ID Handling

```typescript
MongoDbHelper.toObjectId(id)        // String → ObjectId (queries)
MongoDbHelper.extractObjectId(_id)  // ObjectId → String (responses)
MongoDbHelper.extractBookingId(item)
MongoDbHelper.extractCampingPlaceId(booking)
```

## Code Style

- Allman-style braces (opening brace on new line)
- Path alias: `@/*` → `./src/*`
- Types centralized in `src/lib/types/index.ts`

## Key Files

- `prisma/schema.prisma` - DB schema
- `src/lib/types/index.ts` - Type definitions
- `src/lib/MongoDbHelper.ts` - ID/Date conversion
- `ARCHITECTURE.md` - Detailed docs
