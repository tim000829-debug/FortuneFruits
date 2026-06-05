# Fortune Fruits Products, Cart, and Checkout Design

## Goal

Add a small static-commerce flow to the Fortune Fruits website:

- A product page for three fixed products.
- A cart with quantity selection and persisted browser storage.
- A checkout page that totals the order, collects customer details, writes the order to Google Sheets, and prompts the customer to confirm payment through LINE or Instagram.

The site must remain deployable on GitHub Pages. No online payment gateway, login, backend server, or inventory system is included in this release.

## Existing Site Context

The current site is a static brand website with:

- `index.html`
- `styles.css`
- `script.js`
- `assets/` images
- `google-apps-script.js`
- `tests/static-site.test.js`

The site already uses Google Apps Script for inquiry submissions. This feature should extend that integration rather than replacing it.

The current local working copy includes brand copy changes such as `果緣果物 Fortune Fruits` and Instagram `fortune.fruits.tw`. Implementation should preserve those user edits.

## Product Catalog

The first product release uses three fixed products:

1. `small-meeting-fruit`
   - Name: `小型會議果切`
   - Price: `880`
   - Display price: `NT$ 880`
   - Suggested use: small meetings and light business refreshments.

2. `business-gift-box`
   - Name: `商務招待禮盒`
   - Price: `1680`
   - Display price: `NT$ 1,680`
   - Suggested use: client visits, executive hospitality, and premium gifting.

3. `party-platter`
   - Name: `活動派對拼盤`
   - Price: `2880`
   - Display price: `NT$ 2,880`
   - Suggested use: events, parties, and larger gatherings.

Product copy can be concise and premium. Product imagery can reuse the existing fruit photos in `assets/` for the first release.

## Pages

### Home Page

Modify `index.html` navigation:

- Add a `商品` link to `products.html`.
- Preserve existing home sections and current user edits.

### Product Page

Create `products.html`.

Required content:

- Site header with brand link, home link, product page state, and checkout link.
- Three product cards.
- Each product card includes image, name, short description, price, quantity control, and add-to-cart button.
- A visible cart count in the navigation or checkout link.
- A short confirmation message after adding an item.

Quantity behavior:

- Quantity must be at least `1`.
- Quantity selection should use a numeric input or stepper-style control.
- Adding the same product again should increase the stored quantity rather than duplicating separate rows.

### Checkout Page

Create `checkout.html`.

Required content:

- Site header with brand link, products link, and checkout state.
- Cart line items with product name, unit price, quantity, subtotal, and remove control.
- Total amount.
- Empty cart state with link back to products.
- Checkout form.
- Order success state with order summary and payment confirmation instructions.

Cart editing:

- Customers can change item quantity.
- Quantity must stay at least `1`.
- Customers can remove items.
- Total updates immediately.

Checkout fields:

- Name
- Phone
- LINE ID
- Pickup or delivery date
- Address
- Notes

Validation:

- Name is required.
- Phone is required and must be at least six characters after trimming.
- LINE ID is required.
- Pickup or delivery date is required.
- Address is required.

After successful order submission:

- Show a clear success message.
- Show an order summary with total amount.
- Prompt the customer to contact LINE or Instagram for payment confirmation.
- Clear the local cart.

## Cart Storage

Use `localStorage`.

Storage key:

`fortuneFruitsCart`

Suggested stored shape:

```json
[
  {
    "id": "small-meeting-fruit",
    "name": "小型會議果切",
    "price": 880,
    "quantity": 2
  }
]
```

Cart utilities should be shared by `products.html` and `checkout.html` through `script.js` or an additional frontend script if implementation clarity requires it.

## Google Sheets Order Integration

Extend `google-apps-script.js` so the same Web App can receive both inquiries and orders.

Payload routing:

- Inquiry payloads use `type: "inquiry"`.
- Order payloads use `type: "order"`.

Existing inquiry behavior:

- Continue writing inquiries to the `Inquiries` sheet.

New order behavior:

- Write orders to an `Orders` sheet.
- Create headers when missing.

Recommended `Orders` columns:

- Timestamp
- Order ID
- Customer Name
- Phone
- LINE ID
- Pickup or Delivery Date
- Address
- Items
- Total
- Notes
- Source

The `Items` column should contain a readable text summary, for example:

`小型會議果切 x 2 = NT$ 1,760; 商務招待禮盒 x 1 = NT$ 1,680`

Apps Script responses should include enough diagnostics to verify the target sheet:

- `ok`
- `type`
- `sheetName`
- `lastRow`
- `spreadsheetUrl`

## Payment Confirmation

No online payment is included.

After order submission, the website should tell customers to contact the store through LINE or Instagram to confirm payment and final delivery details.

The existing placeholder contact links can remain:

- LINE: `https://line.me/R/ti/p/@fortune-fruits`
- Instagram: current site value, including any user edits.

## Testing

Update tests to cover:

- `products.html` exists.
- `checkout.html` exists.
- `index.html` links to `products.html`.
- Product page contains all three product IDs and prices.
- Checkout page contains all required checkout field names.
- Frontend scripts include cart storage key and order submission hooks.
- Apps Script contains order routing and `Orders` sheet support.

Browser verification should cover:

- Product page renders on desktop and mobile.
- Add-to-cart updates cart count.
- Cart persists from product page to checkout page.
- Checkout page total is correct.
- Quantity changes update total.
- Remove control updates cart and empty state.
- Required field validation works.
- With Google endpoint configured, order submission shows success or a clear failure state.

## Future Expansion

Possible later additions:

- Real product photos per product.
- Product categories and seasonal collections.
- Promo codes.
- Online payment gateway.
- Order status management.
- Admin dashboard.
