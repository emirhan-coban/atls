import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight, Sparkles, Award } from 'lucide-react-native';
import Heading from '../ui/Heading';
import { tOnboardingScreen } from '../../localization/screens/OnboardingScreen';
import type { OnboardingCtx } from './useOnboarding';

export function PayoffStep({ ctx }: { ctx: OnboardingCtx }) {
  const { colors, currentLang, exploredPercent, renderTopBar, setStep, styles, t, totalCount, visitedContinentsCount } = ctx;
  const badgeName = totalCount >= 5 ? 'Küresel Kaşif' : (totalCount >= 2 ? 'Sınır Tanımaz' : 'İlk Adım');

    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(3, 4)}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.payoffScrollContent}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.payoffHeader}>
            <View style={styles.celebrationBadge}>
              <Sparkles size={14} color={colors.gold.base} />
              <Text style={styles.celebrationBadgeText}>PASAPORTUN HAZIRLANIYOR</Text>
            </View>

            <Heading style={styles.payoffTitle}>
              {t?.resultTitle || 'Pasaportun Şekillendi! 🌍'}
            </Heading>
          </Animated.View>

          {/* Large Stat Box */}
          <Animated.View entering={FadeIn.delay(200).duration(700)} style={styles.statHeroBox}>
            <Text style={styles.statHeroPercent}>%{exploredPercent}</Text>
            <Text style={styles.statHeroLabel}>DÜNYA KEŞFİ TAMAMLANDI</Text>

            <View style={styles.statDivider} />

            <View style={styles.statTrioRow}>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{totalCount}</Text>
                <Text style={styles.statTrioLabel}>{t?.countriesLabel || 'ÜLKE'}</Text>
              </View>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{visitedContinentsCount}</Text>
                <Text style={styles.statTrioLabel}>{t?.continentsLabel || 'KITA'}</Text>
              </View>
              <View style={styles.statTrioItem}>
                <Text style={styles.statTrioNum}>{totalCount}</Text>
                <Text style={styles.statTrioLabel}>{tOnboardingScreen('marked', currentLang)}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Unlocked Badge Showcase */}
          <Animated.View entering={FadeInUp.delay(350).duration(600)} style={styles.badgeUnlockCard}>
            <View style={styles.badgeUnlockHeader}>
              <Award size={16} color={colors.gold.deep} />
              <Text style={styles.badgeUnlockSub}>{t?.badgeUnlockedTitle || 'İLK ROZETİN AÇILDI'}</Text>
            </View>

            <View style={styles.badgeMedalIcon}>
              <Award size={48} color={colors.gold.deep} strokeWidth={1.8} />
            </View>

            <Text style={styles.badgeNameText}>{badgeName}</Text>
            <Text style={styles.badgeDescText}>
              {tOnboardingScreen('your_border_credentials_have_been', currentLang)}
            </Text>
          </Animated.View>

          {/* Action Button */}
          <View style={styles.payoffActionWrap}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep(6);
              }}
              style={styles.primaryActionButton}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>
                {t?.finishWishlistBtn || 'Pasaportumu Kaydet'}
              </Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
}
