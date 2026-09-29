# Banksia Tours website

The new website for [Banksia Tours](https://www.banksiatours.com.au), a family coach-tour business in Houghton, South Australia. It's a static [Astro](https://astro.build) site built to be uploaded to cPanel hosting.

The design brief, full content and reference designs are in [`banksia-astro-handoff/`](banksia-astro-handoff/BUILD_BRIEF.md).

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev       # http://localhost:4321
npm run check     # type-check .astro files
npm run build     # production build into dist/
npm run preview   # serve the build locally
npm start         # run the production server (after a build)
```

## Editing content

All words on the site live in [`src/data/site.json`](src/data/site.json): phone numbers, tour types, Travel Club outings, special events, coach features and the terms. Edit that file and rebuild; you don't need to touch the components.

Photos live in `src/assets/photos/` and are referenced by file name from `site.json`. Astro converts them to WebP at build time. To swap a photo, replace the file (keep the name) or add a new file and update the name in `site.json`.

Items still to fill in are marked `[in brackets]` in `site.json`: the email address and ABN.

## Project layout

```
src/
  data/site.json        all site copy
  assets/photos/        tour photos
  styles/global.css     design tokens + shared styles
  layouts/Base.astro    <head>, SEO, header, footer
  components/           page sections and shared building blocks
  pages/                one file per page (see below)
  pages/api/enquiry.ts  enquiry form endpoint (sends email)
  lib/enquiry.ts        form validation, SMTP sending, rate limit
public/
  favicon.svg, robots.txt
```

## Pages

| URL | File | What's on it |
| --- | --- | --- |
| `/` | `pages/index.astro` | Hero, tour types, teasers for safaris, Travel Club and coaches |
| `/group-tours/` | `pages/group-tours.astro` | Day tours, mystery trips, short breaks, extended holidays, snow trips |
| `/camping-safaris/` | `pages/camping-safaris.astro` | Safari details, kit and destinations |
| `/charters/` | `pages/charters.astro` | Charters, seniors & interest groups, special events |
| `/travel-club/` | `pages/travel-club.astro` | How the club works and each outing type |
| `/coaches-drivers/` | `pages/coaches-drivers.astro` | Coach features, drivers, express long-distance runs |
| `/about/` | `pages/about.astro` | The family story and services |
| `/contact/` | `pages/contact.astro` | Contact details and the enquiry form |
| `/terms/` | `pages/terms.astro` | Terms & conditions |

Page titles and search descriptions are in `site.json` under `pages`. `thank-you`, `enquiry-error` and `404` are utility pages and are left out of the sitemap.

## Enquiry form

The contact form posts to `/api/enquiry` (`src/pages/api/enquiry.ts`), which sends the enquiry by email over SMTP using nodemailer. With JavaScript the form submits in the background and shows a thank-you message in place; without it, the browser is redirected to `/thank-you/` or `/enquiry-error/`. It has a hidden spam-trap field, input validation and a limit of 5 enquiries per visitor every 10 minutes.

Set these environment variables on the host (never commit them):

| Variable | Example | Notes |
| --- | --- | --- |
| `SMTP_HOST` | `mail.loffler.au` | Your mail server |
| `SMTP_PORT` | `465` | 465 uses SSL; 587 uses STARTTLS |
| `SMTP_USER` | `website@loffler.au` | Mailbox that sends the enquiries |
| `SMTP_PASS` | — | That mailbox's password |
| `ENQUIRY_TO` | `bookings@…` | Where enquiries are delivered |
| `ENQUIRY_FROM` | `website@loffler.au` | Optional; defaults to `SMTP_USER` |
| `SMTP_SECURE` | `true` / `false` | Optional; defaults to true on port 465 |

Until `SMTP_HOST` and `ENQUIRY_TO` are set, the form tells visitors to call instead.

## Deploying (cPanel AI App Hosting / any Node host)

The site runs as a Node app: pages are pre-built HTML served as static files, and only `/api/enquiry` and the old-URL redirects (`src/pages/index.php/[...path].ts`) run on the server.

- **Repository:** `https://github.com/justinloffler/banksia.git`
- **Node version:** 22.12 or newer
- **Install / build command:** `npm ci && npm run build`
- **Start command:** `npm start` (runs `node ./dist/server/entry.mjs`)
- **Port:** the server listens on the `PORT` environment variable the host provides (default 8080).

Old addresses like `/index.php/selectedContent/1783989715` are 301-redirected to the matching new page.
