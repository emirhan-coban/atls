import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Share2, X } from 'lucide-react-native';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import Heading from './ui/Heading';
import Button from './ui/Button';
import AnimatedCounter from './AnimatedCounter';
import { availableCatalog } from '../data/travelData';
import { Country, Profile } from '../stores/types';
import { useCompareStore } from '../stores/useCompareStore';
import { buildCompareLink, compareVisited, decodeVisited, parseInvite } from '../utils/compareCode';

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
  const tr = currentLang === 'tr';
  const invite = useCompareStore((s) => s.invite);
  const setInvite = useCompareStore((s) => s.setInvite);
  const [pasted, setPasted] = useState('');
  const [invalid, setInvalid] = useState(false);

  const mine = useMemo(
    () => countries.filter((c) => c.status === 'visited' || c.status === 'lived').map((c) => c.id),
    [countries]
  );
  const result = useMemo(() => {
    const theirs = invite ? decodeVisited(invite.code) : null;
    return theirs ? { theirs, ...compareVisited(mine, theirs) } : null;
  }, [invite, mine]);

  const send = () => {
    const link = buildCompareLink(mine, profile.name || '');
    const intro = tr
      ? `Pasaportlarımızı çarpıştıralım! Bağlantıyı atls uygulamasında aç ya da kodu yapıştır:`
      : `Let's clash our passports! Open the link in atls. or paste the code:`;
    Share.share({ message: `${intro}\n${link}` }).catch(() => {});
  };

  const compare = () => {
    const parsed = parseInvite(pasted);
    setInvalid(!parsed);
    if (parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInvite(parsed);
      setPasted('');
    }
  };

  const who = invite?.name || (tr ? 'Arkadaşın' : 'Your friend');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <View style={styles.header}>
          <Heading style={styles.title}>{tr ? 'Pasaport çarpıştır' : 'Passport clash'}</Heading>
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
                  formatter={(v) => `%${Math.round(v)}`}
                  style={styles.overlap}
                />
                <Text style={styles.heroSub}>
                  {tr ? `${who} ile pasaport uyumu` : `Passport match with ${who}`}
                </Text>
              </View>

              <Section
                styles={styles}
                title={tr ? `İkiniz de gittiniz · ${result.both.length}` : `You both went · ${result.both.length}`}
                flags={flagsOf(result.both)}
                empty={tr ? 'Henüz ortak ülke yok.' : 'No shared countries yet.'}
              />
              <Section
                styles={styles}
                title={tr ? `Sadece sen · ${result.onlyMine.length}` : `Only you · ${result.onlyMine.length}`}
                flags={flagsOf(result.onlyMine)}
                empty="—"
              />
              <Section
                styles={styles}
                title={tr ? `Sadece ${who} · ${result.onlyTheirs.length}` : `Only ${who} · ${result.onlyTheirs.length}`}
                flags={flagsOf(result.onlyTheirs)}
                empty="—"
              />
              <Button label={tr ? 'Başka biriyle karşılaştır' : 'Compare with someone else'} variant="secondary" onPress={() => setInvite(null)} />
            </>
          ) : (
            <>
              <Text style={styles.lead}>
                {tr
                  ? 'Pasaportunu bir arkadaşına gönder; ikinizin ortak ve farklı ülkelerini yan yana gör. Sadece ziyaret ettiğin ülkelerin listesi paylaşılır.'
                  : "Send your passport to a friend and see the countries you share and the ones you don't. Only your visited-country list is shared."}
              </Text>
              <Button
                label={tr ? 'Pasaportumu gönder' : 'Send my passport'}
                onPress={send}
                icon={(color) => <Share2 size={16} color={color} />}
              />

              <Text style={styles.sectionTitle}>{tr ? 'ARKADAŞINDAN GELDİ Mİ?' : 'GOT ONE FROM A FRIEND?'}</Text>
              <TextInput
                value={pasted}
                onChangeText={(v) => {
                  setPasted(v);
                  setInvalid(false);
                }}
                placeholder={tr ? 'Mesajı, bağlantıyı ya da kodu buraya yapıştır' : 'Paste the message, link or code here'}
                placeholderTextColor={colors.text.faint}
                style={[styles.input, invalid && { borderColor: colors.danger }]}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
              {invalid && (
                <Text style={styles.error}>
                  {tr ? 'Bu bir atls. pasaport kodu gibi görünmüyor.' : "That doesn't look like an atls. passport code."}
                </Text>
              )}
              <Button label={tr ? 'Karşılaştır' : 'Compare'} variant="secondary" onPress={compare} disabled={!pasted.trim()} />
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
