import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Crest } from '@/components/Crest';
import { JoinButton } from '@/components/JoinButton';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/current-user';
import { DomainError } from '@/lib/errors';
import { previewInvite } from '@/lib/invites';
import { inkFor } from '@/lib/utils';

export const metadata = { title: 'Join a Habitat', robots: { index: false } };

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  const preview = await previewInvite(code).catch((e) =>
    e instanceof DomainError ? e : Promise.reject(e),
  );

  if (preview instanceof DomainError) {
    return (
      <AuthShell seed="habitat-closed" quote={false}>
        <div>
          <h1 className="text-4xl">
            {preview.status === 410 ? 'This invite has expired' : 'We can’t find that invite'}
          </h1>
          <p className="mt-2 text-ink-soft">Ask your friend for a fresh link.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </AuthShell>
    );
  }

  const next = `/join/${code}`;
  // New accounts finish the welcome step first, then come straight back here.
  if (user && !user.onboardedAt) redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  return (
    <AuthShell seed={preview.name} quote={false}>
      <div style={{ ['--accent' as string]: preview.accent }} className="space-y-6">
        <div className="relative overflow-hidden rounded-[1.75rem]">
          <Crest seed={preview.name} cols={10} rows={4} className="h-32 w-full" />
          <span
            className="absolute bottom-0 left-5 flex h-16 w-16 translate-y-1/3 items-center justify-center rounded-t-full rounded-b-2xl border-4 border-background text-3xl"
            style={{ background: preview.accent, color: inkFor(preview.accent) }}
            aria-hidden
          >
            {preview.emoji}
          </span>
        </div>
        <div className="pt-4">
          <h1 className="text-4xl leading-none">
            <span className="mb-1 block text-sm font-bold uppercase tracking-wider text-ink-soft">
              You’re invited to
            </span>
            {preview.name}
          </h1>
          <p className="mt-3 text-ink-soft">
            {preview.memberCount} {preview.memberCount === 1 ? 'person is' : 'people are'} in here.
            It’s private: only members can see anything.
          </p>
        </div>
        {preview.full ? (
          <p className="rounded-2xl bg-surface-2 p-4 text-sm font-medium">
            This Habitat is full right now.
          </p>
        ) : user ? (
          <JoinButton code={code} name={preview.name} />
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in to join</Link>
          </Button>
        )}
      </div>
    </AuthShell>
  );
}
