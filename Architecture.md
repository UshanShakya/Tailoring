# Architecture

## 1. Tech Stack

**Frontend**
- React + TypeScript
- React Router
- TanStack Query (server state/caching)
- Zustand or React Context (light client state — auth session, UI state)
- React Hook Form + Zod (forms + validation)
- Tailwind CSS (see `UIUX.md` for token rules)

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL, hosted on Supabase (used for local dev AND production —
  same database from day one, no local Postgres install needed)
- Prisma ORM (connects to Supabase Postgres using modern Supavisor connection pooling: `DATABASE_URL` for transaction pooling and `DIRECT_URL` for CLI migrations — Supabase client SDK/auth/storage features are not used; it's just our managed Postgres)
- JWT (access token + refresh token) for auth — handled by our own
  Express backend, not Supabase Auth
- Zod for request validation

**Infra (when ready to deploy)**
- Backend: Railway / Render / Fly.io
- Frontend: Vercel / Netlify
- Database: Supabase (same instance used in local dev, or a separate
  Supabase project per environment if you want dev/prod separation)

### Local development setup

No Docker, no local Postgres install. Steps:

1. Create a free Supabase project (see `Supabase_Setup_Guide.md` for step-by-step instructions).
2. Copy the pooled connection string into `backend/.env` as `DATABASE_URL` and the direct connection string as `DIRECT_URL`.
3. Run `npx prisma migrate dev` against it — this is now both your local
   and eventual staging/production schema source.
4. Everyone on the team either shares one dev Supabase project or spins
   up their own free project — either works at this scale.

## 2. Multi-Tenancy Model

Shared database, `businessId` column on every business-scoped table
(tenant-per-row model). Chosen for cost and operational simplicity at
"dozens of businesses" scale.

**Enforcement mechanism:** a tenant-scoped Prisma client wrapper is the
only way route handlers touch business-scoped tables:

```ts
// lib/tenantClient.ts
export function forBusiness(businessId: string) {
  return {
    customer: {
      findMany: (args: Prisma.CustomerFindManyArgs = {}) =>
        prisma.customer.findMany({ ...args, where: { ...args.where, businessId } }),
      create: (data: Prisma.CustomerUncheckedCreateInput) =>
        prisma.customer.create({ data: { ...data, businessId } }),
      // ...update, delete, findUnique, etc.
    },
    measurement: { /* same pattern */ },
    order: { /* same pattern */ },
    invoice: { /* same pattern */ },
    payment: { /* same pattern */ },
  };
}
```

Route handlers receive `req.businessId` (set by middleware from the JWT)
and call `forBusiness(req.businessId).customer.findMany(...)` — there is
no code path where a developer can forget the filter.

Super Admin routes (`/admin/*`) are the only place that operate across
tenants, and only `SUPER_ADMIN` role can reach them.

## 3. Roles (fixed enum, not user-configurable for now)

```prisma
model Role {
  id          String   @id @default(uuid())
  businessId  String?  // null = system default role visible globally
  business    Business? @relation(fields: [businessId], references: [id])
  name        String   // e.g. "Super Admin", "Business Owner", "Senior Tailor", "Receptionist"
  description String?
  permissions Json     // Granted permission keys: ["menu:dashboard", "customer:create", ...]
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())

  users       User[]
}
```

Permissions are granted as granular key strings (e.g. `menu:dashboard`, `menu:staff`, `menu:roles`, `menu:customers`, `customer:create`, `customer:edit`, `staff:manage`, `role:manage`).

Middleware chain per protected route: `authenticate` → `attachTenant` → `authorize(permissionKey)`.

## 4. Data Model (Prisma schema, annotated)

```prisma
model Business {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  users               User[]
  customers           Customer[]
  garmentTypes        GarmentType[]        // business-owned custom types
  measurementTemplates MeasurementTemplate[] // business-owned custom/cloned templates
}

model User {
  id           String    @id @default(uuid())
  businessId   String?   // null only for SUPER_ADMIN
  business     Business? @relation(fields: [businessId], references: [id])
  name         String
  email        String    @unique
  passwordHash String
  role         Role
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
}

model Customer {
  id         String   @id @default(uuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  name       String
  phone      String?
  address    String?
  notes      String?
  createdBy  String
  createdAt  DateTime @default(now())

  measurements Measurement[]
  orders       Order[]
}

// --- Measurement Templates ---

model GarmentType {
  id         String   @id @default(uuid())
  businessId String?  // null = system default, visible to all businesses
  business   Business? @relation(fields: [businessId], references: [id])
  name       String   // e.g. "Shirt", "Trousers", "Suit", "Kurta"
  isSystemDefault Boolean @default(false)
  createdAt  DateTime @default(now())

  templates  MeasurementTemplate[]
}

model MeasurementTemplate {
  id            String   @id @default(uuid())
  businessId    String?  // null = system default
  business      Business? @relation(fields: [businessId], references: [id])
  garmentTypeId String
  garmentType   GarmentType @relation(fields: [garmentTypeId], references: [id])
  name          String   // e.g. "Standard Shirt Template"
  isSystemDefault Boolean @default(false)
  createdAt     DateTime @default(now())

  fields        TemplateField[]
  measurements  Measurement[]
}

model TemplateField {
  id          String   @id @default(uuid())
  templateId  String
  template    MeasurementTemplate @relation(fields: [templateId], references: [id])
  label       String   // "Chest", "Shoulder", "Sleeve Length"
  key         String   // "chest", "shoulder", "sleeveLength" — used as JSON key
  unit        String   // "in", "cm"
  dataType    String   // "number" | "text"
  order       Int
  required    Boolean  @default(true)
}

model Measurement {
  id          String   @id @default(uuid())
  businessId  String
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  templateId  String
  template    MeasurementTemplate @relation(fields: [templateId], references: [id])
  values      Json     // { chest: 40, waist: 34, ... } — keys match template fields
  version     Int      @default(1) // new row per edit, not overwrite — full history
  takenBy     String
  takenAt     DateTime @default(now())
}

// --- Orders / Invoicing ---

model Order {
  id         String   @id @default(uuid())
  businessId String
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  status     OrderStatus @default(PENDING)
  items      Json     // [{ garmentTypeId, description, qty, price }]
  dueDate    DateTime?
  createdBy  String
  createdAt  DateTime @default(now())

  invoices   Invoice[]
}

model Invoice {
  id         String   @id @default(uuid())
  businessId String
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  amount     Decimal
  status     InvoiceStatus @default(UNPAID)
  dueDate    DateTime?
  createdAt  DateTime @default(now())

  payments   Payment[]
}

model Payment {
  id         String   @id @default(uuid())
  businessId String
  invoiceId  String
  invoice    Invoice  @relation(fields: [invoiceId], references: [id])
  amount     Decimal
  method     String   // cash, card, upi, bank_transfer
  paidAt     DateTime @default(now())
  recordedBy String
}

model AuditLog {
  id         String   @id @default(uuid())
  businessId String
  userId     String
  action     String
  entityType String
  entityId   String
  timestamp  DateTime @default(now())
}

enum Role { SUPER_ADMIN BUSINESS_ADMIN STAFF_FULL STAFF_BASIC }
enum OrderStatus { PENDING IN_PROGRESS READY DELIVERED CANCELLED }
enum InvoiceStatus { UNPAID PARTIALLY_PAID PAID }
```

### How measurement templates behave in practice

- On business creation, no rows are copied — the business simply "sees"
  all `GarmentType`/`MeasurementTemplate` rows where `businessId IS NULL`
  (system defaults) merged with any rows where `businessId = theirs`
  (their own customizations/additions).
- If a business wants to customize a system template, the backend clones
  it into a business-scoped copy (`businessId` set, `isSystemDefault:
  false`) and the business's UI uses that copy going forward — the
  original system default and other businesses are unaffected.
- Taking a measurement always references a concrete `templateId`, so
  historical measurements remain valid even if a template is edited later.

## 5. API Structure

```
POST   /auth/login
POST   /auth/refresh

# Super Admin only
GET    /admin/businesses
POST   /admin/businesses
PATCH  /admin/businesses/:id
GET    /admin/users
POST   /admin/users

# Business Admin (own business only)
GET    /users
POST   /users
PATCH  /users/:id

# Business-scoped (businessId always from token)
GET/POST/PATCH   /customers
GET/POST/PATCH   /customers/:id/measurements
GET              /garment-types
GET/POST/PATCH   /measurement-templates
GET/POST/PATCH   /orders
GET/POST/PATCH   /invoices
POST             /payments
```

## 6. Frontend Structure

```
src/
 ├─ app/                 # routing, layout shells, providers
 ├─ features/
 │   ├─ auth/
 │   ├─ businesses/      # super admin only
 │   ├─ users/
 │   ├─ customers/
 │   ├─ measurements/
 │   │   └─ templates/   # garment type & template management
 │   ├─ orders/
 │   ├─ invoices/
 │   └─ payments/
 ├─ components/ui/       # shared design-system components (buttons, inputs, modals)
 ├─ lib/                 # api client, auth context, permission map
 └─ hooks/               # usePermission, useAuth, etc.
```

## 7. Backend Structure

```
src/
 ├─ modules/
 │   ├─ auth/
 │   ├─ businesses/
 │   ├─ users/
 │   ├─ customers/
 │   ├─ measurements/
 │   │   └─ templates/
 │   ├─ orders/
 │   ├─ invoices/
 │   └─ payments/
 ├─ middleware/          # authenticate, attachTenant, authorize
 ├─ lib/                 # tenantClient.ts, prisma.ts
 └─ validators/          # Zod schemas per module
```
