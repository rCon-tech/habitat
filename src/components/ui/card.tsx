import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[1.75rem] border border-line bg-surface p-5 shadow-card', className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'ok' | 'danger' }) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-soft',
    accent: 'bg-accent/18 text-ink',
    ok: 'bg-ok/15 text-ok',
    danger: 'bg-danger/15 text-danger',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('animate-pulse rounded-[1.75rem] bg-surface-2', className)} />
  );
}
