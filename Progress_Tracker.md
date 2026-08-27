# Progress Tracker

> **This is the only file that gets updated during regular work.**
> Update it immediately after finishing any task from `Tasks.md`.
> Last updated: 2026-08-27

## Current Status

**Active Milestone:** Milestone 6 — Orders
**Overall status:** Milestone 5 Complete

## Milestone Overview

| Milestone | Status | Notes |
|-----------|--------|-------|
| 1. Foundation & Auth | Done | Built Express API, Prisma schema, Supabase Postgres connection, JWT token rotation, auth middlewares, seed script, and React login frontend. |
| 2. Business & User Management | Done | Super Admin business management dashboard, tenant user management, staff team management UI, modal & badge UI components. |
| 3. Customer Management | Done | Customer database model, tenant-scoped API routes with search, Customer List page, Customer Detail profile shell, add/edit modals. |
| 4. Garment Types & Measurement Templates | Done | Database models for GarmentType, MeasurementTemplate, TemplateField with English & Nepali (नेपाली) labels, template seed, clone & customize API, and Template Management UI. |
| 5. Measurements | Done | Prisma Measurement model with version history, tenant-isolated API, dynamic bilingual measurement forms (English & Nepali labels), and Customer Detail measurements integration. |
| 6. Orders | Not Started | |
| 7. Invoices & Payments | Not Started | |
| 8. Dashboards, Audit Log, Polish | Not Started | |

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

## In Progress

- —

## Left / Up Next

- Prisma models: `Order`, `OrderItem`, `OrderStatus` enum
- `GET/POST/PATCH /orders` (Order creation with line items, cost calculation, status updates: DRAFT $\rightarrow$ CONFIRMED $\rightarrow$ IN_PROGRESS $\rightarrow$ READY $\rightarrow$ DELIVERED $\rightarrow$ CANCELLED)
- Frontend: Order creation form, Order list page with status filter, Order Detail view with status workflow buttons

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
