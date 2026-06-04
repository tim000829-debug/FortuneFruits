const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

assert.ok(fs.existsSync(path.join(root, "index.html")), "index.html exists");
assert.ok(fs.existsSync(path.join(root, "styles.css")), "styles.css exists");
assert.ok(fs.existsSync(path.join(root, "script.js")), "script.js exists");
assert.ok(
  fs.existsSync(path.join(root, "google-apps-script.js")),
  "google-apps-script.js exists",
);

const html = read("index.html");
const css = read("styles.css");
const js = read("script.js");
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

[
  "果緣 Fortune Fruits",
  "精緻商務果切拼盤",
  "企業活動與大量訂購可另洽",
  "需求洽詢",
  "風格討論",
  "當季搭配",
  "交付安排",
].forEach((text) => {
  assert.ok(html.includes(text), `HTML contains ${text}`);
});

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
  'href="https://www.instagram.com/fortune.fruits"',
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
  assert.ok(html.includes(field), `form field ${field} exists`);
});

[
  ".hero",
  ".gallery-grid",
  ".contact-form",
  "@media (max-width: 760px)",
].forEach((selector) => {
  assert.ok(css.includes(selector), `CSS contains ${selector}`);
});

[
  "validateForm",
  "submitInquiry",
  "GOOGLE_SCRIPT_URL",
  "https://script.google.com/macros/s/AKfycbz9JGXYGwrDCXr96WssJeCz4eK3mXPiXImWEld-bCjEjA20-EM5f_t3VZQcyY1VGTFu/exec",
  "showFieldError",
  "formStatus",
  "scrollIntoView",
].forEach((hook) => {
  assert.ok(js.includes(hook), `JS contains ${hook}`);
});

[
  "SPREADSHEET_ID",
  "1ex-n0Q8lpdvSpP0EMfL_ONhhPl6WpehnSPyo8rfvvm8",
  "doPost",
  "appendRow",
].forEach((hook) => {
  assert.ok(appsScript.includes(hook), `Apps Script contains ${hook}`);
});

console.log("Static site checks passed");
