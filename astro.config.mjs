// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.banksiatours.com.au',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !/\/(thank-you|enquiry-error|404)\/?$/.test(page),
    }),
  ],
});
