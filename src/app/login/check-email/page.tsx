import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { AuthShell } from '@/components/AuthShell';

export const metadata = { title: 'Check your email' };

export default async function CheckEmail({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <AuthShell seed="habitat-mail">
      <span className="flex h-16 w-16 items-center justify-center rounded-t-full rounded-b-2xl bg-accent text-accent-ink">
        <MailCheck size={30} />
      </span>
      <div>
        <h1 className="text-4xl">Check your inbox</h1>
        <p className="mt-2 text-ink-soft">
          We sent a sign-in link
          {email ? (
            <>
              {' '}
              to <strong className="text-ink">{email}</strong>
            </>
          ) : null}
          . It works once and expires in 10 minutes.
        </p>
        <p className="mt-2 text-sm text-ink-soft">Nothing there? Look in spam or promotions.</p>
      </div>
      <Link href="/login" className="text-sm font-semibold text-link underline underline-offset-4">
        Use a different email
      </Link>
    </AuthShell>
  );
}
