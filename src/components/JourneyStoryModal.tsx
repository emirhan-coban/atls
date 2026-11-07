import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { RotateCcw, Share2, X } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import AnimatedCounter from './AnimatedCounter';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { resolveHomeCountry } from '../globe/homeCountry';
import { computeStoryFacts } from '../utils/storyFacts';
import { Country, Profile } from '../stores/types';

interface JourneyStoryModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  profile: Profile;
  currentLang: 'tr' | 'en';
}

const MAX_FLAGS = 30;
const FLAG_STEP = 70; // ms between flags
const REEL_START = 1500;

export default function JourneyStoryModal({ visible, onClose, countries, profile, currentLang }: JourneyStoryModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const tr = currentLang === 'tr';
  const cardRef = useRef<View>(null);
  const [run, setRun] = useState(0); // bumping the key replays every entering animation
  const [readyRun, setReadyRun] = useState(-1); // the run whose animation has finished
  const ready = readyRun === run;
  const [sharing, setSharing] = useState(false);

  const facts = useMemo(
    () => computeStoryFacts(countries, resolveHomeCountry(profile, availableCatalog).iso2, availableCatalog.length),
    [countries, profile]
  );
  const flags = facts.reel.slice(-MAX_FLAGS);
  const factsAt = REEL_START + flags.length * FLAG_STEP + 300;
  const farthest = facts.farthest ? availableCatalog.find((c) => c.id === facts.farthest!.id) : null;

  // Sharing is only offered once the last element has landed, so the picture is the finished frame
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setReadyRun(run), factsAt + 900);
    return () => clearTimeout(t);
  }, [visible, run, factsAt]);

  // A new run on every open, so reopening replays the animation and locks sharing until it ends again
  const close = () => {
    setRun((r) => r + 1);
    onClose();
  };

  const replay = () => {
    Haptics.selectionAsync();
    setRun((r) => r + 1);
  };

  const share = async () => {
    if (!cardRef.current || sharing) return;
    try {
      setSharing(true);
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
      } else {
        Alert.alert(tr ? 'Bilgi' : 'Notice', tr ? 'Paylaşım bu cihazda desteklenmiyor.' : 'Sharing is not available on this device.');
      }
    } catch (e) {
      console.warn('[JourneyStoryModal] share failed:', e);
      Alert.alert(tr ? 'Hata' : 'Error', tr ? 'Hikaye hazırlanamadı.' : 'Could not prepare the story.');
    } finally {
      setSharing(false);
    }
  };

  const { width, height } = Dimensions.get('window');
  const cardHeight = Math.min(height - 220, (width - 40) * (16 / 9));
  const cardWidth = cardHeight * (9 / 16);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>{tr ? 'Yolculuk Hikâyem' : 'My Journey Story'}</Text>
          <TouchableOpacity onPress={close} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.stage}>
          <View ref={cardRef} collapsable={false} style={{ width: cardWidth, height: cardHeight }}>
            <LinearGradient colors={['#0B1220', '#14233F', '#2A1B05']} style={styles.card}>
              <View key={run} style={styles.cardInner}>
                <View style={styles.brandRow}>
                  <Animated.Text entering={FadeIn.duration(500)} style={styles.brand}>
                    atls.
                  </Animated.Text>
                  {/* a shared PNG cannot carry a link, so the card itself says where to get the app */}
                  <Animated.Text entering={FadeIn.delay(factsAt).duration(500)} style={styles.storeHint}>
                    {tr ? "App Store'da ücretsiz" : 'Free on the App Store'}
                  </Animated.Text>
                </View>

                <View style={styles.hero}>
                  <Animated.Text entering={FadeInDown.delay(250).duration(500)} style={styles.eyebrow}>
                    {tr ? 'DÜNYANIN' : 'I HAVE SEEN'}
                  </Animated.Text>
                  <Animated.View entering={FadeInDown.delay(450).duration(600)}>
                    <AnimatedCounter
                      value={facts.percent}
                      duration={1100}
                      formatter={(v) => (tr ? `%${v.toFixed(1)}` : `${v.toFixed(1)}%`)}
                      style={styles.percent}
                    />
                  </Animated.View>
                  <Animated.Text entering={FadeInDown.delay(900).duration(500)} style={styles.eyebrow}>
                    {tr ? 'KADARINI GEZDİM' : 'OF THE WORLD'}
                  </Animated.Text>
                </View>

                <View style={styles.reel}>
                  {flags.map((c, i) => (
                    <Animated.Text
                      key={c.id}
                      entering={ZoomIn.delay(REEL_START + i * FLAG_STEP).springify().damping(14)}
                      style={styles.flag}
                    >
                      {c.flag}
                    </Animated.Text>
                  ))}
                </View>

                <Animated.View entering={FadeInDown.delay(factsAt).duration(600)} style={styles.facts}>
                  <Fact value={String(facts.count)} label={tr ? 'ülke' : 'countries'} styles={styles} />
                  <Fact value={String(facts.continents)} label={tr ? 'kıta' : 'continents'} styles={styles} />
                  {farthest && facts.farthest ? (
                    <Fact
                      value={`${facts.farthest.km.toLocaleString(tr ? 'tr-TR' : 'en-US')} km`}
                      label={`${farthest.flag} ${getLocalizedCountryName(farthest, currentLang)}`}
                      styles={styles}
                    />
                  ) : null}
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={replay} style={styles.secondaryBtn} activeOpacity={0.8}>
            <RotateCcw size={16} color={colors.text.primary} />
            <Text style={styles.secondaryText}>{tr ? 'Tekrar oynat' : 'Replay'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={share}
            disabled={!ready || sharing}
            style={[styles.primaryBtn, (!ready || sharing) && { opacity: 0.5 }]}
            activeOpacity={0.85}
          >
            <Share2 size={16} color={colors.gold.onGold} />
            <Text style={styles.primaryText}>{tr ? 'Story olarak paylaş' : 'Share as story'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Fact({ value, label, styles }: { value: string; label: string; styles: ReturnType<typeof useStyles> }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.factLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
    topTitle: { fontSize: 18, color: colors.text.primary, fontFamily: fonts.display },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.glass.fill,
    },
    stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: { flex: 1, borderRadius: 28, overflow: 'hidden' },
    cardInner: { flex: 1, padding: 24, justifyContent: 'space-between' },
    brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    brand: { fontSize: 22, color: '#F3C766', fontFamily: fonts.display },
    storeHint: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    hero: { alignItems: 'center', gap: 4 },
    eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 2.5, color: 'rgba(255,255,255,0.7)' },
    percent: { fontSize: 76, color: '#FFFFFF', fontFamily: fonts.display },
    reel: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, minHeight: 120 },
    flag: { fontSize: 30 },
    facts: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    fact: { flex: 1, alignItems: 'center', gap: 2 },
    factValue: { fontSize: 22, color: '#F3C766', fontFamily: fonts.display },
    factLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 12, padding: 20 },
    secondaryBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, paddingHorizontal: 18,
      borderRadius: 16, backgroundColor: colors.glass.fillStrong, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    secondaryText: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
    primaryBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52,
      borderRadius: 16, backgroundColor: colors.gold.base,
    },
    primaryText: { fontSize: 15, fontWeight: '800', color: colors.gold.onGold },
  })
);
