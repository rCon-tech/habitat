import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  // The site's public address. Set APP_URL (preferred). NEXT_PUBLIC_APP_URL and BETTER_AUTH_URL still work.
  APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_TRANSPORT: z.enum(['console', 'outbox', 'resend']).default('console'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Habitat <hello@example.com>'),
  CRON_SECRET: z.string().optional(),
  ABLY_API_KEY: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default('habitat-media'),
});

export type Env = z.infer<typeof schema>;

/**
 * The site's address without a trailing slash: APP_URL, else NEXT_PUBLIC_APP_URL, else BETTER_AUTH_URL,
 * else localhost. Reads process.env directly so it works without the full environment (tests, scripts).
 */
export function appUrl(): string {
  const v =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000';
  return v.replace(/\/+$/, '');
}
let cached: Env | undefined;

/** Parsed lazily (not at import) so `next build` and unit tests don't need a full environment. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${lines}`);
  }
  const e = parsed.data;
  if (e.NODE_ENV === 'production') {
    if (e.EMAIL_TRANSPORT === 'outbox') throw new Error('EMAIL_TRANSPORT=outbox is for tests only');
    if (e.EMAIL_TRANSPORT === 'resend' && !e.RESEND_API_KEY)
      throw new Error('RESEND_API_KEY is required');
    if (!e.CRON_SECRET) throw new Error('CRON_SECRET is required in production');
  }
  return (cached = { ...e, APP_URL: appUrl(), NEXT_PUBLIC_APP_URL: appUrl() });
}

export const photosEnabled = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
