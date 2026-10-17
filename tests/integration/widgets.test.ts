import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { createRecord, deleteRecord, queryRecords, updateRecord } from '@/lib/records';
import { getTimeline } from '@/lib/timeline';
import { leaderboard } from '@/modules/declarative/leaderboard';
import { makeHabitat } from './factories';

const rec = (module: string, collection: string, data: Record<string, unknown>) => ({
  module,
  collection,
  data,
});

describe('Shopping List', () => {
  it('anyone can tick off or remove an item someone else added', async () => {
    const h = await makeHabitat({ members: 2, extraModules: ['shopping-list'] });
    const [a, b] = h.members;
    const milk = await createRecord(
      a!,
      rec('shopping-list', 'item', { name: 'Milk', quantity: '2 pints' }),
    );
    expect(milk.data).toMatchObject({ name: 'Milk', done: false });
    expect((await updateRecord(b!, milk.id, { done: true })).data.done).toBe(true);
    await deleteRecord(b!, milk.id);
    expect(
      (await queryRecords(a!, { module: 'shopping-list', collection: 'item' })).items,
    ).toHaveLength(0);
  });
});

describe('Chores', () => {
  it('assign a chore to a member of this Habitat only', async () => {
    const h = await makeHabitat({ members: 2, extraModules: ['chores'] });
    const other = await makeHabitat();
    const [a, b] = h.members;
    const ok = await createRecord(
      a!,
      rec('chores', 'chore', { task: 'Bins', assignedTo: b!.userId, due: '2026-11-02' }),
    );
    expect(ok.data).toMatchObject({ assignedTo: b!.userId, due: '2026-11-02', done: false });
    await expect(
      createRecord(
        a!,
        rec('chores', 'chore', { task: 'Bins', assignedTo: other.members[0]!.userId }),
      ),
    ).rejects.toMatchObject({ status: 422, fields: { assignedTo: expect.any(Array) } });
    await expect(
      createRecord(a!, rec('chores', 'chore', { task: 'Bins', due: 'next tuesday' })),
    ).rejects.toMatchObject({ status: 422 });
    expect((await updateRecord(b!, ok.id, { done: true })).data.done).toBe(true); // the assignee ticks it off
  });
});

describe('Dinner Rota', () => {
  it('needs a date and a cook, and lists upcoming nights in date order', async () => {
    const h = await makeHabitat({ members: 2, extraModules: ['dinner-rota'] });
    const [a, b] = h.members;
    await expect(
      createRecord(a!, rec('dinner-rota', 'meal', { cook: a!.userId })),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      createRecord(a!, rec('dinner-rota', 'meal', { date: '2026-12-01' })),
    ).rejects.toMatchObject({ status: 422 });
    await createRecord(
      a!,
      rec('dinner-rota', 'meal', { date: '2026-12-03', cook: b!.userId, dish: 'Curry' }),
    );
    await createRecord(
      a!,
      rec('dinner-rota', 'meal', { date: '2026-12-01', cook: a!.userId, dish: 'Pasta' }),
    );
    await createRecord(
      a!,
      rec('dinner-rota', 'meal', { date: '2026-11-20', cook: a!.userId, dish: 'Old' }),
    );
    const upcoming = await queryRecords(a!, {
      module: 'dinner-rota',
      collection: 'meal',
      where: { date: { gte: '2026-11-25' } },
      order: 'date:asc',
    });
    expect(upcoming.items.map((m) => m.data.dish)).toEqual(['Pasta', 'Curry']);
    const past = await queryRecords(a!, {
      module: 'dinner-rota',
      collection: 'meal',
      where: { date: { lt: '2026-11-25' } },
      order: 'date:desc',
    });
    expect(past.items.map((m) => m.data.dish)).toEqual(['Old']);
  });
});

describe('Scoreboard', () => {
  it('validates scores and adds them up per person', async () => {
    const h = await makeHabitat({ members: 3, extraModules: ['scoreboard'] });
    const [a, b, c] = h.members;
    const score = (player: string, points: number, game = 'Pub quiz') =>
      rec('scoreboard', 'score', { game, player, points });
    await createRecord(a!, score(a!.userId, 12));
    await createRecord(a!, score(b!.userId, 15));
    await createRecord(b!, score(a!.userId, 4, 'Darts'));
    await createRecord(c!, score(c!.userId, -2));

    await expect(
      createRecord(a!, rec('scoreboard', 'score', { game: 'x', player: a!.userId })),
    ).rejects.toMatchObject({ status: 422 }); // no points
    await expect(createRecord(a!, score(a!.userId, 100000))).rejects.toMatchObject({ status: 422 });
    await expect(
      createRecord(a!, rec('scoreboard', 'score', { game: 'x', player: a!.userId, points: 1.5 })),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      createRecord(a!, { ...score('00000000-0000-4000-8000-000000000000', 1) }),
    ).rejects.toMatchObject({ status: 422 }); // not a member

    const all = await queryRecords(a!, { module: 'scoreboard', collection: 'score', limit: 100 });
    const table = leaderboard(
      all.items.map((r) => r.data),
      'player',
      'points',
    );
    expect(table.map((r) => [r.memberId, r.total, r.rank])).toEqual([
      [a!.userId, 16, 1], // 12 + 4 across two games
      [b!.userId, 15, 2],
      [c!.userId, -2, 3], // negative scores count
    ]);
  });
});

describe('Quote Wall', () => {
  it('shows on the timeline, names who said it, and only the author edits', async () => {
    const h = await makeHabitat({ members: 2, extraModules: ['quote-wall'] });
    const [a, b] = h.members;
    const q = await createRecord(
      a!,
      rec('quote-wall', 'quote', {
        text: 'I can fix it, probably',
        saidBy: b!.userId,
        context: 'The shelf',
      }),
    );
    const tl = await getTimeline(b!);
    expect(tl.items[0]).toMatchObject({
      id: q.id,
      module: 'quote-wall',
      data: { saidBy: b!.userId },
    });
    await expect(updateRecord(b!, q.id, { text: 'edited' })).rejects.toMatchObject({ status: 403 });
    await expect(
      createRecord(a!, rec('quote-wall', 'quote', { text: 'x'.repeat(281), saidBy: b!.userId })),
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      createRecord(a!, rec('quote-wall', 'quote', { text: 'hi' })),
    ).rejects.toMatchObject({ status: 422 }); // who said it?
  });
});

describe('Link Stash', () => {
  it('accepts web links only', async () => {
    const h = await makeHabitat({ extraModules: ['link-stash'] });
    const a = h.members[0]!;
    await createRecord(
      a,
      rec('link-stash', 'link', { title: 'Good read', url: 'https://example.com/post' }),
    );
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,<script>',
      'ftp://x.test',
      'not a url',
    ]) {
      await expect(
        createRecord(a, rec('link-stash', 'link', { title: 'Bad', url })),
      ).rejects.toMatchObject({ status: 422 });
    }
    expect((await getTimeline(a)).items.map((r) => r.module)).toEqual(['link-stash']);
  });
});

describe('Group Notes', () => {
  it('tells everyone else when a note is pinned', async () => {
    const h = await makeHabitat({ members: 3, extraModules: ['group-notes'] });
    const [a, b, c] = h.members;
    await createRecord(
      a!,
      rec('group-notes', 'note', { title: 'Wi-Fi', body: 'The code is on the fridge' }),
    );
    const n = await getDb()
      .select()
      .from(s.notification)
      .where(eq(s.notification.type, 'group-notes.note'));
    expect(n.map((x) => x.userId).sort()).toEqual([b!.userId, c!.userId].sort());
    expect(n[0]!.payload).toMatchObject({ text: expect.stringContaining('posted a note: Wi-Fi') });
    await expect(
      createRecord(a!, rec('group-notes', 'note', { title: 'Empty' })),
    ).rejects.toMatchObject({ status: 422 });
  });
});

describe('every JSON widget', () => {
  it('installs through a vote and keeps its data inside its own Habitat', async () => {
    const { declarativeModules } = await import('@/modules/declarative/catalog');
    const a = await makeHabitat({ members: 2 });
    const b = await makeHabitat();
    const { propose, vote } = await import('@/lib/proposals');
    for (const m of declarativeModules) {
      const p = await propose(a.members[0]!, { kind: 'install', moduleId: m.manifest.id });
      await vote(a.members[1]!, p.id, 'yes');
    }
    const { listActive } = await import('@/lib/installed-modules');
    const active = (await listActive(getDb(), a.id)).map((x) => x.manifest.id);
    for (const m of declarativeModules) expect(active).toContain(m.manifest.id);
    // none of them is installed in the other Habitat, so none of their data is reachable there
    await expect(
      queryRecords(b.members[0]!, { module: 'scoreboard', collection: 'score' }),
    ).rejects.toMatchObject({ code: 'module_not_installed' });
  });
});
