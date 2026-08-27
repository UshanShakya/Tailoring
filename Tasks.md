# Tasks — Milestones & Sprints

Work through milestones **in order**. Do not begin a milestone until the
previous one is marked "Done" in `Progress_Tracker.md`. Each task below
should map to roughly one focused work session/commit.

---

## Milestone 1 — Foundation & Auth

- [ ] Create Supabase project and get `DATABASE_URL`
- [ ] Initialize backend project (Express + TypeScript + Prisma, pointed
      at Supabase Postgres)
- [ ] Initialize frontend project (React + TypeScript + Tailwind)
- [ ] Set up Prisma schema: `Business`, `User`, `Role` enum
- [ ] Implement `POST /auth/login` (email + password → JWT access + refresh)
- [ ] Implement `POST /auth/refresh`
- [ ] Implement `authenticate` middleware (verifies JWT, attaches `req.user`)
- [ ] Implement `attachTenant` middleware (sets `req.businessId` from token)
- [ ] Implement `authorize(permission)` middleware using the fixed
      permission map
- [ ] Frontend: auth context/provider, login page, protected route wrapper
- [ ] Seed script: one Super Admin user

**Milestone done when:** a Super Admin and a business user can both log in,
receive a token, and hit a protected test route with correct 401/403
behavior.

---

## Milestone 2 — Business & User Management (Super Admin)

- [ ] `GET/POST/PATCH /admin/businesses`
- [ ] `GET/POST /admin/users` (create Business Admin for a new business)
- [ ] Frontend: Super Admin dashboard — list/create/deactivate businesses
- [ ] Frontend: Super Admin — create Business Admin user for a business
- [ ] Business Admin: `GET/POST/PATCH /users` (manage own staff, scoped)
- [ ] Frontend: Business Admin — staff management page (create Full/Basic
      staff, activate/deactivate)

**Milestone done when:** a Super Admin can create a new business + its
first admin, and that admin can log in and create staff users under
their own business only.

---

## Milestone 3 — Customer Management

- [ ] Prisma model: `Customer`
- [ ] Tenant-scoped Prisma client wrapper (`lib/tenantClient.ts`)
- [ ] `GET/POST/PATCH /customers` (Staff Basic + Full + Admin)
- [ ] Frontend: customer list, create/edit customer form, customer detail
      page shell

**Milestone done when:** Staff Basic and Staff Full users can create,
view, and edit customers, and cannot see another business's customers.

---

## Milestone 4 — Garment Types & Measurement Templates

- [ ] Prisma models: `GarmentType`, `MeasurementTemplate`, `TemplateField`
- [ ] Seed script: standard system-default garment types + templates
      (Shirt, Trousers, Suit, Kurta, Blazer — with realistic standard
      fields for each)
- [ ] `GET /garment-types` (merges system defaults + business-owned)
- [ ] `GET/POST/PATCH /measurement-templates` (business can clone a system
      default into their own customizable copy)
- [ ] Frontend: garment type list, template viewer, "customize this
      template" flow for Business Admin

**Milestone done when:** every business sees a working set of standard
templates out of the box, and a Business Admin can customize one without
affecting other businesses or the global defaults.

---

## Milestone 5 — Measurements

- [ ] Prisma model: `Measurement` (references a concrete `templateId`)
- [ ] `POST /customers/:id/measurements` (loads template, validates values
      against template fields)
- [ ] `GET /customers/:id/measurements` (history, ordered by version/date)
- [ ] Frontend: "Add Measurement" flow — pick garment type → template
      fields render dynamically → save
- [ ] Frontend: measurement history view per customer

**Milestone done when:** a staff user can add a measurement for a
customer using a template-driven form, and view that customer's full
measurement history.

---

## Milestone 6 — Orders

- [ ] Prisma model: `Order`
- [ ] `GET/POST/PATCH /orders`
- [ ] Frontend: create order (linked to customer + garment items), order
      list with status filter, order detail/status update

**Milestone done when:** Staff Full/Admin can create an order for a
customer and move it through status states.

---

## Milestone 7 — Invoices & Payments

- [ ] Prisma models: `Invoice`, `Payment`
- [ ] `GET/POST/PATCH /invoices`
- [ ] `POST /payments` (supports partial payments against an invoice)
- [ ] Frontend: generate invoice from order, record payment, payment
      history per invoice/customer

**Milestone done when:** Staff Full/Admin can invoice an order, record
one or more payments against it, and see accurate paid/unpaid status.

---

## Milestone 8 — Dashboards, Audit Log, Polish

- [ ] `AuditLog` model + write on key actions (payment recorded, order
      status changed, user created)
- [ ] Business dashboard: pending orders, outstanding payments, recent
      activity
- [ ] Super Admin dashboard: businesses overview, basic platform stats
- [ ] Final UI pass against `UIUX.md` tokens (no raw colors anywhere)
- [ ] Deployment setup (backend host, frontend host — database is
      already on Supabase from Milestone 1; decide whether prod uses the
      same Supabase project or a separate one)

**Milestone done when:** both dashboards are functional, the UI fully
complies with the design tokens, and the app is deployed to a live URL.

## Milestone 9 — Global UX & Application Quality of Life
- [ ] Create reusable application TopBar component
- [ ] Add global search to the top bar
      - [ ] Super Admin: search across all businesses, users, customers, orders, invoices, etc. that they have permission to access
      - [ ] Business Admin: search across their own business data only
      - [ ] Staff: search only across resources they are authorized to access
      - [ ] Search results must respect existing tenant and permission boundaries
      - [ ] Search should navigate directly to the selected resource
- [ ] Create reusable BackButton / navigation component
      - [ ] Use browser history where appropriate
      - [ ] Provide sensible fallback navigation when there is no usable history
      - [ ] Use consistently on detail/create/edit pages
- [ ] Implement application-wide theme system
      - [ ] Light theme
      - [ ] Dark theme
      - [ ] Theme toggle in the top bar
      - [ ] Persist user's selected theme
      - [ ] Respect system theme on first visit
      - [ ] Ensure all existing UI components support both themes
- [ ] Establish reusable dropdown/select component
      - [ ] Install Select2 locally rather than loading it from a CDN
      - [ ] Create a reusable wrapper/component around Select2
      - [ ] Replace native <select> controls throughout the application where appropriate
      - [ ] Support single-select and multi-select where required
      - [ ] Support clearable selections
      - [ ] Support loading/empty/error states
- [ ] Implement searchable Select2/API-driven selection
      - [ ] For small/static datasets, load options normally
      - [ ] For large datasets, do not load the entire dataset into the browser
      - [ ] Start API searching after 3 characters
      - [ ] Add debounce to prevent excessive API requests
      - [ ] Add pagination/limit to API search results
      - [ ] Show loading state while searching
      - [ ] Ensure API searches remain tenant- and permission-scoped
- [ ] Standardize application-wide loading, empty, and error states
      - [ ] Review navigation and page layouts for consistency
      - [ ] Top bar
      - [ ] Sidebar/navigation
      - [ ] Page headers
      - [ ] Back navigation
      - [ ] Action buttons
      - [ ] Detail pages
      - [ ] Forms
- [ ] Implement invoice-specific print styling
      - [ ] Printing an invoice must print only the invoice
      - [ ] Hide sidebar, top bar, navigation, buttons, and other page content when printing
      - [ ] Ensure invoice layout is suitable for physical printing
      - [ ] Add appropriate @media print styles
      - [ ] Ensure print output does not include unnecessary application UI
- [ ] Standardize monetary display across the application
      - [ ] Use Nepalese Rupees (NPR / Rs.)
      - [ ] Store monetary values as appropriate numeric/decimal values, not formatted strings
      - [ ] Create reusable currency formatting utility/component
      - [ ] Use consistent decimal and thousand separators
      - [ ] Use the same formatting in orders, invoices, payments, dashboards and reports

Milestone done when: the application has a consistent global navigation experience with role-aware search, back navigation, light/dark themes, a reusable locally installed Select2 implementation, API-backed searching for large datasets, invoice-only printing, and consistent NPR monetary formatting.