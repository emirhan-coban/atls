import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface GlassCardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  /** BlurView intensity (1-100). Defaults to the theme's glass.blur. */
  intensity?: number;
  /** Strength of the dark scrim over the blur (lower = more see-through). Keep text readable on busy backgrounds. */
  tintOpacity?: number;
  /** Hairline border around the glass edge. */
  bordered?: boolean;
  children?: React.ReactNode;
}

/**
 * Frosted glass surface: blur + dark scrim + hairline border.
 * Use only for floating layers (nav, sheets, overlays on the map) — flat lists/forms don't need it.
 * Android has no blur here (expo-blur needs a BlurTargetView), so it gets a more opaque scrim instead.
 */
function GlassCard({
  style,
  intensity,
  tintOpacity,
  bordered = true,
  children,
  ...rest
}: GlassCardProps) {
  const { colors } = useTheme();
  const isIOS = Platform.OS === 'ios';
  const scrimOpacity = tintOpacity ?? (isIOS ? colors.glass.scrimOpacity : 0.92);
  const blurIntensity = intensity ?? colors.glass.blur;

  return (
    <View
      {...rest}
      style={[styles.base, bordered && { borderWidth: 1, borderColor: colors.glass.border }, style]}
    >
      {isIOS && (
        <BlurView
          intensity={blurIntensity}
          tint={colors.glass.blurTint}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(${colors.glass.scrimRgb}, ${scrimOpacity})` },
        ]}
      />
      {/* Diagonal sheen + bright top hairline: sells the "lit glass edge" */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.38)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topHighlight}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
  },
});

export default React.memo(GlassCard);
