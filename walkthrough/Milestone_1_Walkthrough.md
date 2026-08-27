# Milestone 1 Walkthrough — Foundation & Auth

All tasks for **Milestone 1 — Foundation & Auth** are complete. The database schema is synced with Supabase PostgreSQL, test accounts are seeded, and both backend and frontend applications are verified.

---

## 1. What Was Built & Why

### Backend (`/backend`)
* **Supabase PostgreSQL & Prisma**: Connected using modern **Supavisor connection pooling** (`DATABASE_URL` for transaction pooling on port `6543`, `DIRECT_URL` for direct migrations on port `5432`).
* **Models**: `Business`, `User`, and `Role` enum (`SUPER_ADMIN`, `BUSINESS_ADMIN`, `STAFF_FULL`, `STAFF_BASIC`).
* **Tenant Isolation**: Implemented `src/lib/tenantClient.ts` (`forBusiness(businessId)`) which ensures all business data queries filter by `businessId`.
* **Authentication API**:
  * `POST /auth/login`: Authenticates user with bcrypt password verification, returning JWT access token (`15m`) and refresh token (`7d`).
  * `POST /auth/refresh`: Rotates expired access tokens using a valid refresh token.
  * `GET /auth/me`: Protected endpoint returning user profile and active business assignment.
* **Middlewares**: `authenticate` (verifies JWT), `attachTenant` (extracts tenant ID), `authorize(permission)` (role permission map).
* **Seeding**: Created `prisma/seed.ts` populated with accounts for all 4 roles.

### Frontend (`/frontend`)
* **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query.
* **Design Token System**: Custom Tailwind palette defined in `tailwind.config.js` (`ink`, `canvas`, `surface`, `teal`, `brass`, `border`, `muted`, `success`, `warning`, `error`).
* **Base UI Components**: Created reusable `Button`, `Input`, and `Card` components adhering strictly to design token rules.
* **Auth & Routing**: `AuthContext` with automatic token refresh rotation on HTTP 401, `LoginPage` with **Quick-Fill buttons**, and `ProtectedRoute` guarding dashboard access.

---

## 2. Seeded Test Accounts

| Role | Email | Password | Business Scope |
| --- | --- | --- | --- |
| **Super Admin** | `superadmin@platform.com` | `SuperAdmin123!` | Global (Platform-wide) |
| **Business Admin** | `admin@stitchandstyle.com` | `Admin123!` | `Stitch & Style Tailors` |
| **Staff Full** | `staff.full@stitchandstyle.com` | `Staff123!` | `Stitch & Style Tailors` |
| **Staff Basic** | `staff.basic@stitchandstyle.com` | `Staff123!` | `Stitch & Style Tailors` |

---

## 3. How to Run & Test

You can now start both the backend and frontend at once from the root directory:

```bash
# Run both Backend (Port 5000) and Frontend (Port 3000) simultaneously
npm run dev
```

1. Open `http://localhost:3000/login`.
2. Click any of the **Development Test Accounts** quick-fill buttons.
3. Click **Sign In** to log in and inspect the protected dashboard shell.

---

## 4. How Prisma Works in This Application

Prisma is an Object-Relational Mapper (ORM) that acts as the type-safe bridge between our Express backend typescript code and the PostgreSQL database on Supabase.

Here is step-by-step how Prisma operates in our project:

```
┌──────────────────────────┐        ┌─────────────────────────────┐        ┌──────────────────────────┐
│  Express Route Handler   │        │     Tenant Client Wrapper   │        │    Prisma Query Engine   │
│  (e.g., login, findMany) │ ─────► │  forBusiness(businessId)    │ ─────► │   (Auto-generated TS)   │
└──────────────────────────┘        └─────────────────────────────┘        └────────────┬─────────────┘
                                                                                        │
                                                                                        ▼
                                                                           ┌──────────────────────────┐
                                                                           │  Supabase Postgres DB    │
                                                                           │  (Supavisor Pooler:6543) │
                                                                           └──────────────────────────┘
```

1. **Schema Definition (`backend/prisma/schema.prisma`)**:
   - Defines PostgreSQL tables (`Business`, `User`), field types (`String`, `DateTime`), relations, and `Role` enum.
   - Configured with dual connection URLs:
     - `url = env("DATABASE_URL")`: Transaction connection pooler (port `6543`) for high-concurrency runtime API queries.
     - `directUrl = env("DIRECT_URL")`: Direct PostgreSQL connection (port `5432`) for schema migrations and DDL operations.

2. **Client Generation (`@prisma/client`)**:
   - When running `npx prisma db push` or `npx prisma generate`, Prisma inspects `schema.prisma` and generates a fully type-safe TypeScript client in `node_modules/@prisma/client`.
   - Autocompletes all fields and enforces type checks at compile time.

3. **Runtime Execution (`backend/src/lib/prisma.ts`)**:
   - Singleton instance of `PrismaClient` instantiated once across the server process.
   - Converts JavaScript/TypeScript method calls (e.g. `prisma.user.findUnique({ where: { email } })`) into optimized SQL statements sent over TCP to Supabase.

4. **Tenant Isolation Layer (`backend/src/lib/tenantClient.ts`)**:
   - Wraps Prisma queries with `forBusiness(businessId)`.
   - Automatically injects `{ where: { ...args.where, businessId } }` into every database call so multi-tenant isolation is structurally guaranteed.

