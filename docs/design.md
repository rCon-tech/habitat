# Habitat design system

## The idea

Habitat is _a place that belongs to a group_. The design says so in three ways: the shapes are doorway-and-pillar forms taken from the logo, every Habitat gets its own pattern and accent colour, and the platform itself stays out of the way (navy structure, neutral canvas) so your friends' content is the colour.

## Colour: 60 / 30 / 10

| Share | Role                                           | Light                                            | Dark                  |
| ----- | ---------------------------------------------- | ------------------------------------------------ | --------------------- |
| 60%   | Canvas and cards                               | `#f4f6fb` / white                                | `#0d1017` / `#151a23` |
| 30%   | Structure: sidebar, mobile bar, Habitat banner | midnight navy `#101b33`                          | `#090c12`             |
| 10%   | Accent: actions, unread, active state          | ember `#ff6a3d` by default, or the Habitat's own | same                  |

- All colours are CSS variables in `src/app/globals.css`. A Habitat overrides `--accent` and `--accent-ink` on its wrapper (see `app/h/[slug]/layout.tsx`).
- Text on the accent is whichever of ink or white contrasts better (`inkFor` in `src/lib/utils.ts`). Every colour in `ACCENTS` is tested to stay above 4.5:1.
- The accent as _text_ (links, small labels) uses `--link`, a darker (light mode) or lighter (dark mode) version of the accent, so it stays readable on any surface. Use `text-link`, not `text-accent`.
- Light, dark and "match my device" are all supported (account menu → Appearance).

## Type

Headings: **Bricolage Grotesque** (variable, set narrow and tight). Body: **Instrument Sans**. Both are self-hosted through `@fontsource-variable`.

## Shape language

- **Pill** (`rounded-full`) for buttons, tabs and chips. **Soft slab** (`rounded-[1.75rem]`) for cards.
- **Doorway** (`rounded-t-full rounded-b-2xl`) for emblems and module icons: the Habitat emoji, the widget tiles.
- **Squircle avatars**, each person tinted a steady colour of their own.

## The logo

Two legs of an H that are the same shape turned upside down (one round-topped, one round-bottomed) joined by a bar. Geometry lives in `src/components/Logo.tsx` and `scripts/brand.mjs`; run `node scripts/brand.mjs` to regenerate the app icons and the social preview image.

## The Crest

`src/components/Crest.tsx` draws a pattern from scattered pieces of the logo, seeded by the Habitat's slug, in its accent colour. It appears on the Habitat banner, Habitat cards and the invite page, and the same Habitat always gets the same picture.

## Motion

Short springs only (`animate-rise`, `animate-pop`, button press). Everything respects `prefers-reduced-motion`.
