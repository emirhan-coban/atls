import { makeStyles } from '../theme/ThemeContext';
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlowSphereProps {
  size?: number;
  colors?: [string, string, ...string[]];
  style?: ViewStyle;
  opacity?: number;
}

export default function GlowSphere({
  size = 320,
  colors = ['#3B82F6', '#E5A93C'],
  style,
  opacity = 0.45,
}: GlowSphereProps) {
  const styles = useStyles();
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={styles.gradient}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    // In React Native, large borderRadius + opacity produces the diffuse aura look
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
}));
