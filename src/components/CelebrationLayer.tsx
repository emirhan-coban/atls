import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import AchievementToast from './AchievementToast';
import ConfettiCannon from './ConfettiCannon';
import { useCelebrationStore } from '../stores/useCelebrationStore';
import { useProgressStore } from '../stores/useProgressStore';

interface CelebrationLayerProps {
  /** Unique host id: the app root and each modal that wants to show celebrations on top of itself. */
  hostId: string;
  /** False while the host is not on screen (a closed modal). */
  active?: boolean;
  currentLang: 'tr' | 'en';
}

/**
 * Draws the badge banner and confetti. Native modals cover everything behind them, so every modal
 * mounts its own layer; the store keeps a stack of hosts and only the topmost one actually draws.
 */
export default function CelebrationLayer({ hostId, active = true, currentLang }: CelebrationLayerProps) {
  const isTop = useCelebrationStore((s) => s.hosts[s.hosts.length - 1] === hostId);
  const confettiKey = useCelebrationStore((s) => s.confettiKey);
  const pushHost = useCelebrationStore((s) => s.pushHost);
  const popHost = useCelebrationStore((s) => s.popHost);
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

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <AchievementToast achievement={badge} currentLang={currentLang} onHide={dismissBadge} />
      <ConfettiCannon active={confettiOn} onFinish={() => setConfettiOn(false)} />
    </View>
  );
}

