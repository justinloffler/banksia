import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import site from '../data/site.json';

export const INTEREST_OPTIONS =
  site.contact.form.fields.find((field) => field.name === 'interest')?.options ?? [];

export interface Enquiry {
  name: string;
  phone: string;
  email: string;
  interest: string;
  travellers: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; enquiry: Enquiry }
  | { ok: false; spam: true }
  | { ok: false; spam: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim, drop control characters (newlines survive only in multi-line fields) and cap the length. */
function clean(value: FormDataEntryValue | null, max: number, multiline = false): string {
  if (typeof value !== 'string') return '';
  const pattern = multiline ? /[^\P{Cc}\n\t]/gu : /\p{Cc}/gu;
  return value.replace(pattern, '').trim().slice(0, max);
}

export function validateEnquiry(form: FormData): ValidationResult {
  // Spam trap: people never see or fill in the "website" field.
  if (clean(form.get('website'), 200) !== '') return { ok: false, spam: true };

  const enquiry: Enquiry = {
    name: clean(form.get('name'), 100),
    phone: clean(form.get('phone'), 40),
    email: clean(form.get('email'), 200),
    interest: clean(form.get('interest'), 60),
    travellers: clean(form.get('travellers'), 5),
    message: clean(form.get('message'), 3000, true),
  };

  if (enquiry.email && !EMAIL_PATTERN.test(enquiry.email)) enquiry.email = '';
  if (!INTEREST_OPTIONS.includes(enquiry.interest)) enquiry.interest = 'Not specified';
  if (enquiry.travellers && !/^\d{1,3}$/.test(enquiry.travellers)) enquiry.travellers = '';

  if (!enquiry.name) return { ok: false, spam: false, error: 'Please tell us your name.' };
  if (!enquiry.phone && !enquiry.email) {
    return { ok: false, spam: false, error: 'Please add a phone number or an email address so we can get back to you.' };
  }
  return { ok: true, enquiry };
}

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
}

/** SMTP settings come from environment variables set on the host, never from the repo. */
export function mailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, ENQUIRY_TO, ENQUIRY_FROM } = env;
  if (!SMTP_HOST || !ENQUIRY_TO) return null;
  const port = Number(SMTP_PORT ?? 465);
  return {
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
    user: SMTP_USER ?? '',
    pass: SMTP_PASS ?? '',
    to: ENQUIRY_TO,
    from: ENQUIRY_FROM ?? SMTP_USER ?? ENQUIRY_TO,
  };
}

let transporter: Transporter | undefined;

export async function sendEnquiry(enquiry: Enquiry, config: MailConfig): Promise<void> {
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });

  const text = [
    'New enquiry from the Banksia Tours website',
    '',
    `Name:        ${enquiry.name}`,
    `Phone:       ${enquiry.phone || '—'}`,
    `Email:       ${enquiry.email || '—'}`,
    `Interested:  ${enquiry.interest}`,
    `Travellers:  ${enquiry.travellers || '—'}`,
    '',
    'Where and when?',
    enquiry.message || '—',
  ].join('\n');

  await transporter.sendMail({
    from: { name: 'Banksia Tours website', address: config.from },
    to: config.to,
    replyTo: enquiry.email || undefined,
    subject: `Website enquiry: ${enquiry.interest} — ${enquiry.name}`,
    text,
  });
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

/** Simple in-memory limit: at most 5 enquiries per address every 10 minutes. */
export function isRateLimited(key: string, now = Date.now()): boolean {
  const times = (recent.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  times.push(now);
  recent.set(key, times);
  if (recent.size > 5000) {
    for (const [k, v] of recent) if (v.every((time) => now - time >= WINDOW_MS)) recent.delete(k);
  }
  return times.length > MAX_PER_WINDOW;
}
