import type { CollectionDef } from '../../sdk/types';
import { TODAY, type Filter } from '../mdl-schema';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Turn a view's filter into a records query. `$today` becomes the viewer's current date (for date
 * fields) or the current moment (for date-time fields). Returns undefined until the time is known.
 */
export function asWhere(f: Filter | undefined, def: CollectionDef, nowMs: number) {
  if (!f) return { where: undefined, ready: true };
  let value = String(f.value);
  if (f.value === TODAY) {
    if (nowMs <= 0) return { where: undefined, ready: false };
    const d = new Date(nowMs);
    value =
      def.fields[f.field]?.type === 'datetime'
        ? d.toISOString()
        : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return { where: { [f.field]: { [f.op]: value } }, ready: true };
}
