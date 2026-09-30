import type { APIRoute } from 'astro';

export const prerender = false;

const PRODUCTION_HOSTS = new Set(['www.banksiatours.com.au', 'banksiatours.com.au']);

/**
 * Search engines may crawl only the live site. Any other host (staging such as
 * banksia.loffler.au, or a local server) is blocked entirely.
 */
export const GET: APIRoute = ({ request, site }) => {
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(':')[0];
  const body = PRODUCTION_HOSTS.has(host)
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
