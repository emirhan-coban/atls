import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, GestureResponderEvent, LayoutChangeEvent, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Canvas, Group, Path } from '@shopify/react-native-skia';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Minus, Plus, RotateCcw } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { Country } from '../stores/types';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { translations } from '../localization/translations';
import { getMapShapes, loadMapShapes, MapShape, mergeAll, shapeAt } from '../utils/mapShapes';
import { clampView, INITIAL_VIEW, MAP_BOUNDS, MapView, MAX_ZOOM, panBy, Point, Size, toMapPoint, zoomAround } from '../utils/mapView';

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

/** A finger must travel this far before a touch counts as a drag instead of a tap. */
const DRAG_SLOP = 8;
/** How far (ms of travel at the release speed) the map keeps gliding after a drag. */
const GLIDE_MS = 220;
const SETTLE = { duration: 260, easing: Easing.out(Easing.cubic) };

const centroid = (pts: Point[]): Point => ({ x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length });
const spread = (pts: Point[]) => (pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0);

/**
 * World map drawn with Skia. The country shapes are prepared once (and kept), then zooming and panning only change a transform
 * on the GPU: nothing is redrawn by React and the shapes stay sharp at every zoom.
 * One finger pans, two fingers pan and pinch around the point between them, double tap zooms in, open sea responds to touch too.
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

  const [shapes, setShapes] = useState<MapShape[] | null>(getMapShapes());
  const [size, setSize] = useState<Size | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);

  const sizeRef = useRef<Size>({ width: 340, height: 200 });
  const viewRef = useRef<MapView>(INITIAL_VIEW);
  const originRef = useRef<Point>({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);

  // The view, as shared values: the canvas reads these on the UI thread.
  const zoom = useSharedValue(INITIAL_VIEW.zoom);
  const cx = useSharedValue(INITIAL_VIEW.cx);
  const cy = useSharedValue(INITIAL_VIEW.cy);
  const width = useSharedValue(340);
  const height = useSharedValue(200);
  const moving = useSharedValue(0);

  const gesture = useRef<{ view: MapView; c0: Point; r0: number; n: number } | null>(null);
  const startPoint = useRef<Point>({ x: 0, y: 0 });
  const moved = useRef(false);
  const lastMove = useRef<{ c: Point; time: number; vx: number; vy: number }>({ c: { x: 0, y: 0 }, time: 0, vx: 0, vy: 0 });
  const lastTap = useRef(0);

  useEffect(() => {
    if (shapes) return;
    let alive = true;
    loadMapShapes().then((loaded) => alive && setShapes(loaded));
    return () => {
      alive = false;
    };
  }, [shapes]);

  /** Show `next` right now. */
  const apply = useCallback(
    (next: MapView) => {
      viewRef.current = next;
      zoom.set(next.zoom);
      cx.set(next.cx);
      cy.set(next.cy);
    },
    [zoom, cx, cy]
  );

  /** Glide to `next`. */
  const animateTo = useCallback(
    (next: MapView) => {
      viewRef.current = next;
      zoom.set(withTiming(next.zoom, SETTLE));
      cx.set(withTiming(next.cx, SETTLE));
      cy.set(withTiming(next.cy, SETTLE));
      setZoomed(next.zoom > 1.05);
    },
    [zoom, cx, cy]
  );

  const measure = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      originRef.current = { x, y };
    });
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w === 0 || h === 0) return;
    sizeRef.current = { width: w, height: h };
    width.set(w);
    height.set(h);
    apply(clampView(viewRef.current, { width: w, height: h }));
    setSize({ width: w, height: h });
    measure();
  };

  const pointsOf = (e: GestureResponderEvent): Point[] =>
    Array.from(e.nativeEvent.touches)
      .slice(0, 2)
      .map((touch) => ({ x: touch.pageX - originRef.current.x, y: touch.pageY - originRef.current.y }));

  const rebase = (pts: Point[]) => {
    gesture.current = { view: viewRef.current, c0: centroid(pts), r0: spread(pts), n: pts.length };
  };

  const onTouchStart = (e: GestureResponderEvent) => {
    const pts = pointsOf(e);
    if (pts.length === 0) return;
    if (pts.length === 1) {
      startPoint.current = pts[0];
      moved.current = false;
      lastMove.current = { c: pts[0], time: Date.now(), vx: 0, vy: 0 };
      moving.set(0);
      onInteractionChange?.(true);
    } else {
      moved.current = true;
      moving.set(1);
    }
    rebase(pts);
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    const g = gesture.current;
    if (!g) return;
    const pts = pointsOf(e);
    if (pts.length === 0) return;
    if (pts.length !== g.n) {
      rebase(pts);
      return;
    }
    const c = centroid(pts);

    if (!moved.current) {
      if (Math.hypot(c.x - startPoint.current.x, c.y - startPoint.current.y) < DRAG_SLOP) return;
      moved.current = true;
      moving.set(1);
      rebase(pts); // start from here, so the map does not jump by the slop
      return;
    }

    const k = pts.length > 1 && g.r0 > 0 ? spread(pts) / g.r0 : 1;
    apply(zoomAround(g.view, sizeRef.current, g.view.zoom * k, g.c0, c));

    const now = Date.now();
    const dt = Math.max(1, now - lastMove.current.time);
    lastMove.current = {
      c,
      time: now,
      vx: 0.6 * ((c.x - lastMove.current.c.x) / dt) + 0.4 * lastMove.current.vx,
      vy: 0.6 * ((c.y - lastMove.current.c.y) / dt) + 0.4 * lastMove.current.vy,
    };
  };

  const select = useCallback(
    (id: string) => {
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
    [countries, activeT, currentLang, onSelectCountry]
  );

  const zoomBy = useCallback(
    (factor: number, around?: Point) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = viewRef.current;
      const point = around ?? { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
      animateTo(zoomAround(current, sizeRef.current, current.zoom * factor, point, point));
    },
    [animateTo]
  );

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTo(clampView(INITIAL_VIEW, sizeRef.current));
  }, [animateTo]);

  const tap = (point: Point) => {
    if (!shapes) return;
    const now = Date.now();
    const doubleTap = now - lastTap.current < 300;
    lastTap.current = doubleTap ? 0 : now;
    if (doubleTap) {
      zoomBy(viewRef.current.zoom > 1.4 ? 1 / MAX_ZOOM : 2.2, point);
      return;
    }
    const m = toMapPoint(viewRef.current, sizeRef.current, point);
    const id = shapeAt(shapes, m.x, m.y);
    if (id) select(id);
  };

  const finish = (lifted: boolean) => {
    const wasDrag = moved.current;
    onInteractionChange?.(false);
    gesture.current = null;
    if (!lifted) return;
    if (!wasDrag) {
      tap(startPoint.current);
      return;
    }
    const recent = Date.now() - lastMove.current.time < 90;
    const glide = recent ? { dx: lastMove.current.vx * GLIDE_MS, dy: lastMove.current.vy * GLIDE_MS } : { dx: 0, dy: 0 };
    const target = recent ? panBy(viewRef.current, sizeRef.current, glide.dx, glide.dy) : viewRef.current;
    moving.set(0);
    setZoomed(target.zoom > 1.05);
    if (recent) animateTo(target);
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    if (!gesture.current) return;
    const remaining = pointsOf(e);
    if (remaining.length === 0) finish(true);
    else rebase(remaining);
  };

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

  // One path per country: merged paths cancel where rings overlap with opposite winding, which left Italy unfilled.
  const fillElements = useMemo(
    () => (shapes ? shapes.map((shape, index) => <Path key={`${shape.id}-${index}`} path={shape.path} color={fills[shape.id] ?? colors.map.land} style="fill" />) : []),
    [shapes, fills, colors.map.land]
  );
  const borders = useMemo(() => (shapes ? mergeAll(shapes) : null), [shapes]);
  const selectedPath = useMemo(
    () => (shapes && selectedCountryId ? shapes.find((s) => s.id === selectedCountryId.toUpperCase())?.path ?? null : null),
    [shapes, selectedCountryId]
  );

  // Map units to screen: centre the visible area, scale, move the view centre to the middle.
  const transform = useDerivedValue(() => {
    const s = (width.get() / MAP_BOUNDS.width) * zoom.get();
    return [{ translateX: width.get() / 2 }, { translateY: height.get() / 2 }, { scale: s }, { translateX: -cx.get() }, { translateY: -cy.get() }];
  });
  // Border width stays about 0.7 points at every zoom; while moving a hairline is cheaper to draw.
  const borderWidth = useDerivedValue(() => (moving.get() ? 0 : 0.7 / ((width.get() / MAP_BOUNDS.width) * zoom.get())));
  const selectedWidth = useDerivedValue(() => 2.2 / ((width.get() / MAP_BOUNDS.width) * zoom.get()));

  const ready = Boolean(shapes && size);
  const showUi = showControls !== null ? showControls : interactive;
  const loadingText = currentLang === 'tr' ? 'Harita yükleniyor…' : 'Loading map…';

  return (
    <View
      ref={containerRef}
      style={[fullScreen ? styles.fullScreen : styles.container, style]}
      onLayout={onLayout}
      onTouchStart={interactive ? onTouchStart : undefined}
      onTouchMove={interactive ? onTouchMove : undefined}
      onTouchEnd={interactive ? onTouchEnd : undefined}
      onTouchCancel={interactive ? () => finish(false) : undefined}
    >
      {ready && borders && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group transform={transform}>
            {fillElements}
            <Path path={borders} color={colors.map.border} style="stroke" strokeWidth={borderWidth} strokeJoin="round" />
            {selectedPath && <Path path={selectedPath} color={colors.text.primary} style="stroke" strokeWidth={selectedWidth} strokeJoin="round" />}
          </Group>
        </Canvas>
      )}

      {!ready && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.gold.base} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      )}

      {ready && showUi && (
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

          {/* touches on the buttons must not reach the map as taps */}
          <View style={styles.controls} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
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
    loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    loadingText: { fontSize: 14, fontWeight: '700', color: colors.text.secondary },
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
