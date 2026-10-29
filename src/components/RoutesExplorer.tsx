import React, { useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Search } from 'lucide-react-native';
import Chip from './ui/Chip';
import Button from './ui/Button';
import Heading from './ui/Heading';
import EmptyState from './EmptyState';
import DestinationSheet from './DestinationSheet';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { CURATED_DESTINATIONS, CuratedDestination } from '../data/curatedDestinations';
import { MORE_DESTINATIONS } from '../data/moreDestinations';
import { ROUTE_PHOTOS } from '../data/routePhotos';
import { getCountryFacts, visaGroup, visaLabel } from '../data/countryProfile';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { rt } from '../localization/routes';
import { isGoodIn, monthPicks } from '../utils/discover';
import { Country } from '../stores/types';

const ALL_DESTINATIONS = [...CURATED_DESTINATIONS, ...MORE_DESTINATIONS];
const BY_ID = new Map(ALL_DESTINATIONS.map((d) => [d.id, d]));
const PAGE = 8;
const COLUMN_GAP = 12;
const CARD_WIDTH = (Dimensions.get('window').width - 40 - COLUMN_GAP) / 2;

type Quick = 'all' | 'now' | 'free' | 'new';
const CONTINENTS = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'Europe', tr: 'Avrupa', en: 'Europe' },
  { id: 'Asia', tr: 'Asya', en: 'Asia' },
  { id: 'Americas', tr: 'Amerika', en: 'Americas' },
  { id: 'Africa', tr: 'Afrika', en: 'Africa' },
  { id: 'Oceania', tr: 'Okyanusya', en: 'Oceania' },
];

const fold = (v: string) => v.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');

interface RoutesExplorerProps {
  countries: Country[];
  currentLang: 'tr' | 'en';
  onAddToWishlist: (country: any) => void;
  onSelectCountry?: (countryId: string) => void;
}

/** The routes tab: a "where this month" strip, quick filters, and a grid of route cards that open a full page. */
export default function RoutesExplorer({ countries, currentLang, onAddToWishlist, onSelectCountry }: RoutesExplorerProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [quick, setQuick] = useState<Quick>('all');
  const [continent, setContinent] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);

  const month = new Date().getMonth();
  const statusById = useMemo(() => new Map(countries.map((c) => [c.id, c.status])), [countries]);
  const beenIds = useMemo(() => new Set(countries.filter((c) => c.status === 'visited' || c.status === 'lived').map((c) => c.id)), [countries]);
  const picks = useMemo(() => monthPicks(month, beenIds, 10), [month, beenIds]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return ALL_DESTINATIONS.filter((d) => {
      if (continent !== 'all' && d.continent !== continent) return false;
      if (quick === 'now' && !isGoodIn(d.id, month)) return false;
      if (quick === 'free') {
        const facts = getCountryFacts(d.id);
        if (!facts || visaGroup(facts.visa.status) !== 'free') return false;
      }
      if (quick === 'new' && beenIds.has(d.id)) return false;
      if (q) {
        const hay = fold([d.name, d.nameTr, ...d.seePlaces.flatMap((p) => [p.title, p.city]), ...d.foodPlaces.flatMap((p) => [p.title, p.city])].join(' '));
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [quick, continent, query, month, beenIds]);

  const reset = () => {
    setQuick('all');
    setContinent('all');
    setQuery('');
    setLimit(PAGE);
  };
  const pickQuick = (q: Quick) => {
    Haptics.selectionAsync();
    setQuick(q);
    setLimit(PAGE);
  };

  const photoOf = (d: CuratedDestination | undefined) => (d ? d.heroImage ?? ROUTE_PHOTOS[d.id]?.url ?? null : null);

  const openCountry = (id: string) => {
    Haptics.selectionAsync();
    if (BY_ID.has(id)) setOpenId(id);
    else onSelectCountry?.(id);
  };

  const monthLabel = (currentLang === 'tr'
    ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])[month];

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHead}>
        <Heading style={styles.sectionTitle}>{rt('thisMonth', currentLang)}</Heading>
        <Text style={styles.sectionSub}>{monthLabel} · {rt('thisMonthSub', currentLang)}</Text>
      </View>
      {picks.length === 0 ? (
        <Text style={styles.sectionSub}>{rt('noPicks', currentLang)}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickRow}>
          {picks.map((p) => {
            const entry = availableCatalog.find((c) => c.id === p.id);
            if (!entry) return null;
            const photo = photoOf(BY_ID.get(p.id));
            return (
              <TouchableOpacity key={p.id} style={styles.pick} activeOpacity={0.85} onPress={() => openCountry(p.id)} accessibilityRole="button" accessibilityLabel={getLocalizedCountryName(entry, currentLang)}>
                {photo ? (
                  <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={FALLBACK_GRADIENT} style={[StyleSheet.absoluteFill, styles.center]}>
                    <Text style={styles.pickFlagBg}>{entry.flag}</Text>
                  </LinearGradient>
                )}
                <LinearGradient colors={['transparent', 'rgba(9,11,14,0.85)']} style={StyleSheet.absoluteFill} />
                <View style={styles.pickText}>
                  <Text style={styles.pickName} numberOfLines={1}>{entry.flag} {getLocalizedCountryName(entry, currentLang)}</Text>
                  <Text style={styles.pickMeta}>{p.temp}° · {visaLabel(p.visa, currentLang)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.sectionHead}>
        <Heading style={styles.sectionTitle}>{rt('routes', currentLang)}</Heading>
        <Text style={styles.sectionSub}>{rt('routesCount', currentLang, { n: results.length })}</Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={17} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={rt('search', currentLang)}
          placeholderTextColor={colors.text.muted}
          value={query}
          onChangeText={(v) => { setQuery(v); setLimit(PAGE); }}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={rt('filterAll', currentLang)} selected={quick === 'all'} onPress={() => pickQuick('all')} />
        <Chip label={rt('filterNow', currentLang)} selected={quick === 'now'} onPress={() => pickQuick('now')} />
        <Chip label={rt('filterFree', currentLang)} selected={quick === 'free'} onPress={() => pickQuick('free')} />
        <Chip label={rt('filterNew', currentLang)} selected={quick === 'new'} onPress={() => pickQuick('new')} />
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CONTINENTS.map((c) => (
          <Chip key={c.id} label={c[currentLang]} selected={continent === c.id} onPress={() => { Haptics.selectionAsync(); setContinent(c.id); setLimit(PAGE); }} />
        ))}
      </ScrollView>

      {results.length === 0 ? (
        <EmptyState type="search" title={rt('emptyTitle', currentLang)} description={rt('emptyDesc', currentLang)} actionLabel={rt('clear', currentLang)} onAction={reset} />
      ) : (
        <View style={styles.grid}>
          {results.slice(0, limit).map((d) => {
            const photo = photoOf(d);
            const facts = getCountryFacts(d.id);
            const group = facts ? visaGroup(facts.visa.status) : null;
            const dot = group === 'free' ? colors.status.lived.color : group === 'easy' ? colors.gold.base : null;
            const status = statusById.get(d.id);
            return (
              <TouchableOpacity key={d.id} style={styles.card} activeOpacity={0.88} onPress={() => openCountry(d.id)} accessibilityRole="button" accessibilityLabel={currentLang === 'tr' ? d.nameTr : d.name}>
                {photo ? (
                  <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={FALLBACK_GRADIENT} style={[StyleSheet.absoluteFill, styles.center]}>
                    <Text style={styles.cardFlagBg}>{d.flag}</Text>
                  </LinearGradient>
                )}
                <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(9,11,14,0.88)']} style={StyleSheet.absoluteFill} />
                {status && (status === 'visited' || status === 'lived' || status === 'want') && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{status === 'want' ? '♡' : '✓'}</Text>
                  </View>
                )}
                <View style={styles.cardText}>
                  <Text style={styles.cardName} numberOfLines={1}>{d.flag} {currentLang === 'tr' ? d.nameTr : d.name}</Text>
                  <Text style={styles.cardTag} numberOfLines={1}>{d.tag[currentLang]}</Text>
                  {facts && dot && (
                    <View style={styles.cardMeta}>
                      <View style={[styles.cardDot, { backgroundColor: dot }]} />
                      <Text style={styles.cardMetaText}>{visaLabel(facts.visa.status, currentLang)}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {results.length > limit && (
        <Button variant="secondary" size="md" label={rt('showMore', currentLang)} onPress={() => setLimit((n) => n + PAGE)} style={styles.more} />
      )}

      <DestinationSheet
        dest={openId ? BY_ID.get(openId) ?? null : null}
        visible={openId !== null}
        onClose={() => setOpenId(null)}
        currentLang={currentLang}
        status={openId ? statusById.get(openId) : undefined}
        onAddToWishlist={onAddToWishlist}
        onOpenCountry={onSelectCountry}
      />
    </View>
  );
}

/** Fixed dark tones: white text on top must read in the light theme too. */
const FALLBACK_GRADIENT = ['#3B4456', '#161A22'] as const;

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    wrap: { gap: 14 },
    center: { alignItems: 'center', justifyContent: 'center' },
    sectionHead: { gap: 2, marginTop: 6 },
    sectionTitle: { fontSize: 36, lineHeight: 40, color: colors.text.primary, fontFamily: fonts.display },
    sectionSub: { fontSize: 13, lineHeight: 18, color: colors.text.secondary },
    pickRow: { gap: 12, paddingRight: 8 },
    pick: { width: 150, height: 190, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.canvas.surface },
    pickFlagBg: { fontSize: 70, opacity: 0.35 },
    pickText: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 2 },
    pickName: { color: '#FFFFFF', fontSize: 20, lineHeight: 23, fontFamily: fonts.display },
    pickMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, height: 48, borderRadius: 16, backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline },
    searchInput: { flex: 1, fontSize: 15, color: colors.text.primary },
    chips: { gap: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: COLUMN_GAP },
    card: { width: CARD_WIDTH, height: CARD_WIDTH * 1.25, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.canvas.surface },
    cardFlagBg: { fontSize: 84, opacity: 0.35 },
    cardText: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 2 },
    cardName: { color: '#FFFFFF', fontSize: 24, lineHeight: 27, fontFamily: fonts.display },
    cardTag: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    cardDot: { width: 7, height: 7, borderRadius: 4 },
    cardMetaText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    statusBadge: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(9,11,14,0.6)' },
    statusBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    more: { alignSelf: 'center' },
  })
);
