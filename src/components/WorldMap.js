import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';
import { getLocalizedCountryName } from '../data/travelData';

export default function WorldMap({ countries, activeFilter, onSelectCountry, t, currentLang }) {
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
        return '#1D4ED8'; // Deep Royal Blue
      case 'visited':
        return '#2563EB'; // Vibrant Electric Blue
      case 'want':
        return '#38BDF8'; // Sky Blue
      default:
        return '#E2E8F0';
    }
  };

  const handleCountryPress = (id) => {
    const country = countryStatusMap[id];
    if (country) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const countryName = getLocalizedCountryName(country, currentLang);
      const statusLabel = country.status === 'lived' 
        ? (t ? t.livedIn : 'LIVED')
        : country.status === 'want' 
          ? (t ? t.wishlist : 'WISHLIST')
          : (t ? t.visited : 'VISITED');
      setSelectedCountryInfo(`${country.flag || '🌍'} ${countryName} (${statusLabel})`);
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
      </Svg>

      {/* Floating Status Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.blueDot} />
        <Text style={styles.badgeText}>
          {selectedCountryInfo || (t && t.markedBorders ? t.markedBorders.replace('{count}', countries.length) : `${countries.length} MARKED BORDERS`)}
        </Text>
      </View>

      {/* Map scale badge top right */}
      <View style={styles.coordBadge}>
        <Text style={styles.coordText}>WGS-84 • 195</Text>
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
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
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
