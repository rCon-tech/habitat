import type { ReactNode } from 'react';
import { hashString } from '@/lib/utils';

/** Little compositions built from the logo's own shapes, in the Habitat's accent. Chosen by title, so each screen keeps its own. */
function Motif({ seed }: { seed: string }) {
  const v = hashString(seed) % 4;
  const a = 'var(--accent)';
  const n = 'var(--ink)';
  const s = 'color-mix(in oklab, var(--accent) 35%, var(--surface-2))';
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" aria-hidden className="mb-1">
      {v === 0 && (
        <>
          <path d="M10 70V30a14 14 0 0 1 28 0v40Z" fill={s} />
          <path d="M46 10h28v40a14 14 0 0 1-28 0Z" fill={n} />
          <rect x="30" y="34" width="24" height="14" fill={a} />
        </>
      )}
      {v === 1 && (
        <>
          <circle cx="30" cy="40" r="26" fill={s} />
          <path d="M44 70V36a14 14 0 0 1 28 0v34Z" fill={a} />
          <circle cx="72" cy="20" r="9" fill={n} />
        </>
      )}
      {v === 2 && (
        <>
          <rect x="8" y="46" width="80" height="24" rx="12" fill={s} />
          <rect x="22" y="22" width="52" height="24" rx="12" fill={n} />
          <circle cx="66" cy="34" r="7" fill={a} />
        </>
      )}
      {v === 3 && (
        <>
          <path d="M8 70V40a22 22 0 0 1 44 0v30Z" fill={n} />
          <path d="M52 70V52a18 18 0 0 1 36 0v18Z" fill={a} />
          <circle cx="30" cy="48" r="8" fill={s} />
        </>
      )}
    </svg>
  );
}

export function EmptyState({
  title,
  children,
}: {
  emoji?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[1.75rem] border-2 border-dashed border-line px-6 py-10 text-center">
      <Motif seed={title} />
      <h3 className="text-lg font-extrabold">{title}</h3>
      {children ? <div className="max-w-sm text-sm text-ink-soft">{children}</div> : null}
    </div>
  );
}
