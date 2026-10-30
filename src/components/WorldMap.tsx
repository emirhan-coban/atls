import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, PanResponder, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
  MapView,
  MAX_ZOOM,
  panBy,
  Point,
  Size,
  viewBoxOf,
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
  selectedFill: string;
  selectedStroke: string;
  interactive: boolean;
  onPressCountry: (id: string) => void;
}

/** The ~200 country shapes. Memoised on purpose: panning and zooming only change the SVG viewBox, never these elements. */
const CountryPaths = memo(function CountryPaths({
  fills,
  selectedId,
  landColor,
  borderColor,
  selectedFill,
  selectedStroke,
  interactive,
  onPressCountry,
}: CountryPathsProps) {
  return (
    <G strokeLinejoin="round" strokeLinecap="round">
      {worldMapFeatures.map((feature, index) => {
        const selected = selectedId === feature.id;
        return (
          <Path
            key={`${feature.id}-${index}`}
            d={feature.d}
            fill={fills[feature.id] ?? (selected ? selectedFill : landColor)}
            stroke={selected ? selectedStroke : borderColor}
            strokeWidth={selected ? 2.2 : 0.5}
            vectorEffect="non-scaling-stroke"
            onPress={interactive ? () => onPressCountry(feature.id) : undefined}
          />
        );
      })}
    </G>
  );
});

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * World map with one- and two-finger gestures: drag to pan, pinch to zoom around the fingers, double tap to zoom in.
 * Zoom is done by changing the SVG viewBox, so the shapes stay sharp at any level.
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
  const gesture = useRef<{ view: MapView; fingers: Point[]; startDist: number; startMid: Point } | null>(null);
  const frame = useRef<number | null>(null);
  const lastTap = useRef(0);
  const dragged = useRef(false);

  const commit = useCallback((next: MapView) => {
    viewRef.current = next;
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setView(viewRef.current);
      });
    }
  }, []);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === 0 || height === 0) return;
    sizeRef.current = { width, height };
    setSize({ width, height });
    commit(clampView(viewRef.current, { width, height }));
    containerRef.current?.measureInWindow((x, y) => {
      originRef.current = { x, y };
    });
  };

  const fingersOf = (e: GestureResponderEvent): Point[] =>
    e.nativeEvent.touches.map((touch) => ({ x: touch.pageX - originRef.current.x, y: touch.pageY - originRef.current.y }));

  const beginGesture = (e: GestureResponderEvent) => {
    const fingers = fingersOf(e);
    gesture.current = {
      view: viewRef.current,
      fingers,
      startDist: fingers.length > 1 ? distance(fingers[0], fingers[1]) : 0,
      startMid: fingers.length > 1 ? midpoint(fingers[0], fingers[1]) : fingers[0],
    };
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Two fingers, or a real drag, are taken before a country shape can claim the touch. A plain tap still reaches the shape.
        onStartShouldSetPanResponderCapture: (e) => interactive && e.nativeEvent.touches.length > 1,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          interactive && (g.numberActiveTouches > 1 || Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          dragged.current = true;
          onInteractionChange?.(true);
          containerRef.current?.measureInWindow((x, y) => {
            originRef.current = { x, y };
          });
          beginGesture(e);
        },
        onPanResponderMove: (e, g) => {
          const fingers = fingersOf(e);
          const start = gesture.current;
          if (!start) return;
          if (fingers.length > 1) {
            // a second finger arrived after the drag began: restart from the current state
            if (start.startDist === 0) {
              gesture.current = { view: viewRef.current, fingers, startDist: distance(fingers[0], fingers[1]), startMid: midpoint(fingers[0], fingers[1]) };
              return;
            }
            const dist = distance(fingers[0], fingers[1]);
            commit(zoomAround(start.view, sizeRef.current, start.view.zoom * (dist / start.startDist), start.startMid, midpoint(fingers[0], fingers[1])));
          } else if (start.startDist === 0) {
            commit(panBy(start.view, sizeRef.current, g.dx, g.dy));
          }
        },
        onPanResponderRelease: () => {
          gesture.current = null;
          onInteractionChange?.(false);
          setTimeout(() => {
            dragged.current = false;
          }, 80);
        },
        onPanResponderTerminate: () => {
          gesture.current = null;
          onInteractionChange?.(false);
          dragged.current = false;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive, onInteractionChange, commit]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const current = viewRef.current;
      const centre = { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
      commit(zoomAround(current, sizeRef.current, current.zoom * factor, centre, centre));
    },
    [commit]
  );

  const reset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    commit(clampView(INITIAL_VIEW, sizeRef.current));
  }, [commit]);

  // Fill colour per country id; recomputed only when the countries or filter change
  const fills = useMemo(() => {
    const map: Record<string, string> = {};
    countries.forEach((c) => {
      const filtered = activeFilter !== 'all' && c.status !== activeFilter;
      map[c.id.toUpperCase()] = filtered
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
        zoomBy(viewRef.current.zoom > 1.4 ? 1 / MAX_ZOOM : 2);
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

  const zoomed = view.zoom > 1.05;
  const showUi = showControls !== null ? showControls : interactive;

  return (
    <View
      ref={containerRef}
      style={[fullScreen ? styles.fullScreen : styles.container, style]}
      onLayout={onLayout}
      {...(interactive ? panResponder.panHandlers : {})}
    >
      <Svg width="100%" height="100%" viewBox={viewBoxOf(view, size)} preserveAspectRatio="none">
        <CountryPaths
          fills={fills}
          selectedId={selectedCountryId ? selectedCountryId.toUpperCase() : null}
          landColor={colors.map.land}
          borderColor={colors.map.border}
          selectedFill={colors.map.landDim}
          selectedStroke={colors.text.primary}
          interactive={interactive}
          onPressCountry={handleCountryPress}
        />
      </Svg>

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
            <TouchableOpacity onPress={() => zoomBy(1.6)} style={styles.controlBtn} accessibilityRole="button" accessibilityLabel="Zoom in">
              <Plus size={18} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => zoomBy(1 / 1.6)} disabled={!zoomed} style={[styles.controlBtn, !zoomed && styles.controlOff]} accessibilityRole="button" accessibilityLabel="Zoom out">
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
      aspectRatio: 16 / 9.5,
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
      width: 40,
      height: 40,
      borderRadius: 20,
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
