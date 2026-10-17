import { describe, expect, it } from 'vitest';
import bucketList from '@/modules/bucket-list/module.json';
import { parseMdl } from '@/modules/declarative/mdl-schema';
import { defaultModuleIds, getManifest, listWidgets } from '@/modules/registry';

// Tests poke at arbitrary places in the document, so they work on loosely typed JSON.
type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const clone = (x: unknown): Json => structuredClone(x);

describe('bucket-list/module.json', () => {
  it('is a valid MDL document', () => {
    expect(parseMdl(bucketList).manifest.id).toBe('bucket-list');
  });
});

describe('MDL validation', () => {
  it('rejects a view that names an unknown collection, with the path', () => {
    const bad = clone(bucketList);
    bad.views.main.children[1].collection = 'ghost';
    expect(() => parseMdl(bad)).toThrow(
      /views\.main\.children\.1\.collection: Unknown collection "ghost"/,
    );
  });

  it('rejects unknown fields in filters, forms and cells', () => {
    const a = clone(bucketList);
    a.views.main.children[0].filter.field = 'nope';
    expect(() => parseMdl(a)).toThrow(/not a field/);
    const b = clone(bucketList);
    b.views.main.children[1].fields = ['title', 'nope'];
    expect(() => parseMdl(b)).toThrow(/fields\.1/);
    const c = clone(bucketList);
    c.views.main.children[2].tabs[0].view.cells[1].field = 'nope';
    expect(() => parseMdl(c)).toThrow(/cells\.1\.field/);
  });

  it('checks that cell styles suit the field type', () => {
    const bad = clone(bucketList);
    bad.views.main.children[2].tabs[0].view.cells[1].as = 'toggle'; // title is text, not yes/no
    expect(() => parseMdl(bad)).toThrow(/toggle needs a yes\/no field/);
  });

  it('rejects unknown block types, HTML-ish extras and script-like values', () => {
    const a = clone(bucketList);
    a.views.main.children.push({ type: 'html', html: '<script>alert(1)</script>' });
    expect(() => parseMdl(a)).toThrow();
    const b = clone(bucketList);
    b.views.main.children.push({ type: 'text', text: 'x'.repeat(501) });
    expect(() => parseMdl(b)).toThrow();
  });

  it('limits nesting depth', () => {
    const deep = (n: number): unknown =>
      n === 0 ? { type: 'text', text: 'x' } : { type: 'stack', children: [deep(n - 1)] };
    const doc = clone(bucketList);
    doc.views.main = deep(6);
    expect(() => parseMdl(doc)).toThrow(/at most 4 levels/);
  });

  it('rejects forms for child collections and missing manifests', () => {
    expect(() => parseMdl({ views: { main: { type: 'text', text: 'hi' } } })).toThrow(/manifest/);
    expect(() => parseMdl(null)).toThrow();
  });

  it('rejects filters on photo or list fields', () => {
    const bad = clone(bucketList);
    bad.manifest.collections.idea.fields.photos = { type: 'media-list', max: 3 };
    bad.views.main.children[0].filter = { field: 'photos', op: 'eq', value: 'x' };
    expect(() => parseMdl(bad)).toThrow(/Cannot filter/);
  });
});

describe('the module registry', () => {
  it('contains every built-in and every JSON widget', () => {
    expect(
      listWidgets()
        .map((m) => m.id)
        .sort(),
    ).toEqual(
      [
        'birthdays',
        'bucket-list',
        'chat',
        'chores',
        'dinner-rota',
        'events',
        'feed',
        'group-notes',
        'link-stash',
        'photos',
        'polls',
        'quote-wall',
        'recommendations',
        'scoreboard',
        'shopping-list',
        'split-costs',
        'wishlist',
      ].sort(),
    );
  });
  it('starts Habitats with Feed, Photos, Events and Chat (H5)', () => {
    expect(defaultModuleIds().sort()).toEqual(['chat', 'events', 'feed', 'photos']);
  });
  it('every collection has valid parents and every nav label is set', () => {
    for (const m of listWidgets()) {
      for (const c of Object.values(m.collections))
        if (c.parent) expect(m.collections[c.parent]).toBeDefined();
      if (m.nav) expect(m.nav.label.length).toBeGreaterThan(0);
    }
    expect(getManifest('nope')).toBeUndefined();
  });
});

describe('the widget catalogue', () => {
  it('every JSON widget is valid, with a unique id, a menu label and a unique menu slot', async () => {
    const { declarativeModules } = await import('@/modules/declarative/catalog');
    const ids = declarativeModules.map((m) => m.manifest.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of declarativeModules) {
      expect(m.manifest.nav && m.manifest.nav.label).toBeTruthy();
      expect(m.manifest.icon).toMatch(/^[a-z0-9-]+$/);
    }
    const orders = declarativeModules.map((m) => (m.manifest.nav ? m.manifest.nav.order : 0));
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('MDL: people, leaderboards and dates', () => {
  const doc = () => {
    const d = clone(bucketList);
    d.manifest.collections.idea.fields.owner = { type: 'member' };
    d.manifest.collections.idea.fields.points = { type: 'integer', min: 0, max: 100 };
    d.manifest.collections.idea.fields.when = { type: 'date' };
    return d;
  };

  it('accepts a person cell, a leaderboard and a $today filter', () => {
    const d = doc();
    d.views.main.children.push(
      { type: 'leaderboard', collection: 'idea', groupBy: 'owner', sum: 'points' },
      {
        type: 'list',
        collection: 'idea',
        filter: { field: 'when', op: 'gte', value: '$today' },
        cells: [{ field: 'owner', as: 'member' }],
      },
    );
    expect(() => parseMdl(d)).not.toThrow();
  });

  it('a member cell needs a person field', () => {
    const d = doc();
    d.views.main.children.push({
      type: 'list',
      collection: 'idea',
      cells: [{ field: 'title', as: 'member' }],
    });
    expect(() => parseMdl(d)).toThrow(/member needs a person field/);
  });

  it('a leaderboard must group by a person and sum a number', () => {
    const a = doc();
    a.views.main.children.push({ type: 'leaderboard', collection: 'idea', groupBy: 'title' });
    expect(() => parseMdl(a)).toThrow(/groupBy needs a person field/);
    const b = doc();
    b.views.main.children.push({
      type: 'leaderboard',
      collection: 'idea',
      groupBy: 'owner',
      sum: 'title',
    });
    expect(() => parseMdl(b)).toThrow(/sum needs a number field/);
    const c = doc();
    c.views.main.children.push({ type: 'leaderboard', collection: 'ghost', groupBy: 'owner' });
    expect(() => parseMdl(c)).toThrow(/Unknown collection "ghost"/);
  });

  it('$today only works on date fields', () => {
    const d = doc();
    d.views.main.children.push({
      type: 'counter',
      collection: 'idea',
      label: 'x',
      filter: { field: 'title', op: 'eq', value: '$today' },
    });
    expect(() => parseMdl(d)).toThrow(/only works on date fields/);
  });

  it('a form must include every required field and only fields it can edit', () => {
    const a = clone(bucketList);
    a.views.main.children[1].fields = ['details']; // title is required
    expect(() => parseMdl(a)).toThrow(/must include the required field "title"/);
    const b = clone(bucketList);
    b.manifest.collections.idea.fields.photos = { type: 'media-list', max: 2 };
    b.views.main.children[1].fields = ['title', 'photos'];
    expect(() => parseMdl(b)).toThrow(/can't edit a "media-list" field/);
  });

  it('the timeline card is checked against the collections that show in the timeline', () => {
    const a = doc();
    a.manifest.collections.idea.showInTimeline = true;
    a.views.card = {
      cells: [
        { field: 'title', as: 'title' },
        { field: 'owner', as: 'member' },
      ],
    };
    expect(() => parseMdl(a)).not.toThrow();
    a.views.card.cells.push({ field: 'nope', as: 'text' });
    expect(() => parseMdl(a)).toThrow(/card\.cells\.2\.field/);
    const b = doc();
    b.manifest.collections.idea.showInTimeline = false;
    b.views.card = { cells: [{ field: 'title', as: 'title' }] };
    expect(() => parseMdl(b)).toThrow(/only used when a collection shows in the timeline/);
  });
});
