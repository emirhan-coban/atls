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
  Sparkles,
  Compass,
  MapPin,
  CheckCircle2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete, t, currentLang, onToggleLang }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Globe2,
      badge: t.onboardingBadge1 || "KÜRESEL KEŞİF",
      title: t.onboarding1Title,
      description: t.onboarding1Desc,
      gradientColors: ['#EFF6FF', '#DBEAFE'],
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      floatingTag: currentLang === 'tr' ? '195 Ülke & Harita' : '195 Countries & Map',
      FloatingIcon: Compass,
    },
    {
      icon: ShieldCheck,
      badge: t.onboardingBadge2 || "BİYOMETRİK KİMLİK",
      title: t.onboarding2Title,
      description: t.onboarding2Desc,
      gradientColors: ['#F0FDF4', '#EEF2FF'],
      iconBg: '#E0E7FF',
      iconColor: '#2563EB',
      floatingTag: currentLang === 'tr' ? 'Dijital Pasaport' : 'Digital Passport',
      FloatingIcon: CheckCircle2,
    },
    {
      icon: Sparkles,
      badge: t.onboardingBadge3 || (currentLang === 'tr' ? "PASAPORT FOTOĞRAF KARTI" : "PASSPORT PHOTO CARD"),
      title: t.onboarding3Title,
      description: t.onboarding3Desc,
      gradientColors: ['#FAF5FF', '#EFF6FF'],
      iconBg: '#E0E7FF',
      iconColor: '#2563EB',
      floatingTag: currentLang === 'tr' ? '4:3 Pasaport Kartı' : '4:3 Passport Card',
      FloatingIcon: Share2,
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
  const FloatingIcon = active.FloatingIcon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar: Language toggle & Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onToggleLang();
          }}
          activeOpacity={0.7}
          style={styles.langBtn}
        >
          <Languages size={14} color="#2563EB" />
          <Text style={styles.langText}>{currentLang.toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.6}>
          <Text style={styles.skipText}>{t.skip}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Content */}
      <View style={styles.slideArea}>
        {/* Visual Showcase Card */}
        <View style={styles.heroCardWrapper}>
          <LinearGradient
            colors={active.gradientColors}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Ambient Background Watermark Circles */}
            <View style={styles.bgCircleLarge} />
            <View style={styles.bgCircleSmall} />

            {/* Central Icon Bubble */}
            <View style={[styles.mainIconBubble, { backgroundColor: '#FFFFFF' }]}>
              <IconComponent size={56} color={active.iconColor} strokeWidth={1.8} />
            </View>

            {/* Floating Info Pill */}
            <View style={styles.floatingPill}>
              <FloatingIcon size={12} color="#2563EB" strokeWidth={2.5} />
              <Text style={styles.floatingPillText}>{active.floatingTag}</Text>
            </View>
          </LinearGradient>
        </View>

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
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  langText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  slideArea: {
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  heroCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 34,
  },
  heroCard: {
    width: width * 0.78,
    height: 220,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
    overflow: 'hidden',
  },
  bgCircleLarge: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  bgCircleSmall: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mainIconBubble: {
    width: 104,
    height: 104,
    borderRadius: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  floatingPill: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  floatingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  textContainer: {
    alignItems: 'center',
  },
  pillBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 10,
  },
  slideDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
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
    backgroundColor: '#2563EB',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    paddingVertical: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
