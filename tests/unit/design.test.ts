import { describe, expect, it } from 'vitest';
import { ACCENTS, contrast, hashString, inkFor, seeded } from '@/lib/utils';

describe('accent colours', () => {
  it('every choice gives text that clears WCAG AA (4.5:1), whichever of ink or white is picked', () => {
    for (const { name, hex } of ACCENTS) {
      expect(contrast(hex, inkFor(hex)), `${name} ${hex}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('picks the better of black or white, not just a fixed default', () => {
    expect(inkFor('#ffffff')).toBe('#0b1220');
    expect(inkFor('#000000')).toBe('#ffffff');
    expect(inkFor('#f5a524')).toBe('#0b1220'); // marigold needs dark text
    expect(inkFor('#6c4cf1')).toBe('#ffffff'); // orchid needs white
  });

  it('even arbitrary colours keep at least 4.3:1 with the chosen text (the worst case for ink and white)', () => {
    for (let n = 0; n < 0xffffff; n += 0x1f3a7) {
      const hex = `#${n.toString(16).padStart(6, '0')}`;
      expect(contrast(hex, inkFor(hex))).toBeGreaterThanOrEqual(4.3);
    }
  });

  it('has distinct names and colours', () => {
    expect(new Set(ACCENTS.map((a) => a.hex)).size).toBe(ACCENTS.length);
    expect(new Set(ACCENTS.map((a) => a.name)).size).toBe(ACCENTS.length);
  });
});

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('patterns', () => {
  it('the same seed always draws the same numbers, and different seeds differ', () => {
    const a = seeded(hashString('the-lads'));
    const b = seeded(hashString('the-lads'));
    const c = seeded(hashString('flat-4'));
    const first = Array.from({ length: 8 }, () => a());
    expect(Array.from({ length: 8 }, () => b())).toEqual(first);
    expect(Array.from({ length: 8 }, () => c())).not.toEqual(first);
    expect(first.every((x) => x >= 0 && x < 1)).toBe(true);
  });
});
