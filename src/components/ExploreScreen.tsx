import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  Compass, 
  Search, 
  Utensils, 
  MapPin, 
  Lightbulb, 
  Plus, 
  Check, 
  Languages,
  Sparkles,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react-native';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { getCountryGuide } from '../data/travelGuides';
import { Country, Profile } from '../stores/types';
import { theme } from '../theme';

interface ExploreScreenProps {
  countries: Country[];
  profile?: Profile;
  onAddToWishlist: (country: any) => void;
  onMarkVisited?: (country: any) => void;
  t?: any;
  currentLang: 'tr' | 'en';
  onToggleLang?: () => void;
}

const CONTINENTS = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'Europe', tr: 'Avrupa', en: 'Europe' },
  { id: 'Asia', tr: 'Asya', en: 'Asia' },
  { id: 'Americas', tr: 'Amerika', en: 'Americas' },
  { id: 'Africa', tr: 'Afrika', en: 'Africa' },
  { id: 'Oceania', tr: 'Okyanusya', en: 'Oceania' },
];

// Highlighted iconic curated list first for inspiring explore deck
const FEATURED_COUNTRY_CODES = ['IT', 'JP', 'FR', 'ES', 'TR', 'GR', 'PT', 'TH', 'GE', 'MX', 'GB', 'US', 'CH', 'DE', 'NL'];

export default function ExploreScreen({
  countries,
  onAddToWishlist,
  onMarkVisited,
  t,
  currentLang,
  onToggleLang,
}: ExploreScreenProps) {
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map user's existing statuses
  const visitedSet = useMemo(() => {
    return new Set(
      countries
        .filter((c) => c.status === 'visited' || c.status === 'lived')
        .map((c) => c.id)
    );
  }, [countries]);

  const wishlistSet = useMemo(() => {
    return new Set(
      countries
        .filter((c) => c.status === 'want')
        .map((c) => c.id)
    );
  }, [countries]);

  // Sort and filter country list
  const filteredCountries = useMemo(() => {
    // Put featured countries first, then the rest
    const sortedCatalog = [...availableCatalog].sort((a, b) => {
      const aFeatured = FEATURED_COUNTRY_CODES.includes(a.id);
      const bFeatured = FEATURED_COUNTRY_CODES.includes(b.id);
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return 0;
    });

    return sortedCatalog.filter((c) => {
      // Continent filter
      if (selectedContinent !== 'all' && c.continent !== selectedContinent) {
        return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const locName = getLocalizedCountryName(c, currentLang).toLowerCase();
        const guide = getCountryGuide(c.id, c.name, c.continent);
        const foodText = guide.food[currentLang].toLowerCase();
        const seeText = guide.see[currentLang].toLowerCase();
        const tipText = guide.tip[currentLang].toLowerCase();

        return (
          locName.includes(query) ||
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          foodText.includes(query) ||
          seeText.includes(query) ||
          tipText.includes(query)
        );
      }

      return true;
    });
  }, [selectedContinent, searchQuery, currentLang]);

  const handleContinentSelect = (continentId: string) => {
    Haptics.selectionAsync();
    setSelectedContinent(continentId);
  };

  const handleAddToWishlist = (countryItem: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToWishlist({
      ...countryItem,
      status: 'want',
      year: new Date().getFullYear().toString(),
    });
  };

  const handleMarkVisited = (countryItem: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (onMarkVisited) {
      onMarkVisited({
        ...countryItem,
        status: 'visited',
        year: new Date().getFullYear().toString(),
      });
    } else {
      // Fallback to onAddToWishlist with status visited
      onAddToWishlist({
        ...countryItem,
        status: 'visited',
        year: new Date().getFullYear().toString(),
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Clean Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeRow}>
              <Compass size={16} color="#E5A93C" />
              <Text style={styles.badgeText}>
                {currentLang === 'tr' ? 'GEZGİN REHBERİ' : 'TRAVEL GUIDE'}
              </Text>
            </View>
            <Text style={styles.title}>
              {currentLang === 'tr' ? 'Ne Yenir? Ne Gezilir?' : 'Eat & Wander Guide'}
            </Text>
            <Text style={styles.subtitle}>
              {currentLang === 'tr'
                ? 'İkonik sokak lezzetleri, görülmesi gereken gizli köşeler ve yerel tüyolar.'
                : 'Iconic street bites, must-see secret spots & insider traveler hacks.'}
            </Text>
          </View>

          {onToggleLang && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onToggleLang();
              }}
              activeOpacity={0.7}
              style={styles.langPill}
            >
              <Languages size={14} color="#E5A93C" />
              <Text style={styles.langPillText}>
                {currentLang === 'tr' ? 'EN' : 'TR'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              currentLang === 'tr'
                ? 'Ülke, lezzet veya şehir ara... (Örn. İtalya, Ramen, Roma)'
                : 'Search country, dish or city... (e.g. Italy, Ramen, Rome)'
            }
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        </View>

        {/* Continent Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {CONTINENTS.map((item) => {
            const isActive = selectedContinent === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleContinentSelect(item.id)}
                activeOpacity={0.7}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {item[currentLang]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {filteredCountries.length}{' '}
            {currentLang === 'tr' ? 'ülke rehberi listeleniyor' : 'destinations curated'}
          </Text>
        </View>

        {/* Travel Guide Cards */}
        <View style={styles.cardList}>
          {filteredCountries.map((country) => {
            const localizedName = getLocalizedCountryName(country, currentLang);
            const guide = getCountryGuide(country.id, localizedName, country.continent);
            const isVisited = visitedSet.has(country.id);
            const isWishlisted = wishlistSet.has(country.id);

            return (
              <View key={country.id} style={styles.card}>
                {/* Card Top: Country Flag, Name, Tag & Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.countryInfo}>
                    <Text style={styles.flag}>{country.flag}</Text>
                    <View>
                      <Text style={styles.countryName}>{localizedName}</Text>
                      <Text style={styles.continentText}>
                        {country.continentTr && currentLang === 'tr'
                          ? country.continentTr
                          : country.continent}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{guide.tag[currentLang]}</Text>
                  </View>
                </View>

                {/* Section 1: Ne Yenir? */}
                <View style={styles.guideRow}>
                  <View style={[styles.iconBox, styles.foodIconBox]}>
                    <Utensils size={15} color="#E5A93C" />
                  </View>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideLabel}>
                      {currentLang === 'tr' ? 'NE YENİR?' : 'WHAT TO EAT'}
                    </Text>
                    <Text style={styles.guideText}>
                      {guide.food[currentLang]}
                    </Text>
                  </View>
                </View>

                {/* Section 2: Ne Gezilir? */}
                <View style={styles.guideRow}>
                  <View style={[styles.iconBox, styles.seeIconBox]}>
                    <MapPin size={15} color="#3B82F6" />
                  </View>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideLabel}>
                      {currentLang === 'tr' ? 'NE GEZİLİR?' : 'MUST SEE'}
                    </Text>
                    <Text style={styles.guideText}>
                      {guide.see[currentLang]}
                    </Text>
                  </View>
                </View>

                {/* Section 3: Gezgin Tüyosu */}
                <View style={[styles.guideRow, styles.tipRow]}>
                  <View style={[styles.iconBox, styles.tipIconBox]}>
                    <Lightbulb size={15} color="#10B981" />
                  </View>
                  <View style={styles.guideContent}>
                    <Text style={styles.guideLabel}>
                      {currentLang === 'tr' ? 'GEZGİN TÜYOSU' : 'LOCAL TIP'}
                    </Text>
                    <Text style={styles.tipText}>
                      {guide.tip[currentLang]}
                    </Text>
                  </View>
                </View>

                {/* Bottom Action Buttons */}
                <View style={styles.cardActions}>
                  {isVisited ? (
                    <View style={styles.visitedBanner}>
                      <Check size={14} color="#10B981" />
                      <Text style={styles.visitedBannerText}>
                        {currentLang === 'tr' ? 'Pasaportunda Damgalı' : 'Stamped in Passport'}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleAddToWishlist(country)}
                        activeOpacity={0.7}
                        style={[
                          styles.actionBtn,
                          styles.wishlistBtn,
                          isWishlisted && styles.wishlistBtnActive,
                        ]}
                      >
                        {isWishlisted ? (
                          <>
                            <BookmarkCheck size={14} color="#E5A93C" />
                            <Text style={styles.wishlistBtnTextActive}>
                              {currentLang === 'tr' ? 'İstek Listende' : 'In Wishlist'}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Plus size={14} color="#CBD5E1" />
                            <Text style={styles.wishlistBtnText}>
                              {currentLang === 'tr' ? 'İstek Listeme Ekle' : 'Add to Wishlist'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleMarkVisited(country)}
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.visitedBtn]}
                      >
                        <Check size={14} color="#090B0E" />
                        <Text style={styles.visitedBtnText}>
                          {currentLang === 'tr' ? 'Gittim, Damgala' : 'I Was Here'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B0E', // 60% dominant canvas
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E5A93C', // 10% accent
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    marginTop: 4,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterBar: {
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E5A93C', // 10% accent
    borderColor: '#E5A93C',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#090B0E',
    fontWeight: '700',
  },
  counterRow: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardList: {
    gap: 16,
  },
  // 30% Frosted Glass Card Architecture
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 32,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continentText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagBadgeText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  foodIconBox: {
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  seeIconBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  tipIconBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  guideContent: {
    flex: 1,
  },
  guideLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  guideText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  tipText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  wishlistBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  wishlistBtnActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.10)',
    borderColor: 'rgba(229, 169, 60, 0.40)',
  },
  wishlistBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  wishlistBtnTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E5A93C',
  },
  visitedBtn: {
    backgroundColor: '#FFFFFF',
  },
  visitedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#090B0E',
  },
  visitedBanner: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  visitedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  bottomSpacer: {
    height: 40,
  },
});
