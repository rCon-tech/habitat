import { describe, expect, it } from 'vitest';
import { leaderboard } from '@/modules/declarative/leaderboard';

const rec = (player: string, points: number) => ({ player, points });

describe('leaderboard', () => {
  it('adds up points per person, highest first', () => {
    const rows = leaderboard(
      [rec('a', 5), rec('b', 12), rec('a', 9), rec('c', 3)],
      'player',
      'points',
    );
    expect(rows.map((r) => [r.memberId, r.total, r.entries, r.rank])).toEqual([
      ['a', 14, 2, 1],
      ['b', 12, 1, 2],
      ['c', 3, 1, 3],
    ]);
  });

  it('ties share a rank, then skip (1, 2, 2, 4), ordered by entries then id', () => {
    const rows = leaderboard(
      [rec('a', 12), rec('b', 5), rec('b', 5), rec('c', 10), rec('d', 1)],
      'player',
      'points',
    );
    expect(rows.map((r) => [r.memberId, r.rank])).toEqual([
      ['a', 1],
      ['b', 2], // same total as c, but two entries
      ['c', 2],
      ['d', 4],
    ]);
  });

  it('handles negative points and counts entries when there is no sum field', () => {
    expect(
      leaderboard([rec('a', -3), rec('a', 1), rec('b', 0)], 'player', 'points').map((r) => [
        r.memberId,
        r.total,
      ]),
    ).toEqual([
      ['b', 0],
      ['a', -2],
    ]);
    const counted = leaderboard([{ who: 'a' }, { who: 'a' }, { who: 'b' }], 'who');
    expect(counted.map((r) => [r.memberId, r.total])).toEqual([
      ['a', 2],
      ['b', 1],
    ]);
  });

  it('ignores records with no person and non-numeric points', () => {
    const rows = leaderboard(
      [{ points: 5 }, { player: '', points: 5 }, { player: 'a', points: 'lots' }, rec('a', 2)],
      'player',
      'points',
    );
    expect(rows).toEqual([{ memberId: 'a', total: 2, entries: 2, rank: 1 }]);
  });

  it('is empty for no records', () => {
    expect(leaderboard([], 'player', 'points')).toEqual([]);
  });
});
