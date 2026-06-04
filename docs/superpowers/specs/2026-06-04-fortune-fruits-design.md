# 果緣 Fortune Fruits Website Design

## Goal

Build a high-end one-page brand website for `果緣 Fortune Fruits`, a refined business fruit platter studio. The site should establish trust and taste first, then provide clear inquiry paths for custom orders.

The first release is a static frontend website. It will not include checkout, inventory, accounts, or backend order processing.

## Brand Direction

The visual mood combines fresh natural slow-living imagery with minimalist business-facing layout.

The imagery should feel like an outdoor afternoon picnic: grass, wildflowers, old stone houses, trees, warm sunlight, woven baskets, floral cotton-linen textiles, wood boards, ceramic bowls, enamel cups, and abundant fruit. The interface around those images should stay quiet, spacious, and refined.

Core visual traits:

- Fresh natural atmosphere with a refined commercial tone.
- Warm, soft afternoon light with a slightly vintage quality.
- Natural materials such as rattan, linen, wood, ceramic, and enamel.
- A white and grass-green base with vivid fruit accents from strawberries, blueberries, grapes, citrus, and lemons.
- Large images, restrained text, and generous whitespace.

## Site Strategy

Use a one-page site with an expandable structure. The first release should feel complete as a single page, while keeping sections modular enough to become separate pages later.

Recommended section order:

1. Hero
2. Brand Story
3. Gallery
4. Occasions
5. Custom Process
6. Contact
7. Footer

## Content Structure

### Hero

The first viewport should immediately show `果緣 Fortune Fruits` as the main brand signal. The hero uses a large fruit or picnic-inspired image, minimal copy, and one primary call to action for custom inquiries.

Suggested copy direction:

- Brand: `果緣 Fortune Fruits`
- Offer: `精緻商務果切拼盤`
- Supporting line: a short sentence about seasonal fruit, thoughtful presentation, and business hospitality.

### Brand Story

This section frames the product as more than prepared fruit. It should connect fresh seasonal fruit, careful cutting and arrangement, and a sense of occasion.

Tone:

- Calm
- Warm
- Natural
- Premium without sounding distant

### Gallery

The gallery is portfolio-style rather than menu-style. It should show representative work and avoid fixed prices in the first release.

Use the provided reference images as visual direction:

- `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea1.jpg`
- `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea2.jpg`
- `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea3.jpg`
- `C:/Users/tim00/OneDrive/桌面/果緣Fortune Fruits/ideas/idea4.jpg`

If these files are copied into the project during implementation, they should be placed under an `assets/` folder and referenced through project-local paths.

### Occasions

Show the main use cases without making the site feel like a rigid catalog:

- 企業招待
- 會議茶點
- 活動派對
- 節慶贈禮

The service area should stay flexible. Use the line:

`企業活動與大量訂購可另洽`

Do not list fixed delivery cities in the first release.

### Custom Process

Explain ordering as a custom service:

1. 需求洽詢
2. 風格討論
3. 當季搭配
4. 交付安排

The process should feel simple and reassuring, not procedural or heavy.

### Contact

Include quick contact options and a full inquiry form.

Quick contact options:

- LINE official account placeholder
- Instagram direct message placeholder
- Phone placeholder

Inquiry form fields:

- Name
- Contact method
- Event date
- Estimated quantity
- Occasion type
- Notes

The first release should use placeholder links and a frontend-only form success state. Real integrations can be added later.

## Technical Design

Use a simple static frontend structure:

- `index.html` for the one-page content structure.
- `styles.css` for brand styling and responsive layout.
- `script.js` for lightweight interaction.
- `assets/` for images and future brand assets.

The website should be easy to deploy on static hosting such as GitHub Pages, Netlify, or Vercel.

No framework is required for the first release unless later implementation needs justify one.

## Interaction Design

Expected interactions:

- Smooth scrolling navigation.
- Gallery presentation with responsive image layout.
- Contact buttons with easy-to-replace placeholder links.
- Inquiry form validation.
- Form success message after frontend-only submission.

Validation rules:

- Required fields must show local field-level feedback.
- Contact method should reject obviously too-short input.
- Successful submission should show a calm confirmation message.

## Responsive Requirements

The site must work well on desktop and mobile.

Key checks:

- Hero text must not overlap the image subject.
- Buttons and form fields must remain tappable on mobile.
- Gallery images must keep stable aspect ratios and avoid layout shift.
- Text must fit inside buttons and cards without clipping.
- The first viewport should show the brand clearly and leave a hint of the next section visible when possible.

## Testing Plan

First release verification should include:

- Open the site locally in a browser.
- Check desktop and mobile responsive layouts.
- Confirm images render correctly.
- Confirm navigation scrolls to the right sections.
- Confirm contact buttons exist and use placeholder links.
- Confirm form validation and success state work.
- Confirm no visible text overlaps or clips.

## Future Expansion

Possible later additions:

- Dedicated gallery page.
- About page.
- Real inquiry submission through Google Forms, Formspree, EmailJS, or a small API.
- SEO metadata for business and event fruit platters.
- Seasonal collection sections.
- Testimonials or client logos.
