# Anomaly — Gut-Health Advertorial Landing Page

A static, SEO-friendly advertorial landing page for **Anomaly (ANM)** — colostrum + probiotics +
prebiotics. Built from Figma with **HTML + Tailwind (CDN) + GSAP**.

## Run it

Because the page loads links from `data/links.json` via `fetch()`, open it through a **local web
server** (opening the raw file with `file://` blocks fetch — the page still works, but CTAs fall
back to `#`).

```bash
cd anomaly-advertorial
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, nginx, Netlify, Vercel, etc.).

## Editing the links (no code changes needed)

All destination URLs live in **`data/links.json`**. Edit the values, save, reload the page.

```json
{
  "shop_the_sale": "https://your-store.com/checkout",
  "plans": {
    "twelve_week": { "label": "START 12-WEEK PROTOCOL", "url": "https://…" },
    "adults":      { "label": "START 4-WEEK PROTOCOL",  "url": "https://…" },
    "family":      { "label": "START FAMILY PROTOCOL",  "url": "https://…" }
  },
  "guarantee_cta": "…",
  "legal": { "privacy": "…", "terms": "…", "shipping": "…" }
}
```

- `url` — sets the button/link `href`.
- `label` — (plans only) overrides the button text too.

In the HTML, elements opt in with `data-link="plans.adults.url"` and, optionally,
`data-link-label="plans.adults.label"`. Add a new key to the JSON and a matching `data-link`
attribute to wire up any new link.

## Structure

```
index.html            All 9 sections, SEO meta + JSON-LD (Product & FAQPage)
css/fonts.css         @font-face for self-hosted Söhne
css/styles.css        Design tokens (CSS vars) + custom component styles
js/main.js            Link wiring · FAQ accordion · GSAP reveals + count-up
data/links.json       ← edit this to change links
assets/images/        Photos exported from Figma
assets/fonts/         Söhne-Buch.otf, Söhne-Kraftig.otf (self-hosted)
```

## Design system

| Token | Value | Use |
|-------|-------|-----|
| `--anm-ink` | `#231f20` | Dark hero / dark sections |
| `--anm-cream` | `#f5f1eb` | Page background |
| `--anm-lilac` | `#ccc3ff` | Accent, badges, CTA |
| `--anm-white` | `#f1f1f1` | Text on dark |

Fonts: **Besley** (serif headings) + **Lexend** (sans body) from Google Fonts; **Söhne**
(badges/labels) self-hosted from the provided `.otf` files.

## Notes

- **Responsive:** mobile-first; desktop layout kicks in at `lg` (≥1024px). No horizontal scroll at
  375px. Pricing cards scroll-snap horizontally on small screens, 3-up grid on desktop.
- **Accessibility:** one `<h1>`, sequential headings, alt text on images, keyboard-operable FAQ
  (`aria-expanded`/`aria-controls`), visible focus rings, ≥44px tap targets, skip link.
- **Motion:** all GSAP animation respects `prefers-reduced-motion` (content shown immediately, no
  animation). Without JS, all content is fully visible (progressive enhancement).
- **SEO:** meta description, canonical, Open Graph + Twitter cards, and JSON-LD structured data
  (`Product` with offers + `FAQPage`). Replace the `canonical`/`og:image` URLs with real ones
  before launch.
- The FDA disclaimer in the footer is a placeholder — confirm final legal copy before publishing.
