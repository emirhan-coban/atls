import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  createAnimatedComponent,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { darkColors } from '../theme/colors';
import { clamp } from './globeMath';

const AnimatedScrollView = createAnimatedComponent(ScrollView);

export type SnapName = 'peek' | 'half' | 'full';

export interface SheetHandle {
  snapTo: (name: SnapName) => void;
  current: () => SnapName;
}

interface Props {
  /** Height of the region the sheet may use (above the tab bar). */
  areaHeight: number;
  /** Bottom strip covered by the floating tab bar: the sheet runs under it, snaps are measured above it. */
  dock?: number;
  /** Bump to re-attach the gesture handlers (a tab that was hidden with display: none loses its native views). */
  epoch?: number;
  /** Always-visible first row (summary). */
  peek: React.ReactNode;
  children: React.ReactNode;
  /** Visible height of the sheet in px, shared so the globe can keep clear of it. */
  visible: SharedValue<number>;
  onSnapChange?: (name: SnapName) => void;
}

const HEADER_H = 84;
const FLICK_DOWN = 1200; // px/s
const SPRING = { damping: 28, stiffness: 260, mass: 0.9, overshootClamping: true };

/**
 * Three snap points (peek ~16%, half ~55%, full). Gesture ownership:
 *  - the pan covers the whole sheet; it moves the sheet unless the sheet is full and the content is scrolled,
 *    or the sheet is full and the finger moves up (then the content scrolls);
 *  - the inner ScrollView only scrolls once the sheet is at full, so below that every vertical drag moves the sheet.
 */
const HomeSheet = forwardRef<SheetHandle, Props>(function HomeSheet({ areaHeight, dock = 0, epoch = 0, peek, children, visible, onSnapChange }, ref) {
  const usable = areaHeight - dock;
  const peekH = Math.max(112, Math.round(usable * 0.16)) + dock;
  const halfH = Math.round(usable * 0.55) + dock;
  const fullH = areaHeight;
  const snaps = useMemo(() => ({ peek: peekH, half: halfH, full: fullH }), [peekH, halfH, fullH]);

  const scrollY = useSharedValue(0);
  const startVisible = useSharedValue(0);
  const fromHeader = useSharedValue(false);
  const [scrollable, setScrollable] = useState(false);
  const [name, setName] = useState<SnapName>('peek');

  // keep the sheet on a snap when the area changes (rotation-free app, but keyboard/safe-area can resize it)
  React.useEffect(() => {
    visible.value = snaps[name];
  }, [snaps, name, visible]);

  const settle = useCallback(
    (next: SnapName) => {
      setName(next);
      setScrollable(next === 'full');
      onSnapChange?.(next);
    },
    [onSnapChange]
  );

  const animateTo = useCallback(
    (next: SnapName) => {
      visible.value = withSpring(snaps[next], SPRING, (fin) => {
        if (fin) runOnJS(settle)(next);
      });
    },
    [snaps, visible, settle]
  );

  useImperativeHandle(ref, () => ({ snapTo: animateTo, current: () => name }), [animateTo, name]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const native = useMemo(() => Gesture.Native(), []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .simultaneousWithExternalGesture(native)
        .activeOffsetY([-8, 8])
        .failOffsetX([-24, 24])
        .onBegin((e) => {
          startVisible.value = visible.value;
          fromHeader.value = e.y < HEADER_H;
        })
        .onChange((e) => {
          const atFull = visible.value >= fullH - 0.5;
          // the header strip always drags the sheet; the content only does so when it sits at the top
          if (atFull && !fromHeader.value && (e.changeY < 0 || scrollY.value > 0.5)) return;
          visible.value = clamp(visible.value - e.changeY, peekH, fullH);
        })
        .onEnd((e) => {
          const projected = visible.value - e.velocityY * 0.18;
          // pulled down from full: a short pull or a quick downward flick (even over scrolled content) gets back to the globe
          const fromFull = startVisible.value >= fullH - 0.5;
          if (fromFull && (startVisible.value - visible.value > 48 || e.velocityY > FLICK_DOWN)) {
            visible.value = withSpring(peekH, SPRING, (fin) => {
              if (fin) runOnJS(settle)('peek');
            });
            return;
          }
          let best: SnapName = 'peek';
          let bestD = Math.abs(projected - peekH);
          (['half', 'full'] as const).forEach((k) => {
            const d = Math.abs(projected - (k === 'half' ? halfH : fullH));
            if (d < bestD) {
              bestD = d;
              best = k;
            }
          });
          const target = best === 'peek' ? peekH : best === 'half' ? halfH : fullH;
          visible.value = withSpring(target, SPRING, (fin) => {
            if (fin) runOnJS(settle)(best);
          });
        }),
    [visible, fullH, peekH, halfH, settle, scrollY, native, startVisible, fromHeader]
  );

  const style = useAnimatedStyle(() => ({
    height: fullH,
    transform: [{ translateY: fullH - visible.value }],
  }));

  return (
    <Animated.View style={[styles.sheet, style]} pointerEvents="box-none">
      <BlurView intensity={darkColors.glass.blur} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      <GestureDetector key={epoch} gesture={pan}>
        <View style={styles.flex}>
          <View style={styles.peekWrap}>
            <View style={styles.handle} />
            {peek}
          </View>
          <GestureDetector gesture={native}>
          <AnimatedScrollView
            style={styles.flex}
            scrollEnabled={scrollable}
            bounces={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: 28 + dock }]}
          >
            {children}
          </AnimatedScrollView>
          </GestureDetector>
        </View>
      </GestureDetector>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: darkColors.glass.border,
  },
  scrim: { backgroundColor: darkColors.glass.tint },
  flex: { flex: 1 },
  peekWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
});

export default HomeSheet;
