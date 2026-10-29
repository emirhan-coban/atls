import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import GlassCard from '../GlassCard';
import { makeStyles } from '../../theme/ThemeContext';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Share of the screen height the sheet may use. */
  maxHeight?: `${number}%`;
  animationType?: 'none' | 'slide' | 'fade';
  /** Extra styles for the glass container (padding, etc.). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Bottom sheet shell: dimmed backdrop (tap to close), glass container, grab handle and
 * keyboard avoidance. Screens render their own header and body as children.
 */
export default function Sheet({
  visible,
  onClose,
  children,
  maxHeight = '90%',
  animationType = 'fade',
  style,
}: SheetProps) {
  const styles = useStyles();
  return (
    <Modal visible={visible} animationType={animationType} transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <GlassCard style={[styles.container, { maxHeight }, style]}>
          <View style={styles.handle} />
          {children}
        </GlassCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    container: {
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 16,
      backgroundColor: colors.glass.borderStrong,
    },
  })
);
