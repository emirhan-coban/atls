import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy, Share2, X } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import Heading from './ui/Heading';
import Button from './ui/Button';
import AnimatedCounter from './AnimatedCounter';
import { availableCatalog } from '../data/travelData';
import { Country, Profile } from '../stores/types';
import { useCompareStore } from '../stores/useCompareStore';
import { buildCompareLink, compareVisited, decodeVisited, inviteProblem, parseInvite } from '../utils/compareCode';

import { ct } from '../localization/compare';
interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  profile: Profile;
  currentLang: 'tr' | 'en';
}

const flagsOf = (ids: string[]) => ids.map((id) => availableCatalog.find((c) => c.id === id)?.flag ?? '🏳️');

/** Passport clash: send your visited list as a link, paste a friend's link or code, see what you share. */
export default function CompareModal({ visible, onClose, countries, profile, currentLang }: CompareModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const invite = useCompareStore((s) => s.invite);
  const setInvite = useCompareStore((s) => s.setInvite);
  const [pasted, setPasted] = useState('');
  const [problem, setProblem] = useState<'invalid' | 'newer' | null>(null);
  const [copied, setCopied] = useState(false);

  const mine = useMemo(
    () => countries.filter((c) => c.status === 'visited' || c.status === 'lived').map((c) => c.id),
    [countries]
  );
  const result = useMemo(() => {
    const theirs = invite ? decodeVisited(invite.code) : null;
    return theirs ? { theirs, ...compareVisited(mine, theirs) } : null;
  }, [invite, mine]);

  const inviteMessage = () => {
    const link = buildCompareLink(mine, profile.name || '');
    const intro = ct('intro', currentLang);
    return `${intro}\n${link}`;
  };

  const send = () => {
    Share.share({ message: inviteMessage() }).catch(() => {});
  };

  // The https invite link is tappable in chats; copying the message still lets someone paste it into the app by hand
  const copy = async () => {
    await Clipboard.setStringAsync(inviteMessage());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compare = () => {
    const parsed = parseInvite(pasted);
    setProblem(parsed ? null : inviteProblem(pasted));
    if (parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInvite(parsed);
      setPasted('');
    }
  };

  const who = invite?.name || ct('friend', currentLang);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <View style={styles.header}>
          <Heading style={styles.title}>{ct('title', currentLang)}</Heading>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {result ? (
            <>
              <View style={styles.hero}>
                <AnimatedCounter
                  value={result.overlap}
                  formatter={(v) => (currentLang === 'tr' ? `%${Math.round(v)}` : `${Math.round(v)}%`)}
                  style={styles.overlap}
                />
                <Text style={styles.heroSub}>
                  {ct('match', currentLang, { who })}
                </Text>
              </View>

              <Section
                styles={styles}
                title={ct('both', currentLang, { n: result.both.length })}
                flags={flagsOf(result.both)}
                empty={ct('both_empty', currentLang)}
              />
              <Section
                styles={styles}
                title={ct('only_me', currentLang, { n: result.onlyMine.length })}
                flags={flagsOf(result.onlyMine)}
                empty="—"
              />
              <Section
                styles={styles}
                title={ct('only_them', currentLang, { who, n: result.onlyTheirs.length })}
                flags={flagsOf(result.onlyTheirs)}
                empty="—"
              />
              <Button label={ct('again', currentLang)} variant="secondary" onPress={() => setInvite(null)} />
            </>
          ) : (
            <>
              <Text style={styles.lead}>
                {ct('lead', currentLang)}
              </Text>
              <Button
                label={ct('send', currentLang)}
                onPress={send}
                icon={(color) => <Share2 size={16} color={color} />}
              />
              <Button
                label={copied ? ct('copied', currentLang) : ct('copy', currentLang)}
                variant="secondary"
                onPress={copy}
                icon={(color) => (copied ? <Check size={16} color={color} /> : <Copy size={16} color={color} />)}
              />

              <Text style={styles.sectionTitle}>{ct('from_friend', currentLang)}</Text>
              <TextInput accessibilityLabel={ct('paste', currentLang)}
                value={pasted}
                onChangeText={(v) => {
                  setPasted(v);
                  setProblem(null);
                }}
                placeholder={ct('paste', currentLang)}
                placeholderTextColor={colors.text.faint}
                style={[styles.input, problem && { borderColor: colors.danger }]}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              {problem && (
                <Text style={styles.error}>
                  {problem === 'newer' ? ct('newer', currentLang) : ct('invalid', currentLang)}
                </Text>
              )}
              <Button label={ct('compare', currentLang)} variant="secondary" onPress={compare} disabled={!pasted.trim()} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ styles, title, flags, empty }: { styles: ReturnType<typeof useStyles>; title: string; flags: string[]; empty: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {flags.length ? (
        <View style={styles.flags}>
          {flags.map((f, i) => (
            <Text key={i} style={styles.flag}>
              {f}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{empty}</Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
    title: { fontSize: 26, color: colors.text.primary, fontFamily: fonts.display },
    closeBtn: {
      width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.glass.fill,
    },
    body: { padding: 20, gap: 14 },
    lead: { fontSize: 15, lineHeight: 22, color: colors.text.secondary },
    hero: { alignItems: 'center', gap: 4, paddingVertical: 12 },
    overlap: { fontSize: 72, color: colors.gold.base, fontFamily: fonts.display },
    heroSub: { fontSize: 14, color: colors.text.secondary },
    section: {
      gap: 10, padding: 16, borderRadius: 20, backgroundColor: colors.panel.base,
      borderWidth: 1, borderColor: colors.glass.hairline,
    },
    sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, color: colors.gold.base, marginTop: 6 },
    flags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    flag: { fontSize: 28 },
    empty: { fontSize: 13, color: colors.text.muted },
    input: {
      minHeight: 88, borderRadius: 14, padding: 14, fontSize: 14, color: colors.text.primary, textAlignVertical: 'top',
      backgroundColor: colors.glass.fillStrong, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    error: { fontSize: 12, color: colors.danger },
  })
);
