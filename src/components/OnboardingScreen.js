import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  Globe2, 
  ShieldCheck, 
  Share2, 
  ChevronRight, 
  Languages, 
  Sparkles 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete, t, currentLang, onToggleLang }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Globe2,
      badge: "PLANETARY EXPLORATION",
      title: t.onboarding1Title,
      description: t.onboarding1Desc,
      colors: ['#4F46E5', '#7C3AED'],
      accentColor: '#38BDF8',
    },
    {
      icon: ShieldCheck,
      badge: "BIOMETRIC CREDENTIAL",
      title: t.onboarding2Title,
      description: t.onboarding2Desc,
      colors: ['#6366F1', '#EC4899'],
      accentColor: '#FCD34D',
    },
    {
      icon: Share2,
      badge: "SPOTIFY-STYLE STORY",
      title: t.onboarding3Title,
      description: t.onboarding3Desc,
      colors: ['#1E1035', '#4338CA'],
      accentColor: '#34D399',
    },
  ];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  const active = slides[currentSlide];
  const IconComponent = active.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar: Language toggle & Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onToggleLang();
          }}
          activeOpacity={0.8}
          style={styles.langBtn}
        >
          <Languages size={14} color="#5B4DFF" />
          <Text style={styles.langText}>{currentLang.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t.skip}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Content */}
      <View style={styles.slideArea}>
        {/* Animated Hero Icon Graphic */}
        <LinearGradient
          colors={active.colors}
          style={styles.heroCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Subtle Outer Rings */}
          <View style={styles.outerRing1} />
          <View style={styles.outerRing2} />

          <IconComponent size={64} color="#FFFFFF" strokeWidth={1.8} />

          <View style={[styles.floatingBadge, { backgroundColor: active.accentColor }]}>
            <Sparkles size={12} color="#0F172A" />
          </View>
        </LinearGradient>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>{active.badge}</Text>
          </View>

          <Text style={styles.slideTitle}>{active.title}</Text>
          <Text style={styles.slideDesc}>{active.description}</Text>
        </View>
      </View>

      {/* Footer: Paginator Dots & Next Button */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={styles.nextBtn}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === slides.length - 1 ? t.getStarted : t.next}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B10',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  slideArea: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  heroCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 36,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  outerRing1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  outerRing2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#090B10',
  },
  textContainer: {
    alignItems: 'center',
  },
  pillBadge: {
    backgroundColor: 'rgba(91, 77, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(91, 77, 255, 0.3)',
  },
  pillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#5B4DFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5B4DFF',
    borderRadius: 24,
    paddingVertical: 18,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
