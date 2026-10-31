import { useEffect, useMemo, useState } from 'react';
import { AlphaType, ColorType, Skia, useImage, type SkImage } from '@shopify/react-native-skia';

const DAY_SMALL = require('../../assets/globe/earth-day-small.jpg');
const DAY_BIG = require('../../assets/globe/earth-day.jpg');
const NIGHT = require('../../assets/globe/earth-night.jpg');
const ID_MAP = require('../../assets/globe/country-id.png');
const ID_W = 4096;
const ID_H = 2048;

export interface GlobeTextures {
  /** 1024 first, swapped for the 4096 map once that has decoded */
  day: SkImage | null;
  night: SkImage | null;
  idImage: SkImage | null;
  /** R channel of the ID map, for CPU picking */
  ids: Uint8Array | null;
  /** everything needed for a first frame is decoded */
  ready: boolean;
}

export function useGlobeTextures(): GlobeTextures {
  const daySmall = useImage(DAY_SMALL);
  const night = useImage(NIGHT);
  const idSource = useImage(ID_MAP);
  const idImage = idSource;
  // the big map decodes after the first frame so it never delays first paint
  const [loadBig, setLoadBig] = useState(false);
  const dayBigImage = useImage(loadBig ? DAY_BIG : null);
  const [ids, setIds] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (daySmall && night && idImage) {
      const h = setTimeout(() => setLoadBig(true), 400);
      return () => clearTimeout(h);
    }
  }, [daySmall, night, idImage]);

  useEffect(() => {
    if (!idImage) return;
    const h = setTimeout(() => {
      const w = idImage.width();
      const hgt = idImage.height();
      const rgba = idImage.readPixels(0, 0, { width: w, height: hgt, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul });
      if (!rgba) return;
      const r = new Uint8Array(w * hgt);
      for (let i = 0; i < r.length; i++) r[i] = rgba[i * 4];
      setIds(r);
    }, 0);
    return () => clearTimeout(h);
  }, [idImage]);

  // The decoded PNG goes through colour management on the GPU and its ids drift (Spain read as Algeria), so the
  // shader gets the raw bytes instead, as an 8-bit gray image: sampled r == id / 255 exactly.
  const idTexture = useMemo(() => {
    if (!ids) return null;
    return Skia.Image.MakeImage(
      { width: ID_W, height: ID_H, colorType: ColorType.Gray_8, alphaType: AlphaType.Opaque },
      Skia.Data.fromBytes(ids),
      ID_W
    );
  }, [ids]);

  const day = dayBigImage ?? daySmall;
  return { day, night, idImage: idTexture, ids, ready: Boolean(day && night && idTexture && ids) };
}

/** 256x1 premultiplied RGBA lookup image from statusLut bytes. */
export function makeLutImage(bytes: Uint8Array): SkImage | null {
  return Skia.Image.MakeImage(
    { width: 256, height: 1, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Premul },
    Skia.Data.fromBytes(bytes),
    256 * 4
  );
}
