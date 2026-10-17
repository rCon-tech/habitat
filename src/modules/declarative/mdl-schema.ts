import { z } from 'zod';
import { manifestSchema } from '../sdk/manifest-schema';
import type { Field, ModuleManifest } from '../sdk/types';

/**
 * The Module Definition Language: a module as plain JSON. No HTML, no JavaScript, no expressions.
 * Everything here is data the platform validates and renders itself, which is what makes it safe
 * to accept from a chatbot. See docs/writing-a-module.md.
 */

const name = z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,39}$/);
const literal = z.union([z.string().max(200), z.number(), z.boolean()]);

/**
 * A filter compares one field with a fixed value. For date and date-time fields the value may be
 * the word `$today`, meaning "right now", so a list can show only what is coming up.
 */
export const filterSchema = z.object({
  field: name,
  op: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']),
  value: literal,
});
export type Filter = z.infer<typeof filterSchema>;
export const TODAY = '$today';

/** What to show for one field of a record. */
const cellSchema = z.object({
  field: name,
  as: z
    .enum([
      'title',
      'text',
      'muted',
      'badge',
      'link',
      'toggle',
      'image',
      'money',
      'date',
      'member',
      'quote',
    ])
    .default('text'),
});
export type Cell = z.infer<typeof cellSchema>;

export type ViewNode =
  | { type: 'stack'; children: ViewNode[] }
  | { type: 'text'; text: string; style?: 'title' | 'muted' | 'body' }
  | { type: 'form'; collection: string; title?: string; submitLabel?: string; fields?: string[] }
  | {
      type: 'list';
      collection: string;
      order?: string;
      filter?: Filter;
      empty?: string;
      cells: Cell[];
    }
  | { type: 'tabs'; tabs: Array<{ label: string; view: ViewNode }> }
  | { type: 'counter'; collection: string; filter?: Filter; label: string }
  | { type: 'leaderboard'; collection: string; groupBy: string; sum?: string; label?: string }
  | { type: 'image-grid'; collection: string; field: string };

const MAX_DEPTH = 4;

export const viewSchema: z.ZodType<ViewNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('stack'), children: z.array(viewSchema).min(1).max(12) }),
    z.object({
      type: z.literal('text'),
      text: z.string().max(500),
      style: z.enum(['title', 'muted', 'body']).optional(),
    }),
    z.object({
      type: z.literal('form'),
      collection: name,
      title: z.string().max(80).optional(),
      submitLabel: z.string().max(30).optional(),
      fields: z.array(name).max(20).optional(),
    }),
    z.object({
      type: z.literal('list'),
      collection: name,
      order: z.string().max(60).optional(),
      filter: filterSchema.optional(),
      empty: z.string().max(200).optional(),
      cells: z.array(cellSchema).min(1).max(8),
    }),
    z.object({
      type: z.literal('tabs'),
      tabs: z
        .array(z.object({ label: z.string().min(1).max(30), view: viewSchema }))
        .min(1)
        .max(6),
    }),
    z.object({
      type: z.literal('counter'),
      collection: name,
      filter: filterSchema.optional(),
      label: z.string().max(60),
    }),
    z.object({
      type: z.literal('leaderboard'),
      collection: name,
      groupBy: name,
      sum: name.optional(),
      label: z.string().max(40).optional(),
    }),
    z.object({ type: z.literal('image-grid'), collection: name, field: name }),
  ]),
) as z.ZodType<ViewNode>;

/** How a record looks as a card on the Habitat's home timeline. */
const cardSchema = z.object({ cells: z.array(cellSchema).min(1).max(6) });

export const mdlSchema = z
  .object({
    manifest: manifestSchema,
    views: z.object({ main: viewSchema, card: cardSchema.optional() }),
  })
  .superRefine((m, ctx) => {
    const manifest = m.manifest as ModuleManifest;
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path: ['views', ...path], message });
    type Def = ModuleManifest['collections'][string];

    const FORM_TYPES = new Set([
      'text',
      'longtext',
      'integer',
      'number',
      'boolean',
      'date',
      'datetime',
      'enum',
      'url',
      'member',
    ]);

    const field = (
      def: Def | undefined,
      f: string,
      where: (string | number)[],
    ): Field | undefined => {
      const spec = def?.fields[f];
      if (def && !spec) issue(where, `"${f}" is not a field of this collection`);
      return spec;
    };

    const checkCells = (def: Def | undefined, cells: Cell[], path: (string | number)[]) => {
      for (const [i, c] of cells.entries()) {
        const spec = field(def, c.field, [...path, i, 'field']);
        if (!spec) continue;
        const need = (type: string, human: string) => {
          if (spec.type !== type) issue([...path, i, 'as'], `${c.as} needs ${human}`);
        };
        if (c.as === 'toggle') need('boolean', 'a yes/no field');
        if (c.as === 'image') need('media', 'a photo field');
        if (c.as === 'money') need('money', 'a money field');
        if (c.as === 'link') need('url', 'a link field');
        if (c.as === 'member') need('member', 'a person field');
        if (c.as === 'date' && spec.type !== 'date' && spec.type !== 'datetime')
          issue([...path, i, 'as'], 'date needs a date field');
      }
    };

    const check = (node: ViewNode, path: (string | number)[], depth: number) => {
      if (depth > MAX_DEPTH) return issue(path, `Views can nest at most ${MAX_DEPTH} levels deep`);
      const col = (c: string) => {
        const def = manifest.collections[c];
        if (!def) issue([...path, 'collection'], `Unknown collection "${c}"`);
        return def;
      };
      const filter = (def: Def | undefined, f: Filter | undefined) => {
        if (!f) return;
        const spec = field(def, f.field, [...path, 'filter', 'field']);
        if (!spec) return;
        if (spec.type === 'money' || spec.type.endsWith('list') || spec.type === 'media') {
          issue([...path, 'filter', 'field'], `Cannot filter on a "${spec.type}" field`);
        }
        if (f.value === TODAY && spec.type !== 'date' && spec.type !== 'datetime') {
          issue([...path, 'filter', 'value'], `${TODAY} only works on date fields`);
        }
      };
      switch (node.type) {
        case 'stack':
          node.children.forEach((c, i) => check(c, [...path, 'children', i], depth + 1));
          break;
        case 'tabs':
          node.tabs.forEach((t, i) => check(t.view, [...path, 'tabs', i, 'view'], depth + 1));
          break;
        case 'form': {
          const def = col(node.collection);
          if (def?.parent)
            issue([...path, 'collection'], 'Forms can only create top-level records');
          const named = node.fields ?? Object.keys(def?.fields ?? {});
          for (const [i, f] of (node.fields ?? []).entries()) {
            const spec = field(def, f, [...path, 'fields', i]);
            if (spec && !FORM_TYPES.has(spec.type))
              issue([...path, 'fields', i], `A form can't edit a "${spec.type}" field`);
          }
          // A form that can't fill in a required field could never save anything.
          for (const [f, spec] of Object.entries(def?.fields ?? {})) {
            const required = 'required' in spec && spec.required;
            if (required && (!named.includes(f) || !FORM_TYPES.has(spec.type))) {
              issue([...path, 'fields'], `The form must include the required field "${f}"`);
            }
          }
          break;
        }
        case 'list': {
          const def = col(node.collection);
          filter(def, node.filter);
          checkCells(def, node.cells, [...path, 'cells']);
          break;
        }
        case 'counter':
          filter(col(node.collection), node.filter);
          break;
        case 'leaderboard': {
          const def = col(node.collection);
          const g = field(def, node.groupBy, [...path, 'groupBy']);
          if (g && g.type !== 'member') issue([...path, 'groupBy'], 'groupBy needs a person field');
          if (node.sum) {
            const s = field(def, node.sum, [...path, 'sum']);
            if (s && s.type !== 'integer' && s.type !== 'number')
              issue([...path, 'sum'], 'sum needs a number field');
          }
          break;
        }
        case 'image-grid': {
          const def = col(node.collection);
          const spec = field(def, node.field, [...path, 'field']);
          if (spec && spec.type !== 'media' && spec.type !== 'media-list')
            issue([...path, 'field'], 'image-grid needs a photo field');
          break;
        }
      }
    };
    check(m.views.main, ['main'], 1);

    if (m.views.card) {
      const showing = Object.entries(manifest.collections).filter(([, d]) => d.showInTimeline);
      if (!showing.length)
        issue(['card'], 'card is only used when a collection shows in the timeline');
      for (const [, def] of showing) checkCells(def, m.views.card.cells, ['card', 'cells']);
    }
  });

export type MdlModule = {
  manifest: ModuleManifest;
  views: { main: ViewNode; card?: { cells: Cell[] } };
};

/** Parse an MDL document, throwing an error that names the bad path (it is also what the AI builder is told). */
export function parseMdl(input: unknown): MdlModule {
  const r = mdlSchema.safeParse(input);
  if (!r.success) {
    throw new Error(
      `Invalid module: ${r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`,
    );
  }
  return r.data as unknown as MdlModule;
}
