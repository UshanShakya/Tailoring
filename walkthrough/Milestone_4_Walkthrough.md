# Milestone 4 Walkthrough — Garment Types & Measurement Templates

All tasks for **Milestone 4 — Garment Types & Measurement Templates** are complete. Database schema models include bilingual support (English & Nepali `labelNp`), standard system templates are seeded, template cloning & customization API endpoints are live, and the frontend Template Management UI is built and typechecked.

---

## 1. What Was Built & Why

### Backend API (`/backend`)
* **Bilingual Schema Models**:
  - `GarmentType`: Name in English & Nepali (`nameNp`).
  - `MeasurementTemplate`: Template name in English & Nepali (`nameNp`).
  - `TemplateField`: Label in English (`label`), Label in Nepali (`labelNp`), field `key`, `unit` (`in` / `cm`), `dataType`, `order`, `required`.
* **Standard System Defaults Seed (`prisma/seed.ts`)**:
  - Seeded 5 standard garment templates with rich English & Nepali labels:
    1. **Shirt (सर्ट)**: Chest (छाती), Shoulder (काँध), Sleeve Length (हातको लम्बाइ), Shirt Length (सर्टको लम्बाइ), Neck/Collar (घाँटी/कलर), Cuff (कफ).
    2. **Trousers / Pants (प्यान्ट)**: Waist (कमर), Hip (हिप), Total Length (कुल लम्बाइ), Inseam (इनसिम), Thigh (तिघ्रा), Leg Opening/Mori (मोरी/पाउ).
    3. **Suit / Jacket (सूट / कोट)**: Chest (छाती), Waist (कमर), Shoulder (काँध), Sleeve Length (बाहुलाको लम्बाइ), Coat Length (कोटको लम्बाइ), Cross Back (ढाडको चौडाइ).
    4. **Kurta / Daura (कुर्ता / दौरा)**: Chest (छाती), Shoulder (काँध), Sleeve Length (हातको लम्बाइ), Kurta Length (कुर्ताको लम्बाइ), Neck (घाँटी).
    5. **Blazer (ब्लेजर)**: Chest (छाती), Waist (कमर), Shoulder (काँध), Sleeve Length (हातको लम्बाइ), Back Length (पछाडिको लम्बाइ).
* **Template Endpoints**:
  - `GET /garment-types`: Lists system defaults merged with business-owned garment types.
  - `GET /measurement-templates`: Lists measurement templates (system defaults + business copies).
  - `POST /measurement-templates/clone`: Clones a standard system template into a customizable, business-owned copy.
  - `POST /measurement-templates`: Creates a brand new custom template with custom fields.
  - `PATCH /measurement-templates/:id`: Updates fields/labels/order for business-owned templates.

### Frontend UI (`/frontend`)
* **Template Directory (`/dashboard/templates`)**:
  * Displays template cards grouped by garment type with English and Nepali names.
  * Shows badges for System Default vs Custom Tenant Copy.
* **View Template Fields Modal**:
  * Displays a clean table listing field order, English label, Nepali label (`labelNp`), field key, and unit.
* **Clone & Customize Modal**:
  * Pre-fills all fields from a standard template (including Nepali labels).
  * Allows editing English/Nepali labels, changing units (`in` / `cm`), adding new fields, or removing unnecessary fields.
* **Sidebar & App Routing**: Added **Templates** menu link to left sidebar (guarded by `menu:templates` permission key).

---

## 2. Test Scenarios

### Test Scenario A: View Standard Templates with Nepali Labels
1. Ensure servers are running (`npm run dev` in project root).
2. Log in as `admin@stitchandstyle.com` (`Admin123!`).
3. Click **Templates** in the left sidebar.
4. You will see 5 standard system templates: *Shirt (सर्ट)*, *Trousers (प्यान्ट)*, *Suit (सूट / कोट)*, *Kurta (कुर्ता / दौरा)*, *Blazer (ब्लेजर)*.
5. Click **View Fields** on *Shirt (सर्ट)* $\rightarrow$ Confirm the table displays both English labels (*Chest*, *Shoulder*) and Nepali labels (*छाती*, *काँध*).

### Test Scenario B: Clone & Customize a Standard Template
1. On the *Standard Shirt Template* card, click **Clone & Customize**.
2. Change the template name to `Custom Royal Shirt Template (शाही सर्ट नाप)`.
3. Scroll down to measurement fields $\rightarrow$ Add a new field:
   - English Label: `Pocket Depth`
   - Nepali Label: `खल्तीको गहिराइ`
   - Unit: `Inches (in)`
4. Click **Save Template**.
5. **Observe**: The custom template is saved under *Stitch & Style Tailors* with badge **Custom Tenant Template**.
6. Log in as another business tenant $\rightarrow$ Confirm original system default template is unchanged and custom template is isolated strictly to *Stitch & Style Tailors*.
