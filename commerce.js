const CART_STORAGE_KEY = "fortuneFruitsCart";
const ORDER_ENDPOINT =
  window.GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbz9JGXYGwrDCXr96WssJeCz4eK3mXPiXImWEld-bCjEjA20-EM5f_t3VZQcyY1VGTFu/exec";

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
  added: " 已加入購物車。",
  required: "請填寫此欄位。",
  phoneTooShort: "電話至少需要 6 個字元。",
  emptyCart: "購物車目前是空的，請先回商品頁選購。",
  sending: "訂單請求送出中，請稍候。",
  invalid: "請確認必填資料後再送出。",
  success: "訂單請求已送出，請透過 LINE 或 Instagram 確認付款與交付細節；尚未代表付款或訂單已完成。",
  failed: "訂單請求送出失敗，請稍後再試，或透過 LINE / Instagram 聯繫我們。",
};

function formatCurrency(amount) {
  return `NT$ ${Number(amount).toLocaleString("zh-TW")}`;
}

function parsePositiveInteger(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

function normalizeCartItem(item) {
  if (!item || typeof item !== "object") return null;

  const product = findProduct(item.id);
  const quantity = parsePositiveInteger(item.quantity);
  if (!product || quantity === null) return null;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
  };
}

function normalizeCart(cart) {
  if (!Array.isArray(cart)) return [];
  return cart.map(normalizeCartItem).filter(Boolean);
}

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return normalizeCart(parsed);
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCart(cart)));
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

  const safeQuantity = parsePositiveInteger(quantity) || 1;
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
  const safeQuantity = parsePositiveInteger(quantity) || 1;
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

  const details = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.name;
  const price = document.createElement("p");
  price.textContent = `${formatCurrency(item.price)} / 份`;
  details.append(title);
  details.append(price);

  const quantityLabel = document.createElement("label");
  quantityLabel.textContent = "數量";
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.value = String(item.quantity);
  quantityInput.dataset.cartQuantity = "";
  quantityLabel.append(quantityInput);

  const subtotal = document.createElement("strong");
  subtotal.textContent = formatCurrency(item.price * item.quantity);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.dataset.removeItem = "";
  removeButton.textContent = "移除";

  line.append(details);
  line.append(quantityLabel);
  line.append(subtotal);
  line.append(removeButton);

  line.querySelector("[data-cart-quantity]").addEventListener("change", (event) => {
    updateCartItem(item.id, event.target.value);
  });
  line.querySelector("[data-remove-item]").addEventListener("click", () => {
    removeCartItem(item.id);
  });

  return line;
}

function renderCheckout() {
  const cart = getCart();
  const cartItems = document.querySelector("[data-cart-items]");
  const emptyCart = document.querySelector("[data-empty-cart]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const form = document.querySelector("[data-checkout-form]");

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  cart.forEach((item) => cartItems.append(createCartLine(item)));
  cartTotal.textContent = formatCurrency(getCartTotal(cart));

  const isEmpty = cart.length === 0;
  if (emptyCart) emptyCart.hidden = !isEmpty;
  if (form) form.hidden = isEmpty;
}

function clearOrderErrors(form) {
  form.querySelectorAll(".field-error").forEach((target) => {
    target.textContent = "";
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

  target.hidden = false;
  target.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "訂單摘要";

  const orderId = document.createElement("p");
  orderId.textContent = `訂單編號：${payload.orderId}`;

  const list = document.createElement("ul");
  payload.items.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = `${item.name} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}`;
    list.append(row);
  });

  const total = document.createElement("strong");
  total.textContent = `總計：${formatCurrency(payload.total)}`;

  const confirmation = document.createElement("p");
  confirmation.append(document.createTextNode("訂單請求已送出，請透過 "));
  const lineLink = document.createElement("a");
  lineLink.href = "https://line.me/R/ti/p/@fortune-fruits";
  lineLink.textContent = "LINE";
  confirmation.append(lineLink);
  confirmation.append(document.createTextNode(" 或 "));
  const instagramLink = document.createElement("a");
  instagramLink.href = "https://www.instagram.com/fortune.fruits.tw";
  instagramLink.textContent = "Instagram";
  confirmation.append(instagramLink);
  confirmation.append(document.createTextNode(" 確認付款與交付細節；尚未代表付款或訂單已完成。"));

  target.append(heading);
  target.append(orderId);
  target.append(list);
  target.append(total);
  target.append(confirmation);
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
      if (status) status.textContent = commerceMessages.invalid;
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
