import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INK = '#0b1220';
const WHITE = '#ffffff';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Text colour for a given background: whichever of ink or white has the higher contrast. */
export function inkFor(bg: string): typeof INK | typeof WHITE {
  return contrast(bg, WHITE) >= contrast(bg, INK) ? WHITE : INK;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** A small stable number from a string, for deterministic colours and patterns. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32): the same seed always draws the same pattern. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The accents a Habitat can choose. Every one clears 4.5:1 with the text colour `inkFor` picks (tested). */
export const ACCENTS = [
  { name: 'Ember', hex: '#ff6a3d' },
  { name: 'Coral', hex: '#f0506e' },
  { name: 'Orchid', hex: '#6c4cf1' },
  { name: 'Azure', hex: '#2f7df6' },
  { name: 'Lagoon', hex: '#12b3a8' },
  { name: 'Fern', hex: '#3fb56b' },
  { name: 'Marigold', hex: '#f5a524' },
  { name: 'Slate', hex: '#5b6b86' },
] as const;
export const DEFAULT_ACCENT = ACCENTS[0].hex;
