import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Minus, Plus, RotateCcw } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { Country } from '../stores/types';
import { worldMapFeatures } from '../data/worldMapPaths';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { translations } from '../localization/translations';
import {
  clampView,
  INITIAL_VIEW,
  LiveTransform,
  MapView,
  MAX_ZOOM,
  Point,
  Size,
  transformForView,
  viewBoxOf,
  viewFromTransform,
  zoomAround,
} from '../utils/mapView';

interface WorldMapProps {
  countries?: Country[];
  activeFilter?: string;
  onSelectCountry?: (countryId: string) => void;
  t?: Record<string, any>;
  currentLang?: 'tr' | 'en';
  selectedCountryId?: string | null;
  interactive?: boolean;
  showControls?: boolean | null;
  onInteractionChange?: ((active: boolean) => void) | null;
  style?: StyleProp<ViewStyle> | null;
  fullScreen?: boolean;
}

interface CountryPathsProps {
  fills: Record<string, string>;
  selectedId: string | null;
  landColor: string;
  borderColor: string;
  selectedStroke: string;
  interactive: boolean;
  onPressCountry: (id: string) => void;
}

/** The country shapes. Memoised: a pan or zoom never touches them, only the Svg viewBox changes when a gesture ends. */
const CountryPaths = memo(function CountryPaths({ fills, selectedId, landColor, borderColor, selectedStroke, interactive, onPressCountry }: CountryPathsProps) {
  return (
    <G strokeLinejoin="round" strokeLinecap="round">
      {worldMapFeatures.map((feature, index) => {
        const selected = selectedId === feature.id;
        return (
          <Path
            key={`${feature.id}-${index}`}
            d={feature.d}
            fill={fills[feature.id] ?? landColor}
            stroke={selected ? selectedStroke : borderColor}
            strokeWidth={selected ? 2 : 0.6}
            vectorEffect="non-scaling-stroke"
            onPress={interactive ? () => onPressCountry(feature.id) : undefined}
          />
        );
      })}
    </G>
  );
});

/** A finger must travel this far before a touch counts as a drag instead of a tap. */
const DRAG_SLOP = 8;
/** How far (ms of travel at the release speed) the map keeps gliding after a drag. */
const GLIDE_MS = 160;
const SETTLE = { duration: 240, easing: Easing.out(Easing.cubic) };

const centroid = (pts: Point[]): Point => ({ x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length });
const spread = (pts: Point[]) => (pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0);

/**
 * World map. While a finger is down the drawn map is only moved with a transform on the UI thread (smooth, no React work);
 * when the fingers lift, the drawing is refreshed at the new zoom so it is sharp again and the map glides to rest inside its bounds.
 * One finger pans, two fingers pan and pinch around the point between them, double tap zooms in. Touches on open sea work too.
 */
function WorldMap({
  countries = [],
  activeFilter = 'all',
  onSelectCountry,
  t,
  currentLang = 'tr',
  selectedCountryId = null,
  interactive = true,
  showControls = null,
  onInteractionChange = null,
  style = null,
  fullScreen = false,
}: WorldMapProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const activeT = t || (translations as Record<string, any>)[currentLang] || translations.tr;

  const [size, setSize] = useState<Size>({ width: 340, height: 200 });
  const [view, setView] = useState<MapView>(INITIAL_VIEW);
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);

  const sizeRef = useRef(size);
  const viewRef = useRef(view);
  const originRef = useRef<Point>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  /** Transform currently shown (mirrors the shared values, so touch maths never waits on the UI thread mid-gesture). */
  const live = useRef<LiveTransform>({ s: 1, tx: 0, ty: 0 });
  const base = useRef<{ s: number; tx: number; ty: number; c0: Point; r0: number; n: number } | null>(null);
  const startPoint = useRef<Point>({ x: 0, y: 0 });
  const moved = useRef(false);
  const dragged = useRef(false);
  const lastMove = useRef<{ c: Point; time: number; vx: number; vy: number }>({ c: { x: 0, y: 0 }, time: 0, vx: 0, vy: 0 });
  const lastTap = useRef(0);

  const setLive = useCallback(
    (next: LiveTransform) => {
      live.current = next;
      scale.set(next.s);
      tx.set(next.tx);
      ty.set(next.ty);
    },
    [scale, tx, ty]
  );

  // A new drawing replaces the transform: reset it in the same commit so there is no visible jump.
  useLayoutEffect(() => {
    setLive({ s: 1, tx: 0, ty: 0 });
  }, [view, setLive]);

  const commit = useCallback((next: MapView) => {
    viewRef.current = next;
    setView(next);
  }, []);

  /** Glide the shown map to `target`, then redraw it sharply. */
  const animateTo = useCallback(
    (target: MapView) => {
      const rel = transformForView(viewRef.current, target, sizeRef.current);
      live.current = rel;
      scale.set(
        withTiming(rel.s, SETTLE, (finished) => {
          if (finished) runOnJS(commit)(target);
        })
      );
      tx.set(withTiming(rel.tx, SETTLE));
      ty.set(withTiming(rel.ty, SETTLE));
    },
    [commit, scale, tx, ty]
  );

  const measure = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      originRef.current = { x, y };
    });
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === 0 || height === 0) return;
    sizeRef.current = { width, height };
    setSize({ width, height });
    commit(clampView(viewRef.current, { width, height }));
    measure();
  };

  const pointsOf = (e: GestureResponderEvent): Point[] =>
    Array.from(e.nativeEvent.touches)
      .slice(0, 2)
      .map((touch) => ({ x: touch.pageX - originRef.current.x, y: touch.pageY - originRef.current.y }));

  /** Remember the transform and fingers as the reference for the next movement (also when a finger is added or lifted). */
  const rebase = (pts: Point[]) => {
    base.current = { ...live.current, c0: centroid(pts), r0: spread(pts), n: pts.length };
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    const pts = pointsOf(e);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      cancelAnimation(scale);
      cancelAnimation(tx);
      cancelAnimation(ty);
      live.current = { s: scale.get(), tx: tx.get(), ty: ty.get() };
      startPoint.current = pts[0];
      moved.current = false;
      lastMove.current = { c: pts[0], time: Date.now(), vx: 0, vy: 0 };
      onInteractionChange?.(true);
    } else {
      moved.current = true;
    }
    rebase(pts);
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    if (!base.current) return;
    const pts = pointsOf(e);
    if (pts.length === 0) return;
    if (pts.length !== base.current.n) rebase(pts);
    const b = base.current;
    const c = centroid(pts);

    if (!moved.current) {
      if (Math.hypot(c.x - startPoint.current.x, c.y - startPoint.current.y) < DRAG_SLOP) return;
      moved.current = true;
      dragged.current = true;
      rebase(pts); // start from here, so the map does not jump by the slop
      return;
    }
    dragged.current = true;

    const zoom = viewRef.current.zoom;
    const k = pts.length > 1 && b.r0 > 0 ? spread(pts) / b.r0 : 1;
    const s = Math.min((MAX_ZOOM * 1.25) / zoom, Math.max(0.7 / zoom, b.s * k));
    const kk = s / b.s;
    const centre = { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
    setLive({
      s,
      tx: c.x + kk * (b.tx + centre.x - b.c0.x) - centre.x,
      ty: c.y + kk * (b.ty + centre.y - b.c0.y) - centre.y,
    });

    const now = Date.now();
    const dt = Math.max(1, now - lastMove.current.time);
    lastMove.current = {
      c,
      time: now,
      vx: 0.6 * ((c.x - lastMove.current.c.x) / dt) + 0.4 * lastMove.current.vx,
      vy: 0.6 * ((c.y - lastMove.current.c.y) / dt) + 0.4 * lastMove.current.vy,
    };
  };

  const finish = () => {
    onInteractionChange?.(false);
    base.current = null;
    if (!moved.current) return;
    const recent = Date.now() - lastMove.current.time < 90;
    const glide = recent ? { x: lastMove.current.vx * GLIDE_MS, y: lastMove.current.vy * GLIDE_MS } : { x: 0, y: 0 };
    const target = viewFromTransform(viewRef.current, sizeRef.current, {
      s: live.current.s,
      tx: live.current.tx + glide.x,
      ty: live.current.ty + glide.y,
    });
    animateTo(target);
    setTimeout(() => {
      dragged.current = false;
    }, 120);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    if (!base.current) return;
    const remaining = pointsOf(e);
    if (remaining.length === 0) finish();
    else rebase(remaining);
  };

  const zoomBy = useCallback(
    (factor: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = viewRef.current;
      const centre = { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
      animateTo(zoomAround(current, sizeRef.current, current.zoom * factor, centre, centre));
    },
    [animateTo]
  );

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTo(clampView(INITIAL_VIEW, sizeRef.current));
  }, [animateTo]);

  useEffect(() => measure, [measure]);

  const fills = useMemo(() => {
    const map: Record<string, string> = {};
    countries.forEach((c) => {
      const dimmed = activeFilter !== 'all' && c.status !== activeFilter;
      map[c.id.toUpperCase()] = dimmed
        ? colors.map.landDim
        : c.status === 'lived'
          ? colors.status.lived.color
          : c.status === 'visited'
            ? colors.status.visited.color
            : c.status === 'want'
              ? colors.gold.base
              : colors.map.land;
    });
    return map;
  }, [countries, activeFilter, colors]);

  const handleCountryPress = useCallback(
    (id: string) => {
      if (dragged.current) return;
      const now = Date.now();
      if (now - lastTap.current < 300) {
        lastTap.current = 0;
        zoomBy(viewRef.current.zoom > 1.4 ? 1 / MAX_ZOOM : 2.2);
        return;
      }
      lastTap.current = now;

      const marked = countries.find((c) => c.id.toUpperCase() === id.toUpperCase());
      const country = marked || availableCatalog.find((c) => c.id.toUpperCase() === id.toUpperCase());
      if (!country) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const label = marked
        ? marked.status === 'lived'
          ? activeT?.livedIn || (currentLang === 'tr' ? 'YAŞANAN' : 'LIVED')
          : marked.status === 'want'
            ? activeT?.wishlist || (currentLang === 'tr' ? 'HEDEF' : 'WISHLIST')
            : activeT?.visited || (currentLang === 'tr' ? 'GEZİLEN' : 'VISITED')
        : currentLang === 'tr'
          ? 'KEŞFEDİLMEDİ'
          : 'UNEXPLORED';
      setSelectedInfo(`${country.flag || '🌍'} ${getLocalizedCountryName(country, currentLang)} (${label})`);
      onSelectCountry?.(country.id);
    },
    [countries, activeT, currentLang, onSelectCountry, zoomBy]
  );

  const mapStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: scale.get() }],
  }));

  const zoomed = view.zoom > 1.05;
  const showUi = showControls !== null ? showControls : interactive;

  return (
    <View
      ref={containerRef}
      style={[fullScreen ? styles.fullScreen : styles.container, style]}
      onLayout={onLayout}
      onTouchStart={interactive ? onTouchStart : undefined}
      onTouchMove={interactive ? onTouchMove : undefined}
      onTouchEnd={interactive ? onTouchEnd : undefined}
      onTouchCancel={interactive ? finish : undefined}
    >
      <Animated.View style={[StyleSheet.absoluteFill, mapStyle]}>
        <Svg width="100%" height="100%" viewBox={viewBoxOf(view, size)} preserveAspectRatio="none">
          <CountryPaths
            fills={fills}
            selectedId={selectedCountryId ? selectedCountryId.toUpperCase() : null}
            landColor={colors.map.land}
            borderColor={colors.map.border}
            selectedStroke={colors.text.primary}
            interactive={interactive}
            onPressCountry={handleCountryPress}
          />
        </Svg>
      </Animated.View>

      {showUi && (
        <>
          {!fullScreen && (
            <View style={styles.badge} pointerEvents="none">
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText} numberOfLines={1}>
                {selectedInfo ||
                  (countries.length === 0
                    ? currentLang === 'tr'
                      ? 'DÜNYA HARİTASI'
                      : 'WORLD MAP'
                    : currentLang === 'tr'
                      ? `${countries.length} İŞARETLİ ÜLKE`
                      : `${countries.length} MARKED COUNTRIES`)}
              </Text>
            </View>
          )}

          <View style={styles.controls}>
            {zoomed && (
              <TouchableOpacity onPress={reset} style={styles.controlBtn} accessibilityRole="button" accessibilityLabel="Reset zoom">
                <RotateCcw size={16} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => zoomBy(1.8)} style={styles.controlBtn} accessibilityRole="button" accessibilityLabel="Zoom in">
              <Plus size={18} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => zoomBy(1 / 1.8)} disabled={!zoomed} style={[styles.controlBtn, !zoomed && styles.controlOff]} accessibilityRole="button" accessibilityLabel="Zoom out">
              <Minus size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      aspectRatio: 2.1,
      backgroundColor: colors.map.ocean,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
      overflow: 'hidden',
    },
    fullScreen: {
      flex: 1,
      width: '100%',
      backgroundColor: colors.map.ocean,
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute',
      left: spacing.md,
      bottom: spacing.md,
      maxWidth: '70%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.panel.raised,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.status.visited.color },
    badgeText: { flexShrink: 1, fontSize: 11, fontWeight: '800', letterSpacing: 0.4, color: colors.text.primary },
    controls: { position: 'absolute', right: spacing.md, top: spacing.md, gap: spacing.sm },
    controlBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.panel.raised,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    controlOff: { opacity: 0.4 },
  })
);

export default memo(WorldMap);
