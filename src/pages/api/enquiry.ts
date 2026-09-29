import type { APIRoute } from 'astro';
import { isRateLimited, mailConfig, sendEnquiry, validateEnquiry } from '../../lib/enquiry';

export const prerender = false;

const PHONE = '08 8380 5588';

/**
 * Receives the enquiry form. Browsers with JavaScript get JSON back;
 * a plain form post (no JavaScript) is redirected to a thank-you or error page.
 */
export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = (ok: boolean, status: number, error?: string) =>
    wantsJson
      ? Response.json(ok ? { ok } : { ok, error }, { status })
      : redirect(ok ? '/thank-you/' : '/enquiry-error/', 303);

  // Only accept posts from our own pages. Hostnames are compared (not full
  // origins) because the host's proxy may present https as http.
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return new Response('Forbidden', { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress;
  if (isRateLimited(ip)) {
    return reply(false, 429, `We've received several enquiries from you already. Please call us on ${PHONE}.`);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 400, 'Sorry, we couldn’t read that form. Please try again.');
  }

  const result = validateEnquiry(form);
  if (!result.ok) {
    // Pretend spam succeeded so bots learn nothing.
    return result.spam ? reply(true, 200) : reply(false, 400, result.error);
  }

  const config = mailConfig();
  if (!config) {
    console.error('Enquiry form: SMTP_HOST and ENQUIRY_TO must be set to send email.');
    return reply(false, 503, `Our online form isn’t available right now. Please call us on ${PHONE}.`);
  }

  try {
    await sendEnquiry(result.enquiry, config);
  } catch (error) {
    console.error('Enquiry form: sending failed', error);
    return reply(false, 502, `Sorry, your enquiry didn’t go through. Please call us on ${PHONE}.`);
  }

  return reply(true, 200);
};
