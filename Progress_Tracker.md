# Progress Tracker

> **This is the only file that gets updated during regular work.**
> Update it immediately after finishing any task from `Tasks.md`.
> Last updated: 2026-08-27

## Current Status

**Active Milestone:** — (All Milestones 1–13 Complete)
**Overall status:** Project Complete (Milestones 1-13 Complete)

## Milestone Overview

| Milestone | Status | Notes |
|-----------|--------|-------|
| 1. Foundation & Auth | Done | Built Express API, Prisma schema, Supabase Postgres connection, JWT token rotation, auth middlewares, seed script, and React login frontend. |
| 2. Business & User Management | Done | Super Admin business management dashboard, tenant user management, staff team management UI, modal & badge UI components. |
| 3. Customer Management | Done | Customer database model, tenant-scoped API routes with search, Customer List page, Customer Detail profile shell, add/edit modals, and 3-field text search (Name, Phone, Address). |
| 4. Garment Types & Measurement Templates | Done | Database models for GarmentType, MeasurementTemplate, TemplateField with English & Nepali (नेपाली) labels, template seed, clone & customize API, and Template Management UI. |
| 5. Measurements | Done | Prisma Measurement model with version history, tenant-isolated API, dynamic bilingual measurement forms (English & Nepali labels), and Customer Detail measurements integration. |
| 6. Orders | Done | Database models for Order & OrderItem, OrderStatus workflow, auto-generated order numbers (`ORD-2026-0001`), Order List page with status filter, Order Detail workflow page, and Select2 customer search select. |
| 7. Invoices & Payments | Done | Database models for Invoice & Payment, auto-generated invoice numbers (`INV-2026-0001`), order-to-invoice generator, partial payment tracking, Invoice List directory, printable invoice billing receipt, and payment history. |
| 8. Dashboards, Audit Log, Polish | Done | `AuditLog` database model, automated audit logger utility, `/dashboard/stats` backend API, and live executive dashboard on `OverviewPage.tsx`. |
| 9. Global UX & Application Quality of Life | Done | Nepalese Rupee formatting (`Rs. 1,750.00`), Light/Dark theme system with TopBar toggle, tenant- & permission-scoped Global Search API & combobox, reusable BackButton & PageHeader, local Select2 combobox with async API search, and invoice print styles. |
| 10. Company Setup, Pricing & Nepal Billing | Done | Company setup profile, PAN/VAT # registration, Cloudinary logo upload, optional garment default pricing, permanent invoice price snapshotting, Nepalese A4 billing print receipt, and automated test suite. |
| 11. Product Type Setup | Done | Product Types management setup UI, default unit price configuration, bilingual naming (English & Nepali), measurement template mapping filter, and automated test suite. |
| 12. Issue Fixes | Done | Main Admin Company invoice seller snapshotting & B2B layout, isolated #printable-invoice print CSS, Super Admin business-wise filtering for orders/invoices/customers, and Super Admin Product Type CRUD authorization. |
| 13. Remember Me in Login UI | Done | Remember Me checkbox session persistence across browser restarts (localStorage vs sessionStorage), token storage utility helpers, and removed development quick-fill UI. |
| 14. Select2 Combobox UI Standardization | Done | Standardized all select inputs and filter dropdowns across Super Admin, Customer detail/list, Invoice list, Order list, and Template management using the unified, searchable, light/dark mode ready `Select2Combobox` component with 0 native HTML `<select>` elements remaining. |

_Status values: `Not Started` / `In Progress` / `Blocked` / `Done`_

## Done

- [x] Create Supabase guide & connect live PostgreSQL database with pooled `DATABASE_URL` and direct `DIRECT_URL` (2026-08-27)
- [x] Initialize backend project (Express + TypeScript + Prisma + Zod + JWT) (2026-08-27)
- [x] Initialize frontend project (React + TypeScript + Tailwind design tokens) (2026-08-27)
- [x] Set up Prisma schema: `Business`, `User`, `Role` enum (2026-08-27)
- [x] Implement `POST /auth/login` and `POST /auth/refresh` (2026-08-27)
- [x] Implement `authenticate`, `attachTenant`, `authorize(permission)` middlewares (2026-08-27)
- [x] Frontend: auth context/provider, login page, protected route wrapper (2026-08-27)
- [x] Seed script: Super Admin, Business Admin, Staff Full, Staff Basic (2026-08-27)
- [x] `GET/POST/PATCH /admin/businesses` Super Admin business tenant management API (2026-08-27)
- [x] `GET/POST /admin/users` Super Admin business admin creation API (2026-08-27)
- [x] Frontend: Super Admin control center dashboard & create business/admin modals (2026-08-27)
- [x] Business Admin: `GET/POST/PATCH /users` tenant staff management API (2026-08-27)
- [x] Frontend: Staff management page for adding staff members & toggling status (2026-08-27)
- [x] Prisma model: `Customer` (2026-08-27)
- [x] Tenant-scoped Prisma client wrapper for customers (2026-08-27)
- [x] `GET/POST/PATCH /customers` & `GET /customers/:id` API endpoints with search filter (2026-08-27)
- [x] Frontend: Customer List directory, Customer Detail profile shell, add/edit customer modals (2026-08-27)
- [x] Prisma models: `GarmentType`, `MeasurementTemplate`, `TemplateField` with English & Nepali (`labelNp`) labels (2026-08-27)
- [x] Seed script: standard system-default garment types & templates (Shirt, Trousers, Suit, Kurta, Blazer) with English & Nepali labels (2026-08-27)
- [x] `GET /garment-types` & `GET/POST/PATCH /measurement-templates` & `POST /measurement-templates/clone` (2026-08-27)
- [x] Frontend: Template Management UI with English/Nepali label editor, template viewer, and clone & customize flow (2026-08-27)
- [x] Prisma model: `Measurement` with versioning (2026-08-27)
- [x] `GET/POST /customers/:id/measurements` API endpoints with version auto-increment (2026-08-27)
- [x] Frontend: Customer Detail Measurements History tab, "Take New Measurement" modal with bilingual English/Nepali inputs, and measurement session viewer modal (2026-08-27)
- [x] Prisma models: `Order`, `OrderItem`, `OrderStatus` enum (2026-08-27)
- [x] `GET/POST/PATCH /orders` API endpoints with auto-generated order numbers (`ORD-2026-0001`) & status workflow (2026-08-27)
- [x] Frontend: Order List page with status filter tabs, Order Creation Modal with dynamic garment line items builder, and Order Detail view with status progression bar & workflow buttons (2026-08-27)
- [x] Prisma models: `Invoice`, `Payment`, `InvoiceStatus` enum, `PaymentMethod` enum (2026-08-27)
- [x] `GET/POST/PATCH /invoices` & `POST /invoices/generate/:orderId` & `POST /invoices/:id/payments` API endpoints (2026-08-27)
- [x] Frontend: Invoice List page with status filter tabs, Order Detail "+ Generate Invoice" action button, printable billing receipt view, and Record Payment modal (2026-08-27)
- [x] Customer 3-Field Search (Name, Phone, Address) & Native Select2 Combobox component (`CustomerSearchSelect.tsx`) (2026-08-27)
- [x] Prisma model: `AuditLog` & automated audit logger helper (`logAuditEvent`) (2026-08-27)
- [x] Backend endpoint `GET /dashboard/stats` (2026-08-27)
- [x] Frontend: Upgraded Overview Dashboard (`OverviewPage.tsx`) with active metrics, revenue totals, outstanding balance due, quick action shortcuts, and live Audit Trail Activity feed (2026-08-27)
- [x] Milestone 9: Currency standardization to Nepalese Rupees (`Rs. 1,750.00`), Light/Dark theme system with TopBar toggle, tenant- & permission-scoped Global Search API & combobox, reusable BackButton & PageHeader, local Select2 combobox with async API search, and invoice print styles (2026-08-27)
- [x] Role Groups & User Group Assignment: `RoleGroup` & `RoleGroupMapping` database models, permission aggregation engine, `/role-groups` API module, Role Group management page (`RoleGroupManagementPage.tsx`), and staff user group assignment (2026-08-27)
- [x] Milestone 10: Company Setup, Pricing & Nepal Billing — Company settings API, Cloudinary logo upload, optional garment default pricing, permanent invoice price snapshotting, Nepalese A4 billing print receipt, and 5 automated billing unit tests (2026-08-27)
- [x] Milestone 11: Product Type Setup — Product Types setup UI tab, default unit price manager, bilingual naming (English & Nepali), measurement template mapping filter, and 4 automated test cases (2026-08-28)
- [x] Milestone 12: Issue Fixes — Main Admin Company invoice seller snapshotting & B2B layout, isolated #printable-invoice print CSS, Super Admin business-wise filtering for orders/invoices/customers, Super Admin Product Type CRUD authorization, and 3 automated test cases (2026-08-28)
- [x] Milestone 13: Remember Me in Login UI — Remember Me checkbox session persistence across browser restarts, token storage helpers (localStorage vs sessionStorage), and removed development quick-fill UI (2026-08-28)
- [x] Milestone 14: Select2 Combobox UI Standardization — Complete replacement of all native `<select>` controls across Super Admin, Customer detail/list, Invoice list, Order list, and Template management using `Select2Combobox` (2026-08-31)

## In Progress

- —

## Left / Up Next

- Project complete!

## Blockers / Open Questions

- —

## Session Log

| Date | What happened |
|------|----------------|
| 2026-08-27 | Scaffolded documentation & guide for Supabase setup. |
| 2026-08-27 | Built Milestone 1 (Foundation & Auth). Created Express backend API, Prisma schema, connected Supabase Postgres, seeded database users, built React frontend with design token system & login page. |
| 2026-08-27 | Built Milestone 2 (Business & User Management). Implemented Super Admin business management, Business Admin staff management, Modal/Badge components, and updated routing. |
| 2026-08-27 | Architectural Refactoring: Implemented dynamic roles, granular permission matrix, and modern collapsible sidebar. |
| 2026-08-27 | Built Milestone 3 (Customer Management). Implemented Customer database model, tenant-isolated API routes with real-time search, Customer List directory, Customer Detail profile, and add/edit modals. |
| 2026-08-27 | Built Milestone 4 (Garment Types & Measurement Templates). Added English & Nepali field labels, seeded 5 standard garment templates, implemented template cloning & customization API, and created Template Management UI. |
| 2026-08-27 | Built Milestone 5 (Measurements). Implemented Measurement model with versioning, tenant-isolated API endpoints, dynamic bilingual (English & Nepali) measurement recording modal, and Customer Detail measurements history viewer. |
| 2026-08-27 | Built Milestone 6 (Orders). Implemented Order and OrderItem database models, auto-generated order numbers (`ORD-2026-0001`), order status workflow state machine, Order List page with status filter, and Order Detail workflow page. |
| 2026-08-27 | Built Milestone 7 (Invoices & Payments). Implemented Invoice and Payment database models, order-to-invoice generator, partial payment tracking with status recalculation, printable billing receipts, and payment history. |
| 2026-08-27 | Added 3-field text search for Customers (Name, Phone, Address) & native Select2 combobox component (`CustomerSearchSelect.tsx`). |
| 2026-08-27 | Built Milestone 8 (Dashboards, Audit Log, Polish). Created AuditLog database model, automated audit logger, backend dashboard stats API, and live executive command center dashboard with real-time metrics and audit trail activity feed. |
| 2026-08-27 | Built Milestone 9 (Global UX & Application Quality of Life). Implemented Nepalese Rupee currency formatting (`Rs. 1,750.00`), Light/Dark theme system with TopBar toggle, permission-scoped Global Search API, reusable BackButton & PageHeader, local Select2 combobox with async API search, and invoice print styles. |
| 2026-08-31 | Built Milestone 14 (Select2 Combobox UI Standardization). Replaced all native `<select>` dropdowns across Super Admin, Customers, Invoices, Orders, and Template management with `Select2Combobox`. |
