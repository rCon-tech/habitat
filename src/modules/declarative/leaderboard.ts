export interface LeaderRow {
  memberId: string;
  total: number;
  entries: number;
  /** Competition ranking: equal totals share a rank (1, 2, 2, 4). */
  rank: number;
}

/**
 * Add up records per person. `sum` names a number field to add up; without it each record counts as 1.
 * Highest total first; ties share a rank and are listed by most entries, then by id, so the order is stable.
 */
export function leaderboard(
  records: Array<Record<string, unknown>>,
  groupBy: string,
  sum?: string,
): LeaderRow[] {
  const totals = new Map<string, { total: number; entries: number }>();
  for (const r of records) {
    const id = r[groupBy];
    if (typeof id !== 'string' || !id) continue;
    const add = sum ? Number(r[sum]) : 1;
    const row = totals.get(id) ?? { total: 0, entries: 0 };
    if (Number.isFinite(add)) row.total += add;
    row.entries += 1;
    totals.set(id, row);
  }
  const rows = [...totals.entries()]
    .map(([memberId, v]) => ({ memberId, ...v }))
    .sort(
      (a, b) => b.total - a.total || b.entries - a.entries || a.memberId.localeCompare(b.memberId),
    );
  let rank = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.total !== rows[i - 1]!.total) rank = i + 1;
    return { ...r, rank };
  });
}
