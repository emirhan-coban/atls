import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles, useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered before the label, receives the label colour so icons always match the text. */
  icon?: (color: string) => React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * The one button used across the app. Primary actions are gold (one accent), secondary actions
 * are glass, destructive actions are red-tinted.
 */
function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const labelColor =
    variant === 'primary'
      ? colors.gold.onGold
      : variant === 'ghost'
        ? colors.gold.base
        : variant === 'danger'
          ? colors.danger
          : colors.text.primary;

  const handlePress = () => {
    Haptics.impactAsync(
      variant === 'danger' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.base,
        styles[size],
        styles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <View style={styles.content}>
          {icon ? icon(labelColor) : null}
          <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: labelColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    sm: { height: 36, paddingHorizontal: 14, borderRadius: 18 },
    md: { height: 44, paddingHorizontal: 18, borderRadius: 22 },
    lg: { height: 54, paddingHorizontal: 22, borderRadius: 24 },
    primary: {
      backgroundColor: colors.gold.base,
      shadowColor: colors.gold.base,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 3,
    },
    secondary: {
      backgroundColor: colors.glass.fillStrong,
      borderColor: colors.glass.hairline,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.dangerTint,
      borderColor: colors.dangerBorder,
    },
    disabled: {
      opacity: 0.55,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    labelSm: {
      fontSize: 13,
    },
  })
);

export default React.memo(Button);
