'use client';

import { useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { MemberAvatar, displayName } from '@/components/MemberAvatar';
import { Card, Skeleton } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMemberLookup } from '../../sdk/context';
import { useRecords } from '../../sdk/hooks';
import { leaderboard } from '../leaderboard';

const MAX_PAGES = 5; // 500 records is far more than a friend group will log

/** Everyone's total, highest first. Adds up as many pages as it can, and says so if it had to stop. */
export function LeaderboardBlock({
  moduleId,
  collection,
  groupBy,
  sum,
  label,
}: {
  moduleId: string;
  collection: string;
  groupBy: string;
  sum?: string;
  label?: string;
}) {
  const who = useMemberLookup();
  const q = useRecords({ module: moduleId, collection, limit: 100, pollMs: 30_000 });
  const pages = q.data?.pages.length ?? 0;
  useEffect(() => {
    if (q.hasNextPage && !q.isFetchingNextPage && pages < MAX_PAGES) q.fetchNextPage();
  }, [q, pages]);

  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = leaderboard(
    q.items.map((r) => r.data),
    groupBy,
    sum,
  );
  if (!rows.length)
    return <EmptyState title="No scores yet">Add the first entry below.</EmptyState>;
  return (
    <Card className="space-y-1 p-3">
      <ol>
        {rows.map((r) => {
          const m = who(r.memberId);
          return (
            <li
              key={r.memberId}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5',
                r.rank === 1 && 'bg-accent/15',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-t-full rounded-b-lg font-display text-lg font-extrabold',
                  r.rank === 1 ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-soft',
                )}
                aria-label={`Rank ${r.rank}`}
              >
                {r.rank}
              </span>
              <MemberAvatar member={m} size="sm" />
              <span className="min-w-0 flex-1 truncate font-semibold">{displayName(m)}</span>
              <span className="text-right">
                <span className="block font-display text-2xl font-extrabold leading-none">
                  {r.total}
                </span>
                <span className="text-xs text-ink-soft">
                  {label ?? 'total'} · {r.entries} {r.entries === 1 ? 'entry' : 'entries'}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {q.hasNextPage && (
        <p className="px-3 pb-1 text-xs text-ink-soft">
          Totals cover the most recent {MAX_PAGES * 100} entries.
        </p>
      )}
    </Card>
  );
}
