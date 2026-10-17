'use client';

import { EmptyState } from '@/components/EmptyState';
import { TimelineItem } from '@/components/TimelineItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/card';
import { useNow } from '@/lib/use-now';
import { useRecords } from '../../sdk/hooks';
import type { CollectionDef } from '../../sdk/types';
import type { Cell, Filter } from '../mdl-schema';
import { FieldText } from './FieldText';
import { ToggleBlock } from './ToggleBlock';
import { asWhere } from './where';

const INLINE = new Set(['date', 'member', 'badge', 'money']);

/** Runs of small cells (date, person, badge, amount) share a wrapping row; everything else gets its own line. */
function groupCells(cells: Cell[]): Cell[][] {
  const out: Cell[][] = [];
  for (const c of cells) {
    const last = out[out.length - 1];
    if (INLINE.has(c.as) && last && INLINE.has(last[0].as)) last.push(c);
    else out.push([c]);
  }
  return out;
}

/** A list of records. Each one is wrapped in the standard item, so comments and reactions come for free. */
export function ListBlock({
  moduleId,
  collection,
  def,
  filter,
  order,
  empty,
  cells,
}: {
  moduleId: string;
  collection: string;
  def: CollectionDef;
  filter?: Filter;
  order?: string;
  empty?: string;
  cells: Cell[];
}) {
  const nowMs = useNow(60_000);
  const { where, ready } = asWhere(filter, def, nowMs);
  const q = useRecords({
    module: moduleId,
    collection,
    where,
    order,
    limit: 50,
    pollMs: 30_000,
    enabled: ready,
  });
  if (q.isLoading || !ready) return <Skeleton className="h-24" />;
  if (!q.items.length) return <EmptyState title={empty ?? 'Nothing here yet'} />;
  const titleCell = cells.find((c) => c.as === 'title' || c.as === 'quote');
  return (
    <div className="space-y-3">
      {q.items.map((r) => (
        <TimelineItem key={r.id} record={r}>
          <div className="flex items-start gap-3">
            {cells
              .filter((c) => c.as === 'toggle')
              .map((c) => (
                <ToggleBlock
                  key={c.field}
                  moduleId={moduleId}
                  recordId={r.id}
                  field={c.field}
                  value={!!r.data[c.field]}
                  label={`Mark done: ${String((titleCell && r.data[titleCell.field]) ?? '')}`}
                />
              ))}
            <div className="min-w-0 flex-1 space-y-1.5">
              {groupCells(cells.filter((c) => c.as !== 'toggle')).map((group) =>
                group.length === 1 && !INLINE.has(group[0].as) ? (
                  <FieldText key={group[0].field} cell={group[0]} value={r.data[group[0].field]} />
                ) : (
                  <div key={group[0].field} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {group.map((c) => (
                      <FieldText key={c.field} cell={c} value={r.data[c.field]} />
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        </TimelineItem>
      ))}
      {q.hasNextPage && (
        <Button variant="outline" onClick={() => q.fetchNextPage()}>
          Load more
        </Button>
      )}
    </div>
  );
}
