import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles } from '../../theme/ThemeContext';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Selectable pill used for months, continents and filters. Selected = gold. */
function Chip({ label, selected = false, onPress, style, accessibilityLabel }: ChipProps) {
  const styles = useStyles();
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 16,
      backgroundColor: colors.glass.borderSoft,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    chipSelected: {
      backgroundColor: colors.gold.base,
      borderColor: colors.gold.base,
    },
    text: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text.secondary,
    },
    textSelected: {
      color: colors.gold.onGold,
      fontWeight: '800',
    },
  })
);

export default React.memo(Chip);
