import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Flame, Lock, Share2, X } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import Heading from './ui/Heading';
import Button from './ui/Button';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { searchCountries } from '../globe/countryNames';
import {
  buildClues,
  dayKeyOf,
  feedbackFor,
  liveStreak,
  openClueCount,
  puzzleNumber,
  shareText,
} from '../game/dailyCountry';
import {
  BonusMode,
  GameMode,
  MODE_GUESSES,
  bonusShareText,
  bonusUnlocked,
  buildModeClues,
  modeCountryId,
  openModeClueCount,
} from '../game/modes';
import { FlagStage, GuessPips, ModeSegment, ShapeStage } from './game/ModeStages';
import { useGameStore } from '../stores/useGameStore';
import { refreshGameReminder } from '../services/gameReminder';
import { maybeAskForReview } from '../services/reviewService';
import { APP_STORE_URL } from '../utils/links';

import { gt } from '../localization/game';
interface DailyGameModalProps {
  visible: boolean;
  onClose: () => void;
  currentLang: 'tr' | 'en';
}

export default function DailyGameModal({ visible, onClose, currentLang }: DailyGameModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  // KeyboardAvoidingView measures from its parent, not the screen, so inside a page sheet (which starts ~60pt down) it
  // under-corrects and the keyboard covers the input. The sheet's bottom is the screen's bottom, so the keyboard height is exact.
  const [keyboard, setKeyboard] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e) => setKeyboard(e.endCoordinates.height));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboard(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const days = useGameStore((s) => s.days);
  const stats = useGameStore((s) => s.stats);
  const modeDays = useGameStore((s) => s.modeDays);
  const modeStats = useGameStore((s) => s.modeStats);
  const guess = useGameStore((s) => s.guess);
  const reminder = useGameStore((s) => s.reminder);
  const setReminder = useGameStore((s) => s.setReminder);

  // The bonus modes appear after the first finished classic puzzle, so a new player only ever sees one puzzle
  const unlocked = bonusUnlocked(stats);
  const [chosenMode, setMode] = useState<GameMode>('clues');
  const mode: GameMode = unlocked ? chosenMode : 'clues';
  const bonus = mode === 'clues' ? null : (mode as BonusMode);
  const maxGuesses = MODE_GUESSES[mode];

  // Read on every render so a modal left alive past midnight shows the new puzzle
  const today = dayKeyOf();
  const secretId = useMemo(() => modeCountryId(mode, today), [mode, today]);
  const record = bonus ? modeDays[bonus][today] : days[today];
  const done = Boolean(record?.done);
  const clues = useMemo(
    () => (bonus ? buildModeClues(bonus, secretId, currentLang) : buildClues(secretId, currentLang)),
    [bonus, secretId, currentLang]
  );
  const secret = availableCatalog.find((c) => c.id === secretId)!;
  const open = bonus ? openModeClueCount(bonus, record, clues.length) : openClueCount(record);
  const doneByMode: Record<GameMode, boolean> = {
    clues: Boolean(days[today]?.done),
    flag: Boolean(modeDays.flag[today]?.done),
    shape: Boolean(modeDays.shape[today]?.done),
  };

  const close = () => {
    setQuery('');
    onClose();
  };

  const guessed = useMemo(() => record?.guesses ?? [], [record]);
  const suggestions = useMemo(
    () => searchCountries(query, availableCatalog.filter((c) => !guessed.includes(c.id)), 5),
    [query, guessed]
  );

  const submit = (id: string) => {
    const after = guess(id, mode);
    setQuery('');
    if (after.done) {
      Haptics.notificationAsync(
        after.won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
      // the classic puzzle moves the evening reminder to tomorrow, and a win is a good moment to ask for a rating
      if (!bonus) {
        refreshGameReminder();
        if (after.won) setTimeout(() => maybeAskForReview(), 2500);
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onShare = () => {
    if (!record) return;
    const text = bonus ? bonusShareText(bonus, today, record, secretId, currentLang) : shareText(today, record, secretId, currentLang);
    Share.share({ message: `${text}\n${APP_STORE_URL}` }).catch(() => {});
  };

  const streak = liveStreak(stats, today);

  const toggleReminder = async (on: boolean) => {
    const ok = await setReminder(on);
    if (!ok) {
      Alert.alert(
        gt('notif_off_title', currentLang),
        gt('notif_off_body', currentLang)
      );
      return;
    }
    refreshGameReminder();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <View style={[styles.flex, { paddingBottom: Math.max(0, keyboard - insets.bottom) }]}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.eyebrow}>
                {`${bonus ? gt('eyebrow_bonus', currentLang, { mode: gt(`mode_${bonus}` as 'mode_flag', currentLang).toUpperCase() }) : gt('eyebrow', currentLang)} · #${puzzleNumber(today)}`}
              </Text>
              <Heading style={styles.title}>{gt('title', currentLang)}</Heading>
            </View>
            <View style={styles.streak}>
              <Flame size={14} color={colors.gold.base} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {unlocked ? <ModeSegment mode={mode} onChange={(m) => { setMode(m); setQuery(''); }} done={doneByMode} lang={currentLang} /> : null}

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {bonus === 'flag' ? <FlagStage flag={secret.flag} lang={currentLang} /> : null}
            {bonus === 'shape' ? <ShapeStage id={secretId} lang={currentLang} /> : null}
            {bonus ? <GuessPips used={guessed.length} total={maxGuesses} lang={currentLang} /> : null}
            {clues.map((clue, i) => {
              const isOpen = i < open;
              // the bonus modes only hint at the next locked clue; the classic game shows the whole ladder
              if (bonus && !isOpen && i > open) return null;
              return isOpen ? (
                <Animated.View key={i} entering={FadeInDown.duration(320)} style={styles.clue}>
                  <Text style={styles.clueLabel}>{`${i + 1} · ${clue.label.toUpperCase()}`}</Text>
                  <Text style={styles.clueText}>{clue.text}</Text>
                  {clue.flag ? <Text style={styles.clueFlag}>{clue.flag}</Text> : null}
                </Animated.View>
              ) : (
                <View key={i} style={[styles.clue, styles.clueLocked]}>
                  <Lock size={14} color={colors.text.faint} />
                  <Text style={styles.lockedText}>
                    {gt('clue_locked', currentLang, { n: i + 1 })}
                  </Text>
                </View>
              );
            })}

            {guessed.length > 0 && (
              <View style={styles.guesses}>
                {guessed.map((id) => {
                  const c = availableCatalog.find((x) => x.id === id);
                  const fb = feedbackFor(id, secretId);
                  if (!c) return null;
                  const tone =
                    fb === 'correct' ? colors.status.visited : fb === 'continent' ? colors.status.want : null;
                  return (
                    <View
                      key={id}
                      style={[
                        styles.guessRow,
                        tone && { backgroundColor: tone.light, borderColor: tone.border },
                        !tone && { backgroundColor: colors.dangerTint, borderColor: colors.dangerBorder },
                      ]}
                    >
                      <Text style={styles.guessFlag}>{c.flag}</Text>
                      <Text style={styles.guessName}>{getLocalizedCountryName(c, currentLang)}</Text>
                      <Text style={styles.guessNote}>
                        {fb === 'correct'
                          ? gt('fb_correct', currentLang)
                          : fb === 'continent'
                            ? gt('fb_continent', currentLang)
                            : gt('fb_wrong', currentLang)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {done && record && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.result}>
                <Text style={styles.resultFlag}>{secret.flag}</Text>
                <Heading style={styles.resultTitle}>
                  {record.won
                    ? gt('found_in', currentLang, { n: record.guesses.length })
                    : gt('not_today', currentLang)}
                </Heading>
                <Text style={styles.resultName}>{getLocalizedCountryName(secret, currentLang)}</Text>
                <Text style={styles.resultSub}>
                  {bonus
                    ? gt('bonus_result_note', currentLang)
                    : gt('stats_line', currentLang, { streak, best: stats.best, won: stats.won, played: stats.played })}
                </Text>
                {!bonus && stats.played === 1 ? (
                  <View style={styles.unlock} accessible accessibilityLabel={`${gt('unlock_title', currentLang)}. ${gt('unlock_body', currentLang)}`}>
                    <Text style={styles.unlockTitle}>{gt('unlock_title', currentLang)}</Text>
                    <Text style={styles.unlockBody}>{gt('unlock_body', currentLang)}</Text>
                  </View>
                ) : null}
                <GuessDistribution
                  dist={bonus ? modeStats[bonus].dist : stats.dist}
                  highlight={record.won ? record.guesses.length - 1 : -1}
                  losses={bonus ? Math.max(0, modeStats[bonus].played - modeStats[bonus].won) : Math.max(0, stats.played - stats.won)}
                  lang={currentLang}
                />
                <Button
                  label={gt('share', currentLang)}
                  onPress={onShare}
                  icon={(color) => <Share2 size={16} color={color} />}
                />
                {bonus ? null : (
                  <View style={styles.reminderRow}>
                    <Text style={styles.reminderText}>
                      {gt('reminder', currentLang)}
                    </Text>
                    <Switch
                      value={reminder}
                      onValueChange={toggleReminder}
                      trackColor={{ true: colors.gold.base }}
                      accessibilityLabel={gt('reminder_a11y', currentLang)}
                    />
                  </View>
                )}
                <Text style={styles.resultNext}>
                  {gt('next_country', currentLang)}
                </Text>
              </Animated.View>
            )}
          </ScrollView>

          {!done && (
            <View style={styles.inputArea}>
              {suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {suggestions.map((c) => (
                    <TouchableOpacity key={c.id} style={styles.suggestion} onPress={() => submit(c.id)} activeOpacity={0.7}>
                      <Text style={styles.guessFlag}>{c.flag}</Text>
                      <Text style={styles.suggestionText}>{getLocalizedCountryName(c, currentLang)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput accessibilityLabel={gt('search', currentLang)}
                value={query}
                onChangeText={setQuery}
                placeholder={gt('search', currentLang)}
                placeholderTextColor={colors.text.faint}
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => suggestions[0] && submit(suggestions[0].id)}
              />
              {bonus ? null : (
                <Text style={styles.remaining}>
                  {gt('guesses_left', currentLang, { n: maxGuesses - guessed.length })}
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/** Wordle-style bars: how many wins took 1..6 guesses. Wins from before this was tracked are not counted. */
function GuessDistribution({ dist, highlight, losses, lang }: { dist: number[]; highlight: number; losses: number; lang: 'tr' | 'en' }) {
  const styles = useStyles();
  const max = Math.max(1, ...dist);
  const summary = dist.map((n, i) => `${i + 1}: ${n}`).join(', ');
  return (
    <View
      style={styles.dist}
      accessible
      accessibilityLabel={`${gt('dist_a11y', lang)}. ${summary}. ${gt('dist_lost', lang)}: ${losses}`}
    >
      <Text style={styles.distTitle}>{gt('dist_title', lang)}</Text>
      {dist.map((n, i) => (
        <View key={i} style={styles.distRow}>
          <Text style={styles.distIndex}>{i + 1}</Text>
          <View style={styles.distTrack}>
            <View style={[styles.distBar, i === highlight && styles.distBarNow, { width: `${Math.max(n ? 8 : 0, (n / max) * 100)}%` }]} />
          </View>
          <Text style={styles.distCount}>{n}</Text>
        </View>
      ))}
      <Text style={styles.distLost}>{gt('dist_missed', lang, { n: losses })}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 8 },
    eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: colors.gold.base },
    title: { fontSize: 26, color: colors.text.primary, fontFamily: fonts.display },
    streak: {
      flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: 16,
      backgroundColor: colors.gold.tint, borderWidth: 1, borderColor: colors.gold.border,
    },
    streakText: { fontSize: 13, fontWeight: '800', color: colors.gold.base },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.glass.fill,
    },
    body: { padding: 20, paddingTop: 8, gap: 10 },
    clue: {
      padding: 16, borderRadius: 20, gap: 6, backgroundColor: colors.panel.base,
      borderWidth: 1, borderColor: colors.glass.hairline,
    },
    clueLocked: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, opacity: 0.6 },
    clueLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.gold.base },
    clueText: { fontSize: 16, lineHeight: 22, color: colors.text.primary },
    clueFlag: { fontSize: 44, marginTop: 4 },
    lockedText: { fontSize: 13, color: colors.text.faint },
    guesses: { gap: 8, marginTop: 6 },
    guessRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 46,
      borderRadius: 14, borderWidth: 1,
    },
    guessFlag: { fontSize: 20 },
    guessName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text.primary },
    guessNote: { fontSize: 12, color: colors.text.secondary },
    result: {
      alignItems: 'center', gap: 8, padding: 20, borderRadius: 24, marginTop: 6,
      backgroundColor: colors.panel.raised, borderWidth: 1, borderColor: colors.gold.border,
    },
    resultFlag: { fontSize: 64 },
    resultTitle: { fontSize: 24, color: colors.text.primary, fontFamily: fonts.display, textAlign: 'center' },
    resultName: { fontSize: 16, fontWeight: '700', color: colors.gold.base },
    resultSub: { fontSize: 12, color: colors.text.secondary, marginBottom: 6 },
    dist: { alignSelf: 'stretch', gap: 4, paddingVertical: 6 },
    distTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: colors.text.muted, marginBottom: 2 },
    distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    distIndex: { width: 12, fontSize: 12, fontWeight: '700', color: colors.text.secondary },
    distTrack: { flex: 1, height: 14, borderRadius: 4, backgroundColor: colors.glass.fill, overflow: 'hidden' },
    distBar: { height: 14, borderRadius: 4, backgroundColor: colors.text.faint },
    distBarNow: { backgroundColor: colors.gold.base },
    distCount: { width: 24, fontSize: 12, color: colors.text.secondary, textAlign: 'right' },
    distLost: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
    unlock: {
      alignSelf: 'stretch', padding: 12, borderRadius: 16, gap: 2, backgroundColor: colors.gold.tint,
      borderWidth: 1, borderColor: colors.gold.border,
    },
    unlockTitle: { fontSize: 14, fontWeight: '700', color: colors.gold.base },
    unlockBody: { fontSize: 12, color: colors.text.secondary },
    resultNext: { fontSize: 12, color: colors.text.muted },
    reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 6 },
    reminderText: { fontSize: 13, color: colors.text.secondary },
    inputArea: { padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.glass.hairline },
    suggestions: {
      borderRadius: 16, overflow: 'hidden', backgroundColor: colors.canvas.elevated,
      borderWidth: 1, borderColor: colors.glass.hairline,
    },
    suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 44 },
    suggestionText: { fontSize: 15, color: colors.text.primary },
    input: {
      height: 48, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, color: colors.text.primary,
      backgroundColor: colors.glass.fillStrong, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    remaining: { fontSize: 12, color: colors.text.muted, textAlign: 'center' },
  })
);
