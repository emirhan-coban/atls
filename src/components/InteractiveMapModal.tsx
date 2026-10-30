import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Plus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorldMap from './WorldMap';
import Heading from './ui/Heading';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/typography';
import { availableCatalog } from '../data/travelData';
import { Country } from '../stores/types';

type Filter = 'all' | 'visited' | 'lived' | 'want';

interface InteractiveMapModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  onSelectCountry: (countryId: string) => void;
  currentLang: 'tr' | 'en';
  t?: Record<string, any>;
  initialFilter?: Filter;
}

/** Full map in a sheet: filter chips on top (they double as the colour legend), the map fills the rest. */
export default function InteractiveMapModal({
  visible,
  onClose,
  countries = [],
  onSelectCountry,
  currentLang = 'tr',
  t,
  initialFilter = 'all',
}: InteractiveMapModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tr = currentLang === 'tr';
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveFilter(initialFilter);
      setSelectedId(null);
    }
  }, [visible, initialFilter]);

  const counts = useMemo(
    () => ({
      all: countries.length,
      visited: countries.filter((c) => c.status === 'visited').length,
      lived: countries.filter((c) => c.status === 'lived').length,
      want: countries.filter((c) => c.status === 'want').length,
    }),
    [countries]
  );
  const explored = counts.visited + counts.lived;
  const percentage = ((explored / 195) * 100).toFixed(1);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const id = selectedId.toUpperCase();
    const marked = countries.find((c) => c.id.toUpperCase() === id);
    const entry = availableCatalog.find((c) => c.id.toUpperCase() === id);
    if (!entry && !marked) return null;
    return {
      id,
      name: tr ? entry?.nameTr || marked?.nameTr || id : entry?.name || marked?.name || id,
      continent: tr ? entry?.continentTr || marked?.continentTr || '' : entry?.continent || marked?.continent || '',
      flag: entry?.flag || marked?.flag || '🌍',
      status: marked?.status ?? null,
      year: marked?.visitedYear || marked?.year || null,
    };
  }, [selectedId, countries, tr]);

  const filters: { id: Filter; label: string; color: string | null }[] = [
    { id: 'all', label: tr ? 'Tümü' : 'All', color: null },
    { id: 'visited', label: tr ? 'Gezilen' : 'Visited', color: colors.status.visited.color },
    { id: 'lived', label: tr ? 'Yaşanan' : 'Lived', color: colors.status.lived.color },
    { id: 'want', label: tr ? 'Hedef' : 'Wishlist', color: colors.gold.base },
  ];

  const statusText =
    selected?.status === 'lived'
      ? tr ? 'Yaşanan ülke' : 'Lived here'
      : selected?.status === 'visited'
        ? `${tr ? 'Gezildi' : 'Visited'}${selected.year ? ` · ${selected.year}` : ''}`
        : selected?.status === 'want'
          ? tr ? 'Hedef listende' : 'On your wishlist'
          : tr ? 'Henüz keşfedilmedi' : 'Not explored yet';
  const statusColor =
    selected?.status === 'lived'
      ? colors.status.lived.color
      : selected?.status === 'visited'
        ? colors.status.visited.color
        : selected?.status === 'want'
          ? colors.gold.base
          : colors.text.muted;

  const close = () => {
    setSelectedId(null);
    onClose();
  };

  const openDetail = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = selected.id;
    close();
    setTimeout(() => onSelectCountry(id), 150);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Heading style={styles.title}>{tr ? 'Dünya Haritası' : 'World Map'}</Heading>
            <Text style={styles.subtitle}>
              {tr ? `${explored} ülke · %${percentage} keşif` : `${explored} countries · ${percentage}% explored`}
            </Text>
          </View>
          <TouchableOpacity onPress={close} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => {
            const active = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveFilter(f.id);
                }}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                {f.color && <View style={[styles.dot, { backgroundColor: f.color }]} />}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                <Text style={[styles.chipCount, active && styles.chipTextActive]}>{counts[f.id]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.mapArea}>
          <WorldMap
            countries={countries}
            activeFilter={activeFilter}
            selectedCountryId={selectedId}
            onSelectCountry={(id) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedId(id);
            }}
            currentLang={currentLang}
            t={t}
            showControls
            fullScreen
          />

          {selected && (
            <View style={[styles.card, { marginBottom: Math.max(insets.bottom, spacing.lg) }]}>
              <Text style={styles.cardFlag}>{selected.flag}</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardName} numberOfLines={1}>{selected.name}</Text>
                <View style={styles.cardStatus}>
                  <View style={[styles.dot, { backgroundColor: statusColor }]} />
                  <Text style={styles.cardStatusText} numberOfLines={1}>{selected.continent ? `${selected.continent} · ` : ''}{statusText}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={openDetail} style={styles.cardAction} accessibilityRole="button" accessibilityLabel={selected.name}>
                {selected.status ? <ChevronRight size={20} color={colors.gold.onGold} /> : <Plus size={20} color={colors.gold.onGold} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.cardClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                <X size={14} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
    headerText: { flex: 1 },
    title: { fontSize: 36, lineHeight: 40, color: colors.text.primary, fontFamily: fonts.display },
    subtitle: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    filterScroll: { flexGrow: 0 },
    filterRow: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 36, borderRadius: 18, backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline },
    chipActive: { backgroundColor: colors.gold.base, borderColor: colors.gold.base },
    chipText: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
    chipTextActive: { color: colors.gold.onGold },
    chipCount: { fontSize: 13, fontWeight: '800', color: colors.text.secondary, fontVariant: ['tabular-nums'] },
    dot: { width: 9, height: 9, borderRadius: 5 },
    mapArea: { flex: 1, justifyContent: 'flex-end' },
    card: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      paddingRight: spacing.xl,
      borderRadius: 22,
      backgroundColor: colors.panel.raised,
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    cardFlag: { fontSize: 36 },
    cardText: { flex: 1, gap: 2 },
    cardName: { fontSize: 24, lineHeight: 27, color: colors.text.primary, fontFamily: fonts.display },
    cardStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardStatusText: { flexShrink: 1, fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    cardAction: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold.base },
    cardClose: { position: 'absolute', top: 8, right: 8 },
  })
);
