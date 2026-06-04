# Cost Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone mobile-first product and food cost calculator with local storage and JSON backup import/export.

**Architecture:** Create a new `cost-calculator/` folder that is independent from the existing website. Put reusable calculation and data-shape logic in `cost-core.js`, wire the browser UI in `app.js`, and keep styles scoped in `cost-calculator/styles.css`.

**Tech Stack:** Plain HTML, CSS, JavaScript, browser `localStorage`, browser `FileReader`, and Node's built-in `assert` module for tests.

---

## File Structure

- Create: `cost-calculator/index.html`
  - Standalone mobile-first app shell.
  - Loads `cost-core.js` and `app.js`.
  - Does not reference or modify existing root site files.
- Create: `cost-calculator/styles.css`
  - Scoped visual design for the cost calculator only.
  - Responsive phone-first layout with stable controls and readable inputs.
- Create: `cost-calculator/cost-core.js`
  - Pure calculation, sample-data, normalization, and import validation functions.
  - Exports functions for Node tests and also attaches them to `window.CostCore` for the browser.
- Create: `cost-calculator/app.js`
  - Browser state management, rendering, event handling, local storage, and import/export.
- Create: `tests/cost-core.test.js`
  - Node test coverage for calculation, numeric normalization, and import validation.
- Create: `tests/cost-calculator-static.test.js`
  - Static checks that the standalone app files exist and do not depend on existing root website files.
- Do not modify: `index.html`, `script.js`, `styles.css`, or `google-apps-script.js`.

## Task 1: Calculation Core And Tests

**Files:**
- Create: `cost-calculator/cost-core.js`
- Create: `tests/cost-core.test.js`

- [ ] **Step 1: Write the failing calculation core test**

Create `tests/cost-core.test.js`:

```js
const assert = require("node:assert");
const {
  createProduct,
  calculateProduct,
  normalizeNumber,
  normalizeDataSet,
  validateImportData,
} = require("../cost-calculator/cost-core.js");

const product = createProduct("Mango Cup");
product.salePrice = "120";
product.packagingCost = "8";
product.laborCost = "15";
product.otherCost = "";
product.materials = [
  { id: "m1", name: "Mango", quantity: "2", unitPrice: "18" },
  { id: "m2", name: "Cream", quantity: "1.5", unitPrice: "10" },
];

const totals = calculateProduct(product);
assert.equal(totals.materialTotal, 51);
assert.equal(totals.totalCost, 74);
assert.equal(totals.grossProfit, 46);
assert.equal(totals.grossMargin, 46 / 120);
assert.equal(totals.isNegativeProfit, false);

assert.equal(normalizeNumber(""), 0);
assert.equal(normalizeNumber("abc"), 0);
assert.equal(normalizeNumber("12.5"), 12.5);

const zeroSale = calculateProduct({
  salePrice: 0,
  packagingCost: 2,
  laborCost: 3,
  otherCost: 4,
  materials: [{ id: "m3", name: "Box", quantity: 1, unitPrice: 5 }],
});
assert.equal(zeroSale.totalCost, 14);
assert.equal(zeroSale.grossProfit, -14);
assert.equal(zeroSale.grossMargin, 0);
assert.equal(zeroSale.isNegativeProfit, true);

const validImport = validateImportData({
  version: 1,
  selectedProductId: "p1",
  products: [
    {
      id: "p1",
      name: "Cake",
      salePrice: "200",
      packagingCost: "10",
      laborCost: "25",
      otherCost: "5",
      materials: [{ id: "m1", name: "Flour", quantity: "3", unitPrice: "12" }],
    },
  ],
});

assert.equal(validImport.ok, true);
assert.equal(validImport.data.products[0].materials[0].quantity, 3);

const invalidImport = validateImportData({ version: 1, products: "wrong" });
assert.equal(invalidImport.ok, false);
assert.equal(typeof invalidImport.message, "string");

const emptyData = normalizeDataSet({ version: 1, products: [] });
assert.equal(emptyData.products.length, 1);
assert.equal(emptyData.selectedProductId, emptyData.products[0].id);

console.log("Cost core checks passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node tests/cost-core.test.js
```

Expected: FAIL because `cost-calculator/cost-core.js` does not exist.

- [ ] **Step 3: Implement the calculation core**

Create `cost-calculator/cost-core.js`:

```js
(function attachCostCore(root) {
  const DATA_VERSION = 1;

  function createId(prefix) {
    if (root.crypto && typeof root.crypto.randomUUID === "function") {
      return `${prefix}-${root.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function normalizeNumber(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function createMaterial(name = "") {
    return {
      id: createId("material"),
      name,
      quantity: 0,
      unitPrice: 0,
    };
  }

  function createProduct(name = "New product") {
    return {
      id: createId("product"),
      name,
      salePrice: 0,
      packagingCost: 0,
      laborCost: 0,
      otherCost: 0,
      materials: [createMaterial()],
    };
  }

  function normalizeMaterial(material) {
    const source = material && typeof material === "object" ? material : {};
    return {
      id: typeof source.id === "string" && source.id ? source.id : createId("material"),
      name: typeof source.name === "string" ? source.name : "",
      quantity: normalizeNumber(source.quantity),
      unitPrice: normalizeNumber(source.unitPrice),
    };
  }

  function normalizeProduct(product) {
    const source = product && typeof product === "object" ? product : {};
    const materials = Array.isArray(source.materials)
      ? source.materials.map(normalizeMaterial)
      : [];

    return {
      id: typeof source.id === "string" && source.id ? source.id : createId("product"),
      name: typeof source.name === "string" && source.name.trim() ? source.name : "New product",
      salePrice: normalizeNumber(source.salePrice),
      packagingCost: normalizeNumber(source.packagingCost),
      laborCost: normalizeNumber(source.laborCost),
      otherCost: normalizeNumber(source.otherCost),
      materials: materials.length ? materials : [createMaterial()],
    };
  }

  function normalizeDataSet(data) {
    const source = data && typeof data === "object" ? data : {};
    const products = Array.isArray(source.products)
      ? source.products.map(normalizeProduct)
      : [];
    const normalizedProducts = products.length ? products : [createProduct("Sample product")];
    const selectedExists = normalizedProducts.some((product) => product.id === source.selectedProductId);

    return {
      version: DATA_VERSION,
      products: normalizedProducts,
      selectedProductId: selectedExists ? source.selectedProductId : normalizedProducts[0].id,
    };
  }

  function calculateProduct(product) {
    const normalized = normalizeProduct(product);
    const materialRows = normalized.materials.map((material) => {
      const rowCost = roundCurrency(material.quantity * material.unitPrice);
      return { ...material, rowCost };
    });
    const materialTotal = roundCurrency(
      materialRows.reduce((sum, material) => sum + material.rowCost, 0),
    );
    const totalCost = roundCurrency(
      materialTotal + normalized.packagingCost + normalized.laborCost + normalized.otherCost,
    );
    const salePrice = normalizeNumber(normalized.salePrice);
    const grossProfit = roundCurrency(salePrice - totalCost);
    const grossMargin = salePrice > 0 ? grossProfit / salePrice : 0;

    return {
      materialRows,
      materialTotal,
      totalCost,
      grossProfit,
      grossMargin,
      isNegativeProfit: grossProfit < 0,
    };
  }

  function validateImportData(data) {
    if (!data || typeof data !== "object") {
      return { ok: false, message: "Backup file must contain a JSON object." };
    }
    if (!Array.isArray(data.products)) {
      return { ok: false, message: "Backup file is missing a products array." };
    }
    if (data.version !== DATA_VERSION) {
      return { ok: false, message: "Backup file version is not supported." };
    }
    return { ok: true, data: normalizeDataSet(data) };
  }

  const api = {
    DATA_VERSION,
    createMaterial,
    createProduct,
    normalizeNumber,
    normalizeDataSet,
    calculateProduct,
    validateImportData,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.CostCore = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
node tests/cost-core.test.js
```

Expected: PASS and prints `Cost core checks passed`.

- [ ] **Step 5: Commit calculation core**

Run:

```bash
git add -- cost-calculator/cost-core.js tests/cost-core.test.js
git commit -m "feat: add cost calculator core"
```

Expected: Commit succeeds and does not include root `index.html`.

## Task 2: Standalone App Shell And Static Checks

**Files:**
- Create: `cost-calculator/index.html`
- Create: `tests/cost-calculator-static.test.js`

- [ ] **Step 1: Write the failing static app test**

Create `tests/cost-calculator-static.test.js`:

```js
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

["index.html", "styles.css", "app.js", "cost-core.js"].forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, "cost-calculator", file)), `${file} exists`);
});

const html = read("cost-calculator/index.html");
assert.ok(html.includes('<meta name="viewport"'), "mobile viewport meta exists");
assert.ok(html.includes('id="productList"'), "product list exists");
assert.ok(html.includes('id="productForm"'), "product form exists");
assert.ok(html.includes('id="materialsList"'), "materials list exists");
assert.ok(html.includes('id="summaryPanel"'), "summary panel exists");
assert.ok(html.includes('id="exportButton"'), "export button exists");
assert.ok(html.includes('id="importInput"'), "import input exists");
assert.ok(html.includes("cost-core.js"), "loads core script");
assert.ok(html.includes("app.js"), "loads app script");
assert.ok(!html.includes("../styles.css"), "does not depend on root styles");
assert.ok(!html.includes("../script.js"), "does not depend on root script");

console.log("Cost calculator static checks passed");
```

- [ ] **Step 2: Run the static test to verify it fails**

Run:

```bash
node tests/cost-calculator-static.test.js
```

Expected: FAIL because `cost-calculator/index.html`, `styles.css`, and `app.js` are not complete yet.

- [ ] **Step 3: Create the standalone HTML shell**

Create `cost-calculator/index.html`:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>成本計算工具</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="app-shell">
      <header class="app-header">
        <div>
          <p class="eyebrow">商品 / 餐飲</p>
          <h1>成本計算工具</h1>
        </div>
        <div class="backup-actions" aria-label="資料備份">
          <button class="icon-button" id="exportButton" type="button" title="匯出備份" aria-label="匯出備份">⬇</button>
          <label class="icon-button" title="匯入備份" aria-label="匯入備份">
            ⬆
            <input id="importInput" type="file" accept="application/json">
          </label>
        </div>
      </header>

      <section class="workspace" aria-label="成本計算工作區">
        <aside class="product-panel" aria-label="商品清單">
          <div class="panel-heading">
            <h2>商品</h2>
            <button id="addProductButton" type="button">新增</button>
          </div>
          <div class="product-list" id="productList"></div>
        </aside>

        <section class="editor-panel" aria-label="商品成本編輯">
          <form id="productForm" autocomplete="off">
            <div class="field full">
              <label for="productName">商品名稱</label>
              <input id="productName" name="productName" type="text" required>
            </div>

            <div class="input-grid">
              <div class="field">
                <label for="salePrice">售價</label>
                <input id="salePrice" name="salePrice" type="number" min="0" step="0.01" inputmode="decimal">
              </div>
              <div class="field">
                <label for="packagingCost">包材</label>
                <input id="packagingCost" name="packagingCost" type="number" min="0" step="0.01" inputmode="decimal">
              </div>
              <div class="field">
                <label for="laborCost">人工</label>
                <input id="laborCost" name="laborCost" type="number" min="0" step="0.01" inputmode="decimal">
              </div>
              <div class="field">
                <label for="otherCost">其他費用</label>
                <input id="otherCost" name="otherCost" type="number" min="0" step="0.01" inputmode="decimal">
              </div>
            </div>
          </form>

          <section class="materials-section" aria-label="材料明細">
            <div class="panel-heading">
              <h2>材料</h2>
              <button id="addMaterialButton" type="button">新增材料</button>
            </div>
            <div class="materials-list" id="materialsList"></div>
          </section>

          <section class="summary-panel" id="summaryPanel" aria-live="polite">
            <div>
              <span>材料成本</span>
              <strong id="materialTotal">$0.00</strong>
            </div>
            <div>
              <span>總成本</span>
              <strong id="totalCost">$0.00</strong>
            </div>
            <div>
              <span>毛利</span>
              <strong id="grossProfit">$0.00</strong>
            </div>
            <div>
              <span>毛利率</span>
              <strong id="grossMargin">0%</strong>
            </div>
          </section>

          <div class="danger-row">
            <button id="deleteProductButton" class="danger-button" type="button">刪除商品</button>
          </div>
        </section>
      </section>

      <p class="status-line" id="statusLine" role="status"></p>
    </main>

    <script src="cost-core.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create placeholder files needed by the static test**

Create `cost-calculator/styles.css`:

```css
:root {
  color-scheme: light;
}
```

Create `cost-calculator/app.js`:

```js
(() => {
  "use strict";
})();
```

- [ ] **Step 5: Run the static test to verify it passes**

Run:

```bash
node tests/cost-calculator-static.test.js
```

Expected: PASS and prints `Cost calculator static checks passed`.

- [ ] **Step 6: Commit standalone app shell**

Run:

```bash
git add -- cost-calculator/index.html cost-calculator/styles.css cost-calculator/app.js tests/cost-calculator-static.test.js
git commit -m "feat: add cost calculator app shell"
```

Expected: Commit succeeds and does not include root `index.html`.

## Task 3: Browser State, Rendering, And Persistence

**Files:**
- Modify: `cost-calculator/app.js`
- Test: `tests/cost-core.test.js`
- Test: `tests/cost-calculator-static.test.js`

- [ ] **Step 1: Replace the placeholder app script with full browser logic**

Replace `cost-calculator/app.js` with:

```js
(() => {
  "use strict";

  const STORAGE_KEY = "cost-calculator-data-v1";
  const {
    calculateProduct,
    createMaterial,
    createProduct,
    normalizeDataSet,
    validateImportData,
  } = window.CostCore;

  const elements = {
    productList: document.querySelector("#productList"),
    productForm: document.querySelector("#productForm"),
    productName: document.querySelector("#productName"),
    salePrice: document.querySelector("#salePrice"),
    packagingCost: document.querySelector("#packagingCost"),
    laborCost: document.querySelector("#laborCost"),
    otherCost: document.querySelector("#otherCost"),
    materialsList: document.querySelector("#materialsList"),
    materialTotal: document.querySelector("#materialTotal"),
    totalCost: document.querySelector("#totalCost"),
    grossProfit: document.querySelector("#grossProfit"),
    grossMargin: document.querySelector("#grossMargin"),
    summaryPanel: document.querySelector("#summaryPanel"),
    addProductButton: document.querySelector("#addProductButton"),
    addMaterialButton: document.querySelector("#addMaterialButton"),
    deleteProductButton: document.querySelector("#deleteProductButton"),
    exportButton: document.querySelector("#exportButton"),
    importInput: document.querySelector("#importInput"),
    statusLine: document.querySelector("#statusLine"),
  };

  let data = loadData();

  function loadData() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return normalizeDataSet(stored ? JSON.parse(stored) : null);
    } catch (error) {
      return normalizeDataSet(null);
    }
  }

  function saveData() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function selectedProduct() {
    return data.products.find((product) => product.id === data.selectedProductId) || data.products[0];
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return `${Math.round(value * 1000) / 10}%`;
  }

  function setStatus(message) {
    elements.statusLine.textContent = message;
    if (!message) return;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      elements.statusLine.textContent = "";
    }, 2600);
  }

  function render() {
    const product = selectedProduct();
    renderProducts(product);
    renderForm(product);
    renderMaterials(product);
    renderSummary(product);
    saveData();
  }

  function renderProducts(activeProduct) {
    elements.productList.innerHTML = "";
    data.products.forEach((product) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = product.id === activeProduct.id ? "product-item active" : "product-item";
      button.textContent = product.name || "未命名商品";
      button.addEventListener("click", () => {
        data.selectedProductId = product.id;
        render();
      });
      elements.productList.appendChild(button);
    });
  }

  function renderForm(product) {
    elements.productName.value = product.name;
    elements.salePrice.value = product.salePrice || "";
    elements.packagingCost.value = product.packagingCost || "";
    elements.laborCost.value = product.laborCost || "";
    elements.otherCost.value = product.otherCost || "";
  }

  function renderMaterials(product) {
    const totals = calculateProduct(product);
    elements.materialsList.innerHTML = "";
    product.materials.forEach((material, index) => {
      const total = totals.materialRows.find((row) => row.id === material.id);
      const row = document.createElement("div");
      row.className = "material-row";
      row.innerHTML = `
        <div class="field material-name">
          <label>材料名稱</label>
          <input data-material-field="name" data-material-id="${material.id}" type="text" value="${escapeHtml(material.name)}">
        </div>
        <div class="field">
          <label>用量</label>
          <input data-material-field="quantity" data-material-id="${material.id}" type="number" min="0" step="0.01" inputmode="decimal" value="${material.quantity || ""}">
        </div>
        <div class="field">
          <label>單價</label>
          <input data-material-field="unitPrice" data-material-id="${material.id}" type="number" min="0" step="0.01" inputmode="decimal" value="${material.unitPrice || ""}">
        </div>
        <output>${formatCurrency(total ? total.rowCost : 0)}</output>
        <button class="icon-button remove-material" data-remove-material="${material.id}" type="button" aria-label="刪除第 ${index + 1} 個材料">×</button>
      `;
      elements.materialsList.appendChild(row);
    });
  }

  function renderSummary(product) {
    const totals = calculateProduct(product);
    elements.materialTotal.textContent = formatCurrency(totals.materialTotal);
    elements.totalCost.textContent = formatCurrency(totals.totalCost);
    elements.grossProfit.textContent = formatCurrency(totals.grossProfit);
    elements.grossMargin.textContent = formatPercent(totals.grossMargin);
    elements.summaryPanel.classList.toggle("negative", totals.isNegativeProfit);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function updateProductField(field, value) {
    const product = selectedProduct();
    product[field] = field === "name" ? value : value === "" ? 0 : Number(value);
    render();
  }

  function addProduct() {
    const product = createProduct(`商品 ${data.products.length + 1}`);
    data.products.push(product);
    data.selectedProductId = product.id;
    render();
    elements.productName.focus();
  }

  function deleteProduct() {
    if (data.products.length === 1) {
      setStatus("至少需要保留一個商品");
      return;
    }
    if (!window.confirm("確定要刪除這個商品嗎？")) return;
    data.products = data.products.filter((product) => product.id !== data.selectedProductId);
    data.selectedProductId = data.products[0].id;
    render();
    setStatus("商品已刪除");
  }

  function addMaterial() {
    selectedProduct().materials.push(createMaterial());
    render();
  }

  function updateMaterial(materialId, field, value) {
    const material = selectedProduct().materials.find((item) => item.id === materialId);
    if (!material) return;
    material[field] = field === "name" ? value : value === "" ? 0 : Number(value);
    render();
  }

  function removeMaterial(materialId) {
    const product = selectedProduct();
    if (product.materials.length === 1) {
      product.materials = [createMaterial()];
    } else {
      product.materials = product.materials.filter((material) => material.id !== materialId);
    }
    render();
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cost-calculator-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("備份已匯出");
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = validateImportData(parsed);
        if (!result.ok) {
          setStatus(result.message);
          return;
        }
        if (!window.confirm("匯入會取代目前所有資料，確定繼續嗎？")) return;
        data = result.data;
        render();
        setStatus("備份已匯入");
      } catch (error) {
        setStatus("備份檔不是有效的 JSON");
      } finally {
        elements.importInput.value = "";
      }
    });
    reader.readAsText(file);
  }

  elements.productName.addEventListener("input", (event) => updateProductField("name", event.target.value));
  elements.salePrice.addEventListener("input", (event) => updateProductField("salePrice", event.target.value));
  elements.packagingCost.addEventListener("input", (event) => updateProductField("packagingCost", event.target.value));
  elements.laborCost.addEventListener("input", (event) => updateProductField("laborCost", event.target.value));
  elements.otherCost.addEventListener("input", (event) => updateProductField("otherCost", event.target.value));
  elements.addProductButton.addEventListener("click", addProduct);
  elements.deleteProductButton.addEventListener("click", deleteProduct);
  elements.addMaterialButton.addEventListener("click", addMaterial);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importInput.addEventListener("change", (event) => importBackup(event.target.files[0]));

  elements.materialsList.addEventListener("input", (event) => {
    const field = event.target.dataset.materialField;
    const materialId = event.target.dataset.materialId;
    if (field && materialId) updateMaterial(materialId, field, event.target.value);
  });

  elements.materialsList.addEventListener("click", (event) => {
    const materialId = event.target.dataset.removeMaterial;
    if (materialId) removeMaterial(materialId);
  });

  render();
})();
```

- [ ] **Step 2: Run the JavaScript tests**

Run:

```bash
node tests/cost-core.test.js
node tests/cost-calculator-static.test.js
```

Expected: both tests pass.

- [ ] **Step 3: Manually check local storage wiring in the browser**

Open `cost-calculator/index.html` in a browser, add a product named `測試商品`, set `售價` to `100`, refresh the page, and confirm `測試商品` and `100` are still visible.

- [ ] **Step 4: Commit browser app logic**

Run:

```bash
git add -- cost-calculator/app.js
git commit -m "feat: wire cost calculator interactions"
```

Expected: Commit succeeds and does not include root `index.html`.

## Task 4: Mobile-First Styling

**Files:**
- Modify: `cost-calculator/styles.css`
- Test: `tests/cost-calculator-static.test.js`

- [ ] **Step 1: Replace placeholder CSS with scoped mobile-first styles**

Replace `cost-calculator/styles.css` with:

```css
:root {
  color-scheme: light;
  --ink: #17211d;
  --muted: #647067;
  --line: #d8ded9;
  --paper: #fbfcfb;
  --surface: #ffffff;
  --accent: #0f766e;
  --accent-strong: #115e59;
  --danger: #b42318;
  --danger-soft: #fff0ed;
  --warning: #8a4b0f;
  --warning-soft: #fff7df;
  font-family: Inter, "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
}

button,
input,
label {
  font: inherit;
}

button {
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}

button:active {
  transform: translateY(1px);
}

.app-shell {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 16px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0 16px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
}

h1,
h2 {
  margin: 0;
  letter-spacing: 0;
}

h1 {
  font-size: 1.55rem;
}

h2 {
  font-size: 1.05rem;
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 1.2rem;
}

.icon-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.workspace {
  display: grid;
  gap: 14px;
}

.product-panel,
.editor-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  padding: 14px;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panel-heading button,
.danger-button {
  padding: 0 14px;
}

.product-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.product-item {
  flex: 0 0 auto;
  max-width: 180px;
  padding: 0 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-item.active {
  border-color: var(--accent);
  background: #e7f5f3;
  color: var(--accent-strong);
  font-weight: 700;
}

.field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.field label {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.field input {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
  color: var(--ink);
}

.field input:focus {
  border-color: var(--accent);
  outline: 3px solid #c7ece8;
}

.full {
  margin-bottom: 12px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.materials-section {
  margin-top: 18px;
}

.materials-list {
  display: grid;
  gap: 12px;
}

.material-row {
  display: grid;
  grid-template-columns: 1fr 0.65fr 0.65fr auto 44px;
  gap: 8px;
  align-items: end;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fbfcfb;
}

.material-row output {
  min-width: 84px;
  min-height: 44px;
  display: grid;
  place-items: center end;
  color: var(--accent-strong);
  font-weight: 800;
}

.remove-material {
  color: var(--danger);
}

.summary-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.summary-panel div {
  display: grid;
  gap: 5px;
  min-height: 72px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #f8fbfa;
}

.summary-panel span {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.summary-panel strong {
  font-size: 1.2rem;
  overflow-wrap: anywhere;
}

.summary-panel.negative div:nth-child(3) {
  border-color: #f2b8ad;
  background: var(--danger-soft);
  color: var(--danger);
}

.danger-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.danger-button {
  border-color: #f2b8ad;
  color: var(--danger);
}

.status-line {
  min-height: 24px;
  margin: 12px 0 0;
  color: var(--warning);
  font-weight: 700;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 12px;
  }

  .app-header {
    align-items: flex-start;
  }

  .input-grid,
  .summary-panel {
    grid-template-columns: 1fr 1fr;
  }

  .material-row {
    grid-template-columns: 1fr 1fr 44px;
  }

  .material-name {
    grid-column: 1 / -1;
  }

  .material-row output {
    grid-column: 1 / 3;
    justify-content: start;
    place-items: center start;
  }
}

@media (min-width: 900px) {
  .workspace {
    grid-template-columns: 280px 1fr;
    align-items: start;
  }

  .product-list {
    display: grid;
    overflow: visible;
  }

  .product-item {
    width: 100%;
    max-width: none;
    text-align: left;
  }
}
```

- [ ] **Step 2: Run static and core tests**

Run:

```bash
node tests/cost-core.test.js
node tests/cost-calculator-static.test.js
```

Expected: both tests pass.

- [ ] **Step 3: Manual mobile viewport check**

Open `cost-calculator/index.html` and inspect at a 390px-wide mobile viewport. Confirm:

- Product buttons stay readable and scroll horizontally.
- Material rows wrap into a usable phone layout.
- Summary numbers do not overlap.
- Import and export buttons remain tappable.

- [ ] **Step 4: Commit styling**

Run:

```bash
git add -- cost-calculator/styles.css
git commit -m "style: add mobile cost calculator layout"
```

Expected: Commit succeeds and does not include root `index.html`.

## Task 5: Import, Export, And End-To-End Verification

**Files:**
- Modify: `tests/cost-calculator-static.test.js`
- Test manually: `cost-calculator/index.html`

- [ ] **Step 1: Strengthen static checks for backup and scoped files**

Replace `tests/cost-calculator-static.test.js` with:

```js
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

["index.html", "styles.css", "app.js", "cost-core.js"].forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, "cost-calculator", file)), `${file} exists`);
});

const html = read("cost-calculator/index.html");
const app = read("cost-calculator/app.js");
const css = read("cost-calculator/styles.css");

assert.ok(html.includes('<meta name="viewport"'), "mobile viewport meta exists");
assert.ok(html.includes('id="productList"'), "product list exists");
assert.ok(html.includes('id="productForm"'), "product form exists");
assert.ok(html.includes('id="materialsList"'), "materials list exists");
assert.ok(html.includes('id="summaryPanel"'), "summary panel exists");
assert.ok(html.includes('id="exportButton"'), "export button exists");
assert.ok(html.includes('id="importInput"'), "import input exists");
assert.ok(html.includes('accept="application/json"'), "import only accepts JSON");
assert.ok(html.includes("cost-core.js"), "loads core script");
assert.ok(html.includes("app.js"), "loads app script");
assert.ok(!html.includes("../styles.css"), "does not depend on root styles");
assert.ok(!html.includes("../script.js"), "does not depend on root script");

assert.ok(app.includes("localStorage"), "app uses localStorage");
assert.ok(app.includes("JSON.stringify(data, null, 2)"), "app exports formatted JSON");
assert.ok(app.includes("validateImportData"), "app validates imports");
assert.ok(app.includes("window.confirm"), "app confirms destructive actions");
assert.ok(app.includes("summaryPanel.classList.toggle(\"negative\""), "negative profit is highlighted");

assert.ok(css.includes("@media (max-width: 720px)"), "mobile styles exist");
assert.ok(css.includes(".summary-panel.negative"), "negative profit style exists");

console.log("Cost calculator static checks passed");
```

- [ ] **Step 2: Run the full local test set**

Run:

```bash
node tests/cost-core.test.js
node tests/cost-calculator-static.test.js
node tests/static-site.test.js
```

Expected:

- `Cost core checks passed`
- `Cost calculator static checks passed`
- `Static site checks passed`

If `tests/static-site.test.js` fails because of the existing garbled root-site assertions, report that separately and do not modify root website files as part of this cost calculator task.

- [ ] **Step 3: Manual import/export verification**

In the browser:

1. Open `cost-calculator/index.html`.
2. Create a product named `備份測試`.
3. Set sale price to `100`.
4. Add a material named `材料A`, quantity `2`, and unit price `10`.
5. Confirm material cost is `NT$20.00`, total cost is `NT$20.00`, gross profit is `NT$80.00`, and gross margin is `80%`.
6. Click export and confirm a JSON file downloads.
7. Change the product name to `改過的名稱`.
8. Import the downloaded JSON file.
9. Confirm the product name returns to `備份測試`.

- [ ] **Step 4: Confirm existing root website files were not modified**

Run:

```bash
git status --short
```

Expected: Any changes for this feature are only in `cost-calculator/` and `tests/`. The existing `M index.html` may still appear because it was present before this feature; do not stage or commit it.

- [ ] **Step 5: Commit final verification test**

Run:

```bash
git add -- tests/cost-calculator-static.test.js
git commit -m "test: cover cost calculator app"
```

Expected: Commit succeeds and does not include root `index.html`.

## Completion Checklist

- [ ] `cost-calculator/index.html` opens as a standalone app.
- [ ] `cost-calculator/styles.css` keeps phone layout usable at 390px width.
- [ ] `cost-calculator/app.js` supports product CRUD, material CRUD, local storage, export, and import.
- [ ] `cost-calculator/cost-core.js` calculation rules match the design spec.
- [ ] `tests/cost-core.test.js` passes.
- [ ] `tests/cost-calculator-static.test.js` passes.
- [ ] Root website files remain untouched by this feature.
- [ ] User is given the local file path for opening the app.
