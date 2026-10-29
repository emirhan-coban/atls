/// <reference types="jest" />
import { darkColors, lightColors } from '../colors';

const hex = (c: string) => {
  const m = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16));
};
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('%s theme text contrast (WCAG)', (_name, c) => {
  const surfaces = [c.canvas.base, c.canvas.raised, c.canvas.surface];

  it.each(['primary', 'soft', 'secondary', 'muted'] as const)('text.%s reaches 4.5:1 on every surface', (role) => {
    surfaces.forEach((surface) => expect(ratio(c.text[role], surface)).toBeGreaterThanOrEqual(4.5));
  });

  it('faint text (decorative only) reaches 3:1', () => {
    surfaces.forEach((surface) => expect(ratio(c.text.faint, surface)).toBeGreaterThanOrEqual(3));
  });

  it('gold text on the canvas reaches 3:1 (large headings and accents)', () => {
    expect(ratio(c.gold.base, c.canvas.base)).toBeGreaterThanOrEqual(3);
  });
});
