import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AchievementToast from './AchievementToast';
import ConfettiCannon from './ConfettiCannon';
import StampView from './StampView';
import { makeStyles } from '../theme/ThemeContext';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { monthShort } from '../data/months';
import { useCelebrationStore } from '../stores/useCelebrationStore';
import { useProgressStore } from '../stores/useProgressStore';
import { jt } from '../localization/journey';

interface CelebrationLayerProps {
  /** Unique host id: the app root and each modal that wants to show celebrations on top of itself. */
  hostId: string;
  /** False while the host is not on screen (a closed modal). */
  active?: boolean;
  currentLang: 'tr' | 'en';
}

/**
 * Draws the stamp, badge banner and confetti. Native modals cover everything behind them, so every modal
 * mounts its own layer; the store keeps a stack of hosts and only the topmost one actually draws.
 */
export default function CelebrationLayer({ hostId, active = true, currentLang }: CelebrationLayerProps) {
  const styles = useStyles();
  const isTop = useCelebrationStore((s) => s.hosts[s.hosts.length - 1] === hostId);
  const stamp = useCelebrationStore((s) => s.stamp);
  const confettiKey = useCelebrationStore((s) => s.confettiKey);
  const pushHost = useCelebrationStore((s) => s.pushHost);
  const popHost = useCelebrationStore((s) => s.popHost);
  const clearStamp = useCelebrationStore((s) => s.clearStamp);
  const badge = useProgressStore((s) => (s.queue[0] ? s.currentBadge() : null));
  const dismissBadge = useProgressStore((s) => s.dismissCurrent);

  useEffect(() => {
    if (!active) return;
    pushHost(hostId);
    return () => popHost(hostId);
  }, [active, hostId, pushHost, popHost]);

  const [confettiOn, setConfettiOn] = React.useState(false);
  const lastKey = useRef(confettiKey);
  useEffect(() => {
    if (isTop && confettiKey !== lastKey.current) setConfettiOn(true);
    lastKey.current = confettiKey;
  }, [confettiKey, isTop]);

  if (!active || !isTop) return null;

  const catalogEntry = stamp ? availableCatalog.find((c: any) => c.id.toUpperCase() === stamp.countryId.toUpperCase()) : null;
  const dateText = stamp
    ? [monthShort(stamp.month, currentLang), stamp.year].filter(Boolean).join(' ') || String(new Date().getFullYear())
    : '';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <AchievementToast achievement={badge} currentLang={currentLang} onHide={dismissBadge} />
      <ConfettiCannon active={confettiOn} onFinish={() => setConfettiOn(false)} />
      {stamp && (
        <StampSlam key={stamp.id} onDone={clearStamp}>
          <StampView
            countryId={stamp.countryId}
            title={catalogEntry ? getLocalizedCountryName(catalogEntry, currentLang) : stamp.countryId}
            dateText={dateText}
            status={stamp.status}
            size={300}
          />
          <Text style={styles.caption}>{jt('stamped', currentLang)}</Text>
        </StampSlam>
      )}
    </View>
  );
}

/** The stamp flies in large, "hits" the page with a spring and a heavy haptic, holds, then fades out. */
function StampSlam({ children, onDone }: { children: React.ReactNode; onDone: () => void }) {
  const styles = useStyles();
  const scale = useSharedValue(3.2);
  const opacity = useSharedValue(0);
  const tilt = useSharedValue(-22);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 140 }),
      withDelay(1500, withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(onDone)();
      }))
    );
    tilt.value = withSpring(0, { damping: 9, stiffness: 140 });
    scale.value = withSpring(1, { damping: 7, stiffness: 190, mass: 0.8 });
    const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 170);
    return () => clearTimeout(t);
  }, [onDone, opacity, scale, tilt]);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <View style={styles.center}>
      <Animated.View style={[styles.stampBox, animated]}>{children}</Animated.View>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    stampBox: {
      alignItems: 'center',
      padding: 18,
      borderRadius: 32,
      backgroundColor: colors.canvas.elevated,
      borderWidth: 1,
      borderColor: colors.glass.border,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 12,
    },
    caption: { marginTop: 4, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, color: colors.text.secondary },
  })
);
