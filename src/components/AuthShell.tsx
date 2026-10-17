import type { ReactNode } from 'react';
import { Crest } from '@/components/Crest';
import { Logo } from '@/components/Logo';

/** Sign-in, welcome and invite screens: the form on the left, a Habitat-style pattern panel on the right. */
export function AuthShell({
  children,
  seed = 'habitat-welcome',
  quote = true,
}: {
  children: ReactNode;
  seed?: string;
  quote?: boolean;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-10">
          {children}
        </div>
        <p className="text-xs text-ink-soft">Private by design. No ads, no algorithm.</p>
      </div>
      <aside
        className="relative isolate hidden overflow-hidden bg-nav text-nav-ink lg:block"
        aria-hidden
      >
        <Crest
          seed={seed}
          cols={14}
          rows={18}
          density={0.6}
          className="absolute inset-0 -z-10 h-full w-full"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-nav via-nav/40 to-transparent" />
        {quote && (
          <div className="absolute inset-x-10 bottom-12">
            <p className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
              A home for the people
              <br />
              you’d actually text.
            </p>
          </div>
        )}
      </aside>
    </main>
  );
}
