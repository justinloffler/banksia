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
npm run preview   # serve dist/ locally
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
public/
  .htaccess             redirects from the old site, caching, 404 page
  enquiry.php           enquiry form handler (PHP mail)
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

## Deploying to cPanel

1. **Set up the enquiry email (first time only).** Open `public/enquiry.php` and set:
   - `ENQUIRY_TO`: the inbox that should receive enquiries.
   - `ENQUIRY_FROM`: a mailbox on the site's own domain, e.g. `website@banksiatours.com.au`. Create it in cPanel → Email Accounts. Mail from another domain is likely to be marked as spam.

   Until `ENQUIRY_TO` is set, the form sends people to a "please call us" page instead.
2. Run `npm run build`.
3. In cPanel → File Manager, open `public_html`, back up the old site, then upload **the contents of `dist/`**. The hidden `.htaccess` file must be included. In File Manager, turn on Settings → "Show Hidden Files".
4. Visit the site and send a test enquiry.

### Staging (banksia.loffler.au)

On the server, from a clone of this repo: `bash scripts/deploy-staging.sh`. It builds the site, blocks search engines with `robots.txt`, keeps cPanel's PHP settings at the top of `.htaccess`, and syncs everything into `~/banksia.loffler.au`. It needs Node.js 22.12+ on the server.

The server needs PHP 8.0 or newer for the form; set it in cPanel → MultiPHP Manager. Old addresses like `/index.php/selectedContent/1783989715` redirect to the matching page of the new site. Once SSL is active, uncomment the HTTPS redirect at the top of `.htaccess`.
