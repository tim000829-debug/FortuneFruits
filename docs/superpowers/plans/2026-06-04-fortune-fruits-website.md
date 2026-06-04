# Fortune Fruits Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static one-page brand website for `果緣 Fortune Fruits` that presents refined custom fruit platters and guides visitors to inquiry channels.

**Architecture:** The site is a plain static frontend with one HTML entry point, one stylesheet, one behavior script, local image assets, and a small Node-based static test. The sections are modular so the one-page site can later expand into separate pages without rewriting the content model.

**Tech Stack:** HTML, CSS, vanilla JavaScript, local JPG assets, Node.js built-in `assert`/`fs` test script.

---

## File Structure

- Create: `index.html`
  - Owns semantic page structure, section order, navigation anchors, Chinese marketing copy, gallery markup, quick contact links, inquiry form fields, and footer.
- Create: `styles.css`
  - Owns responsive layout, brand palette, typography, image presentation, form styling, interaction states, and mobile rules.
- Create: `script.js`
  - Owns smooth scrolling enhancement, frontend-only form validation, inline field errors, and success message state.
- Create: `tests/static-site.test.js`
  - Owns fast static checks for required sections, assets, contact links, form fields, CSS hooks, and JS validation hooks.
- Create: `assets/idea1.jpg`
  - Local copy of `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea1.jpg`.
- Create: `assets/idea2.jpg`
  - Local copy of `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea2.jpg`.
- Create: `assets/idea3.jpg`
  - Local copy of `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea3.jpg`.
- Create: `assets/idea4.jpg`
  - Local copy of `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea4.jpg`.

## Task 1: Static Test Harness

**Files:**
- Create: `tests/static-site.test.js`

- [ ] **Step 1: Create the failing static test**

Create `tests/static-site.test.js` with this content:

```javascript
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

assert.ok(fs.existsSync(path.join(root, "index.html")), "index.html exists");
assert.ok(fs.existsSync(path.join(root, "styles.css")), "styles.css exists");
assert.ok(fs.existsSync(path.join(root, "script.js")), "script.js exists");

const html = read("index.html");
const css = read("styles.css");
const js = read("script.js");

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
  "showFieldError",
  "formStatus",
  "scrollIntoView",
].forEach((hook) => {
  assert.ok(js.includes(hook), `JS contains ${hook}`);
});

console.log("Static site checks passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL because `index.html`, `styles.css`, `script.js`, and image assets do not exist yet.

- [ ] **Step 3: Commit the failing test**

Run:

```powershell
git add tests/static-site.test.js
git commit -m "test: add Fortune Fruits static site checks"
```

Expected: commit succeeds with only the test file.

## Task 2: Local Image Assets

**Files:**
- Create: `assets/idea1.jpg`
- Create: `assets/idea2.jpg`
- Create: `assets/idea3.jpg`
- Create: `assets/idea4.jpg`

- [ ] **Step 1: Copy the provided reference images into the project**

Run:

```powershell
New-Item -ItemType Directory -Force -Path assets
Copy-Item -LiteralPath "C:\Users\tim00\OneDrive\桌面\果緣Fortune Fruits\ideas\idea1.jpg" -Destination "assets\idea1.jpg"
Copy-Item -LiteralPath "C:\Users\tim00\OneDrive\桌面\果緣Fortune Fruits\ideas\idea2.jpg" -Destination "assets\idea2.jpg"
Copy-Item -LiteralPath "C:\Users\tim00\OneDrive\桌面\果緣Fortune Fruits\ideas\idea3.jpg" -Destination "assets\idea3.jpg"
Copy-Item -LiteralPath "C:\Users\tim00\OneDrive\桌面\果緣Fortune Fruits\ideas\idea4.jpg" -Destination "assets\idea4.jpg"
```

Expected: `assets/` contains four JPG files.

- [ ] **Step 2: Verify copied assets**

Run:

```powershell
Get-ChildItem assets
```

Expected: output lists `idea1.jpg`, `idea2.jpg`, `idea3.jpg`, and `idea4.jpg`.

- [ ] **Step 3: Commit the assets**

Run:

```powershell
git add assets
git commit -m "chore: add Fortune Fruits reference images"
```

Expected: commit succeeds with the four image files.

## Task 3: HTML Content Structure

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create the page structure**

Create `index.html` with this content:

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="果緣 Fortune Fruits 提供精緻商務果切拼盤，為企業招待、會議茶點、活動派對與節慶贈禮打造客製化水果儀式感。"
    />
    <title>果緣 Fortune Fruits | 精緻商務果切拼盤</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="script.js" defer></script>
  </head>
  <body>
    <header class="site-header" aria-label="主要導覽">
      <a class="brand-mark" href="#hero" aria-label="回到首頁">
        <span>果緣</span>
        <small>Fortune Fruits</small>
      </a>
      <nav class="site-nav">
        <a href="#story">品牌</a>
        <a href="#gallery">作品</a>
        <a href="#process">流程</a>
        <a href="#contact">洽詢</a>
      </nav>
    </header>

    <main>
      <section class="hero" id="hero" aria-labelledby="hero-title">
        <div class="hero-media">
          <img src="assets/idea2.jpg" alt="精緻水果禮盒以莓果、柑橘與葡萄排列成商務果切拼盤" />
        </div>
        <div class="hero-copy">
          <p class="eyebrow">Fresh Fruit, Crafted for Gatherings</p>
          <h1 id="hero-title">果緣 Fortune Fruits</h1>
          <p class="hero-offer">精緻商務果切拼盤</p>
          <p class="hero-text">
            以當季鮮果、細緻切工與溫柔擺盤，為會議招待、節慶贈禮與重要時刻準備剛剛好的豐盛。
          </p>
          <a class="primary-action" href="#contact">預約客製洽詢</a>
        </div>
      </section>

      <section class="section story-section" id="story" aria-labelledby="story-title">
        <div class="section-kicker">Brand Story</div>
        <h2 id="story-title">把新鮮果物，整理成值得被記住的款待。</h2>
        <p>
          果緣相信一份水果拼盤不只是點心，而是場合裡最自然的儀式感。從水果熟度、色彩層次到入口份量，
          每一盒都依照活動氣氛與招待需求安排，讓商務往來多一點輕盈，也多一點被照顧的溫度。
        </p>
      </section>

      <section class="section gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div class="section-kicker">Gallery</div>
        <div class="section-heading">
          <h2 id="gallery-title">作品集式果切提案</h2>
          <p>不固定菜單與價格，依照季節、份量、場合與預算討論專屬搭配。</p>
        </div>
        <div class="gallery-grid">
          <figure class="gallery-item large">
            <img src="assets/idea1.jpg" alt="多盒柑橘與西瓜果切拼盤整齊排列" />
            <figcaption>會議茶點</figcaption>
          </figure>
          <figure class="gallery-item">
            <img src="assets/idea2.jpg" alt="高級水果禮盒與品牌卡片放在黑色背景上" />
            <figcaption>商務贈禮</figcaption>
          </figure>
          <figure class="gallery-item">
            <img src="assets/idea3.jpg" alt="方形水果禮盒放滿鳳梨、葡萄、莓果與番茄" />
            <figcaption>活動派對</figcaption>
          </figure>
          <figure class="gallery-item wide">
            <img src="assets/idea4.jpg" alt="蘋果切片以花朵造型排列在餐碗中" />
            <figcaption>客製擺盤</figcaption>
          </figure>
        </div>
      </section>

      <section class="section occasions-section" id="occasions" aria-labelledby="occasions-title">
        <div class="section-kicker">Occasions</div>
        <h2 id="occasions-title">為不同款待時刻準備</h2>
        <div class="occasion-list">
          <article>
            <h3>企業招待</h3>
            <p>用清爽細緻的水果禮盒，為客戶拜訪與貴賓接待留下舒服印象。</p>
          </article>
          <article>
            <h3>會議茶點</h3>
            <p>適合長時間會議、講座與內部活動，份量與食用便利性可依人數調整。</p>
          </article>
          <article>
            <h3>活動派對</h3>
            <p>以鮮明果色與豐盛層次，成為派對桌上自然又吸睛的焦點。</p>
          </article>
          <article>
            <h3>節慶贈禮</h3>
            <p>以當季水果搭配禮盒設計，傳遞清新、不厚重的節日心意。</p>
          </article>
        </div>
        <p class="service-note">企業活動與大量訂購可另洽</p>
      </section>

      <section class="section process-section" id="process" aria-labelledby="process-title">
        <div class="section-kicker">Custom Process</div>
        <h2 id="process-title">客製流程簡單安心</h2>
        <ol class="process-list">
          <li>
            <span>01</span>
            <strong>需求洽詢</strong>
            <p>提供日期、場合、人數與預算方向。</p>
          </li>
          <li>
            <span>02</span>
            <strong>風格討論</strong>
            <p>確認禮盒感、野餐感、商務感或活動主題。</p>
          </li>
          <li>
            <span>03</span>
            <strong>當季搭配</strong>
            <p>依水果狀態與色彩層次安排內容。</p>
          </li>
          <li>
            <span>04</span>
            <strong>交付安排</strong>
            <p>確認數量、時間與交付細節。</p>
          </li>
        </ol>
      </section>

      <section class="section contact-section" id="contact" aria-labelledby="contact-title">
        <div class="contact-intro">
          <div class="section-kicker">Contact</div>
          <h2 id="contact-title">讓下一場款待，有一份剛好的鮮甜。</h2>
          <p>可以先透過快速入口聯繫，也可以留下需求，我們將依照場合回覆合適的客製方向。</p>
          <div class="quick-links" aria-label="快速聯絡方式">
            <a href="https://line.me/R/ti/p/@fortune-fruits">LINE</a>
            <a href="https://www.instagram.com/fortune.fruits">Instagram</a>
            <a href="tel:+886900000000">電話</a>
          </div>
        </div>

        <form class="contact-form" novalidate>
          <label>
            姓名
            <input type="text" name="name" autocomplete="name" required />
            <span class="field-error" data-error-for="name"></span>
          </label>
          <label>
            聯絡方式
            <input type="text" name="contact" autocomplete="tel email" required />
            <span class="field-error" data-error-for="contact"></span>
          </label>
          <label>
            活動日期
            <input type="date" name="eventDate" required />
            <span class="field-error" data-error-for="eventDate"></span>
          </label>
          <label>
            預估份量
            <input type="text" name="quantity" placeholder="例如 20 人會議、30 盒禮盒" required />
            <span class="field-error" data-error-for="quantity"></span>
          </label>
          <label>
            場合類型
            <select name="occasion" required>
              <option value="">請選擇</option>
              <option>企業招待</option>
              <option>會議茶點</option>
              <option>活動派對</option>
              <option>節慶贈禮</option>
              <option>其他客製</option>
            </select>
            <span class="field-error" data-error-for="occasion"></span>
          </label>
          <label class="full">
            備註
            <textarea name="notes" rows="5" placeholder="想要的風格、預算、交付時間或其他需求"></textarea>
          </label>
          <button type="submit">送出詢問</button>
          <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <p>果緣 Fortune Fruits</p>
      <p>精緻商務果切拼盤 · 企業活動與大量訂購可另洽</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL because `styles.css` and `script.js` do not exist yet.

- [ ] **Step 3: Commit the HTML**

Run:

```powershell
git add index.html
git commit -m "feat: add Fortune Fruits page structure"
```

Expected: commit succeeds with `index.html`.

## Task 4: Responsive Visual Styling

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Add the complete stylesheet**

Create `styles.css` with this content:

```css
:root {
  --paper: #fbfaf4;
  --cream: #f3eadc;
  --ink: #1f251f;
  --muted: #6d7468;
  --leaf: #496b3b;
  --leaf-dark: #2f4929;
  --citrus: #f3b536;
  --berry: #b94b52;
  --line: rgba(31, 37, 31, 0.14);
  --shadow: 0 22px 60px rgba(31, 37, 31, 0.14);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", Arial, sans-serif;
  line-height: 1.7;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

a {
  color: inherit;
  text-decoration: none;
}

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px clamp(20px, 4vw, 56px);
  background: rgba(251, 250, 244, 0.82);
  border-bottom: 1px solid rgba(31, 37, 31, 0.08);
  backdrop-filter: blur(18px);
}

.brand-mark {
  display: grid;
  gap: 0;
  font-weight: 700;
  letter-spacing: 0;
}

.brand-mark small {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 34px);
  color: var(--muted);
  font-size: 0.94rem;
}

.site-nav a:hover,
.site-nav a:focus-visible {
  color: var(--leaf-dark);
}

.hero {
  min-height: 94vh;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  align-items: stretch;
  padding-top: 76px;
  background: linear-gradient(90deg, rgba(251, 250, 244, 0.2), rgba(243, 234, 220, 0.68));
}

.hero-media {
  min-height: 620px;
  overflow: hidden;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(40px, 7vw, 92px);
}

.eyebrow,
.section-kicker {
  margin: 0 0 14px;
  color: var(--leaf);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 10px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 8vw, 7.2rem);
  line-height: 0.95;
  font-weight: 500;
  letter-spacing: 0;
}

.hero-offer {
  margin-bottom: 22px;
  color: var(--leaf-dark);
  font-size: clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight: 700;
}

.hero-text {
  max-width: 520px;
  margin-bottom: 34px;
  color: var(--muted);
  font-size: 1.05rem;
}

.primary-action,
.quick-links a,
.contact-form button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--leaf-dark);
  background: var(--leaf-dark);
  color: #fff;
  padding: 12px 22px;
  font-weight: 700;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease;
}

.primary-action:hover,
.quick-links a:hover,
.contact-form button:hover {
  transform: translateY(-2px);
  background: var(--ink);
}

.section {
  padding: clamp(72px, 10vw, 132px) clamp(20px, 6vw, 86px);
}

.story-section {
  max-width: 980px;
}

.story-section h2,
.section-heading h2,
.occasions-section h2,
.process-section h2,
.contact-intro h2 {
  max-width: 760px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 4vw, 4.4rem);
  line-height: 1.08;
  font-weight: 500;
  letter-spacing: 0;
}

.story-section p,
.section-heading p,
.contact-intro p {
  max-width: 700px;
  color: var(--muted);
  font-size: 1.05rem;
}

.gallery-section {
  background: #fff;
}

.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
  gap: 32px;
  align-items: end;
  margin-bottom: 38px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(220px, 30vw);
  gap: 16px;
}

.gallery-item {
  position: relative;
  min-height: 260px;
  margin: 0;
  overflow: hidden;
  background: var(--cream);
}

.gallery-item.large {
  grid-column: span 2;
  grid-row: span 2;
}

.gallery-item.wide {
  grid-column: span 2;
}

.gallery-item figcaption {
  position: absolute;
  left: 16px;
  bottom: 16px;
  background: rgba(251, 250, 244, 0.9);
  color: var(--leaf-dark);
  padding: 8px 12px;
  font-weight: 700;
}

.occasions-section {
  background: var(--paper);
}

.occasion-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 34px;
  border: 1px solid var(--line);
  background: var(--line);
}

.occasion-list article {
  min-height: 210px;
  padding: 26px;
  background: var(--paper);
}

.occasion-list h3 {
  margin-bottom: 14px;
  color: var(--leaf-dark);
}

.occasion-list p,
.process-list p {
  color: var(--muted);
}

.service-note {
  margin-top: 28px;
  color: var(--berry);
  font-weight: 700;
}

.process-section {
  background: var(--cream);
}

.process-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  padding: 0;
  margin: 38px 0 0;
  list-style: none;
}

.process-list li {
  min-height: 230px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(31, 37, 31, 0.08);
}

.process-list span {
  display: block;
  margin-bottom: 38px;
  color: var(--citrus);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2.2rem;
}

.process-list strong {
  display: block;
  margin-bottom: 10px;
  font-size: 1.15rem;
}

.contact-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
  gap: clamp(36px, 6vw, 80px);
  background: #fff;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.quick-links a {
  min-width: 120px;
  background: transparent;
  color: var(--leaf-dark);
}

.quick-links a:hover {
  color: #fff;
}

.contact-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding: clamp(24px, 4vw, 42px);
  background: var(--paper);
  box-shadow: var(--shadow);
}

.contact-form label {
  display: grid;
  gap: 8px;
  color: var(--leaf-dark);
  font-weight: 700;
}

.contact-form .full {
  grid-column: 1 / -1;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  font: inherit;
  padding: 12px 14px;
}

.contact-form input:focus,
.contact-form select:focus,
.contact-form textarea:focus {
  outline: 2px solid rgba(73, 107, 59, 0.28);
  border-color: var(--leaf);
}

.contact-form button,
.form-status {
  grid-column: 1 / -1;
}

.field-error {
  min-height: 20px;
  color: #a33b3f;
  font-size: 0.86rem;
  font-weight: 500;
}

.form-status {
  min-height: 24px;
  margin: 0;
  color: var(--leaf-dark);
  font-weight: 700;
}

.site-footer {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 30px clamp(20px, 6vw, 86px);
  background: var(--leaf-dark);
  color: rgba(255, 255, 255, 0.82);
}

.site-footer p {
  margin: 0;
}

@media (max-width: 980px) {
  .hero,
  .contact-section,
  .section-heading {
    grid-template-columns: 1fr;
  }

  .hero-media {
    min-height: 54vh;
  }

  .hero-copy {
    padding-top: 44px;
  }

  .gallery-grid,
  .occasion-list,
  .process-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .site-header {
    position: static;
    align-items: flex-start;
    padding: 16px 18px;
  }

  .site-nav {
    gap: 12px;
    font-size: 0.88rem;
  }

  .hero {
    min-height: auto;
    padding-top: 0;
  }

  .hero-media {
    min-height: 48vh;
  }

  .gallery-grid,
  .occasion-list,
  .process-list,
  .contact-form {
    grid-template-columns: 1fr;
  }

  .gallery-item.large,
  .gallery-item.wide {
    grid-column: auto;
    grid-row: auto;
  }

  .gallery-item {
    aspect-ratio: 4 / 5;
    min-height: 0;
  }

  .contact-form {
    padding: 22px;
  }

  .site-footer {
    display: grid;
  }
}
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: FAIL because `script.js` does not exist yet.

- [ ] **Step 3: Commit the CSS**

Run:

```powershell
git add styles.css
git commit -m "style: add Fortune Fruits responsive design"
```

Expected: commit succeeds with `styles.css`.

## Task 5: Frontend Interaction

**Files:**
- Create: `script.js`

- [ ] **Step 1: Add form validation and navigation enhancement**

Create `script.js` with this content:

```javascript
const form = document.querySelector(".contact-form");
const formStatus = document.querySelector("#formStatus");
const navLinks = document.querySelectorAll('a[href^="#"]');

function showFieldError(formElement, fieldName, message) {
  const target = formElement.querySelector(`[data-error-for="${fieldName}"]`);
  if (target) {
    target.textContent = message;
  }
}

function clearFieldErrors(formElement) {
  formElement.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function validateForm(formElement) {
  const data = new FormData(formElement);
  const requiredFields = ["name", "contact", "eventDate", "quantity", "occasion"];
  let isValid = true;

  clearFieldErrors(formElement);

  requiredFields.forEach((fieldName) => {
    const value = String(data.get(fieldName) || "").trim();
    if (!value) {
      showFieldError(formElement, fieldName, "請填寫這個欄位");
      isValid = false;
    }
  });

  const contact = String(data.get("contact") || "").trim();
  if (contact && contact.length < 6) {
    showFieldError(formElement, "contact", "請留下可聯繫的電話、LINE 或 email");
    isValid = false;
  }

  return isValid;
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      if (formStatus) {
        formStatus.textContent = "請確認必填資訊後再送出。";
      }
      return;
    }

    form.reset();
    clearFieldErrors(form);
    if (formStatus) {
      formStatus.textContent = "已收到詢問，我們將盡快與您聯繫。";
    }
  });
}
```

- [ ] **Step 2: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS with `Static site checks passed`.

- [ ] **Step 3: Commit the interaction script**

Run:

```powershell
git add script.js
git commit -m "feat: add inquiry form interactions"
```

Expected: commit succeeds with `script.js`.

## Task 6: Local Browser Verification

**Files:**
- Modify only if verification finds layout or behavior defects:
  - `index.html`
  - `styles.css`
  - `script.js`

- [ ] **Step 1: Run the static test**

Run:

```powershell
node tests/static-site.test.js
```

Expected: PASS with `Static site checks passed`.

- [ ] **Step 2: Open the local page**

Open this file in the browser:

```text
C:\Users\tim00\OneDrive\文件\NET\index.html
```

Expected: the page renders without a dev server because all assets are local static files.

- [ ] **Step 3: Verify desktop layout**

At a desktop viewport, confirm:

- Brand name appears clearly in the first viewport.
- Hero text does not cover the fruit image subject.
- Next section is discoverable after the hero.
- Gallery shows four images with stable image areas.
- Occasion and process sections are readable.
- Contact form appears beside or below the contact intro depending on viewport width.

- [ ] **Step 4: Verify mobile layout**

At a mobile viewport around 390px wide, confirm:

- Header links fit without clipping.
- Hero text wraps cleanly.
- Gallery stacks into one column.
- Buttons remain easy to tap.
- Form fields are full-width and labels do not overlap inputs.

- [ ] **Step 5: Verify form behavior**

In the browser:

1. Submit the empty form.
2. Confirm required field messages appear.
3. Enter `Tim`, `tim000829@gmail.com`, a date, `20 人會議`, and `企業招待`.
4. Submit again.
5. Confirm the success message says `已收到詢問，我們將盡快與您聯繫。`

- [ ] **Step 6: Fix defects if found**

If text overlaps, buttons clip, images fail, or validation does not work, edit only the affected file and rerun:

```powershell
node tests/static-site.test.js
```

Expected: PASS after every fix.

- [ ] **Step 7: Commit verification fixes or final verification note**

If fixes were needed:

```powershell
git add index.html styles.css script.js
git commit -m "fix: polish Fortune Fruits responsive site"
```

If no fixes were needed, do not create an empty commit. Record the verification result in the final response.

## Self-Review

Spec coverage:

- One-page expandable static site: covered by Tasks 3, 4, and 5.
- Fresh natural visual direction with minimalist business layout: covered by Task 4.
- Hero, story, gallery, occasions, process, contact, footer: covered by Task 3.
- Portfolio-style gallery without fixed prices: covered by Task 3.
- Flexible service area line: covered by Task 3 and tested in Task 1.
- LINE, Instagram, phone, and form entry points: covered by Task 3 and tested in Task 1.
- Frontend-only validation and success state: covered by Task 5.
- Desktop and mobile verification: covered by Task 6.

Placeholder scan:

- Contact URLs and phone number are intentional first-release placeholders requested in the spec. They are concrete, easy-to-replace values and are included in tests.
- No implementation step uses unresolved-marker language or unspecified behavior.

Type and selector consistency:

- Form selector is `.contact-form` in HTML, CSS, JS, and tests.
- Status selector is `#formStatus` in HTML, JS, and tests.
- Form field names are consistent across HTML, JS, and tests.
- Section IDs are consistent across nav links, HTML sections, and tests.
