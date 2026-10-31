import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas, FilterMode, ImageShader, RadialGradient, Rect, Shader, vec } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Country } from '../stores/types';
import { darkColors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { globeEffect } from './globeShader';
import { Starfield } from './Starfield';
import { makeLutImage, useGlobeTextures } from './useGlobeTextures';
import { buildStatusLut, hexToRgb } from './statusLut';
import { idOfIso, isoOfId, labelOfIso } from './countryIndex';
import { classifyOcean, oceanName } from './oceanName';
import { PITCH_LIMIT, clamp, pixelIndex, screenToLocalDir, shortestDelta, solveFlyTo, toLocalUniform, dirToLonLat } from './globeMath';

const AUTO_SPIN = 0.028; // rad/s
const DRAG = 0.005; // rad/px
const DECEL = 0.9963; // per ms, ≈ ×0.94 per 60 Hz frame
const ID_W = 4096;
const ID_H = 2048;
const gold = hexToRgb(darkColors.gold.base).map((v) => v / 255);

export interface GlobeHandle {
  flyTo: (iso: string, opts?: { lift?: number; duration?: number }) => void;
  glideHome: () => void;
  celebrate: (iso: string, status: 'visited' | 'lived' | 'want', onDone?: () => void) => void;
}

interface Props {
  countries: Country[];
  selectedIso: string | null;
  lang: 'tr' | 'en';
  /** Draw frames and run the clock only while true (Home visible, app active). */
  running: boolean;
  /** Pause the idle spin (country open, sheet raised). */
  autoSpin: boolean;
  /** Height at the bottom that the sheet peek covers; the globe is centred above it. */
  bottomInset: number;
  home: { lon: number; lat: number };
  onPickCountry: (iso: string) => void;
  onInteractionStart?: () => void;
  /** Extra upward shift of the globe in px, driven by the sheet so the globe stays clear of it. */
  extraLift?: SharedValue<number>;
  /** Called once the opening cinematic has finished (stat line and sheet peek rise in). */
  onIntroDone?: () => void;
}

const GlobeView = forwardRef<GlobeHandle, Props>(function GlobeView(
  { countries, selectedIso, lang, running, autoSpin, bottomInset, home, onPickCountry, onInteractionStart, onIntroDone, extraLift },
  ref
) {
  const tex = useGlobeTextures();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [oceanLabel, setOceanLabel] = useState<{ key: number; text: string; x: number; y: number } | null>(null);

  const spin = useSharedValue(0);
  const tilt = useSharedValue(0);
  const lift = useSharedValue(0);
  const introScale = useSharedValue(0.001);
  const veil = useSharedValue(1);
  const stars = useSharedValue(0);
  const time = useSharedValue(0);
  const busy = useSharedValue(false);
  const dragging = useSharedValue(false);
  const coasting = useSharedValue(false);
  const spinEnabled = useSharedValue(autoSpin);
  const selId = useSharedValue(0);
  const celebId = useSharedValue(0);
  const celebT = useSharedValue(0);
  const celebOrigin = useSharedValue([0, 0]);
  const oceanDir = useSharedValue([0, 0, 1]);
  const oceanActive = useSharedValue(0);
  const oceanTime = useSharedValue(0);
  const dims = useSharedValue({ w: 1, h: 1, inset: 0 });
  const dayRes = useSharedValue([1024, 512]);
  const nightRes = useSharedValue([2048, 1024]);
  const introDone = useRef(false);
  const noLift = useSharedValue(0);
  const extra = extraLift ?? noLift;

  const frame = useFrameCallback((info) => {
    const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
    time.value += dt;
    if (oceanActive.value > 0) oceanTime.value += dt;
    if (spinEnabled.value && !dragging.value && !busy.value && !coasting.value && introScale.value >= 1) {
      spin.value += AUTO_SPIN * dt;
    }
  }, false);

  useEffect(() => {
    frame.setActive(running);
  }, [running, frame]);
  useEffect(() => {
    spinEnabled.value = autoSpin;
  }, [autoSpin, spinEnabled]);
  useEffect(() => {
    selId.value = selectedIso ? idOfIso(selectedIso) : 0;
  }, [selectedIso, selId]);
  useEffect(() => {
    dims.value = { w: size.w, h: size.h, inset: bottomInset };
  }, [size, bottomInset, dims]);
  useEffect(() => {
    if (tex.day) dayRes.value = [tex.day.width(), tex.day.height()];
    if (tex.night) nightRes.value = [tex.night.width(), tex.night.height()];
  }, [tex.day, tex.night, dayRes, nightRes]);

  // status colours -> LUT image
  const lut = useMemo(() => {
    const bytes = buildStatusLut(countries, {
      visited: hexToRgb(darkColors.status.visited.color),
      lived: hexToRgb(darkColors.status.lived.color),
      want: hexToRgb(darkColors.status.want.color),
    });
    return makeLutImage(bytes);
  }, [countries]);

  // Opening cinematic, once textures are decoded and the canvas has a size
  useEffect(() => {
    if (!tex.ready || size.w === 0 || introDone.current) return;
    introDone.current = true;
    const { spinY, tiltX } = solveFlyTo(home.lon, home.lat);
    spin.value = spinY + 1.3;
    tilt.value = 0.25;
    busy.value = true;
    veil.value = withTiming(0, { duration: 700 });
    introScale.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    spin.value = withTiming(spinY, { duration: 2300, easing: Easing.out(Easing.cubic) }, () => {
      busy.value = false;
    });
    tilt.value = withTiming(tiltX, { duration: 2300, easing: Easing.out(Easing.cubic) });
    stars.value = withTiming(1, { duration: 1600 });
    const h = setTimeout(() => onIntroDone?.(), 1700);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex.ready, size.w]);

  const flyTo = useCallback(
    (lon: number, lat: number, liftPx = 0, duration = 1300, done?: () => void) => {
      const target = solveFlyTo(lon, lat);
      busy.value = true;
      coasting.value = false;
      const cfg = { duration, easing: Easing.inOut(Easing.cubic) };
      spin.value = withTiming(spin.value + shortestDelta(spin.value, target.spinY), cfg, (fin) => {
        busy.value = false;
        if (fin && done) runOnJS(done)();
      });
      tilt.value = withTiming(target.tiltX, cfg);
      lift.value = withTiming(liftPx, cfg);
    },
    [spin, tilt, lift, busy, coasting]
  );

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (iso, opts) => {
        const l = labelOfIso(iso);
        if (l) flyTo(l.lon, l.lat, opts?.lift ?? 0, opts?.duration ?? 1300);
      },
      glideHome: () => {
        busy.value = true;
        const cfg = { duration: 1000, easing: Easing.inOut(Easing.cubic) };
        tilt.value = withTiming(0, cfg);
        lift.value = withTiming(0, cfg, () => {
          busy.value = false;
        });
      },
      celebrate: (iso, status, onDone) => {
        const l = labelOfIso(iso);
        const id = idOfIso(iso);
        if (!l || !id) {
          onDone?.();
          return;
        }
        flyTo(l.lon, l.lat, 0, 1300, () => {
          if (status === 'want') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          celebOrigin.value = [l.lon, l.lat];
          celebId.value = id;
          celebT.value = 0;
          busy.value = true;
          celebT.value = withTiming(1, { duration: status === 'want' ? 600 : 900, easing: Easing.out(Easing.quad) }, () => {
            celebId.value = 0;
            busy.value = false;
            if (onDone) runOnJS(onDone)();
          });
        });
      },
    }),
    [flyTo, busy, tilt, lift, celebId, celebT, celebOrigin]
  );

  const view = useCallback(() => {
    const R0 = Math.min(size.w * 0.41, size.h * 0.31);
    const R = R0 * Math.min(1, (size.h - bottomInset - 2 * extra.value) / (2 * R0 * 1.12));
    return { spinY: spin.value, tiltX: tilt.value, cx: size.w / 2, cy: (size.h - bottomInset) / 2 - lift.value - extra.value, radius: R };
  }, [size, bottomInset, spin, tilt, lift, extra]);

  const handleTap = useCallback(
    (x: number, y: number) => {
      const v = view();
      const dir = screenToLocalDir(x, y, v);
      if (!dir || !tex.ids) return;
      const id = tex.ids[pixelIndex(dir, ID_W, ID_H)];
      const iso = id ? isoOfId(id) : null;
      if (iso) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPickCountry(iso);
        return;
      }
      const { lon, lat } = dirToLonLat(dir);
      oceanDir.value = dir;
      oceanTime.value = 0;
      oceanActive.value = 1;
      oceanActive.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.quad) });
      setOceanLabel({ key: Date.now(), text: oceanName(classifyOcean(lon, lat), lang), x, y });
      setTimeout(() => setOceanLabel(null), 1200);
    },
    [view, tex.ids, onPickCountry, lang, oceanDir, oceanTime, oceanActive]
  );

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(4)
      .onStart(() => {
        cancelAnimation(spin);
        cancelAnimation(tilt);
        busy.value = false;
        coasting.value = false;
        dragging.value = true;
        if (onInteractionStart) runOnJS(onInteractionStart)();
      })
      .onChange((e) => {
        spin.value += e.changeX * DRAG;
        tilt.value = clamp(tilt.value + e.changeY * DRAG, -PITCH_LIMIT, PITCH_LIMIT);
      })
      .onEnd((e) => {
        dragging.value = false;
        coasting.value = true;
        spin.value = withDecay({ velocity: e.velocityX * DRAG, deceleration: DECEL }, (fin) => {
          if (fin) coasting.value = false;
        });
        tilt.value = withDecay({ velocity: e.velocityY * DRAG, deceleration: DECEL, clamp: [-PITCH_LIMIT, PITCH_LIMIT] });
      });
    const tap = Gesture.Tap()
      .maxDistance(10)
      .onEnd((e, ok) => {
        if (ok) runOnJS(handleTap)(e.x, e.y);
      });
    return Gesture.Race(pan, tap);
  }, [spin, tilt, busy, coasting, dragging, handleTap, onInteractionStart]);

  const uniforms = useDerivedValue(() => {
    const { w, h, inset } = dims.value;
    const R0 = Math.min(w * 0.41, h * 0.31);
    // shrink with the clear space above the sheet so the globe never runs under the header
    const R = R0 * Math.min(1, (h - inset - 2 * extra.value) / (2 * R0 * 1.12));
    return {
      dayRes: dayRes.value,
      nightRes: nightRes.value,
      idRes: [ID_W, ID_H],
      center: [w / 2, (h - inset) / 2 - lift.value - extra.value],
      radius: Math.max(R * introScale.value, 1),
      toLocal: toLocalUniform(spin.value, tilt.value),
      sunDir: [0.32, 0.18, 0.95],
      time: time.value,
      selectId: selId.value,
      selectColor: gold,
      selectPulse: Math.sin(time.value * 3),
      celebrateId: celebId.value,
      celebrateT: celebT.value,
      celebrateOrigin: celebOrigin.value,
      oceanDir: oceanDir.value,
      oceanActive: oceanActive.value,
      oceanTime: oceanTime.value,
    };
  });

  const gradCenter = useDerivedValue(() => vec(dims.value.w / 2, (dims.value.h - dims.value.inset) / 2 - lift.value - extra.value));

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const ready = tex.day && tex.night && tex.idImage && lut && globeEffect && size.w > 0;

  return (
    <View style={styles.fill} onLayout={onLayout}>
      <GestureDetector gesture={gesture}>
        <View style={styles.fill}>
          {ready ? (
            <Canvas style={styles.fill}>
              <Rect x={0} y={0} width={size.w} height={size.h}>
                <RadialGradient c={gradCenter} r={Math.max(size.w, size.h) * 0.75} colors={[darkColors.canvas.elevated, darkColors.canvas.raised, darkColors.canvas.base]} positions={[0, 0.45, 1]} />
              </Rect>
              <Starfield width={size.w} height={size.h} opacity={stars} time={time} />
              <Rect x={0} y={0} width={size.w} height={size.h}>
                <Shader source={globeEffect!} uniforms={uniforms}>
                  <ImageShader image={tex.day} fit="fill" rect={{ x: 0, y: 0, width: tex.day!.width(), height: tex.day!.height() }} sampling={{ filter: FilterMode.Linear }} />
                  <ImageShader image={tex.night} fit="fill" rect={{ x: 0, y: 0, width: tex.night!.width(), height: tex.night!.height() }} sampling={{ filter: FilterMode.Linear }} />
                  <ImageShader image={tex.idImage} fit="fill" rect={{ x: 0, y: 0, width: ID_W, height: ID_H }} sampling={{ filter: FilterMode.Nearest }} />
                  <ImageShader image={lut} fit="fill" rect={{ x: 0, y: 0, width: 256, height: 1 }} sampling={{ filter: FilterMode.Nearest }} />
                </Shader>
              </Rect>
            </Canvas>
          ) : null}
          {oceanLabel ? (
            <Animated.Text
              key={oceanLabel.key}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(400)}
              pointerEvents="none"
              style={[styles.oceanLabel, { left: Math.max(12, Math.min(size.w - 172, oceanLabel.x - 80)), top: oceanLabel.y - 44 }]}
            >
              {oceanLabel.text}
            </Animated.Text>
          ) : null}
        </View>
      </GestureDetector>
      <VeilLayer veil={veil} />
    </View>
  );
});

function VeilLayer({ veil }: { veil: ReturnType<typeof useSharedValue<number>> }) {
  const style = useAnimatedStyle(() => ({ opacity: veil.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil, style]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: darkColors.canvas.base },
  veil: { backgroundColor: darkColors.canvas.base },
  oceanLabel: {
    position: 'absolute',
    width: 160,
    textAlign: 'center',
    color: 'rgba(200,225,255,0.7)',
    fontFamily: fonts.displayItalic,
    fontSize: 18,
  },
});

export default GlobeView;
