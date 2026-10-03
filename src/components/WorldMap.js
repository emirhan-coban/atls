import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';

export default function WorldMap({ countries, activeFilter, onSelectCountry }) {
  const [selectedCountryInfo, setSelectedCountryInfo] = useState(null);

  // Fast country lookup map by ISO-2 code
  const countryStatusMap = useMemo(() => {
    const map = {};
    countries.forEach((c) => {
      map[c.id.toUpperCase()] = c;
    });
    return map;
  }, [countries]);

  const getCountryColor = (id) => {
    const country = countryStatusMap[id];
    if (!country) return '#E2E8F0'; // Base landmass

    if (activeFilter && activeFilter !== 'all' && country.status !== activeFilter) {
      return '#CBD5E1'; // Dimmed if not in active filter
    }

    switch (country.status) {
      case 'lived':
        return '#4F46E5'; // Deep Indigo (Fremd)
      case 'visited':
        return '#3B82F6'; // Bright Electric Blue
      case 'want':
        return '#A855F7'; // Purple
      default:
        return '#E2E8F0';
    }
  };

  const handleCountryPress = (id) => {
    const country = countryStatusMap[id];
    if (country) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedCountryInfo(`${country.flag} ${country.name} (${country.status.toUpperCase()})`);
      if (onSelectCountry) onSelectCountry(country.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background coordinate grid watermark */}
      <View style={styles.watermarkGrid} />

      <Svg
        viewBox={worldViewBox}
        style={styles.svg}
      >
        <G stroke="#FFFFFF" strokeWidth={0.6} strokeLinejoin="round" strokeLinecap="round">
          {worldMapFeatures.map((feature, idx) => {
            const fill = getCountryColor(feature.id);
            const isInteractive = Boolean(countryStatusMap[feature.id]);

            return (
              <Path
                key={`${feature.id}-${idx}`}
                d={feature.d}
                fill={fill}
                onPress={() => isInteractive && handleCountryPress(feature.id)}
              />
            );
          })}
        </G>

        {/* Pulse beacon at Lisbon (Home) */}
        <Circle cx="395" cy="370" r="6" fill="#4F46E5" opacity={0.4} />
        <Circle cx="395" cy="370" r="3.5" fill="#4F46E5" />
        <Circle cx="395" cy="370" r="1.5" fill="#FFFFFF" />

        {/* Pulse beacon at Taiwan */}
        <Circle cx="664" cy="425" r="4.5" fill="#4F46E5" opacity={0.4} />
        <Circle cx="664" cy="425" r="2.8" fill="#4F46E5" />
        <Circle cx="664" cy="425" r="1.2" fill="#FFFFFF" />
      </Svg>

      {/* Floating Status Badge (like Fremd's VERIFIED tag) */}
      <View style={styles.badgeContainer}>
        <View style={styles.greenDot} />
        <Text style={styles.badgeText}>
          {selectedCountryInfo || `${countries.length} MARKED BORDERS`}
        </Text>
      </View>

      {/* Live Coordinate tag top right */}
      <View style={styles.coordBadge}>
        <Text style={styles.coordText}>38.72° N, 9.13° W</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.4,
  },
  coordBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coordText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
});
