'use client';

import type { FeedCardProps } from '../sdk/types';
import { FieldText } from './blocks/FieldText';
import type { Cell } from './mdl-schema';

/** A record's card on the Habitat home timeline, drawn from the module's `views.card` cells. */
export function DeclarativeCard({ record, cells }: FeedCardProps & { cells: Cell[] }) {
  return (
    <div className="space-y-2">
      {cells.map((c) => (
        <FieldText key={c.field} cell={c} value={record.data[c.field]} />
      ))}
    </div>
  );
}
