# Cost Calculator Mobile Web App Design

## Goal

Build a standalone mobile-first web app for product and food cost calculation. The app will manage multiple products, calculate each product's per-item cost, and support local backup through export and import files.

The app must not modify the existing website files in the repository. It will live in its own folder, planned as `cost-calculator/`.

## Scope

Included in the first version:

- A standalone single-page app.
- Multiple products in one local data set.
- Per-product fields: product name, sale price, packaging cost, labor cost, and other cost.
- Per-product material rows: material name, quantity, and unit price.
- Automatic calculation of material total, total cost, gross profit, and gross margin.
- Local browser storage using `localStorage`.
- Export and import of a JSON backup file.
- Mobile-first interface with large controls and clear input states.

Out of scope for the first version:

- Google Sheets sync.
- Login or user accounts.
- Inventory tracking.
- Unit conversion.
- Multi-user collaboration.
- Native Android or iOS packaging.
- Changes to the existing site files: `index.html`, `script.js`, `styles.css`, and `google-apps-script.js`.

## Recommended Approach

Create a new folder:

```text
cost-calculator/
```

With these files:

```text
cost-calculator/index.html
cost-calculator/styles.css
cost-calculator/app.js
```

This keeps the tool independent from the existing website and makes it easy to open directly in a mobile browser. The same structure can later be upgraded into a PWA or connected to Google Sheets.

## User Experience

The first screen shows the working cost calculator, not a marketing page. Users can select an existing product, add a new product, edit product-level costs, and manage material rows.

Expected workflows:

1. Create a product.
2. Enter sale price, packaging, labor, and other cost.
3. Add material rows with name, quantity, and unit price.
4. See cost and profit totals update immediately.
5. Export the full data set as a JSON backup.
6. Import a backup file when needed.

The interface should be optimized for phones: readable text, comfortable tap targets, stable layout, and no dependence on desktop-only interactions.

## Data Model

The app stores one object in `localStorage`.

```json
{
  "version": 1,
  "products": [
    {
      "id": "product-id",
      "name": "Product name",
      "salePrice": 0,
      "packagingCost": 0,
      "laborCost": 0,
      "otherCost": 0,
      "materials": [
        {
          "id": "material-id",
          "name": "Material name",
          "quantity": 0,
          "unitPrice": 0
        }
      ]
    }
  ],
  "selectedProductId": "product-id"
}
```

Calculation rules:

- Material row cost = `quantity * unitPrice`.
- Material total = sum of all material row costs.
- Total cost = material total + packaging cost + labor cost + other cost.
- Gross profit = sale price - total cost.
- Gross margin = gross profit / sale price, shown as `0%` when sale price is zero.
- Empty numeric inputs are treated as `0`.

## Error Handling

- Invalid numeric input is normalized to `0` for calculation.
- Import requires valid JSON with a supported shape.
- Failed imports show an error and do not replace existing data.
- Destructive actions, such as deleting a product or replacing all data through import, require confirmation.
- Negative profit is visually highlighted without blocking editing.

## Testing And Verification

Manual verification for the first version:

- Create, rename, select, and delete products.
- Add and remove material rows.
- Confirm totals update while editing.
- Confirm empty numeric fields calculate as `0`.
- Confirm negative profit is highlighted.
- Refresh the page and verify data remains.
- Export data, clear or change local data, import the backup, and verify the data is restored.
- Verify the app works on a narrow mobile viewport and text does not overflow controls.

## Implementation Notes

- Use plain HTML, CSS, and JavaScript unless implementation planning discovers a strong reason to add tooling.
- Keep all styles scoped to the standalone app folder.
- Avoid modifying existing repository website files.
- Keep the first version focused on cost calculation and backup, with future expansion paths for PWA support and Google Sheets sync.
