import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Plus, Minus, RotateCcw } from 'lucide-react-native';
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';
import { getLocalizedCountryName } from '../data/travelData';
import { translations } from '../localization/translations';

// Base world coordinates
const BASE_VIEWBOX = {
  minX: 30.767,
  minY: 241.591,
  width: 784.077,
  height: 458.627,
};
const CENTER_X = BASE_VIEWBOX.minX + BASE_VIEWBOX.width / 2;
const CENTER_Y = BASE_VIEWBOX.minY + BASE_VIEWBOX.height / 2;

export default function WorldMap({
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
}) {
  const [selectedCountryInfo, setSelectedCountryInfo] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 340, height: 200 });

  const activeT = t || translations[currentLang] || translations.tr;

  // Refs for gesture tracking without stale closures
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef(null);
  const baseZoomOnPinch = useRef(1);
  const basePanOnDrag = useRef({ x: 0, y: 0 });
  const dragStartTouch = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const rafId = useRef(null);

  // Sync refs with state
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = panOffset;
  }, [panOffset]);

  // Compute crisp vector viewBox
  const computedViewBox = useMemo(() => {
    const z = Math.max(1, zoom);
    const w = BASE_VIEWBOX.width / z;
    const h = BASE_VIEWBOX.height / z;

    const maxPanX = (BASE_VIEWBOX.width - w) / 2;
    const maxPanY = (BASE_VIEWBOX.height - h) / 2;

    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, panOffset.x));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, panOffset.y));

    const minX = CENTER_X + clampedX - w / 2;
    const minY = CENTER_Y + clampedY - h / 2;

    return `${minX.toFixed(3)} ${minY.toFixed(3)} ${w.toFixed(3)} ${h.toFixed(3)}`;
  }, [zoom, panOffset]);

  const updateViewBoxThrottled = (newZoom, newPan) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setZoom(newZoom);
      setPanOffset(newPan);
    });
  };

  const resetZoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    if (onInteractionChange) onInteractionChange(false);
  };

  const zoomIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const target = Math.min(5.5, zoomRef.current * 1.5);
    zoomRef.current = target;
    setZoom(target);
  };

  const zoomOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const target = Math.max(1, zoomRef.current / 1.5);
    if (target <= 1.05) {
      resetZoom();
    } else {
      zoomRef.current = target;
      setZoom(target);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (!interactive) return false;
          return (
            gesture.numberActiveTouches === 2 ||
            (zoomRef.current > 1.05 &&
              (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4)) ||
            (Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5)
          );
        },
        onPanResponderGrant: (evt, gesture) => {
          if (onInteractionChange) onInteractionChange(true);
          if (evt.nativeEvent.touches.length === 2) {
            const [t1, t2] = evt.nativeEvent.touches;
            initialPinchDist.current = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            baseZoomOnPinch.current = zoomRef.current;
          } else if (evt.nativeEvent.touches.length === 1) {
            dragStartTouch.current = { x: gesture.x0, y: gesture.y0 };
            basePanOnDrag.current = { ...panRef.current };
          }
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockAppResponder: () => true,
        onPanResponderMove: (evt, gesture) => {
          if (evt.nativeEvent.touches.length === 2 && initialPinchDist.current) {
            const [t1, t2] = evt.nativeEvent.touches;
            const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            const factor = dist / initialPinchDist.current;
            const nextZoom = Math.max(1, Math.min(5.5, baseZoomOnPinch.current * factor));
            zoomRef.current = nextZoom;
            updateViewBoxThrottled(nextZoom, panRef.current);
          } else if (evt.nativeEvent.touches.length === 1 && (zoomRef.current > 1.05 || Math.abs(gesture.dx) > 6)) {
            // Screen pixel to SVG unit ratio
            const currentW = BASE_VIEWBOX.width / zoomRef.current;
            const currentH = BASE_VIEWBOX.height / zoomRef.current;
            const ratioX = currentW / Math.max(100, containerSize.width);
            const ratioY = currentH / Math.max(100, containerSize.height);

            const nextPanX = basePanOnDrag.current.x - gesture.dx * ratioX;
            const nextPanY = basePanOnDrag.current.y - gesture.dy * ratioY;

            const maxPanX = (BASE_VIEWBOX.width - currentW) / 2;
            const maxPanY = (BASE_VIEWBOX.height - currentH) / 2;

            const clampedPan = {
              x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
              y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY)),
            };

            panRef.current = clampedPan;
            updateViewBoxThrottled(zoomRef.current, clampedPan);
          }
        },
        onPanResponderRelease: () => {
          initialPinchDist.current = null;
          if (onInteractionChange) onInteractionChange(false);
          if (zoomRef.current < 1) {
            resetZoom();
          }
        },
        onPanResponderTerminate: () => {
          initialPinchDist.current = null;
          if (onInteractionChange) onInteractionChange(false);
        },
      }),
    [containerSize, interactive, onInteractionChange]
  );

  // Fast country lookup map by ISO-2 code
  const countryStatusMap = useMemo(() => {
    const map = {};
    countries.forEach((c) => {
      map[c.id.toUpperCase()] = c;
    });
    return map;
  }, [countries]);

  const getCountryColor = (id) => {
    const country = countryStatusMap[id];
    if (!country) return '#182235'; // Deep obsidian-navy landmass

    if (activeFilter && activeFilter !== 'all' && country.status !== activeFilter) {
      return '#101624'; // Dimmed if not in active filter
    }

    switch (country.status) {
      case 'lived':
        return '#10B981'; // Emerald beacon
      case 'visited':
        return '#3B82F6'; // Electric sapphire
      case 'want':
        return '#FF6B35'; // Solar flare orange
      default:
        return '#182235';
    }
  };

  const handleCountryPress = (id) => {
    if (!interactive) return;

    // Double-tap zoom into country
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (zoomRef.current > 1.4) {
        resetZoom();
      } else {
        zoomIn();
      }
      lastTapTime.current = 0;
      return;
    }
    lastTapTime.current = now;

    const country = countryStatusMap[id];
    if (country) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const countryName = getLocalizedCountryName(country, currentLang);
      const statusLabel = country.status === 'lived' 
        ? (activeT?.livedIn || (currentLang === 'tr' ? 'YAŞANAN' : 'LIVED'))
        : country.status === 'want' 
          ? (activeT?.wishlist || (currentLang === 'tr' ? 'HEDEF' : 'WISHLIST'))
          : (activeT?.visited || (currentLang === 'tr' ? 'GEZİLEN' : 'VISITED'));
      setSelectedCountryInfo(`${country.flag || '🌍'} ${countryName} (${statusLabel})`);
      if (onSelectCountry) onSelectCountry(country.id);
    }
  };

  const isZoomed = zoom > 1.05;
  const zoomDisplay = (Math.round(zoom * 10) / 10).toFixed(1);
  const shouldShowControls = showControls !== null ? showControls : interactive;

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setContainerSize({ width, height });
      }}
      {...(interactive ? panResponder.panHandlers : {})}
    >
      {/* Background coordinate grid watermark */}
      <View style={styles.watermarkGrid} pointerEvents="none" />

      {/* 
        Native Vector SVG Canvas
        ViewBox manipulation guarantees 100% vector sharpness at retina resolution without bitmap pixelation!
      */}
      <Svg
        viewBox={computedViewBox}
        preserveAspectRatio="xMidYMid meet"
        style={styles.svg}
      >
        <G
          stroke="#25324B"
          strokeWidth={0.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          {worldMapFeatures.map((feature, idx) => {
            const fill = getCountryColor(feature.id);
            const isInteractive = interactive && Boolean(countryStatusMap[feature.id]);
            const isSelected = selectedCountryId && selectedCountryId.toUpperCase() === feature.id;

            return (
              <Path
                key={`${feature.id}-${idx}`}
                d={feature.d}
                fill={isSelected ? '#6366F1' : fill}
                stroke={isSelected ? '#FFFFFF' : '#25324B'}
                strokeWidth={isSelected ? 1.0 : 0.5}
                vectorEffect="non-scaling-stroke"
                onPress={() => isInteractive && handleCountryPress(feature.id)}
              />
            );
          })}
        </G>
      </Svg>

      {/* Floating Status Badge (Shown only if controls are enabled) */}
      {shouldShowControls && (
        <View style={styles.badgeContainer}>
          <View style={styles.blueDot} />
          <Text style={styles.badgeText} numberOfLines={1}>
            {selectedCountryInfo || (
              countries.length === 0
                ? (currentLang === 'tr' ? 'DÜNYA HARİTASI' : 'WORLD MAP')
                : (activeT?.markedBorders
                    ? activeT.markedBorders.replace('{count}', countries.length)
                    : (currentLang === 'tr' ? `${countries.length} İŞARETLİ ÜLKE` : `${countries.length} MARKED COUNTRIES`))
            )}
          </Text>
        </View>
      )}

      {/* Mini Zoom & Scale Controls top right */}
      {shouldShowControls && (
        <View style={styles.topRightControls}>
          {isZoomed && (
            <TouchableOpacity
              onPress={resetZoom}
              activeOpacity={0.75}
              style={styles.resetButton}
            >
              <RotateCcw size={10} color="#2563EB" strokeWidth={2.5} />
              <Text style={styles.resetText}>{`${zoomDisplay}x`}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.zoomButtonsGroup}>
            <TouchableOpacity
              onPress={zoomIn}
              activeOpacity={0.75}
              style={styles.zoomBtn}
            >
              <Plus size={11} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {isZoomed && (
              <TouchableOpacity
                onPress={zoomOut}
                activeOpacity={0.75}
                style={styles.zoomBtn}
              >
                <Minus size={11} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          {!isZoomed && (
            <View style={styles.coordBadge}>
              <Text style={styles.coordText}>WGS-84 • 195</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    backgroundColor: '#07090E',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(11, 15, 25, 0.90)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxWidth: '75%',
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.4,
  },
  topRightControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  resetText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#60A5FA',
    fontVariant: ['tabular-nums'],
  },
  zoomButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 32, 0.90)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  zoomBtn: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  coordBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coordText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
    fontVariant: ['tabular-nums'],
  },
});
