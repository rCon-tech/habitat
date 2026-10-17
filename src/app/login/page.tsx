import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { LoginForm } from '@/components/LoginForm';
import { getCurrentUser } from '@/lib/current-user';
import { safeNext } from '@/lib/safe-next';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(rawNext);
  if (await getCurrentUser()) redirect(next);
  return (
    <AuthShell>
      <div>
        <h1 className="text-4xl">Welcome in.</h1>
        <p className="mt-2 text-ink-soft">Sign in, or create your account, with just your email.</p>
      </div>
      <LoginForm
        next={next}
        google={!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET}
        invited={next.startsWith('/join/')}
      />
    </AuthShell>
  );
}
