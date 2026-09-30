// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.banksiatours.com.au',
  // 'server' so hosts (e.g. cPanel Web Apps) run the Node server; every page
  // still opts into pre-rendering, so only /api/enquiry and the old-URL
  // redirects actually run on each request.
  output: 'server',
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
