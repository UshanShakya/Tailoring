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


### Milestone 10 — Company Setup, Pricing & Nepal Billing

- [x] Create Prisma model for global/business company setup
      - [x] Company/business name
      - [x] Address
      - [x] PAN number
      - [x] Contact number
      - [x] Email
      - [x] Logo/image
      - [x] Other information required for invoices
- [x] Implement company setup API
      - [x] GET /settings/company
      - [x] PATCH /settings/company
      - [x] Restrict modification to authorized Business Admin users
      - [x] Ensure each business can only manage its own company information
- [x] Implement company setup frontend
      - [x] Company name
      - [x] Address
      - [x] PAN
      - [x] Contact information
      - [x] Logo upload
      - [x] Preview
      - [x] Replace/remove logo
- [x] Integrate Cloudinary for company images
      - [x] Use Cloudinary free tier
      - [x] Compress/resize images before upload where appropriate
      - [x] Store Cloudinary URL/public identifier rather than image binary in PostgreSQL
      - [x] Validate supported image formats and reasonable file sizes
      - [x] Handle replacing/deleting previous company logo
- [x] Review garment/product pricing model
- [x] Make garment/product type pricing optional
      - [x] Default price may be null
      - [x] A garment type/product can exist without a predefined price
- [x] Update order creation
      - [x] Unit price must not be required
      - [x] When creating an order, automatically use the configured garment/product price when one exists
      - [x] Allow the resulting unit price to remain null when no configured price exists
      - [x] Allow authorized users to manually provide/override the price when appropriate
      - [x] Do not prevent order creation merely because a price has not yet been determined
- [x] Define invoice pricing behavior
      - [x] Clearly distinguish between configured/default price and the final order/invoice price
      - [x] Once an invoice is issued, preserve the price used for that invoice
      - [x] Changes to future garment/product pricing must not alter existing invoices
- [x] Implement proper invoice generation
      - [x] Generate invoice from an order
      - [x] Include company information
      - [x] Include company logo
      - [x] Include PAN
      - [x] Include customer information
      - [x] Include invoice number
      - [x] Include invoice date
      - [x] Include order/reference information
      - [x] Include garment/product descriptions
      - [x] Include quantities
      - [x] Include unit prices
      - [x] Include line totals
      - [x] Include subtotal
      - [x] Include applicable taxes/charges where configured
      - [x] Include total amount
      - [x] Include amount paid
      - [x] Include amount due
      - [x] Display amounts in NPR
- [x] Implement invoice numbering
      - [x] Define a reliable invoice-number generation strategy
      - [x] Ensure invoice numbers cannot accidentally be duplicated
      - [x] Ensure concurrent invoice creation cannot generate the same invoice number
      - [x] Preserve invoice numbers permanently once issued
- [x] Implement invoice lifecycle rules
      - [x] Draft invoice
      - [x] Issued/finalized invoice
      - [x] Paid/partially paid/unpaid state
      - [x] Prevent inappropriate modification of finalized billing information
      - [x] Keep historical invoice data stable
- [x] Review payment calculations
      - [x] Partial payments
      - [x] Total paid
      - [x] Remaining balance
      - [x] Overpayment prevention
      - [x] Invoice payment status
      - [x] NPR formatting
- [x] Update invoice print/PDF layout for actual customer billing
      - [x] Professional invoice layout
      - [x] Company branding
      - [x] Company PAN
      - [x] Customer details
      - [x] Invoice number/date
      - [x] Itemized charges
      - [x] Totals
      - [x] Payment status
      - [x] Suitable A4/standard printing layout
- [x] Review Nepal billing requirements before marking this milestone complete
      - [x] Verify required invoice/business fields
      - [x] Verify invoice numbering requirements
      - [x] Verify applicable tax/VAT fields based on the business's actual registration/status
      - [x] Verify required customer information
      - [x] Verify invoice retention/history requirements
      - [x] Avoid hard-coding assumptions where requirements depend on the business's tax status
- [x] Add tests for billing calculations and invoice generation
      - [x] Price available
      - [x] Price unavailable/null
      - [x] Partial payment
      - [x] Fully paid invoice
      - [x] Multiple payments
      - [x] Concurrent invoice creation
      - [x] Invoice remains unchanged after product price changes

**Milestone done when:** a Business Admin can configure their company's billing information and logo, orders can be created even when a price has not yet been determined, configured prices are automatically used when available, invoices preserve their final billing values, payments correctly update outstanding balances, and the resulting invoice contains the information required for the business's applicable Nepalese billing/tax requirements.


### Milestone 11 — Product Type Setup

- [x] There should be a product type setup
      - [x] Setup for like Shirt, Pant, etc, new product type
      - [x] Template will be mapped as per the product type.
      
**Milestone done when:** An admin can create a new product type,business admins can create their own template for the product type.


### Milestone 12 - Issue Fixes
- [x] The company details used in invoice should only be of our company the one that is managed by super admin, it should not be of the business admin. It could be of the business only for sub heading, like to which party but from should always be our admin company. 
- [x] The area of print is still not ok.
- [x] Admin cannot view all the orders, the orders should be seperated business wise , eveything should be seperated business wise in the UI for admin.
- [x] I still cannot see the Product Type crud operation page from the super admih, this should only be available for the super admin.

**Milestone done when:** Main admin company pan and details is being used. Print area only print a selected div. admin should be able to view orders seperately for businesses, product type crud with template management should be seen. 
 

### Milestone 13 - Remember Me in the Login UI
- [x] Add a remember me so that the login wont go away for some time. 
- [x] Remove the fill super admin details button and ui.

**Milestone done when:** Login when browser is closed if logged in when closing browser.
 

### Milestone 14 - Be able to change the user roles,
- [x] As admin and business admin, i am not able to update or assign roles to user, change roles basically . the super amdin should be able to assign roles to any user of any company whereas the business admin should be able to assign roles to user of that company except for business admins.

**Milestone done when:**  the super amdin should be able to assign roles to any user of any company whereas the business admin should be able to assign roles to user of that company except for business admins.
 