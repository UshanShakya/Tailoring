# Project Overview — Tailoring Business Management Platform

## What this project is

A multi-tenant web application for tailoring businesses. Each tailoring
business (tenant) gets its own isolated space to manage staff, customers,
measurements, orders, invoices, and payments. A platform-level Super Admin
oversees all businesses.

Customers never log in — they are records managed by business staff, not
application users.

## How to use this documentation set

This project is documented with six living files. Read them in this order
when starting work, and keep them in sync as described below.

| # | File | Purpose | Who updates it | When |
|---|------|---------|-----------------|------|
| 1 | `ProjectOverview.md` | This file. Big picture + how the docs fit together. | Rarely — only on major scope change | As needed |
| 2 | `AI_Guidelines.md` | Rules for how code should be written (by AI or humans) | Rarely — only if conventions change | As needed |
| 3 | `Architecture.md` | Folder structure, stack, data model, API shape | When architecture actually changes | As needed |
| 4 | `Tasks.md` | Milestones broken into concrete tasks | When scope for a milestone changes | As needed |
| 5 | `Progress_Tracker.md` | **The only file updated on every work session** | After every task/session | Continuously |
| 6 | `UIUX.md` | Brand colors, design tokens, Tailwind usage rules | Rarely — only on rebrand | As needed |

**Golden rule:** `Progress_Tracker.md` is the single source of truth for
"where are we right now." Everything else is relatively static reference
material. If you (or an AI assistant) are picking this project up cold,
read `Progress_Tracker.md` first to see what's done, what's in progress,
and what's next — then cross-reference `Tasks.md` for the detail of the
next task.

## Core concept summary

- **Businesses** are tenants. Each has its own users and customers.
- **Users** belong to exactly one business (except Super Admin, who belongs
  to none and oversees all). Roles: `SUPER_ADMIN`, `BUSINESS_ADMIN`,
  `STAFF_FULL`, `STAFF_BASIC`.
- **Customers** belong to a business, have no login, and are managed
  entirely by staff.
- **Garment Types & Measurement Templates**: the system ships with standard
  templates (Shirt, Trousers, Suit, etc.). Every new measurement taken for
  a customer starts from a template so the right fields always appear.
  Businesses can customize their own templates without affecting the
  system defaults or other businesses.
- **Orders, Invoices, Payments**: standard tailoring shop workflow —
  an order is placed for a customer, invoiced, and paid (possibly in
  installments).

## Tech stack (summary — full detail in Architecture.md)

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL hosted on Supabase + Prisma ORM (Supabase used
  purely as managed Postgres — no Docker or local DB install needed)
- Auth: JWT (access + refresh tokens)

## Non-negotiable principles

1. **Tenant isolation is sacred.** No query touching business-scoped data
   may ever skip the `businessId` filter. See `AI_Guidelines.md`.
2. **Roles are fixed, not configurable**, for now (see Architecture.md) —
   do not build a custom permissions UI unless explicitly asked.
3. **One milestone at a time.** Do not start milestone N+1 until N is
   marked complete in `Progress_Tracker.md`.
4. **Design tokens only.** No raw hex colors in components — see
   `UIUX.md`.
