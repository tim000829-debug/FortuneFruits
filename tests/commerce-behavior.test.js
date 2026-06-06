const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const commerceSource = fs.readFileSync(path.join(root, "commerce.js"), "utf8");

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toLowerCase();
    this.children = [];
    this.dataset = {};
    this.eventListeners = {};
    this.hidden = false;
    this._textContent = "";
    this._innerHTML = "";
    this.className = "";
    this.value = "";
  }

  append(child) {
    this.children.push(child);
    return child;
  }

  appendChild(child) {
    return this.append(child);
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = handler;
  }

  set textContent(value) {
    this.children = [];
    this._innerHTML = "";
    this._textContent = String(value);
  }

  get textContent() {
    return this._textContent + this.children.map((child) => child.textContent).join("");
  }

  set innerHTML(value) {
    this.children = [];
    this._textContent = "";
    this._innerHTML = String(value);
    if (this._innerHTML.includes("data-cart-quantity")) {
      const input = new FakeElement("input");
      input.dataset.cartQuantity = "";
      const valueMatch = this._innerHTML.match(/data-cart-quantity[^>]*value="([^"]*)"/);
      input.value = valueMatch ? valueMatch[1] : "";
      this.children.push(input);
    }
    if (this._innerHTML.includes("data-remove-item")) {
      const button = new FakeElement("button");
      button.dataset.removeItem = "";
      this.children.push(button);
    }
  }

  get innerHTML() {
    if (this._innerHTML) return this._innerHTML;
    const text = escapeHtml(this._textContent);
    return text + this.children.map((child) => child.outerHTML).join("");
  }

  get outerHTML() {
    return `<${this.tagName}>${this.innerHTML}</${this.tagName}>`;
  }

  querySelector(selector) {
    return findDescendant(this, selector);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}

function findDescendant(element, selector) {
  for (const child of element.children) {
    if (matches(child, selector)) return child;
    const nested = findDescendant(child, selector);
    if (nested) return nested;
  }
  return null;
}

function matches(element, selector) {
  if (selector.startsWith("[data-")) {
    const key = selector.slice(6, -1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return Object.prototype.hasOwnProperty.call(element.dataset, key);
  }

  return element.tagName === selector.toLowerCase();
}

function createHarness(initialCart) {
  const storage = new Map();
  if (initialCart !== undefined) {
    storage.set("fortuneFruitsCart", JSON.stringify(initialCart));
  }

  const cartItems = new FakeElement("div");
  cartItems.dataset.cartItems = "";
  const emptyCart = new FakeElement("div");
  emptyCart.dataset.emptyCart = "";
  const cartTotal = new FakeElement("strong");
  cartTotal.dataset.cartTotal = "";
  const checkoutForm = new FakeElement("form");
  checkoutForm.dataset.checkoutForm = "";
  const cartCount = new FakeElement("span");
  cartCount.dataset.cartCount = "";

  const bySelector = new Map([
    ["[data-cart-items]", cartItems],
    ["[data-empty-cart]", emptyCart],
    ["[data-cart-total]", cartTotal],
    ["[data-checkout-form]", checkoutForm],
  ]);

  const context = {
    FormData: class {},
    fetch: async () => ({ ok: false }),
    localStorage: {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    document: {
      body: { dataset: {} },
      createElement: (tagName) => new FakeElement(tagName),
      querySelector: (selector) => bySelector.get(selector) || null,
      querySelectorAll: (selector) => (selector === "[data-cart-count]" ? [cartCount] : []),
    },
    window: {
      location: { href: "https://example.test/checkout.html" },
    },
  };

  const api = vm.runInNewContext(`${commerceSource}\n({ getCart, getCartCount, getCartTotal, addToCart, updateCartItem, renderCheckout });`, context);
  return { api, cartItems, cartTotal, emptyCart, storage };
}

{
  const { api, cartItems, cartTotal, emptyCart } = createHarness([
    {},
    { id: "unknown", name: "Ghost", price: 1, quantity: 3 },
    { id: "small-meeting-fruit", name: "Wrong", price: 1, quantity: -4 },
    { id: "business-gift-box", quantity: "NaN" },
  ]);

  api.renderCheckout();

  assert.strictEqual(api.getCart().length, 0, "malformed cart entries are removed");
  assert.strictEqual(cartItems.children.length, 0, "malformed cart entries do not render checkout lines");
  assert.strictEqual(cartTotal.textContent, "NT$ 0", "malformed cart entries do not create NaN totals");
  assert.strictEqual(emptyCart.hidden, false, "malformed cart is treated as empty");
}

{
  const { api, cartItems } = createHarness([
    {
      id: "small-meeting-fruit",
      name: '<img src=x onerror="globalThis.injected = true">',
      price: 1,
      quantity: 1,
    },
  ]);

  api.renderCheckout();

  assert.strictEqual(cartItems.children.length, 1, "valid product id renders one sanitized line");
  assert.ok(!cartItems.innerHTML.includes("<img"), "tampered item name markup is not rendered as HTML");
  assert.ok(cartItems.innerHTML.includes("&lt;") || !cartItems.innerHTML.includes("onerror"), "untrusted markup is escaped or ignored");
}

{
  const { api, cartTotal } = createHarness();

  api.addToCart("small-meeting-fruit", 2);
  api.addToCart("business-gift-box", 1);
  assert.strictEqual(api.getCartCount(), 3, "cart count uses sanitized quantities");
  assert.strictEqual(api.getCartTotal(), 3440, "cart total uses approved product prices");

  api.updateCartItem("small-meeting-fruit", 3);
  assert.strictEqual(api.getCartCount(), 4, "quantity mutation updates count");
  assert.strictEqual(api.getCartTotal(), 4320, "quantity mutation recalculates total");
  assert.strictEqual(cartTotal.textContent, "NT$ 4,320", "rendered total follows quantity mutation");
}

console.log("Commerce behavior checks passed");
