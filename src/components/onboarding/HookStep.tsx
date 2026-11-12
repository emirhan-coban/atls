import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Compass, ArrowRight, Languages } from 'lucide-react-native';
import WorldMap from '../WorldMap';
import Heading from '../ui/Heading';
import { tOnboardingScreen } from '../../localization/screens/OnboardingScreen';
import type { OnboardingCtx } from './useOnboarding';

export function HookStep({ ctx }: { ctx: OnboardingCtx }) {
  const { colors, currentLang, onToggleLang, setAuthTab, setStep, styles, t } = ctx;
  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.hookTopBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              onToggleLang();
            }}
            style={styles.langPill}
            activeOpacity={0.7}
          >
            <Languages size={12} color={colors.gold.base} />
            <Text style={styles.langPillText}>{currentLang.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hookContent}>
          {/* Animated Vector World Map Preview */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.hookMapWrapper}>
            <WorldMap
              countries={[]}
              activeFilter="all"
              interactive={false}
              t={t}
              currentLang={currentLang}
              showControls={false}
              style={styles.hookMapCard}
            />
          </Animated.View>

          {/* Headline & Value Proposition */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.hookTextCol}>
            <View style={styles.hookBadge}>
              <Compass size={12} color={colors.gold.base} strokeWidth={2.5} />
              <Text style={styles.hookBadgeText}>
                {tOnboardingScreen('digital_world_passport', currentLang)}
              </Text>
            </View>

            <Heading style={styles.hookMainTitle}>
              {t?.onboardingPromise || 'Dünyanın ne kadarını gezdin?'}
            </Heading>

            <Text style={styles.hookSubTitle}>
              {t?.onboardingPromiseSub || 'Seyahatlerini haritalandır, ülkelerini işaretle ve kişisel dünya pasaportunu başlat.'}
            </Text>
          </Animated.View>
        </View>

        {/* Action Button & Sign In Shortcut */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.hookFooter}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStep(2);
            }}
            activeOpacity={0.88}
            style={styles.primaryActionButton}
          >
            <Text style={styles.primaryActionButtonText}>
              {t?.startPassportBtn || 'Pasaportumu Başlat'}
            </Text>
            <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAuthTab('login');
              setStep(6);
            }}
            style={styles.signInShortcutBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.signInShortcutText}>
              {t?.alreadyHaveAccount || 'Zaten bir hesabın var mı? Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
}
