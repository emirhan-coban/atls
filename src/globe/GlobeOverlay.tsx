import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Search, X } from 'lucide-react-native';
import { darkColors as colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { availableCatalog } from '../data/travelData';
import { searchCountries, shortenName } from './countryNames';

interface Props {
  markedCount: number;
  lang: 'tr' | 'en';
  /** Stat line and search rise in once the opening cinematic is done. */
  show: boolean;
  /** A country is open: the stat line would run into the globe, so only the search stays. */
  hideStat?: boolean;
  onPickCountry: (iso: string) => void;
}

/** The only thing floating over the globe: one stat line and a search that opens into a hairline field. */
export default function GlobeOverlay({ markedCount, lang, show, hideStat, onPickCountry }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const total = availableCatalog.length;
  const percent = Math.round((markedCount / total) * 100);
  const results = useMemo(() => searchCountries(query, availableCatalog, 6), [query]);

  if (!show) return null;

  const stat =
    lang === 'tr'
      ? `${markedCount} ülke · dünyanın %${percent}'i`
      : `${markedCount} ${markedCount === 1 ? 'country' : 'countries'} · ${percent}% of the world`;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.wrap} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        {open ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.field}>
            <Search size={16} color={colors.text.secondary} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={lang === 'tr' ? 'Ülke ara' : 'Search a country'}
              placeholderTextColor={colors.text.faint}
              style={styles.input}
              returnKeyType="search"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={close} hitSlop={10}>
              <X size={16} color={colors.text.secondary} />
            </TouchableOpacity>
            <View style={[styles.hairline, focused && styles.hairlineOn]} />
          </Animated.View>
        ) : (
          <>
            <Text style={[styles.stat, hideStat && styles.hidden]} pointerEvents="none">{stat}</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setOpen(true);
              }}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel={lang === 'tr' ? 'Ülke ara' : 'Search'}
            >
              <Search size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
      {open && results.length ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={styles.results}>
          {results.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.result}
              onPress={() => {
                Haptics.selectionAsync();
                close();
                onPickCountry(c.id);
              }}
            >
              <Text style={styles.flag}>{c.flag}</Text>
              <Text style={styles.resultName} numberOfLines={1}>{shortenName(lang === 'tr' ? c.nameTr : c.name)}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 10, left: 20, right: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  stat: { color: colors.text.soft, fontFamily: fonts.displayItalic, fontSize: 20, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  hidden: { opacity: 0 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong, borderWidth: 1, borderColor: colors.glass.hairline },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  input: { flex: 1, color: colors.text.primary, fontSize: 17, padding: 0 },
  hairline: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.glass.border },
  hairlineOn: { backgroundColor: colors.gold.base, height: 1 },
  results: { marginTop: 8, borderRadius: 14, backgroundColor: 'rgba(14,18,24,0.88)', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glass.border, overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  flag: { fontSize: 18 },
  resultName: { color: colors.text.primary, fontSize: 15, flex: 1 },
});
