'use client';

import { Card } from '@/components/ui/card';
import { useNow } from '@/lib/use-now';
import { useRecords } from '../../sdk/hooks';
import type { CollectionDef } from '../../sdk/types';
import type { Filter } from '../mdl-schema';
import { asWhere } from './where';

/** "3 of 12 ticked off": a count of records that match the filter, out of all of them. */
export function CounterBlock({
  moduleId,
  collection,
  def,
  filter,
  label,
}: {
  moduleId: string;
  collection: string;
  def: CollectionDef;
  filter?: Filter;
  label: string;
}) {
  const nowMs = useNow(60_000);
  const { where, ready } = asWhere(filter, def, nowMs);
  const all = useRecords({ module: moduleId, collection, limit: 100, pollMs: 30_000 });
  const some = useRecords({
    module: moduleId,
    collection,
    where,
    limit: 100,
    pollMs: 30_000,
    enabled: ready,
  });
  const total = all.items.length;
  const n = some.items.length;
  const capped = !!all.hasNextPage;
  return (
    <Card className="flex items-center justify-between">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <span className="font-display text-3xl font-extrabold">
        {n}
        <span className="text-base font-medium text-ink-soft">
          {' '}
          of {total}
          {capped ? '+' : ''}
        </span>
      </span>
    </Card>
  );
}
