import { makeStyles, useTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Ellipse, Circle } from 'react-native-svg';

interface OrbitalRingsProps {
  width?: number;
  height?: number;
  size?: number;
  style?: ViewStyle;
}

export default function OrbitalRings({
  width,
  height,
  size,
  style,
}: OrbitalRingsProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const finalWidth = size ?? width ?? 300;
  const finalHeight = size ? Math.round(size * 0.6) : (height ?? 180);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Svg width={finalWidth} height={finalHeight} viewBox="0 0 300 180">
        {/* Outer subtle orbital ring */}
        <Ellipse
          cx="150"
          cy="90"
          rx="135"
          ry="65"
          stroke="rgba(255, 255, 255, 0.09)"
          strokeWidth="1"
          strokeDasharray="4 6"
          transform="rotate(-12 150 90)"
        />

        {/* Inner clean orbital ring */}
        <Ellipse
          cx="150"
          cy="90"
          rx="105"
          ry="48"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
          transform="rotate(-8 150 90)"
        />

        {/* Orbit coordinate node */}
        <Circle
          cx="245"
          cy="78"
          r="3"
          fill={colors.gold.light}
        />

        {/* Orbit secondary node */}
        <Circle
          cx="60"
          cy="105"
          r="2"
          fill={colors.status.visited.color}
        />
      </Svg>
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
