import { makeStyles } from '../theme/ThemeContext';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonItem({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const styles = useStyles();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCountryCard() {
  const styles = useStyles();
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <SkeletonItem width={70} height={24} borderRadius={12} />
        <SkeletonItem width={36} height={36} borderRadius={18} />
      </View>
      <SkeletonItem width="60%" height={28} borderRadius={6} style={{ marginVertical: 10 }} />
      <SkeletonItem width="90%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
      <SkeletonItem width="75%" height={14} borderRadius={4} />
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  skeleton: {
    backgroundColor: colors.glass.fillStrong,
  },
  cardContainer: {
    backgroundColor: colors.panel.base,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
