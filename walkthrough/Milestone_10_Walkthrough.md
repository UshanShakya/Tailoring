# Milestone 10 Walkthrough — Company Setup, Pricing & Nepal Billing

All tasks for **Milestone 10 — Company Setup, Pricing & Nepal Billing** are complete.

---

## 1. What Was Built & Why

### Company Billing Settings Profile & Cloudinary Logo Upload
* **Company Profile API (`/settings/company`)**:
  - Store and manage business billing information: Company Name, Address, PAN/VAT Number, Billing Contact Phone, Email, Tax Rate %, VAT Registered toggle, and Default Invoice Note.
* **Cloudinary Image Upload (`cloudinary.ts`)**:
  - Integrates Cloudinary for uploading and replacing company logos (`POST /settings/company/logo` and `DELETE /settings/company/logo`).
* **Company Settings UI (`CompanySettingsPage.tsx`)**:
  - Located under `/dashboard/settings` with live invoice receipt header preview and logo file uploader.

### Optional & Auto-Filled Garment Default Pricing
* **GarmentType `defaultPrice`**:
  - Predefined prices are now optional (`defaultPrice?: Decimal?`).
  - When creating orders, the system automatically auto-populates `garmentType.defaultPrice` if a price is not manually supplied.
  - Allows order creation even when price is undetermined without blocking production workflows.

### Permanent Invoice Price Snapshotting & VAT Calculations
* **Invoice Snapshotting & Tax Engine (`invoices.service.ts`)**:
  - Computes `subtotal`, `taxAmount` (if VAT registered), and `totalAmount`.
  - Permanently snapshots company profile (`companyName`, `companyPan`, `companyAddress`, `companyPhone`, `companyLogoUrl`, `isVatRegistered`, `taxRate`, `subtotal`, `taxAmount`, `totalAmount`) onto the `Invoice` record.
  - Future changes to company settings or product default prices **never** alter historical issued invoices.

### Nepalese A4 Billing Receipt Layout
* **Printable Invoice Receipt (`InvoiceDetailPage.tsx`)**:
  - Displays company logo, company PAN/VAT #, billing address, customer details, invoice number (`INV-2026-0001`), order reference, subtotal, VAT amount, and total in Nepalese Rupees (`Rs. 1,750.00`).

### Automated Billing Unit Test Suite (`backend/src/tests/billing.test.ts`)
* Automated test runner verifying default price auto-fill, null unit price handling, 13% VAT tax calculation, invoice snapshot immutability, partial payment recalculations, and overpayment guards.

---

## 2. Test Verification Results

All 5 automated tests ran and passed cleanly:

```bash
=== RUNNING BILLING & INVOICE AUTOMATED TESTS ===
[TEST 1] Testing Garment Type Default Price Auto-Fill...
✓ TEST 1 PASSED: Configured default price auto-filled correctly!
[TEST 2] Testing Order Creation without Predefined Price...
✓ TEST 2 PASSED: Order created without price successfully!
[TEST 3] Testing VAT Calculation & Invoice Snapshot...
✓ TEST 3 PASSED: VAT calculation & snapshot verified!
[TEST 4] Testing Historical Invoice Price Snapshot Immutability...
✓ TEST 4 PASSED: Issued invoice snapshot remained unchanged after price & company setting updates!
[TEST 5] Testing Partial Payments & Overpayment Guard...
✓ TEST 5 PASSED: Payment status recalculation & overpayment guard verified!

==================================================
🎉 ALL BILLING & INVOICE TESTS PASSED SUCCESSFULLY!
==================================================
```

---

## 3. Manual Test Steps

1. Open `/dashboard/settings` as Business Admin.
2. Set PAN `123456789`, enable VAT Registered (13%), upload logo image $\rightarrow$ Save.
3. Create an Order $\rightarrow$ Predefined default price auto-fills automatically.
4. Click **Generate Invoice** $\rightarrow$ Verify invoice snapshot contains PAN `123456789`, Logo, Subtotal, 13% VAT, and Total in `Rs.`.
5. Click **Print Invoice Receipt** $\rightarrow$ Verify clean A4 billing layout.
