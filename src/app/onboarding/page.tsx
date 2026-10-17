import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { OnboardingForm } from '@/components/OnboardingForm';
import { requireUser } from '@/lib/current-user';
import { safeNext } from '@/lib/safe-next';

export const metadata = { title: 'Welcome' };

export default async function Onboarding({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser({ allowUnonboarded: true });
  const next = safeNext((await searchParams).next);
  if (user.onboardedAt) redirect(next);
  const guess = user.name && !user.name.includes('@') ? user.name : '';
  return (
    <AuthShell seed="habitat-hello">
      <div>
        <h1 className="text-4xl">One quick thing.</h1>
        <p className="mt-2 text-ink-soft">Then you’re in.</p>
      </div>
      <OnboardingForm initialName={guess} next={next} />
    </AuthShell>
  );
}
