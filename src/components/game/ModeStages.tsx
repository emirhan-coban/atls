import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { makeStyles, useTheme } from '../../theme/ThemeContext';
import { gt } from '../../localization/game';
import { silhouetteFor } from '../../game/silhouette';
import { ALL_MODES, GameMode, MODE_GUESSES } from '../../game/modes';

type Lang = 'tr' | 'en';

/** Classic / Flag / Silhouette switch. Mounted only once the bonus modes are unlocked. */
export function ModeSegment({ mode, onChange, done, lang }: { mode: GameMode; onChange: (m: GameMode) => void; done: Record<GameMode, boolean>; lang: Lang }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.seg} accessibilityRole="tablist">
      {ALL_MODES.map((m) => {
        const on = m === mode;
        return (
          <TouchableOpacity
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${gt(`mode_${m}` as 'mode_clues', lang)}${done[m] ? ' ✓' : ''}`}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(m);
            }}
            style={[styles.chip, on && styles.chipOn]}
          >
            {done[m] ? <Check size={14} color={on ? colors.gold.onGold : colors.status.visited.bright} /> : null}
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{gt(`mode_${m}` as 'mode_clues', lang)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Big flag of the day. The accessibility label stays neutral so it never names the country. */
export function FlagStage({ flag, lang }: { flag: string; lang: Lang }) {
  const styles = useStyles();
  return (
    <View style={styles.stage}>
      <Text style={styles.stageTag}>{gt('flag_tag', lang, { n: MODE_GUESSES.flag })}</Text>
      <Text style={styles.flag} accessibilityRole="image" accessibilityLabel={gt('flag_a11y', lang)}>
        {flag}
      </Text>
    </View>
  );
}

/** The country's outline, north up, drawn from the world map data. */
export function ShapeStage({ id, lang }: { id: string; lang: Lang }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const shape = silhouetteFor(id);
  return (
    <View style={styles.stage}>
      <Text style={styles.stageTag}>{gt('shape_tag', lang)}</Text>
      {shape ? (
        <Svg viewBox={shape.viewBox} width="78%" height="82%" accessibilityRole="image" accessibilityLabel={gt('shape_a11y', lang)}>
          <Path d={shape.d} fill={colors.gold.base} fillOpacity={0.92} stroke={colors.gold.light} strokeWidth={0.12} strokeLinejoin="round" />
        </Svg>
      ) : null}
    </View>
  );
}

/** One bar per guess, used ones in the warning tone, plus the remaining count. */
export function GuessPips({ used, total, lang }: { used: number; total: number; lang: Lang }) {
  const styles = useStyles();
  return (
    <View style={styles.pips} accessible accessibilityLabel={gt('guesses_used_a11y', lang, { used, total })}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.pip, i < used && styles.pipUsed]} />
      ))}
      <Text style={styles.pipsLeft}>{gt('guesses_left', lang, { n: total - used })}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    seg: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 4 },
    chip: {
      flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 22,
      backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    chipOn: { backgroundColor: colors.gold.base, borderColor: colors.gold.base },
    chipText: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
    chipTextOn: { color: colors.gold.onGold, fontWeight: '700' },
    stage: {
      height: 230, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      backgroundColor: colors.canvas.surface, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    stageTag: { position: 'absolute', left: 16, top: 14, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.text.muted },
    flag: { fontSize: 140, lineHeight: 168, marginTop: 14 },
    pips: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 },
    pip: { width: 26, height: 8, borderRadius: 4, backgroundColor: colors.glass.fillActive },
    pipUsed: { backgroundColor: colors.status.want.color },
    pipsLeft: { marginLeft: 'auto', fontSize: 12, color: colors.text.muted },
  })
);
