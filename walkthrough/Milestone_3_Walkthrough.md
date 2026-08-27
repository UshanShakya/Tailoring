# Milestone 3 Walkthrough — Customer Management

All tasks for **Milestone 3 — Customer Management** are complete. The database schema has been updated with the `Customer` model, tenant-isolated API endpoints with real-time search are operational, and the frontend customer directory & profile shell are built and typechecked.

---

## 1. What Was Built & Why

### Backend API (`/backend`)
* **Customer Model**: Added `Customer` table linked to `Business` (`businessId`, `name`, `phone`, `address`, `notes`, `createdBy`).
* **Tenant Isolation**: Extended `src/lib/tenantClient.ts` to expose `forBusiness(businessId).customer` methods so cross-tenant data leakage is structurally impossible.
* **Customer Endpoints (`/customers`)**:
  * `GET /customers?search=`: Lists business customers with real-time case-insensitive search by name or phone (guarded by `customer:view`).
  * `GET /customers/:id`: Fetches detailed single customer profile (guarded by `customer:view`).
  * `POST /customers`: Creates a new customer record (guarded by `customer:create`).
  * `PATCH /customers/:id`: Updates customer details (guarded by `customer:edit`).

### Frontend UI (`/frontend`)
* **Customer Directory (`/dashboard/customers`)**:
  * Search input filtering customers in real-time.
  * Customer cards showing name, phone number, address, notes snippet, and creation date.
  * "+ Add Customer" modal dialog with full form validation (guarded by `customer:create` permission check).
* **Customer Detail View (`/dashboard/customers/:id`)**:
  * Detailed header card with contact information and date added.
  * Tab navigation for *Overview & Notes*, *Measurements History* (placeholder for Milestone 4/5), and *Orders & Invoices* (placeholder for Milestone 6/7).
  * "Edit Profile" modal dialog (guarded by `customer:edit` permission check).
* **Sidebar Integration**: Added **Customers** menu link dynamically rendered for accounts possessing `menu:customers` permission.

---

## 2. Test Scenarios

### Test Scenario A: Customer Creation & Profile Editing
1. Run `npm run dev` in the project root.
2. Log in as `admin@stitchandstyle.com` (`Admin123!`).
3. Click **Customers** in the left sidebar.
4. Click **+ Add Customer**:
   - Customer Full Name: `Jane Doe`
   - Phone: `+1 (555) 987-6543`
   - Address: `100 Tailor Ave, Fashion District`
   - Notes: `Prefers slim fit jackets, 2-button coats`
   - Click **Save Customer**.
5. Type `Jane` into the search bar $\rightarrow$ Confirm real-time filtering matches Jane Doe.
6. Click **View Profile &rarr;** on Jane Doe's card to open `/dashboard/customers/:id`.
7. Click **Edit Profile** $\rightarrow$ Change phone or notes $\rightarrow$ Click **Save Changes**.

### Test Scenario B: Tenant Scoping Verification
1. Log in as a user from another business tenant.
2. Navigate to **Customers**.
3. **Observe**: Jane Doe does **NOT** appear in this business workspace (confirming strict multi-tenant isolation).
