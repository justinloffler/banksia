# Banksia Tours — Astro site build brief

Hand this folder to Claude (Claude Code works best) and say:

> "Build this as an Astro site following BUILD_BRIEF.md."

## What's in this folder

| Path | What it is |
| --- | --- |
| `BUILD_BRIEF.md` | This file: the spec. |
| `content.json` | All site copy as structured data, taken from the current banksiatours.com.au. |
| `design/desktop.html` | The approved desktop design (1440 px wide). Open it in a browser. **This is the visual reference.** |
| `design/mobile.html` | The approved mobile design (390 px wide). |
| `design/images/` | The 11 photos used, renamed from the old site. |

If this brief and the design HTML disagree, follow the design HTML for looks and `content.json` for words.

---

## 1. Goal

Rebuild https://www.banksiatours.com.au as a fast, static, accessible Astro site. The current site is an outdated 2000s CMS.

Banksia Tours is a family coach-tour business in Houghton (Adelaide Hills, SA), running since 1984. It offers day tours, short breaks, 7–21 day holidays, camping safaris, charters and a Travel Club. Most customers are over-50s, seniors and retirees, and many will be on phones or tablets. So:

- Use large, readable text (body ≥ 16 px; nothing below 13 px).
- Make touch targets at least 44 px.
- Keep strong contrast.
- Show the phone number everywhere. Calling is the main way people book.

## 2. Tech requirements

- **Astro, latest stable version, with `output: 'static'`.** The site will be hosted on **cPanel shared hosting**, so `npm run build` must produce a plain `dist/` folder that can be uploaded to `public_html`. No SSR adapter and no Node server.
- Use plain CSS with custom properties: one global stylesheet plus scoped `<style>` in components. No Tailwind unless asked.
- Aim for no client-side JavaScript except:
  - the mobile menu toggle (a small inline script, or `<details>`)
  - optional form validation
- Use `astro:assets` `<Image>` for photos, so they get WebP and width/height.
- Self-host the fonts with `@fontsource/fraunces`, `@fontsource/figtree` and `@fontsource/caveat` (or `@fontsource-variable/*`). Don't load them from Google Fonts at runtime.
- Import the content from `content.json` into `src/data/site.json`. Don't hard-code copy in components.

### Suggested structure

```
src/
  data/site.json            ← copy of content.json
  assets/photos/*.jpg       ← from design/images
  styles/global.css         ← tokens + base styles
  layouts/Base.astro        ← <head>, SEO, fonts, header, footer
  components/
    UtilityBar.astro
    Header.astro            ← desktop nav + mobile menu
    Hero.astro
    Snap.astro              ← polaroid photo (props: src, alt, caption, rotate, width, height)
    TourTypes.astro
    Safaris.astro
    TravelClub.astro        ← includes the distance bars
    SpecialEvents.astro
    Coaches.astro
    Contact.astro           ← about text + enquiry form
    Footer.astro
    Icon.astro              ← inline stroke SVG icons (sun, bed, map, bus, check, phone, pin, shield, arrow, menu)
  pages/
    index.astro             ← the one-page design, in order
    terms.astro             ← Terms & Conditions (content.json → terms)
    thank-you.astro         ← form success page
public/
  favicon.svg               ← the banksia-flower mark from the header
  robots.txt
```

**Optional phase 2:** add inner pages mirroring the old site (`/group-tours`, `/camping-safaris`, `/charters`, `/travel-club`, `/coaches-drivers`, `/contact`), reusing the same sections with fuller copy from `content.json` (the `popular` lists, `interestGroups`, `outings[].detail`). Keep the homepage as designed.

## 3. Design tokens

```css
:root {
  /* surfaces */
  --cream: #F6F1E7;        /* page background */
  --paper: #FFFDF8;        /* alternate section / card background */
  --sand: #EDE3CF;         /* contact panel, callout strips */
  --forest: #23392C;       /* dark safari section */
  --ink: #1F2A22;          /* text, utility bar, footer */
  --sage-chip: #E6EBDF;    /* icon tiles */

  /* text */
  --text: #1F2A22;
  --text-muted: #4A5249;
  --text-subtle: #5A6158;
  --label-green: #2F4A3A;  /* eyebrow labels on light backgrounds */
  --on-dark: #F6F1E7;
  --on-dark-muted: #CFD8C9;
  --on-dark-accent: #E3B98C; /* eyebrow + check icons on forest */
  --footer-muted: #B9C2B2;
  --footer-label: #8FA08A;

  /* lines */
  --line: #E2DACA;
  --line-strong: #CFC6B4;
  --line-dark: #3A4A3E;
  --chip-line-dark: #56705F;

  /* accent (burnt banksia orange). White text on it passes AA. */
  --accent: #A6531A;
  --link: #8F4614;
  --link-hover: #6E350F;

  /* type */
  --font-display: 'Fraunces', Georgia, serif;          /* 400/500/600 */
  --font-body: 'Figtree', system-ui, sans-serif;       /* 400/500/600/700 */
  --font-hand: 'Caveat', cursive;                      /* photo captions only */

  /* layout */
  --container: 1200px;   /* content width; 120px side padding at 1440 */
  --radius-card: 20px;
  --radius-panel: 28px;
  --radius-pill: 999px;
}
```

### Type scale (desktop → mobile)

| Role | Desktop | Mobile | Style |
| --- | --- | --- | --- |
| H1 | 80px / 1.02 | 46px / 1.04 | Fraunces 500, letter-spacing −0.025em |
| H2 | 52–56px / 1.05 | 32–36px / 1.08 | Fraunces 500, −0.02em |
| H3 / card title | 26px | 21–22px | Fraunces 500 |
| Big numbers (stats) | 30–40px | 26–32px | Fraunces 400 |
| Lead paragraph | 18–20px / 1.55–1.65 | 16–17px | Figtree 400, `--text-muted` |
| Body | 15–17px / 1.6 | 14–16px | Figtree 400 |
| Eyebrow label | 13px, 600, uppercase, 0.16em tracking | 12px | `--label-green`, or `--on-dark-accent` on forest |
| Photo caption | 21–22px | 19px | Caveat 500 |

Use `clamp()` so the type scales smoothly between the two designs.

### Components

- **Buttons.** Pill shaped, 56 px tall (54 px on mobile), weight 600.
  - Primary: `--accent` background with white text.
  - Secondary: transparent with a 1.5 px `--ink` border.
  - Visible `:focus-visible` outline on both.
- **Snap (polaroid).** White frame with 10–12 px padding and a 36–40 px bottom strip for a Caveat caption. Shadow: `0 1px 2px rgba(31,42,34,.10), 0 12px 28px rgba(31,42,34,.16)`.
  - Tilted −6° to +4°, overlapping in a loose collage (see positions in `design/desktop.html`).
  - **Keep the photos near their small size.** The originals are only 200–430 px wide; don't blow them up into full-width banners.
  - Under `prefers-reduced-motion`, a hover straighten is fine but optional.
- **"Since 1984" badge.** Accent-coloured circle rotated 8°, overlapping the hero collage.
- **Tour-type cards.** Four columns: `--cream` background on a `--paper` section, 1 px `--line` border, 20 px radius, a 52 px sage icon tile, title, uppercase meta line, then body text.
- **Travel Club distance bars.** One row per outing. Bar widths are proportional to km on a 750 km scale: 160 → 21 %, 250 → 33 %, 400 → 53 %, 750 → 85 %. "Anywhere" is a full-width bar in `--ink`. Also render the data as accessible text: label, range and note are real text, and the bar is `aria-hidden`.
- **Check lists.** A 16–18 px stroke check icon, then the text. Two columns on desktop, one on mobile.
- **Chips.** Destination pills with a 1 px border, on the forest section.

## 4. Page sections (homepage, in order)

Every section's copy is in `content.json`. Match layouts to `design/desktop.html` and `design/mobile.html`.

1. **Utility bar** (desktop only): the ink strip with the "since 1984" line, a phone link and the location.
2. **Header**: the logo (banksia mark + wordmark + small tagline), 6 nav links and a primary "phone" button.
   - Mobile: logo, a round accent call button and a menu button.
   - The menu button opens a full-width panel with the nav links and a big call button. Use `aria-expanded` and close on Escape or link click.
3. **Hero**: two columns. The left has the eyebrow, H1, lead, two CTAs and three stats. The right has a four-photo polaroid collage plus the "Since 1984" badge. On mobile, stack them with a three-photo collage.
4. **Tours** (`#tours`, paper background): heading row, four type cards, then the sand "Also on offer" strip.
5. **Camping & safaris** (`#safaris`, forest background): text, kit checklist and destination chips on the left, a four-photo collage on the right.
6. **Travel Club** (`#club`): a 5 : 6 column split. The left has the copy, a CTA and "No joining fee". The right is a paper card with the distance bars.
7. **Special events** (paper background): heading plus intro, then five columns of event groups, each with a 2 px ink top rule and accent-coloured group labels. On mobile, two columns showing the first four groups.
8. **Coaches & drivers** (`#coaches`): a two-photo collage on the left. The right has copy, a feature checklist and a sand callout box about the drivers (shield icon).
9. **Contact** (`#contact`): one sand panel.
   - Left: about copy, a "Call David Camilleri" phone row and a location/fax row.
   - Right: the enquiry form on a paper card.
10. **Footer** (ink background): a brand blurb, then "Travel with us", "Company" and "Get in touch" columns, then a copyright/ABN row.

**Responsive:** design for 1440 and 390, and make everything in between fluid.
- Multi-column grids collapse to one column below about 900 px. Tour cards and events can go 2-up between 600 and 900 px.
- Collages shrink with container-relative sizing. Don't let them overflow horizontally.

## 5. Enquiry form (cPanel hosting)

There's no server-side runtime, so pick **one** of these. Ask the owner which; default to A.

- **A. PHP mailer (recommended on cPanel).** Put a small `public/enquiry.php` next to the static files. It validates the fields, sends the email with PHP `mail()` (or SMTP via the cPanel mailbox), and redirects to `/thank-you/`.
  - Include a honeypot field and basic rate-limit or referrer checks.
  - Never put secrets in the repo.
- **B. Third-party form endpoint** (Formspree, Web3Forms, etc.) set as the form's `action`.

Either way:
- The form must work without JavaScript.
- Every input has a real `<label>`, and `name` is required.
- Give either phone or email; use a light JS check plus a server-side check.

## 6. SEO and meta

- `<title>`: "Banksia Tours — Coach tours, safaris & charters from Adelaide since 1984"
- Meta description: "Family-run coach tours from Houghton in the Adelaide Hills since 1984. Day tours, short breaks, 7–21 day holidays, outback camping safaris, group charters and the Banksia Travel Club. Call 08 8380 5588."
- `LocalBusiness` / `TravelAgency` JSON-LD with the name, phone, Houghton SA 5131 and `foundingDate` 1984. Add the street address once the owner confirms it.
- Open Graph image: `coach-uluru.jpg` or a better new photo.
- Add a sitemap with `@astrojs/sitemap`, and a canonical `https://www.banksiatours.com.au/`.
- **Redirects:** the old site uses URLs like `/index.php/selectedContent/1783989715`. Add an `.htaccess` in `public/` that 301-redirects them:

| Old ID | Old page | New target |
| --- | --- | --- |
| `1421035056` | Home | `/` |
| `1163092997` | About | `/#contact` |
| `63353039` | Terms | `/terms/` |
| `974690243` | Coaches & Drivers | `/#coaches` |
| `1918768925` | Charters | `/#tours` |
| `432184977` | Seniors & others | `/#tours` |
| `904669671` | Travel Club | `/#club` |
| `1910560607` | Camping & Safaris | `/#safaris` |
| `1783989715` | Group Tours | `/#tours` |
| `2022761914` | Express Coaches | `/#coaches` |
| `284480115` | Contact | `/#contact` |

(Point these at the inner pages instead if phase 2 is built.)

## 7. Accessibility checklist

- One `<h1>`, with headings in order.
- Landmarks: `header`, `nav` (with `aria-label`), `main`, `footer`.
- A skip link.
- Every photo has meaningful `alt` text (provided in `content.json`). Decorative icons get `aria-hidden="true"`.
- Text contrast of at least 4.5 : 1. The tokens above already pass; don't lighten the muted greys.
- Visible focus styles, and the phone links use `tel:`.
- Respect `prefers-reduced-motion`.

## 8. Open items for the owner (keep as visible `[placeholders]`)

- Email address, ABN and any accreditation logos.
- Street address: confirm "Lot 2 Black Hill Rd, Houghton" or omit it.
- **New photography.** The existing photos are 2001–04 and very low resolution. A shoot of the current coaches, drivers and a recent tour group would lift the site a lot. The polaroid treatment is designed to work with both old and new photos.
- Current tour calendar and prices, if they want an "Upcoming trips" section later. The old site had none.
- Old-site facts that look wrong: it lists "2002 Sydney Olympics" and "2000 Eclipse". The redesign omits the years.

## 9. Definition of done

- `npm run build` succeeds, and `dist/` works when opened from a static server.
- Pages match `design/desktop.html` at 1440 px and `design/mobile.html` at 390 px, with no horizontal scroll at any width from 320 to 1920 px.
- Lighthouse on mobile scores 95 or more for Performance, Accessibility, Best Practices and SEO.
- The form submits end-to-end on the chosen method and lands on `/thank-you/`.
- There's a README with local dev steps and cPanel upload steps: build, then upload the contents of `dist/` to `public_html`.
