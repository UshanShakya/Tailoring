# Milestone 9 Walkthrough — Global UX & Application Quality of Life

All tasks for **Milestone 9 — Global UX & Application Quality of Life** are complete.

---

## 1. What Was Built & Why

### Currency Standardization (Nepalese Rupees - NPR / Rs.)
* **`formatCurrency` Utility & `<CurrencyDisplay />`**:
  - Formats all monetary amounts to Nepalese Rupees (e.g. `Rs. 1,750.00`).
  - Standardized across Orders, Invoices, Payment Modals, Overview Metrics, and line item tables.

### Application-Wide Theme System (Light / Dark Mode)
* **`ThemeContext.tsx` & `[data-theme]` CSS Custom Variables**:
  - Supports light mode and dark mode with CSS color variables mapped to Tailwind design tokens.
  - Theme state persists in `localStorage` (`app-theme`) and detects system `prefers-color-scheme`.
  - Toggle button with Sun/Moon icon in the TopBar.

### TopBar & Role-Aware Global Search
* **`TopBar.tsx` & Backend Search API (`/search?q=`)**:
  - Global search input in sticky TopBar with 300ms debounce.
  - Role-aware & tenant-isolated search across **Customers**, **Orders**, **Invoices**, **Measurement Templates**, and **Businesses** (Super Admin).
  - Clicking any search result item navigates directly to the target detail page.

### Reusable UI Components
* **`BackButton.tsx`**: Standardized back navigation button with fallback route support when browser history is unavailable.
* **`PageHeader.tsx`**: Reusable page title & actions banner.
* **`Select2Combobox.tsx`**: Reusable Select2-style dropdown built locally in the project codebase. Supports local static options and async API-backed searching after 3 characters with 300ms debounce.

### Invoice Print Styling (`@media print`)
* CSS `@media print` rules hide TopBar, Sidebar, action buttons, and extraneous application UI during `window.print()`, leaving only the clean billing receipt.

---

## 2. Test Scenarios

### Test Scenario A: Light / Dark Theme Switching
1. Open the application (`npm run dev`).
2. Click the **Sun / Moon** icon toggle button in the TopBar.
3. **Observe**: The application background, text, borders, cards, and sidebar transition smoothly between Light mode and Dark mode!
4. Refresh the page $\rightarrow$ Theme preference persists.

### Test Scenario B: Global Workspace Search
1. In the TopBar search input, type an order number (e.g. `ORD-2026-0001`) or customer name (e.g. `Jane`).
2. **Observe**: A category-grouped popover popup appears displaying matching Customers, Orders, or Invoices!
3. Click a result item $\rightarrow$ Navigates directly to the target record.

### Test Scenario C: Currency & Invoice Printing
1. View `/dashboard/invoices/:id`.
2. **Observe**: All monetary totals display in Nepalese Rupees (`Rs. 175.00`).
3. Click **Print Invoice Receipt**.
4. **Observe**: Print preview hides the top bar, sidebar, and action buttons, leaving only the invoice receipt.
