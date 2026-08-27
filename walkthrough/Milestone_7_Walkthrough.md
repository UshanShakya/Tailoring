# Milestone 7 Walkthrough — Invoices & Payments

All tasks for **Milestone 7 — Invoices & Payments** are complete. Database schema models for `Invoice`, `Payment`, `InvoiceStatus`, and `PaymentMethod` are synced, backend endpoints with order-to-invoice conversion and partial/full payment tracking are operational, and the frontend Invoice List directory & Printable Invoice Detail view are built and typechecked.

---

## 1. What Was Built & Why

### Backend API (`/backend`)
* **Invoice & Payment Models (`schema.prisma`)**:
  - `Invoice`: Stores `id`, `businessId`, `orderId`, `customerId`, `invoiceNumber` (`INV-2026-0001`), `status` (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `CANCELLED`), `totalAmount`, `paidAmount`, `dueAmount`, `dueDate`, `notes`.
  - `Payment`: Stores `id`, `businessId`, `invoiceId`, `amount`, `method` (`CASH`, `BANK_TRANSFER`, `CARD`, `MOBILE_WALLET`), `referenceNote`, `recordedBy`, `createdAt`.
* **Invoice Generation**:
  - `POST /invoices/generate/:orderId`: Converts a confirmed order into a formal invoice, creating `invoiceNumber` (`INV-2026-0001`).
* **Partial & Full Payment Calculation**:
  - `POST /invoices/:id/payments`: Validates payment amount <= remaining due balance, records payment item in a transaction, and updates invoice status:
    - Status set to `PARTIALLY_PAID` when `paidAmount > 0` and `dueAmount > 0`.
    - Status set to `PAID` when `dueAmount <= 0`.
* **Invoice Endpoints (`/invoices`)**:
  * `GET /invoices?search=&status=`: Search by invoice number, order number, or customer name, filter by status (guarded by `invoice:view`).
  * `GET /invoices/:id`: Detailed billing record with order line items & payment history (guarded by `invoice:view`).

### Frontend UI (`/frontend`)
* **Invoice Directory (`/dashboard/invoices`)**:
  * Status filter tabs (`All Invoices`, `Unpaid`, `Partially Paid`, `Paid in Full`, `Cancelled`).
  * Search bar for real-time invoice filtering.
  * Invoice cards showing invoice number, order number reference, customer name, total amount, balance due badge (color-coded red/green), and view details link.
* **Printable Invoice Detail View (`/dashboard/invoices/:id`)**:
  * Clean printable billing receipt styling with company header, client address, order line items breakdown, subtotal, paid deposits, and remaining due balance.
  * **Print Receipt Action**: One-click printable receipt output.
  * **"+ Record Payment" Modal**: Pre-fills remaining due balance, allows choosing payment method (Cash, Bank Transfer, Card, Mobile Wallet), and adding transaction notes.
  * **Payment History Table**: Chronological list of recorded payments showing timestamp, payment method badge, amount paid (`+$50.00`), and staff recorder.
* **Order Integration**: Added **Generate Invoice** button to Order Detail view (`OrderDetailPage.tsx`).

---

## 2. Test Scenarios

### Test Scenario A: Generate Invoice from Order
1. Ensure both servers are running (`npm run dev` in project root).
2. Log in as `admin@stitchandstyle.com` (`Admin123!`).
3. Click **Orders** in the left sidebar $\rightarrow$ View Order `ORD-2026-0001` ($175.00 total).
4. Click **Generate Invoice** in the header.
5. **Observe**: You are redirected to `/dashboard/invoices/:id` showing Invoice `INV-2026-0001` with status **Unpaid**, total `$175.00`, and remaining balance due `$175.00`.

### Test Scenario B: Record Partial & Final Payments
1. On Invoice `INV-2026-0001`, click **+ Record Payment**.
   - Amount: `$75.00`
   - Payment Method: `Cash`
   - Reference Note: `Initial deposit`
   - Click **Save Payment**.
2. **Observe**: Invoice status automatically updates to **Partially Paid**!
   - Paid Deposits: `-$75.00`
   - Remaining Balance Due: `$100.00`
   - Payment History table shows the cash deposit entry.
3. Click **+ Record Payment** again:
   - Amount: `$100.00`
   - Payment Method: `Mobile Wallet / QR Payment`
   - Reference Note: `eSewa Ref #99281`
   - Click **Save Payment**.
4. **Observe**: Invoice status automatically updates to **Paid in Full**!
   - Remaining Balance Due: `$0.00`
   - Print button outputs receipt with full payment history.
