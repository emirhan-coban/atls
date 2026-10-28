import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  onFinish?: () => void;
}

const COLORS = ['#6366F1', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export default function ConfettiCannon({ active, count = 35, onFinish }: ConfettiProps) {
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const particlesRef = useRef<Particle[]>([]);

  if (particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: count }).map(() => ({
      x: new Animated.Value(windowWidth / 2),
      y: new Animated.Value(windowHeight / 2),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.floor(Math.random() * 7) + 6,
    }));
  }

  useEffect(() => {
    if (!active) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const animations = particlesRef.current.map((p) => {
      p.x.setValue(windowWidth / 2);
      p.y.setValue(windowHeight / 2);
      p.opacity.setValue(1);
      p.rotation.setValue(0);
      p.scale.setValue(1);

      const angle = Math.random() * 2 * Math.PI;
      const velocity = Math.random() * 260 + 100;
      const destX = windowWidth / 2 + Math.cos(angle) * velocity;
      const destY = windowHeight / 2 + Math.sin(angle) * velocity + 150; // gravity bias downwards

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: destX,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: destY,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotation, {
          toValue: Math.random() * 720 - 360,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(p.scale, {
          toValue: Math.random() * 0.5 + 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      if (onFinish) onFinish();
    });
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particlesRef.current.map((p, index) => {
        const spin = p.rotation.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size * 1.5,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate: spin },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
