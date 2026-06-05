# Products Cart Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `products.html` and `checkout.html` with a localStorage cart, quantity controls, order totals, and Google Sheets order submission with LINE/Instagram payment confirmation guidance.

**Architecture:** Keep the existing brand page and inquiry form intact. Add a focused `commerce.js` module-like script for product catalog data, cart persistence, product-page behavior, checkout rendering, order validation, and order submission. Extend `google-apps-script.js` so the existing Apps Script endpoint routes `type: "inquiry"` and `type: "order"` payloads to separate sheets.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, browser `localStorage`, Google Apps Script, Node.js static tests, headless Edge browser verification.

---

## File Structure

- Modify: `index.html`
  - Preserve the user's existing local edits, including `果緣果物 Fortune Fruits`, `果切作品展示`, and Instagram `fortune.fruits.tw`.
  - Add a navigation link to `products.html`.
- Create: `products.html`
  - Product listing page with three fixed products, quantity inputs, add-to-cart controls, and checkout navigation.
- Create: `checkout.html`
  - Cart review and checkout page with editable quantities, order total, customer fields, order submission, and success summary.
- Modify: `styles.css`
  - Add shared shop, product, cart, checkout, quantity, and order-status styling.
- Create: `commerce.js`
  - Own product catalog, `fortuneFruitsCart` localStorage helpers, cart count, product-page add-to-cart behavior, checkout rendering, form validation, and order submission.
- Modify: `google-apps-script.js`
  - Preserve inquiry support.
  - Add order routing to an `Orders` sheet.
- Modify: `tests/static-site.test.js`
  - Add static assertions for product and checkout pages, cart hooks, order fields, product data, and Apps Script order support.

## Current Dirty Worktree Note

Before implementation, `index.html` has user edits that must be preserved:

```diff
- 果緣 Fortune Fruits
+ 果緣果物 Fortune Fruits

- 作品集式果切提案
+ 果切作品展示

- https://www.instagram.com/fortune.fruits
+ https://www.instagram.com/fortune.fruits.tw
```

When modifying `index.html`, apply only the `商品` navigation link and do not revert these changes.

## Task 1: Static Coverage for Commerce Pages

**Files:**
- Modify: `tests/static-site.test.js`

- [ ] **Step 1: Add failing static assertions**

Update `tests/static-site.test.js` so the top file existence block becomes:

```javascript
assert.ok(fs.existsSync(path.join(root, "index.html")), "index.html exists");
assert.ok(fs.existsSync(path.join(root, "products.html")), "products.html exists");
assert.ok(fs.existsSync(path.join(root, "checkout.html")), "checkout.html exists");
assert.ok(fs.existsSync(path.join(root, "styles.css")), "styles.css exists");
assert.ok(fs.existsSync(path.join(root, "script.js")), "script.js exists");
assert.ok(fs.existsSync(path.join(root, "commerce.js")), "commerce.js exists");
assert.ok(
  fs.existsSync(path.join(root, "google-apps-script.js")),
  "google-apps-script.js exists",
);
```

Then add these reads after the existing `html`, `css`, and `js` reads:

```javascript
const productsHtml = read("products.html");
const checkoutHtml = read("checkout.html");
const commerceJs = read("commerce.js");
```

Add this assertion after the home section ID checks:

```javascript
assert.ok(html.includes('href="products.html"'), "home page links to products");
```

Add this block after the existing asset checks:

```javascript
[
  "small-meeting-fruit",
  "business-gift-box",
  "party-platter",
  "NT$ 880",
  "NT$ 1,680",
  "NT$ 2,880",
  'data-product-id="small-meeting-fruit"',
  'data-product-id="business-gift-box"',
  'data-product-id="party-platter"',
].forEach((text) => {
  assert.ok(productsHtml.includes(text), `products page contains ${text}`);
});

[
  'name="customerName"',
  'name="phone"',
  'name="lineId"',
  'name="deliveryDate"',
  'name="address"',
  'name="orderNotes"',
  "cartItems",
  "cartTotal",
  "orderSummary",
].forEach((text) => {
  assert.ok(checkoutHtml.includes(text), `checkout page contains ${text}`);
});
```

Add these CSS selectors to the existing CSS selector array:

```javascript
".shop-page",
".product-grid",
".cart-line",
".checkout-form",
```

Add this block after the existing JS hook checks:

```javascript
[
  "fortuneFruitsCart",
  "PRODUCTS",
  "addToCart",
  "renderCartCount",
  "renderCheckout",
  "submitOrder",
  "type: \"order\"",
].forEach((hook) => {
  assert.ok(commerceJs.includes(hook), `commerce JS contains ${hook}`);
});
```

Add these Apps Script hooks to the existing Apps Script hook array:

```javascript
"ORDERS_SHEET_NAME",
"routeRequest",
"appendOrder",
"type === \"order\"",
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL with `products.html exists` because `products.html`, `checkout.html`, and `commerce.js` do not exist yet.

- [ ] **Step 3: Commit the failing test**

Run:

```powershell
git add tests/static-site.test.js
git commit -m "test: add commerce page static checks"
```

Expected: commit succeeds with only `tests/static-site.test.js`.

## Task 2: Product and Checkout HTML

**Files:**
- Modify: `index.html`
- Create: `products.html`
- Create: `checkout.html`

- [ ] **Step 1: Add product navigation to the home page**

In `index.html`, inside `<nav class="site-nav">`, insert this link between the existing `作品` and `流程` links:

```html
<a href="products.html">商品</a>
```

Preserve all current user edits in `index.html`.

- [ ] **Step 2: Create `products.html`**

Create `products.html` with this content:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="果緣果物 Fortune Fruits 商品頁，提供商務果切、招待禮盒與活動派對拼盤，可加入購物車並前往結帳。"
    />
    <title>商品 | 果緣果物 Fortune Fruits</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="commerce.js" defer></script>
  </head>
  <body class="shop-page" data-page="products">
    <header class="site-header" aria-label="主要導覽">
      <a class="brand-mark" href="index.html" aria-label="回到首頁">
        <span>果緣果物</span>
        <small>Fortune Fruits</small>
      </a>
      <nav class="site-nav">
        <a href="index.html">首頁</a>
        <a href="products.html" aria-current="page">商品</a>
        <a href="checkout.html">購物車 <span class="cart-count" data-cart-count>0</span></a>
      </nav>
    </header>

    <main>
      <section class="shop-hero">
        <p class="eyebrow">Products</p>
        <h1>商務果切商品</h1>
        <p>
          選擇適合場合的果切提案，加入購物車後送出訂單，我們將透過 LINE 或 Instagram 與您確認付款與交付細節。
        </p>
      </section>

      <section class="section product-section" aria-labelledby="products-title">
        <div class="section-heading">
          <h2 id="products-title">精選商品</h2>
          <p>第一版提供三種常用場合方案，實際內容會依季節水果調整。</p>
        </div>

        <div class="product-grid">
          <article class="product-card" data-product-id="small-meeting-fruit">
            <img src="assets/idea1.jpg" alt="小型會議果切，以柑橘、西瓜與藍莓排列成多盒拼盤" />
            <div class="product-card-body">
              <p class="product-tag">Meeting</p>
              <h3>小型會議果切</h3>
              <p>適合小型會議、內部討論與輕食茶點，清爽好入口。</p>
              <strong class="product-price">NT$ 880</strong>
              <label>
                數量
                <input class="quantity-input" type="number" min="1" value="1" data-quantity />
              </label>
              <button type="button" data-add-to-cart>加入購物車</button>
            </div>
          </article>

          <article class="product-card" data-product-id="business-gift-box">
            <img src="assets/idea2.jpg" alt="商務招待禮盒，以莓果、柑橘、葡萄與哈密瓜呈現高級禮盒感" />
            <div class="product-card-body">
              <p class="product-tag">Gift</p>
              <h3>商務招待禮盒</h3>
              <p>適合客戶拜訪、貴賓接待與企業贈禮，呈現精緻款待。</p>
              <strong class="product-price">NT$ 1,680</strong>
              <label>
                數量
                <input class="quantity-input" type="number" min="1" value="1" data-quantity />
              </label>
              <button type="button" data-add-to-cart>加入購物車</button>
            </div>
          </article>

          <article class="product-card" data-product-id="party-platter">
            <img src="assets/idea3.jpg" alt="活動派對拼盤，包含鳳梨、葡萄、莓果與多色水果" />
            <div class="product-card-body">
              <p class="product-tag">Event</p>
              <h3>活動派對拼盤</h3>
              <p>適合活動、派對與多人聚會，色彩豐盛，桌面效果亮眼。</p>
              <strong class="product-price">NT$ 2,880</strong>
              <label>
                數量
                <input class="quantity-input" type="number" min="1" value="1" data-quantity />
              </label>
              <button type="button" data-add-to-cart>加入購物車</button>
            </div>
          </article>
        </div>

        <p class="shop-status" data-shop-status role="status" aria-live="polite"></p>
      </section>
    </main>

    <footer class="site-footer">
      <p>果緣果物 Fortune Fruits</p>
      <p><a href="checkout.html">前往購物車結帳</a></p>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Create `checkout.html`**

Create `checkout.html` with this content:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="果緣果物 Fortune Fruits 結帳頁，可確認購物車、填寫訂購資料，並送出訂單後透過 LINE 或 Instagram 確認付款。"
    />
    <title>結帳 | 果緣果物 Fortune Fruits</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="commerce.js" defer></script>
  </head>
  <body class="shop-page" data-page="checkout">
    <header class="site-header" aria-label="主要導覽">
      <a class="brand-mark" href="index.html" aria-label="回到首頁">
        <span>果緣果物</span>
        <small>Fortune Fruits</small>
      </a>
      <nav class="site-nav">
        <a href="index.html">首頁</a>
        <a href="products.html">商品</a>
        <a href="checkout.html" aria-current="page">購物車 <span class="cart-count" data-cart-count>0</span></a>
      </nav>
    </header>

    <main>
      <section class="shop-hero">
        <p class="eyebrow">Checkout</p>
        <h1>確認訂單</h1>
        <p>送出後我們會收到您的訂單，並透過 LINE 或 Instagram 與您確認付款與交付細節。</p>
      </section>

      <section class="section checkout-section" aria-labelledby="checkout-title">
        <div class="checkout-layout">
          <div class="cart-panel">
            <h2 id="checkout-title">購物車</h2>
            <div class="cart-items" id="cartItems" data-cart-items></div>
            <div class="empty-cart" data-empty-cart hidden>
              <p>購物車目前是空的。</p>
              <a class="primary-action" href="products.html">回商品頁選購</a>
            </div>
            <div class="cart-total-row">
              <span>總金額</span>
              <strong id="cartTotal" data-cart-total>NT$ 0</strong>
            </div>
          </div>

          <form class="checkout-form" novalidate data-checkout-form>
            <h2>訂購資料</h2>
            <label>
              姓名
              <input type="text" name="customerName" autocomplete="name" required />
              <span class="field-error" data-error-for="customerName"></span>
            </label>
            <label>
              電話
              <input type="tel" name="phone" autocomplete="tel" required />
              <span class="field-error" data-error-for="phone"></span>
            </label>
            <label>
              LINE ID
              <input type="text" name="lineId" required />
              <span class="field-error" data-error-for="lineId"></span>
            </label>
            <label>
              取貨/配送日期
              <input type="date" name="deliveryDate" required />
              <span class="field-error" data-error-for="deliveryDate"></span>
            </label>
            <label class="full">
              地址
              <input type="text" name="address" autocomplete="street-address" required />
              <span class="field-error" data-error-for="address"></span>
            </label>
            <label class="full">
              備註
              <textarea name="orderNotes" rows="4" placeholder="希望時段、場合、付款或配送備註"></textarea>
            </label>
            <button type="submit">送出訂單</button>
            <p class="form-status" data-order-status role="status" aria-live="polite"></p>
          </form>
        </div>

        <div class="order-summary" id="orderSummary" data-order-summary hidden></div>
      </section>
    </main>

    <footer class="site-footer">
      <p>果緣果物 Fortune Fruits</p>
      <p>
        <a href="https://line.me/R/ti/p/@fortune-fruits">LINE</a>
        ·
        <a href="https://www.instagram.com/fortune.fruits.tw">Instagram</a>
      </p>
    </footer>
  </body>
</html>
```

- [ ] **Step 4: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL with `commerce.js exists` or commerce hook failures because `commerce.js` does not exist yet.

- [ ] **Step 5: Commit the page structure**

Run:

```powershell
git add index.html products.html checkout.html
git commit -m "feat: add product and checkout pages"
```

Expected: commit succeeds. Confirm `git diff HEAD~1 -- index.html` shows only the `products.html` navigation addition plus the existing user edits carried forward.

## Task 3: Commerce Frontend Logic

**Files:**
- Create: `commerce.js`

- [ ] **Step 1: Create `commerce.js`**

Create `commerce.js` with this content:

```javascript
const CART_STORAGE_KEY = "fortuneFruitsCart";
const ORDER_ENDPOINT = window.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbz9JGXYGwrDCXr96WssJeCz4eK3mXPiXImWEld-bCjEjA20-EM5f_t3VZQcyY1VGTFu/exec";

const PRODUCTS = [
  {
    id: "small-meeting-fruit",
    name: "小型會議果切",
    price: 880,
    image: "assets/idea1.jpg",
  },
  {
    id: "business-gift-box",
    name: "商務招待禮盒",
    price: 1680,
    image: "assets/idea2.jpg",
  },
  {
    id: "party-platter",
    name: "活動派對拼盤",
    price: 2880,
    image: "assets/idea3.jpg",
  },
];

const commerceMessages = {
  added: "已加入購物車。",
  required: "請填寫這個欄位",
  phoneTooShort: "請留下可聯繫的電話",
  emptyCart: "購物車目前是空的，請先選擇商品。",
  sending: "訂單送出中，請稍候…",
  success: "訂單已送出，請透過 LINE 或 Instagram 聯絡我們確認付款。",
  failed: "訂單送出失敗，請稍後再試，或直接透過 LINE / Instagram 聯絡我們。",
};

function formatCurrency(amount) {
  return `NT$ ${Number(amount).toLocaleString("zh-TW")}`;
}

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCartCount();
}

function getCartCount(cart = getCart()) {
  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getCartTotal(cart = getCart()) {
  return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
}

function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function addToCart(productId, quantity) {
  const product = findProduct(productId);
  if (!product) return;

  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += safeQuantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: safeQuantity,
    });
  }

  saveCart(cart);
}

function updateCartItem(productId, quantity) {
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, quantity: safeQuantity } : item,
  );
  saveCart(cart);
  renderCheckout();
}

function removeCartItem(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCheckout();
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  renderCartCount();
}

function renderCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((target) => {
    target.textContent = String(getCartCount());
  });
}

function renderProductPage() {
  const status = document.querySelector("[data-shop-status]");

  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-product-id]");
      if (!card) return;

      const input = card.querySelector("[data-quantity]");
      addToCart(card.dataset.productId, input ? input.value : 1);

      if (status) {
        const product = findProduct(card.dataset.productId);
        status.textContent = `${product.name}${commerceMessages.added}`;
      }
    });
  });
}

function createCartLine(item) {
  const line = document.createElement("article");
  line.className = "cart-line";
  line.dataset.productId = item.id;
  line.innerHTML = `
    <div>
      <h3>${item.name}</h3>
      <p>${formatCurrency(item.price)} / 份</p>
    </div>
    <label>
      數量
      <input type="number" min="1" value="${item.quantity}" data-cart-quantity />
    </label>
    <strong>${formatCurrency(item.price * item.quantity)}</strong>
    <button type="button" data-remove-item>移除</button>
  `;

  line.querySelector("[data-cart-quantity]").addEventListener("change", (event) => {
    updateCartItem(item.id, event.target.value);
  });

  line.querySelector("[data-remove-item]").addEventListener("click", () => {
    removeCartItem(item.id);
  });

  return line;
}

function renderCheckout() {
  const cartItems = document.querySelector("[data-cart-items]");
  const emptyCart = document.querySelector("[data-empty-cart]");
  const totalTarget = document.querySelector("[data-cart-total]");
  const form = document.querySelector("[data-checkout-form]");

  if (!cartItems || !totalTarget) return;

  const cart = getCart();
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    cartItems.appendChild(createCartLine(item));
  });

  totalTarget.textContent = formatCurrency(getCartTotal(cart));

  const isEmpty = cart.length === 0;
  if (emptyCart) emptyCart.hidden = !isEmpty;
  if (form) form.hidden = isEmpty;
}

function clearOrderErrors(form) {
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function showOrderError(form, fieldName, message) {
  const target = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (target) {
    target.textContent = message;
  }
}

function getOrderFormPayload(form) {
  const data = new FormData(form);
  return {
    customerName: String(data.get("customerName") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    lineId: String(data.get("lineId") || "").trim(),
    deliveryDate: String(data.get("deliveryDate") || "").trim(),
    address: String(data.get("address") || "").trim(),
    orderNotes: String(data.get("orderNotes") || "").trim(),
  };
}

function validateOrderForm(form) {
  const payload = getOrderFormPayload(form);
  const requiredFields = ["customerName", "phone", "lineId", "deliveryDate", "address"];
  let isValid = true;

  clearOrderErrors(form);

  requiredFields.forEach((fieldName) => {
    if (!payload[fieldName]) {
      showOrderError(form, fieldName, commerceMessages.required);
      isValid = false;
    }
  });

  if (payload.phone && payload.phone.length < 6) {
    showOrderError(form, "phone", commerceMessages.phoneTooShort);
    isValid = false;
  }

  return isValid;
}

function createOrderPayload(form) {
  const cart = getCart();
  const customer = getOrderFormPayload(form);
  return {
    type: "order",
    orderId: `FF-${Date.now()}`,
    customer,
    items: cart,
    total: getCartTotal(cart),
    source: window.location.href,
  };
}

async function submitOrder(payload) {
  try {
    await fetch(ORDER_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
}

function renderOrderSummary(payload) {
  const target = document.querySelector("[data-order-summary]");
  if (!target) return;

  const itemRows = payload.items
    .map((item) => `<li>${item.name} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}</li>`)
    .join("");

  target.hidden = false;
  target.innerHTML = `
    <h2>訂單摘要</h2>
    <p>訂單編號：${payload.orderId}</p>
    <ul>${itemRows}</ul>
    <strong>總金額：${formatCurrency(payload.total)}</strong>
    <p>請透過 <a href="https://line.me/R/ti/p/@fortune-fruits">LINE</a> 或 <a href="https://www.instagram.com/fortune.fruits.tw">Instagram</a> 聯絡我們確認付款。</p>
  `;
}

function bindCheckoutForm() {
  const form = document.querySelector("[data-checkout-form]");
  const status = document.querySelector("[data-order-status]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (getCart().length === 0) {
      if (status) status.textContent = commerceMessages.emptyCart;
      return;
    }

    if (!validateOrderForm(form)) {
      if (status) status.textContent = "請確認必填資訊後再送出。";
      return;
    }

    const payload = createOrderPayload(form);
    if (status) status.textContent = commerceMessages.sending;

    const result = await submitOrder(payload);
    if (!result.ok) {
      if (status) status.textContent = commerceMessages.failed;
      return;
    }

    renderOrderSummary(payload);
    clearCart();
    renderCheckout();
    form.reset();
    if (status) status.textContent = commerceMessages.success;
  });
}

renderCartCount();

if (document.body.dataset.page === "products") {
  renderProductPage();
}

if (document.body.dataset.page === "checkout") {
  renderCheckout();
  bindCheckoutForm();
}
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL with CSS selector failures because shop styles are not added yet, or PASS if all static selectors already exist from previous edits.

- [ ] **Step 3: Commit commerce logic if static failures are only CSS-related**

Run:

```powershell
git add commerce.js
git commit -m "feat: add static cart commerce logic"
```

Expected: commit succeeds with `commerce.js`.

## Task 4: Commerce Styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add commerce styles**

Append this CSS to `styles.css` before the first `@media` block:

```css
.shop-page {
  background: var(--paper);
}

.shop-hero {
  padding: calc(76px + clamp(64px, 8vw, 110px)) clamp(20px, 6vw, 86px) clamp(48px, 7vw, 86px);
  background: linear-gradient(135deg, rgba(233, 241, 223, 0.92), rgba(255, 255, 255, 0.92));
}

.shop-hero h1 {
  max-width: 780px;
  margin-bottom: 20px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.8rem, 7vw, 6.5rem);
  line-height: 0.98;
  font-weight: 500;
}

.shop-hero p:not(.eyebrow) {
  max-width: 720px;
  color: var(--muted);
  font-size: 1.08rem;
}

.cart-count {
  display: inline-flex;
  min-width: 24px;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  border-radius: 999px;
  background: var(--citrus);
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 800;
}

.product-section {
  background: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  display: grid;
  grid-template-rows: minmax(260px, 22vw) 1fr;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--paper);
}

.product-card-body {
  display: grid;
  gap: 14px;
  padding: 24px;
}

.product-tag {
  margin: 0;
  color: var(--leaf);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.product-card h3 {
  margin-bottom: 0;
  color: var(--leaf-dark);
  font-size: 1.35rem;
}

.product-card p {
  margin-bottom: 0;
  color: var(--muted);
}

.product-price {
  color: var(--berry);
  font-size: 1.35rem;
}

.product-card label,
.checkout-form label,
.cart-line label {
  display: grid;
  gap: 8px;
  color: var(--leaf-dark);
  font-weight: 700;
}

.quantity-input,
.cart-line input,
.checkout-form input,
.checkout-form textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  font: inherit;
  padding: 12px 14px;
}

.product-card button,
.cart-line button,
.checkout-form button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--leaf-dark);
  background: var(--leaf-dark);
  color: #fff;
  padding: 12px 18px;
  font-weight: 800;
  cursor: pointer;
}

.cart-line button {
  background: transparent;
  color: var(--leaf-dark);
}

.shop-status {
  min-height: 26px;
  margin-top: 22px;
  color: var(--leaf-dark);
  font-weight: 800;
}

.checkout-section {
  background: #fff;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(340px, 1.05fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
}

.cart-panel,
.checkout-form,
.order-summary {
  border: 1px solid var(--line);
  background: var(--paper);
  padding: clamp(22px, 4vw, 36px);
}

.cart-items {
  display: grid;
  gap: 14px;
}

.cart-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px minmax(110px, auto) auto;
  gap: 14px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.cart-line h3,
.cart-line p {
  margin: 0;
}

.cart-line p {
  color: var(--muted);
}

.empty-cart[hidden],
.order-summary[hidden],
.checkout-form[hidden] {
  display: none;
}

.cart-total-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid var(--leaf-dark);
  font-size: 1.2rem;
}

.checkout-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.checkout-form h2,
.checkout-form .full,
.checkout-form button,
.checkout-form .form-status {
  grid-column: 1 / -1;
}

.order-summary {
  margin-top: 28px;
}

.order-summary ul {
  padding-left: 20px;
}
```

Then add these rules inside the existing `@media (max-width: 980px)` block:

```css
.product-grid,
.checkout-layout {
  grid-template-columns: 1fr;
}
```

Then add these rules inside the existing `@media (max-width: 760px)` block:

```css
.shop-hero {
  padding-top: 54px;
}

.product-grid,
.checkout-form,
.cart-line {
  grid-template-columns: 1fr;
}

.product-card {
  grid-template-rows: auto 1fr;
}

.product-card img {
  aspect-ratio: 4 / 3;
}
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS if commerce static hooks and CSS selectors are present.

- [ ] **Step 3: Commit commerce styling**

Run:

```powershell
git add styles.css
git commit -m "style: add commerce page layouts"
```

Expected: commit succeeds with `styles.css`.

## Task 5: Apps Script Order Routing

**Files:**
- Modify: `google-apps-script.js`

- [ ] **Step 1: Replace the Apps Script with routed inquiry/order support**

Replace `google-apps-script.js` with this content:

```javascript
const SPREADSHEET_ID = "1ex-n0Q8lpdvSpP0EMfL_ONhhPl6WpehnSPyo8rfvvm8";
const INQUIRIES_SHEET_NAME = "Inquiries";
const ORDERS_SHEET_NAME = "Orders";

const INQUIRY_HEADERS = [
  "Timestamp",
  "Name",
  "Contact",
  "Event Date",
  "Estimated Quantity",
  "Occasion",
  "Notes",
  "Source",
];

const ORDER_HEADERS = [
  "Timestamp",
  "Order ID",
  "Customer Name",
  "Phone",
  "LINE ID",
  "Pickup or Delivery Date",
  "Address",
  "Items",
  "Total",
  "Notes",
  "Source",
];

function doPost(e) {
  try {
    const payload = parsePayload(e);
    return routeRequest(payload);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doGet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  return jsonResponse({
    ok: true,
    message: "Fortune Fruits endpoint is ready.",
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: spreadsheet.getUrl(),
    sheets: [INQUIRIES_SHEET_NAME, ORDERS_SHEET_NAME],
  });
}

function routeRequest(payload) {
  if (payload.type === "order") {
    return appendOrder(payload);
  }

  return appendInquiry(payload);
}

function appendInquiry(payload) {
  const sheet = getSheet(INQUIRIES_SHEET_NAME, INQUIRY_HEADERS);

  sheet.appendRow([
    new Date(),
    payload.name || "",
    payload.contact || "",
    payload.eventDate || "",
    payload.quantity || "",
    payload.occasion || "",
    payload.notes || "",
    payload.source || "",
  ]);

  return successResponse("inquiry", sheet);
}

function appendOrder(payload) {
  const sheet = getSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const customer = payload.customer || {};

  sheet.appendRow([
    new Date(),
    payload.orderId || "",
    customer.customerName || "",
    customer.phone || "",
    customer.lineId || "",
    customer.deliveryDate || "",
    customer.address || "",
    formatItems(payload.items || []),
    payload.total || 0,
    customer.orderNotes || "",
    payload.source || "",
  ]);

  return successResponse("order", sheet);
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body.");
  }

  return JSON.parse(e.postData.contents);
}

function getSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = headers.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function formatItems(items) {
  return items
    .map(function (item) {
      const subtotal = Number(item.price || 0) * Number(item.quantity || 0);
      return item.name + " x " + item.quantity + " = NT$ " + subtotal.toLocaleString("zh-TW");
    })
    .join("; ");
}

function successResponse(type, sheet) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  return jsonResponse({
    ok: true,
    type: type,
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: spreadsheet.getUrl(),
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
  });
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS.

- [ ] **Step 3: Commit Apps Script routing**

Run:

```powershell
git add google-apps-script.js
git commit -m "feat: route orders to Google Sheets"
```

Expected: commit succeeds with `google-apps-script.js`.

## Task 6: Browser Verification

**Files:**
- Modify only if verification finds defects:
  - `products.html`
  - `checkout.html`
  - `styles.css`
  - `commerce.js`

- [ ] **Step 1: Run static tests**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS with `Static site checks passed`.

- [ ] **Step 2: Run headless browser commerce verification**

Run this PowerShell command:

```powershell
$env:NODE_PATH='C:\Users\tim00\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules;C:\Users\tim00\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\.pnpm\playwright-core@1.60.0\node_modules'; @'
require('module').Module._initPaths();
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const root = process.cwd();
  const artifacts = path.join(root, 'docs', 'superpowers', 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const productsUrl = pathToFileURL(path.join(root, 'products.html')).href;
  const checkoutUrl = pathToFileURL(path.join(root, 'checkout.html')).href;

  await page.goto(productsUrl, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  const productCount = await page.locator('[data-product-id]').count();
  assert.strictEqual(productCount, 3, 'three products render');
  await page.locator('[data-product-id="small-meeting-fruit"] [data-quantity]').fill('2');
  await page.locator('[data-product-id="small-meeting-fruit"] [data-add-to-cart]').click();
  await page.locator('[data-product-id="business-gift-box"] [data-add-to-cart]').click();
  await page.waitForTimeout(100);
  const cartCount = await page.locator('[data-cart-count]').first().innerText();
  assert.strictEqual(cartCount, '3', 'cart count updates after adding products');
  await page.screenshot({ path: path.join(artifacts, 'fortune-fruits-products-mobile.png'), fullPage: false });

  await page.goto(checkoutUrl, { waitUntil: 'load' });
  const lineCount = await page.locator('.cart-line').count();
  assert.strictEqual(lineCount, 2, 'checkout renders two cart lines');
  const total = await page.locator('[data-cart-total]').innerText();
  assert.strictEqual(total, 'NT$ 3,440', 'checkout total is correct');
  await page.locator('[data-product-id="small-meeting-fruit"] [data-cart-quantity]').fill('3');
  await page.locator('[data-product-id="small-meeting-fruit"] [data-cart-quantity]').press('Tab');
  await page.waitForTimeout(100);
  const updatedTotal = await page.locator('[data-cart-total]').innerText();
  assert.strictEqual(updatedTotal, 'NT$ 4,320', 'quantity updates total');
  await page.locator('[data-checkout-form] button[type="submit"]').click();
  await page.waitForTimeout(100);
  const requiredErrors = await page.locator('.field-error').evaluateAll((nodes) => nodes.filter((node) => node.textContent.trim()).length);
  assert.ok(requiredErrors >= 5, `required checkout errors shown, got ${requiredErrors}`);
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflowX <= 1, `mobile has no horizontal overflow, got ${overflowX}`);
  await page.screenshot({ path: path.join(artifacts, 'fortune-fruits-checkout-mobile.png'), fullPage: false });
  await browser.close();
  console.log(JSON.stringify({ productCount, cartCount, lineCount, total, updatedTotal, requiredErrors, overflowX }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@ | & "C:\Users\tim00\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" -
```

Expected: PASS and JSON output with:

```json
{
  "productCount": 3,
  "cartCount": "3",
  "lineCount": 2,
  "total": "NT$ 3,440",
  "updatedTotal": "NT$ 4,320"
}
```

- [ ] **Step 3: Fix defects if found**

If verification fails, identify the root cause before editing. Make the smallest targeted fix, then rerun:

```powershell
node tests/static-site.test.js
```

and the full browser verification command from Step 2.

- [ ] **Step 4: Commit verification fixes if any**

If fixes were needed:

```powershell
git add products.html checkout.html styles.css commerce.js
git commit -m "fix: polish commerce checkout flow"
```

If no fixes were needed, do not create an empty commit.

## Task 7: Final Publish Verification

**Files:**
- No file changes expected.

- [ ] **Step 1: Run final static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS.

- [ ] **Step 2: Confirm branch and dirty state**

Run:

```powershell
git status --short --branch
```

Expected: clean working tree except for intentional user changes if any remain outside committed work. If the user edits in `index.html` are still unstaged because implementation preserved them separately, ask whether to include them before pushing.

- [ ] **Step 3: Push to GitHub after user approval**

If the user wants the live GitHub Pages site updated, run:

```powershell
git push
```

Expected: push succeeds to `origin/master`. GitHub Pages should update after the normal Pages build delay.

## Self-Review

Spec coverage:

- Product page: Task 2.
- Checkout page: Task 2.
- Three fixed products and prices: Task 2 and Task 3.
- Cart quantity and `localStorage`: Task 3.
- Checkout total and editable quantities: Task 3.
- Checkout fields and validation: Task 2 and Task 3.
- Google Sheets `Orders` routing: Task 5.
- LINE/Instagram payment confirmation prompt: Task 2 and Task 3.
- Static tests and browser verification: Tasks 1, 4, 5, 6, and 7.

Placeholder scan:

- The plan uses the existing Google Apps Script URL already present in the site.
- The plan does not include unresolved implementation placeholders.

Type and selector consistency:

- Cart storage key is `fortuneFruitsCart` in spec, tests, and `commerce.js`.
- Product IDs are consistent across `products.html`, tests, and `commerce.js`.
- Checkout field names are consistent across `checkout.html`, tests, and `commerce.js`.
- Apps Script routing uses `type: "order"` and `type: "inquiry"` consistently.
