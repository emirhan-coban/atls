import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Search } from 'lucide-react-native';
import Chip from './ui/Chip';
import Button from './ui/Button';
import EmptyState from './EmptyState';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { getCountryFacts, VISA_RANK, visaGroup, VisaGroup, VisaStatus, visaLabel } from '../data/countryProfile';
import { pt } from '../localization/profile';
import { Country } from '../stores/types';
import { CONTINENT_FILTERS, ContinentFilter, inContinent } from '../data/continents';

type VisaFilter = 'all' | VisaGroup;


const PAGE = 30;

interface Collection {
  id: string;
  labelKey: 'colFreeEurope' | 'colFreeAsia' | 'colFreeAmericas' | 'colEasyNext' | 'colSchengenNext';
  visa: VisaFilter;
  continent: ContinentFilter;
  schengen: boolean;
  notVisited: boolean;
}

/** Ready-made filter combinations. They only set the filters below, so they stay editable afterwards. */
const COLLECTIONS: Collection[] = [
  { id: 'free-europe', labelKey: 'colFreeEurope', visa: 'free', continent: 'Europe', schengen: false, notVisited: false },
  { id: 'free-asia', labelKey: 'colFreeAsia', visa: 'free', continent: 'Asia', schengen: false, notVisited: false },
  { id: 'free-americas', labelKey: 'colFreeAmericas', visa: 'free', continent: 'Americas', schengen: false, notVisited: false },
  { id: 'easy-next', labelKey: 'colEasyNext', visa: 'easy', continent: 'all', schengen: false, notVisited: true },
  { id: 'schengen-next', labelKey: 'colSchengenNext', visa: 'all', continent: 'all', schengen: true, notVisited: true },
];

/** Normalises Turkish and accented letters so "istanbul" finds "İstanbul" and "turkiye" finds "Türkiye". */
const fold = (value: string) =>
  value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

interface CountryBrowserProps {
  countries: Country[];
  currentLang: 'tr' | 'en';
  onSelectCountry: (countryId: string) => void;
}

/** Every country in the catalog with search, continent and entry-requirement filters. */
export default function CountryBrowser({ countries, currentLang, onSelectCountry }: CountryBrowserProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const [continent, setContinent] = useState<ContinentFilter>('all');
  const [visa, setVisa] = useState<VisaFilter>('all');
  const [schengenOnly, setSchengenOnly] = useState(false);
  const [notVisitedOnly, setNotVisitedOnly] = useState(false);
  const [collection, setCollection] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const statusById = useMemo(() => {
    const map = new Map<string, Country['status']>();
    countries.forEach((c) => map.set(c.id, c.status));
    return map;
  }, [countries]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return availableCatalog
      .filter((c: any) => {
        if (!inContinent(c.continent, continent)) return false;
        const facts = getCountryFacts(c.id);
        if (visa !== 'all' && (!facts || visaGroup(facts.visa.status) !== visa)) return false;
        if (schengenOnly && !facts?.schengen) return false;
        if (notVisitedOnly) {
          const status = statusById.get(c.id);
          if (status === 'visited' || status === 'lived') return false;
        }
        if (q) {
          const haystack = fold(
            [c.name, c.nameTr, facts?.capital.en, facts?.capital.tr].filter(Boolean).join(' ')
          );
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .map((c: any) => ({ c, facts: getCountryFacts(c.id) }))
      .sort((a, b) => {
        // Unfiltered: easiest entry first. Once a visa filter is on, everything is the same group, so go alphabetical.
        const rankOf = (f: ReturnType<typeof getCountryFacts>) => VISA_RANK[(f?.visa.status ?? 'unknown') as VisaStatus];
        const byRank = rankOf(a.facts) - rankOf(b.facts);
        if (visa !== 'all' || byRank === 0) {
          return getLocalizedCountryName(a.c, currentLang).localeCompare(getLocalizedCountryName(b.c, currentLang), currentLang);
        }
        return byRank;
      });
  }, [query, continent, visa, schengenOnly, notVisitedOnly, statusById, currentLang]);

  const visaColor = (group: VisaGroup | null) =>
    group === 'free' ? colors.status.lived.color : group === 'easy' ? colors.gold.base : group === 'required' ? colors.danger : colors.text.muted;

  const statusDot = (id: string) => {
    const status = statusById.get(id);
    if (status === 'visited') return colors.status.visited.color;
    if (status === 'lived') return colors.status.lived.color;
    if (status === 'want') return colors.status.want.color;
    return null;
  };

  const resetFilters = () => {
    setQuery('');
    setContinent('all');
    setVisa('all');
    setSchengenOnly(false);
    setNotVisitedOnly(false);
    setCollection(null);
  };

  /** Any manual filter change leaves the collection, since the list no longer matches it. */
  const edit = (apply: () => void) => {
    apply();
    setCollection(null);
    setLimit(PAGE);
  };

  const applyCollection = (item: Collection) => {
    Haptics.selectionAsync();
    if (collection === item.id) {
      resetFilters();
      return;
    }
    setQuery('');
    setVisa(item.visa);
    setContinent(item.continent);
    setSchengenOnly(item.schengen);
    setNotVisitedOnly(item.notVisited);
    setCollection(item.id);
    setLimit(PAGE);
  };

  return (
    <View>
      <View style={styles.searchBox}>
        <Search size={17} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={pt('searchCountries', currentLang)}
          placeholderTextColor={colors.text.muted}
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setLimit(PAGE);
          }}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <Text style={styles.filterLabel}>{pt('collectionsLabel', currentLang)}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {COLLECTIONS.map((item) => (
          <Chip key={item.id} label={pt(item.labelKey, currentLang)} selected={collection === item.id} onPress={() => applyCollection(item)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>{pt('visaFilter', currentLang)}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={pt('filterAll', currentLang)} selected={visa === 'all'} onPress={() => edit(() => setVisa('all'))} />
        <Chip label={pt('filterFree', currentLang)} selected={visa === 'free'} onPress={() => edit(() => setVisa('free'))} />
        <Chip label={pt('filterEasy', currentLang)} selected={visa === 'easy'} onPress={() => edit(() => setVisa('easy'))} />
        <Chip label={pt('filterRequired', currentLang)} selected={visa === 'required'} onPress={() => edit(() => setVisa('required'))} />
        <Chip label={pt('filterSchengen', currentLang)} selected={schengenOnly} onPress={() => edit(() => setSchengenOnly(!schengenOnly))} />
        <Chip label={pt('filterNotVisited', currentLang)} selected={notVisitedOnly} onPress={() => edit(() => setNotVisitedOnly(!notVisitedOnly))} />
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CONTINENT_FILTERS.map((item) => (
          <Chip
            key={item.id}
            label={item[currentLang]}
            selected={continent === item.id}
            onPress={() => edit(() => setContinent(item.id))}
          />
        ))}
      </ScrollView>

      <Text style={styles.counter}>{pt('countriesFound', currentLang, { n: results.length })}</Text>

      {results.length === 0 ? (
        <EmptyState
          type="search"
          title={pt('noMatch', currentLang)}
          description={pt('noMatchDesc', currentLang)}
          actionLabel={currentLang === 'tr' ? 'Filtreleri temizle' : 'Clear filters'}
          onAction={resetFilters}
        />
      ) : (
        <View style={styles.list}>
          {results.slice(0, limit).map(({ c, facts }: any) => {
            const group = facts ? visaGroup(facts.visa.status) : null;
            const dot = statusDot(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelectCountry(c.id);
                }}
                activeOpacity={0.8}
                style={styles.row}
                accessibilityRole="button"
                accessibilityLabel={getLocalizedCountryName(c, currentLang)}
              >
                <Text style={styles.flag}>{c.flag}</Text>
                <View style={styles.rowBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {getLocalizedCountryName(c, currentLang)}
                    </Text>
                    {dot && <View style={[styles.statusDot, { backgroundColor: dot }]} />}
                  </View>
                  <Text style={styles.meta} numberOfLines={1}>
                    {facts ? `${facts.capital[currentLang]} · ${facts.currency?.code ?? ''}` : ''}
                  </Text>
                </View>
                {facts && facts.visa.status !== 'unknown' && (
                  <View style={[styles.visaTag, { borderColor: visaColor(group) }]}>
                    <Text style={[styles.visaTagText, { color: visaColor(group) }]} numberOfLines={1}>
                      {visaLabel(facts.visa.status, currentLang)}
                    </Text>
                  </View>
                )}
                <ChevronRight size={16} color={colors.text.muted} />
              </TouchableOpacity>
            );
          })}
          {results.length > limit && (
            <Button
              variant="secondary"
              size="md"
              label={currentLang === 'tr' ? `Daha fazla göster (${results.length - limit})` : `Show more (${results.length - limit})`}
              onPress={() => setLimit((l) => l + PAGE)}
              style={styles.more}
            />
          )}
        </View>
      )}

      <Text style={styles.credit}>
        {pt('dataCredit', currentLang)}: mledoze/countries (ODbL), Wikidata (CC0), {pt('source', currentLang)} (CC BY-SA 4.0)
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      height: 50,
      borderRadius: 18,
      backgroundColor: colors.glass.fill,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
      marginBottom: 14,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text.primary },
    filterLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary, marginBottom: 8 },
    chips: { gap: 8, paddingBottom: 12 },
    counter: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, paddingHorizontal: 2 },
    list: { gap: 10 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 20,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    flag: { fontSize: 30 },
    rowBody: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { flexShrink: 1, fontSize: 16, fontWeight: '800', color: colors.text.primary },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    meta: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    visaTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, maxWidth: 120 },
    visaTagText: { fontSize: 11, fontWeight: '800' },
    more: { marginTop: 4 },
    credit: { fontSize: 11, lineHeight: 16, color: colors.text.muted, textAlign: 'center', marginTop: 20, paddingHorizontal: 12 },
  })
);
