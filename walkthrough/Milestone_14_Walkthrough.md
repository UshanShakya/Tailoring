# Milestone 14 Walkthrough — User Role Assignment & Editing Capabilities

## Overview

Milestone 14 enables Super Admins and Business Admins to assign and update user roles and role groups across the tailoring business management platform while enforcing strict role hierarchy and tenant security boundaries.

---

## Technical & Architectural Implementation

### 1. Server-Side Authorization & Safeguards (`users.service.ts` & `users.routes.ts`)
- **Super Admin Capabilities**:
  - Super Admin can change the role and role group of **any user** across **any company/tenant**.
  - Exposes `PATCH /admin/users/:id` route for global role administration.
- **Business Admin Capabilities**:
  - Business Admin can update staff user profiles within **their own tenant**.
  - **Target User Safeguard**: If a Business Admin attempts to edit a user whose current role is `Business Admin` or `Super Admin`, the API rejects the request with a `403 Forbidden` response (`"Business Admins cannot modify Business Admin or Super Admin user accounts"`).
  - **Assignable Role Safeguard**: If a Business Admin attempts to assign the `Business Admin` or `Super Admin` role to any staff member, the API rejects the request with a `403 Forbidden` response (`"Business Admins cannot assign Business Admin or Super Admin roles"`).

### 2. Super Admin Control Center (`SuperAdminDashboard.tsx`)
- Added a **"Platform Users & Role Assignments"** directory table listing every registered user across all business tenants with their current business, assigned primary role, role group, and status.
- Added an **"Edit / Assign Role"** modal allowing Super Admin to edit the name, role (selecting any system or custom role), role group, and active status for any platform user.

### 3. Business Staff Management UI (`StaffManagementPage.tsx`)
- Integrated `useAuth` context to enforce role-aware UI logic:
  - Role dropdown choices are dynamically filtered for Business Admins to display only assignable staff roles (excluding `Business Admin` & `Super Admin`).
  - Action buttons for users with `Business Admin` or `Super Admin` roles are locked with an **"Admin Account"** indicator badge when viewed by a Business Admin.
  - Standard staff members can be edited via the modal to reassign their primary role or role group.

---

## Automated Verification & Test Results

A comprehensive automated unit test suite was added to `backend/src/tests/user_roles.test.ts`:

1. **TEST 1**: Business Admin updating staff user role to Staff Full.
   - Result: `PASSED` (Role successfully updated to Staff Full).
2. **TEST 2**: Business Admin attempting to edit a Business Admin user account.
   - Result: `PASSED` (Correctly blocked with HTTP 403: `"Business Admins cannot modify Business Admin or Super Admin user accounts"`).
3. **TEST 3**: Business Admin attempting to assign Business Admin role to staff member.
   - Result: `PASSED` (Correctly blocked with HTTP 403: `"Business Admins cannot assign Business Admin or Super Admin roles"`).
4. **TEST 4**: Super Admin editing Business Admin user details & role.
   - Result: `PASSED` (Super Admin successfully updated Business Admin user details and role across tenants).

---

## How to Run & Verify

1. **Run Automated Test Suite**:
   ```bash
   cd backend
   npx ts-node src/tests/user_roles.test.ts
   ```

2. **Run Full Project Build**:
   ```bash
   npm run build
   ```

3. **Manual Verification**:
   - Log in as **Super Admin** (`admin.global@platform.com` or `superadmin@tailoring.com`). Navigate to **Super Admin Control Center** -> **Platform Users & Role Assignments** card to edit/assign roles for any user.
   - Log in as **Business Admin** (`admin@tenant.com`). Navigate to **Staff Team Management** to verify role editing for staff members, role dropdown filtering, and protection of Business Admin accounts.
