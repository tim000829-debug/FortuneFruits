const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

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

const html = read("index.html");
const productsHtml = read("products.html");
const checkoutHtml = read("checkout.html");
const css = read("styles.css");
const js = read("script.js");
const commerceJs = read("commerce.js");
const appsScript = read("google-apps-script.js");

[
  "hero",
  "story",
  "gallery",
  "occasions",
  "process",
  "contact",
].forEach((id) => {
  assert.ok(html.includes(`id="${id}"`), `section #${id} exists`);
});

assert.ok(html.includes("\u679c\u7de3\u679c\u7269 Fortune Fruits"), "home page preserves brand copy");
assert.ok(html.includes("\u679c\u5207\u4f5c\u54c1\u5c55\u793a"), "home page preserves gallery heading");
assert.ok(html.includes('href="products.html"'), "home page links to products");

[
  "assets/idea1.jpg",
  "assets/idea2.jpg",
  "assets/idea3.jpg",
  "assets/idea4.jpg",
].forEach((assetPath) => {
  assert.ok(html.includes(assetPath), `HTML references ${assetPath}`);
  assert.ok(fs.existsSync(path.join(root, assetPath)), `${assetPath} exists`);
});

[
  'href="#contact"',
  'href="https://line.me/R/ti/p/@fortune-fruits"',
  'href="https://www.instagram.com/fortune.fruits.tw"',
  'href="tel:+886900000000"',
].forEach((link) => {
  assert.ok(html.includes(link), `HTML contains ${link}`);
});

[
  'name="name"',
  'name="contact"',
  'name="eventDate"',
  'name="quantity"',
  'name="occasion"',
  'name="notes"',
].forEach((field) => {
  assert.ok(html.includes(field), `inquiry form field ${field} exists`);
});

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

[
  ".hero",
  ".gallery-grid",
  ".contact-form",
  ".shop-page",
  ".product-grid",
  ".cart-line",
  ".checkout-form",
  "@media (max-width: 760px)",
].forEach((selector) => {
  assert.ok(css.includes(selector), `CSS contains ${selector}`);
});

[
  "validateForm",
  "submitInquiry",
  "GOOGLE_SCRIPT_URL",
  "https://script.google.com/macros/s/AKfycby8wu2VvolNUnXRWp4JKhsdfwW24q6qGmpcQEn2J6cTBbASOaZt1Toi77DduiIA8hCr/exec",
  "showFieldError",
  "formStatus",
  "scrollIntoView",
  'type: "inquiry"',
].forEach((hook) => {
  assert.ok(js.includes(hook), `JS contains ${hook}`);
});

[
  "fortuneFruitsCart",
  "PRODUCTS",
  "addToCart",
  "renderCartCount",
  "renderCheckout",
  "submitOrder",
  'type: "order"',
].forEach((hook) => {
  assert.ok(commerceJs.includes(hook), `commerce JS contains ${hook}`);
});

[
  "SPREADSHEET_ID",
  "1ex-n0Q8lpdvSpP0EMfL_ONhhPl6WpehnSPyo8rfvvm8",
  "doPost",
  "appendRow",
  "ORDERS_SHEET_NAME",
  "routeRequest",
  "appendOrder",
  'type === "order"',
].forEach((hook) => {
  assert.ok(appsScript.includes(hook), `Apps Script contains ${hook}`);
});

console.log("Static site checks passed");
