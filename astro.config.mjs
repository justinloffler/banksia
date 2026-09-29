// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.banksiatours.com.au',
  // Pages are pre-built HTML; only /api/enquiry runs on the server.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  server: { host: true },
  // 'ignore' so POSTs to /api/enquiry aren't redirected (which drops the form data).
  trailingSlash: 'ignore',
  // The enquiry endpoint does its own same-site check; Astro's compares full
  // origins, which fails behind the host's HTTPS proxy.
  security: { checkOrigin: false },
  integrations: [
    sitemap({
      filter: (page) => !/\/(thank-you|enquiry-error|404)\/?$/.test(page),
    }),
  ],
});
