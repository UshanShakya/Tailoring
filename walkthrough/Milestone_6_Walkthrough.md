# Milestone 6 Walkthrough — Orders

All tasks for **Milestone 6 — Orders** are complete. Database schema models for `Order`, `OrderItem`, and `OrderStatus` are synced, backend endpoints with auto-generated order numbers (`ORD-2026-0001`) and state machine transitions are operational, and the frontend Order List directory & Order Detail workflow views are built and typechecked.

---

## 1. What Was Built & Why

### Backend API (`/backend`)
* **Order & OrderItem Models (`schema.prisma`)**:
  - `Order`: Stores `id`, `businessId`, `customerId`, `orderNumber`, `status` (`DRAFT`, `CONFIRMED`, `IN_PROGRESS`, `READY`, `DELIVERED`, `CANCELLED`), `totalAmount`, `dueDate`, `notes`, `createdById`, `createdAt`, `updatedAt`.
  - `OrderItem`: Stores `id`, `orderId`, `garmentTypeId`, `quantity`, `unitPrice`, `totalPrice`, `fabricNotes`, `specialInstructions`.
* **Auto-Sequential Order Numbers**:
  - Automatically calculates `ORD-${currentYear}-${paddedCount}` (e.g. `ORD-2026-0001`, `ORD-2026-0002`) per business.
* **Order Endpoints (`/orders`)**:
  * `GET /orders?search=&status=`: Search by order number or customer name, filter by status (guarded by `order:view`).
  * `GET /orders/:id`: Detailed single order record with customer contact info and line items (guarded by `order:view`).
  * `POST /orders`: Creates order + line items in a transaction (guarded by `order:create`).
  * `PATCH /orders/:id/status`: Advances order status along state machine workflow (guarded by `order:edit`).

### Frontend UI (`/frontend`)
* **Order Directory (`/dashboard/orders`)**:
  * Status filter tabs (`All Orders`, `Draft`, `Confirmed`, `In Production`, `Ready for Pickup`, `Delivered`, `Cancelled`).
  * Real-time search by order number or customer name.
  * Order cards showing order number, customer name, status badge, total amount, items count, due date, and view details link.
* **"+ Create New Order" Modal**:
  * Client/Customer selection dropdown.
  * Target delivery due date & order notes.
  * Dynamic Line Item Builder: Select Garment Type, Quantity, Unit Price, Line Total calculation, Fabric Notes, and Special Instructions.
* **Order Detail Workflow View (`/dashboard/orders/:id`)**:
  * Order header with status badge and created/due dates.
  * Visual 5-step status progression bar (`DRAFT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `READY` $\rightarrow$ `DELIVERED`).
  * Workflow action buttons: **Confirm Order**, **Start Production**, **Mark Ready for Pickup**, **Mark Delivered**, **Cancel Order**.
  * Table breakdown of garment line items, quantities, prices, fabric notes, and order total.

---

## 2. Test Scenarios

### Test Scenario A: Create a Tailoring Order
1. Ensure both servers are running (`npm run dev` in project root).
2. Log in as `admin@stitchandstyle.com` (`Admin123!`).
3. Click **Orders** in the left sidebar $\rightarrow$ Click **+ Create New Order**.
4. Select Customer *Jane Doe*.
5. Set Due Date to next week (e.g. `2026-09-05`).
6. Add 2 Line Items:
   - Item #1: Garment Type *Shirt*, Qty `2`, Unit Price `$50.00`, Fabric Notes `Navy Italian Cotton`.
   - Item #2: Garment Type *Trousers*, Qty `1`, Unit Price `$75.00`, Fabric Notes `Matching Navy Wool`.
7. Observe Total Calculated Amount: `$175.00`.
8. Click **Create Order**.
9. **Observe**: Order `ORD-2026-0001` appears in the list with badge **Draft**!

### Test Scenario B: Production Workflow Status Transitions
1. Click **View Detail &rarr;** on `ORD-2026-0001` to view `/dashboard/orders/:id`.
2. Observe 5-step status progression bar highlighted on **DRAFT**.
3. Click **Confirm Order** $\rightarrow$ Status badge changes to **Confirmed** (Step 2).
4. Click **Start Production** $\rightarrow$ Status badge changes to **In Production** (Step 3).
5. Click **Mark Ready for Pickup** $\rightarrow$ Status badge changes to **Ready for Pickup** (Step 4).
6. Click **Mark Delivered** $\rightarrow$ Status badge changes to **Delivered** (Step 5).
7. Return to Order List $\rightarrow$ Click **Ready** or **Delivered** status tabs to verify real-time filtering.
