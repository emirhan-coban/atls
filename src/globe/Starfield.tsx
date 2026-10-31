import React, { useMemo } from 'react';
import { Points, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

/** Seeded so the sky is the same on every launch. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUCKETS = 3;

/** ~500 stars on a fixed screen layer, in three size buckets that twinkle out of phase. */
export function Starfield({ width, height, opacity, time }: { width: number; height: number; opacity: SharedValue<number>; time: SharedValue<number> }) {
  const buckets = useMemo(() => {
    const rand = rng(7);
    const out: { pts: ReturnType<typeof vec>[]; size: number }[] = [0, 1, 2].map((i) => ({ pts: [], size: 1 + i * 0.8 }));
    for (let i = 0; i < 460; i++) {
      const size = 1 + Math.pow(rand(), 2.6) * 2.8;
      const b = size < 1.6 ? 0 : size < 2.4 ? 1 : 2;
      out[b].pts.push(vec(rand() * width, rand() * height));
    }
    return out;
  }, [width, height]);

  const o0 = useDerivedValue(() => opacity.value * (0.55 + 0.3 * Math.sin(time.value * 1.1)));
  const o1 = useDerivedValue(() => opacity.value * (0.65 + 0.3 * Math.sin(time.value * 0.8 + 2)));
  const o2 = useDerivedValue(() => opacity.value * (0.8 + 0.2 * Math.sin(time.value * 0.6 + 4)));
  const ops = [o0, o1, o2];
  return (
    <>
      {buckets.slice(0, BUCKETS).map((b, i) => (
        <Points key={i} points={b.pts} mode="points" color="white" style="stroke" strokeWidth={b.size} strokeCap="round" opacity={ops[i]} />
      ))}
    </>
  );
}
