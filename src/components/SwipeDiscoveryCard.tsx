import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Heart, ArrowRight, Sparkles, RefreshCw, Compass } from 'lucide-react-native';
import GlowSphere from './GlowSphere';
import OrbitalRings from './OrbitalRings';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { Country } from '../stores/types';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

interface SwipeDiscoveryCardProps {
  existingCountries: Country[];
  currentLang: 'tr' | 'en';
  onAddToWishlist: (country: any) => void;
  t: any;
}

export default function SwipeDiscoveryCard({
  existingCountries,
  currentLang,
  onAddToWishlist,
  t,
}: SwipeDiscoveryCardProps) {
  // Filter out countries user has already marked
  const markedIds = new Set(existingCountries.map((c) => c.id.toUpperCase()));
  const unvisitedCountries = availableCatalog.filter((c) => !markedIds.has(c.id.toUpperCase()));

  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentCountry = unvisitedCountries[currentIndex];

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleForceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    if (direction === 'right') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (currentCountry) {
        onAddToWishlist({
          id: currentCountry.id,
          name: currentCountry.name,
          nameTr: currentCountry.nameTr,
          flag: currentCountry.flag,
          status: 'want',
          continent: currentCountry.continent,
          continentTr: currentCountry.continentTr,
        });
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          handleForceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          handleForceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // Rotation interpolation based on horizontal swipe
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skipOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!currentCountry || currentIndex >= unvisitedCountries.length) {
    return (
      <View style={styles.allDoneCard}>
        <View style={styles.allDoneIcon}>
          <Compass size={32} color="#6366F1" />
        </View>
        <Text style={styles.allDoneTitle}>
          {t?.allCaughtUp || (currentLang === 'tr' ? 'Tüm önerileri inceledin!' : 'All caught up!')}
        </Text>
        <TouchableOpacity
          style={styles.shuffleBtn}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync();
            setCurrentIndex(0);
          }}
        >
          <RefreshCw size={16} color="#4F46E5" />
          <Text style={styles.shuffleBtnText}>
            {t?.shuffleDeck || (currentLang === 'tr' ? 'Yeniden Keşfet' : 'Discover Again')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const countryName = getLocalizedCountryName(currentCountry, currentLang);
  const trivia = getCountryTrivia(currentCountry.id, countryName, currentLang);
  const continentName =
    currentLang === 'tr' ? currentCountry.continentTr || currentCountry.continent : currentCountry.continent;

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]}
      >
        {/* Background Celestial Aura & Orbital Lines */}
        <GlowSphere
          size={240}
          colors={['#FF6B35', '#2E5CFF']}
          opacity={0.24}
          style={{ position: 'absolute', top: -40, right: -40 }}
        />
        <OrbitalRings
          size={200}
          style={{ position: 'absolute', top: -20, right: -20, opacity: 0.22 }}
        />

        {/* Swipe Indicators */}
        <Animated.View style={[styles.stampIndicator, styles.likeStamp, { opacity: likeOpacity }]}>
          <Text style={styles.likeStampText}>
            {currentLang === 'tr' ? 'HEDEF ❤️' : 'WISHLIST ❤️'}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.stampIndicator, styles.skipStamp, { opacity: skipOpacity }]}>
          <Text style={styles.skipStampText}>
            {currentLang === 'tr' ? 'GEÇ ⏭️' : 'SKIP ⏭️'}
          </Text>
        </Animated.View>

        {/* Card Header & Flag */}
        <View style={styles.topRow}>
          <View style={styles.continentPill}>
            <Sparkles size={12} color="#60A5FA" />
            <Text style={styles.continentPillText}>{continentName}</Text>
          </View>
          <Text style={styles.flagEmoji}>{currentCountry.flag}</Text>
        </View>

        {/* Title & Trivia */}
        <View style={styles.cardContent}>
          <Text style={styles.countryName} numberOfLines={1}>
            {countryName}
          </Text>
          <View style={styles.triviaContainer}>
            <Text style={styles.triviaLabel}>
              {t?.funFact || (currentLang === 'tr' ? 'Bunu biliyor muydun?' : 'Fun Fact')}
            </Text>
            <Text style={styles.triviaText} numberOfLines={4}>
              {trivia}
            </Text>
          </View>
        </View>

        {/* Card Footer Hint */}
        <Text style={styles.swipeHint}>
          {t?.swipeCardHint ||
            (currentLang === 'tr'
              ? 'Hedeflere eklemek için sağa, geçmek için sola kaydır'
              : 'Swipe right to wishlist, left to skip')}
        </Text>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => handleForceSwipe('left')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t?.skipCountry || 'Skip Country'}
          style={[styles.actionBtn, styles.skipBtn]}
        >
          <ArrowRight size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleForceSwipe('right')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t?.addToWishlist || 'Add to Wishlist'}
          style={[styles.actionBtn, styles.heartBtn]}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8A5B']}
            style={styles.heartGradient}
          >
            <Heart size={24} color="#090B0E" fill="#090B0E" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  card: {
    width: SCREEN_WIDTH - theme.spacing.lg * 2,
    backgroundColor: 'rgba(15, 20, 32, 0.88)',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  stampIndicator: {
    position: 'absolute',
    top: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  likeStamp: {
    left: 20,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    transform: [{ rotate: '-12deg' }],
  },
  likeStampText: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  skipStamp: {
    right: 20,
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    transform: [{ rotate: '12deg' }],
  },
  skipStampText: {
    color: '#FF8A5B',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  continentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  continentPillText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#60A5FA',
    textTransform: 'uppercase',
  },
  flagEmoji: {
    fontSize: 48,
  },
  cardContent: {
    marginVertical: theme.spacing.sm,
  },
  countryName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.black,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  triviaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#E5A93C',
  },
  triviaLabel: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: '#E5A93C',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  triviaText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: '#64748B',
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  skipBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heartBtn: {
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.4,
  },
  heartGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allDoneCard: {
    width: SCREEN_WIDTH - theme.spacing.lg * 2,
    backgroundColor: 'rgba(15, 20, 32, 0.88)',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: theme.spacing.md,
  },
  allDoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  allDoneTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
  },
  shuffleBtnText: {
    color: '#090B0E',
    fontWeight: theme.typography.fontWeight.black,
    fontSize: theme.typography.fontSize.sm,
  },
});
