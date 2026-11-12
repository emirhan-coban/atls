/// <reference types="jest" />
import { darkColors, lightColors } from '../colors';

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const SURFACES = ['base', 'raised', 'surface', 'elevated'] as const;
const AA = 4.5;

describe.each([
  ['dark', darkColors],
  ['light', lightColors],
] as const)('%s theme contrast (WCAG AA)', (_name, c) => {
  it.each(['primary', 'soft', 'secondary', 'muted', 'faint'] as const)('text.%s reads on every surface', (token) => {
    for (const surface of SURFACES) {
      expect(contrast(c.text[token], c.canvas[surface])).toBeGreaterThanOrEqual(AA);
    }
  });

  it('text on solid gold buttons reads', () => {
    expect(contrast(c.gold.onGold, c.gold.base)).toBeGreaterThanOrEqual(AA);
  });

  it('error text reads on the canvas', () => {
    expect(contrast(c.danger, c.canvas.base)).toBeGreaterThanOrEqual(AA);
    expect(contrast(c.danger, c.canvas.surface)).toBeGreaterThanOrEqual(AA);
  });
});

describe('gold as text', () => {
  it('the dark theme gold reads on the canvas', () => {
    expect(contrast(darkColors.gold.base, darkColors.canvas.base)).toBeGreaterThanOrEqual(AA);
  });
  it('the light theme uses gold.light as its text-safe tone (gold.base is for fills and icons)', () => {
    expect(contrast(lightColors.gold.light, lightColors.canvas.base)).toBeGreaterThanOrEqual(AA);
    expect(contrast(lightColors.gold.light, lightColors.canvas.surface)).toBeGreaterThanOrEqual(AA);
  });
});
