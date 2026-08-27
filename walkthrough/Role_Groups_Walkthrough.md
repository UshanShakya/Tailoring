# Role Groups & User Group Assignment Walkthrough

All tasks for **Role Groups & User Group Assignment** are complete.

---

## 1. What Was Built & Why

### Database & Backend Engine (`/backend`)
* **RoleGroup & RoleGroupMapping Models (`schema.prisma`)**:
  - `RoleGroup`: Organizes multiple roles into logical teams (e.g. *"Tailoring Operations Group"*, *"Finance & Billing Group"*).
  - `RoleGroupMapping`: Links multiple roles to a role group in a many-to-many relationship.
  - `User.roleGroupId`: Links a Role Group to each user in addition to their Primary Role.
* **Permission Aggregation Engine (`auth.service.ts`)**:
  - Automatically combines permissions from a user's Primary Role **PLUS** all permissions from any role included in their assigned Role Group into `user.role.permissions`.
* **Role Groups API (`/role-groups`)**:
  - `GET /role-groups`: Lists tenant role groups with included roles & assigned user counts.
  - `POST /role-groups`: Creates a role group with mapped roles.
  - `PATCH /role-groups/:id`: Updates role group metadata and mapped role IDs.
  - `DELETE /role-groups/:id`: Deletes custom non-system role groups.

### Frontend UI (`/frontend`)
* **Role Group Management Page (`RoleGroupManagementPage.tsx`)**:
  - Accessible via **Role Groups** menu item under `/dashboard/role-groups`.
  - Cards displaying group names, descriptions, included roles, and assigned user counts.
  - Modal to create & edit role groups with interactive role checkboxes.
* **Staff Team Integration (`StaffManagementPage.tsx`)**:
  - Displays assigned Role Group badges on staff items.
  - Add & Edit Staff modals include `Select2Combobox` controls for selecting Primary Role AND assigned Role Group.

---

## 2. Test Scenarios

### Test Scenario A: Create & Manage a Role Group
1. Ensure both servers are running (`npm run dev` in project root).
2. Log in as `admin@stitchandstyle.com` (`Admin123!`).
3. Click **Role Groups** in the left sidebar (`/dashboard/role-groups`).
4. Click **+ Create Role Group**:
   - Group Name: `Tailoring Operations Team`
   - Description: `Combines Senior Tailor and Receptionist roles for shop floor staff`
   - Select Roles: Check `Senior Tailor` and `Receptionist`.
   - Click **Create Group**.
5. **Observe**: Role Group `Tailoring Operations Team` is created showing badges for both included roles!

### Test Scenario B: Assign Role Group to Staff Member
1. Click **Staff Team** in the left sidebar (`/dashboard/staff`).
2. Click **Edit** on staff user `Jane Tailor`.
3. In the **Assigned Role Group** dropdown, select `Tailoring Operations Team`.
4. Click **Update Staff Member**.
5. **Observe**: Staff user `Jane Tailor` displays the **Tailoring Operations Team** group badge!
6. Log in as `Jane Tailor` $\rightarrow$ Her effective permissions now dynamically grant access across all actions in both `Senior Tailor` and `Receptionist` roles!
