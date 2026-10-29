import CountryBrowser from './CountryBrowser';
import { pt } from '../localization/profile';
import Chip from './ui/Chip';
import EmptyState from './EmptyState';
import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  Compass, 
  Search, 
  Utensils, 
  MapPin, 
  Lightbulb, 
  Plus, 
  Check, 
  Navigation,
  ExternalLink,
  BookmarkCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { CURATED_DESTINATIONS, CuratedDestination, MapPoint } from '../data/curatedDestinations';
import { MORE_DESTINATIONS } from '../data/moreDestinations';

const ALL_DESTINATIONS = [...CURATED_DESTINATIONS, ...MORE_DESTINATIONS];
import { openAppleMaps, openGoogleMaps } from '../utils/mapHelper';
import { Country, Profile } from '../stores/types';

interface ExploreScreenProps {
  countries: Country[];
  profile?: Profile;
  onAddToWishlist: (country: any) => void;
  onMarkVisited?: (country: any) => void;
  t?: any;
  currentLang: 'tr' | 'en';
  onToggleLang?: () => void;
  onSelectCountry?: (countryId: string) => void;
}

const CONTINENTS = [
  { id: 'all', tr: 'Tümü', en: 'All' },
  { id: 'Europe', tr: 'Avrupa', en: 'Europe' },
  { id: 'Asia', tr: 'Asya', en: 'Asia' },
  { id: 'Americas', tr: 'Amerika', en: 'Americas' },
  { id: 'Africa', tr: 'Afrika', en: 'Africa' },
  { id: 'Oceania', tr: 'Okyanusya', en: 'Oceania' },
];

function ExploreScreen({
  countries,
  onAddToWishlist,
  onMarkVisited,
  currentLang,
  onToggleLang,
  onSelectCountry,
  t,
}: ExploreScreenProps) {
  const [mode, setMode] = useState<'routes' | 'countries'>('routes');
  const { colors } = useTheme();
  const styles = useStyles();
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountryId, setExpandedCountryId] = useState<string | null>('IT'); // Default first expanded

  // Visited and wishlist tracking
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

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return ALL_DESTINATIONS.filter((item) => {
      if (selectedContinent !== 'all') {
        const itemContinent = (item.continent || '').toLowerCase();
        const selContinent = selectedContinent.toLowerCase();

        if (selContinent === 'americas' || selContinent === 'america') {
          if (!itemContinent.includes('america')) {
            return false;
          }
        } else if (itemContinent !== selContinent) {
          return false;
        }
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query) || item.nameTr.toLowerCase().includes(query);
        const cityMatch = item.seePlaces.some(p => p.city.toLowerCase().includes(query) || p.title.toLowerCase().includes(query));
        const foodMatch = item.foodPlaces.some(p => p.title.toLowerCase().includes(query) || p.city.toLowerCase().includes(query));
        return nameMatch || cityMatch || foodMatch;
      }

      return true;
    });
  }, [selectedContinent, searchQuery]);

  const handleContinentSelect = (continentId: string) => {
    Haptics.selectionAsync();
    setSelectedContinent(continentId);
  };

  const handleToggleExpand = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCountryId(prev => (prev === id ? null : id));
  };

  const handleAddToWishlist = (dest: CuratedDestination) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToWishlist({
      id: dest.id,
      name: dest.name,
      nameTr: dest.nameTr,
      flag: dest.flag,
      continent: dest.continent,
      continentTr: dest.continentTr,
      status: 'want',
      year: new Date().getFullYear().toString(),
    });
  };

  const handleMarkVisited = (dest: CuratedDestination) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const payload = {
      id: dest.id,
      name: dest.name,
      nameTr: dest.nameTr,
      flag: dest.flag,
      continent: dest.continent,
      continentTr: dest.continentTr,
      status: 'visited',
      year: new Date().getFullYear().toString(),
    };
    if (onMarkVisited) {
      onMarkVisited(payload);
    } else {
      onAddToWishlist(payload);
    }
  };

  const renderMapPoint = (point: MapPoint, isFood: boolean = false) => {
    return (
      <View key={point.title} style={styles.pointCard}>
        <View style={styles.pointHeader}>
          <View style={[styles.pointIconBox, isFood ? styles.foodIconBox : styles.seeIconBox]}>
            {isFood ? (
              <Utensils size={13} color={colors.gold.base} />
            ) : (
              <MapPin size={13} color={colors.status.visited.color} />
            )}
          </View>
          <View style={styles.pointTitles}>
            <Text style={styles.pointMainTitle}>{point.title}</Text>
            <Text style={styles.pointSubtitle}>
              {point.city} • {point.subtitle}
            </Text>
          </View>
        </View>

        <Text style={styles.pointDesc}>{point.desc[currentLang]}</Text>

        {/* Clickable Maps Launchers */}
        <View style={styles.mapButtonsRow}>
          <TouchableOpacity
            style={[styles.mapBtn, styles.appleMapBtn]}
            onPress={() => {
              Haptics.selectionAsync();
              openAppleMaps(point.mapQuery);
            }}
            activeOpacity={0.75}
          >
            <Navigation size={12} color={colors.text.primary} />
            <Text style={styles.mapBtnTextApple}>Apple Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapBtn, styles.googleMapBtn]}
            onPress={() => {
              Haptics.selectionAsync();
              openGoogleMaps(point.mapQuery);
            }}
            activeOpacity={0.75}
          >
            <ExternalLink size={12} color={colors.text.soft} />
            <Text style={styles.mapBtnTextGoogle}>Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page Subheader */}
        <View style={styles.pageSubheader}>
          <View style={styles.badgeRow}>
            <Compass size={14} color={colors.gold.base} />
            <Text style={styles.badgeText}>
              {currentLang === 'tr' ? 'GEZGİN REHBERİ' : 'CURATED GUIDE'}
            </Text>
          </View>
          <Text style={styles.title}>
            {currentLang === 'tr' ? 'Nerede Ne Yenir & Ne Gezilir?' : 'Eat & Wander Guide'}
          </Text>
          <Text style={styles.subtitle}>
            {currentLang === 'tr'
              ? 'Popüler rotaların konum noktaları, mekan önerileri ve harita bağlantıları.'
              : 'Exact map points, handpicked food spots & one-click navigation.'}
          </Text>
        </View>

        <View style={styles.modeRow}>
          <Chip label={pt('exploreRoutes', currentLang)} selected={mode === 'routes'} onPress={() => setMode('routes')} />
          <Chip label={pt('exploreCountries', currentLang)} selected={mode === 'countries'} onPress={() => setMode('countries')} />
        </View>

        {mode === 'countries' && onSelectCountry ? (
          <CountryBrowser countries={countries} currentLang={currentLang} onSelectCountry={onSelectCountry} />
        ) : (
          <>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={17} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              currentLang === 'tr'
                ? 'Ülke, şehir veya lezzet ara... (Örn. Roma, Ramen, Paris)'
                : 'Search country, city or dish... (e.g. Rome, Ramen, Paris)'
            }
            placeholderTextColor={colors.text.muted}
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
              <Chip
                key={item.id}
                label={item[currentLang]}
                selected={isActive}
                onPress={() => handleContinentSelect(item.id)}
              />
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {filteredDestinations.length}{' '}
            {currentLang === 'tr' ? 'özenle hazırlanmış rota' : 'handcrafted destinations'}
          </Text>
        </View>

        {filteredDestinations.length === 0 && (
          <EmptyState
            type="search"
            title={currentLang === 'tr' ? 'Sonuç bulunamadı' : 'No results'}
            description={
              currentLang === 'tr'
                ? 'Aramanı veya kıta filtresini değiştirmeyi dene.'
                : 'Try a different search or continent filter.'
            }
          />
        )}

        {/* Curated Destination Cards */}
        <View style={styles.destinationList}>
          {filteredDestinations.map((dest) => {
            const isExpanded = expandedCountryId === dest.id;
            const isVisited = visitedSet.has(dest.id);
            const isWishlisted = wishlistSet.has(dest.id);
            const countryDisplayName = currentLang === 'tr' ? dest.nameTr : dest.name;

            return (
              <View key={dest.id} style={styles.destinationCard}>
                {/* Hero Image Thumbnail & Banner */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleToggleExpand(dest.id)}
                  style={styles.thumbnailContainer}
                >
                  {dest.heroImage ? (
                    <Image source={{ uri: dest.heroImage }} style={styles.thumbnail} resizeMode="cover" />
                  ) : (
                    <LinearGradient
                      colors={[colors.panel.raised, colors.panel.base]}
                      style={[styles.thumbnail, styles.thumbnailFallback]}
                    >
                      <Text style={styles.fallbackFlag}>{dest.flag}</Text>
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(9, 11, 14, 0.95)']}
                    style={styles.thumbnailGradient}
                  />

                  {/* Top Bar on Image: Flag, Continent Tag & Expand Indicator */}
                  <View style={styles.imageOverlayTop}>
                    <View style={styles.imageTagBadge}>
                      <Text style={styles.imageTagText}>{dest.tag[currentLang]}</Text>
                    </View>
                    <View style={styles.expandChevron}>
                      {isExpanded ? (
                        <ChevronUp size={16} color={colors.white} />
                      ) : (
                        <ChevronDown size={16} color={colors.white} />
                      )}
                    </View>
                  </View>

                  {/* Bottom Bar on Image: Name & Headline */}
                  <View style={styles.imageOverlayBottom}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardFlag}>{dest.flag}</Text>
                      <Text style={styles.cardCountryName}>{countryDisplayName}</Text>
                    </View>
                    <Text style={styles.cardHeadline}>{dest.headline[currentLang]}</Text>
                  </View>
                </TouchableOpacity>

                {/* Collapsible Content */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {/* SECTION: Gezilecek Yerler */}
                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionHeader}>
                        <MapPin size={15} color={colors.status.visited.color} />
                        <Text style={styles.sectionTitle}>
                          {currentLang === 'tr' ? 'MUTLAKA GEZİLECEK YERLER' : 'MUST-SEE PLACES'}
                        </Text>
                      </View>
                      <View style={styles.pointsList}>
                        {dest.seePlaces.map(p => renderMapPoint(p, false))}
                      </View>
                    </View>

                    {/* SECTION: Ne Yenir & Nerede Yenir? */}
                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionHeader}>
                        <Utensils size={15} color={colors.gold.base} />
                        <Text style={styles.sectionTitle}>
                          {currentLang === 'tr' ? 'NE YENİR & NEREDE YENİR?' : 'WHAT & WHERE TO EAT'}
                        </Text>
                      </View>
                      <View style={styles.pointsList}>
                        {dest.foodPlaces.map(p => renderMapPoint(p, true))}
                      </View>
                    </View>

                    {/* SECTION: Gezgin Tüyosu */}
                    <View style={styles.tipBox}>
                      <View style={styles.tipHeader}>
                        <Lightbulb size={15} color={colors.status.lived.color} />
                        <Text style={styles.tipLabel}>
                          {currentLang === 'tr' ? 'GEZGİN TÜYOSU' : 'INSIDER TRAVEL HACK'}
                        </Text>
                      </View>
                      <Text style={styles.tipBody}>{dest.insiderTip[currentLang]}</Text>
                    </View>

                    {/* Action Bar */}
                    <View style={styles.cardActions}>
                      {isVisited ? (
                        <View style={styles.visitedBanner}>
                          <Check size={14} color={colors.status.lived.color} />
                          <Text style={styles.visitedBannerText}>
                            {currentLang === 'tr' ? 'Pasaportunda Damgalı' : 'Stamped in Passport'}
                          </Text>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => handleAddToWishlist(dest)}
                            activeOpacity={0.7}
                            style={[
                              styles.actionBtn,
                              styles.wishlistBtn,
                              isWishlisted && styles.wishlistBtnActive,
                            ]}
                          >
                            {isWishlisted ? (
                              <>
                                <BookmarkCheck size={14} color={colors.gold.base} />
                                <Text style={styles.wishlistBtnTextActive}>
                                  {currentLang === 'tr' ? 'İstek Listende' : 'In Wishlist'}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Plus size={14} color={colors.text.soft} />
                                <Text style={styles.wishlistBtnText}>
                                  {currentLang === 'tr' ? '+ İstek Listesi' : '+ Wishlist'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleMarkVisited(dest)}
                            activeOpacity={0.7}
                            style={[styles.actionBtn, styles.visitedBtn]}
                          >
                            <Check size={14} color={colors.canvas.base} />
                            <Text style={styles.visitedBtnText}>
                              {currentLang === 'tr' ? 'Gittim, Damgala' : 'I Was Here'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.base, // 60% dominant canvas
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  pageSubheader: {
    marginBottom: 18,
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
    color: colors.gold.base, // 10% accent
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 31,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
    fontFamily: fonts.display,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    marginTop: 4,
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
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
    color: colors.text.primary,
    fontSize: 14,
  },
  thumbnailFallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackFlag: { fontSize: 72, opacity: 0.5 },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBar: {
    paddingBottom: 14,
    gap: 8,
  },
  counterRow: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
  },
  destinationList: {
    gap: 20,
  },
  // 30% Glass Destination Card
  destinationCard: {
    backgroundColor: colors.glass.fill,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 190,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumbnailGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageOverlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  imageTagBadge: {
    backgroundColor: 'rgba(9, 11, 14, 0.70)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
  },
  imageTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.base,
  },
  expandChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(9, 11, 14, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  imageOverlayBottom: {
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardFlag: {
    fontSize: 26,
  },
  cardCountryName: {
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  cardHeadline: {
    fontSize: 13,
    color: colors.white,
    lineHeight: 18,
  },
  // Expanded Content
  expandedContent: {
    padding: 16,
    paddingTop: 12,
    gap: 16,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  pointsList: {
    gap: 10,
  },
  pointCard: {
    backgroundColor: colors.glass.fill,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
    padding: 12,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  pointIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  seeIconBox: {
    backgroundColor: colors.status.visited.light,
  },
  foodIconBox: {
    backgroundColor: colors.gold.tint,
  },
  pointTitles: {
    flex: 1,
  },
  pointMainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  pointSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  pointDesc: {
    fontSize: 12,
    color: colors.text.soft,
    lineHeight: 17,
    marginBottom: 10,
  },
  mapButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
  },
  appleMapBtn: {
    backgroundColor: colors.glass.fillStrong,
    borderColor: colors.glass.fillActive,
  },
  googleMapBtn: {
    backgroundColor: colors.glass.fill,
    borderColor: colors.glass.fillStrong,
  },
  mapBtnTextApple: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  mapBtnTextGoogle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tipBox: {
    backgroundColor: colors.status.lived.light,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.status.lived.border,
    padding: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.lived.color,
    letterSpacing: 0.8,
  },
  tipBody: {
    fontSize: 12,
    color: colors.text.soft,
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
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  wishlistBtn: {
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  wishlistBtnActive: {
    backgroundColor: colors.gold.tint,
    borderColor: colors.gold.border,
  },
  wishlistBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.soft,
  },
  wishlistBtnTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold.base,
  },
  visitedBtn: {
    backgroundColor: colors.text.primary,
  },
  visitedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.canvas.base,
  },
  visitedBanner: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.status.lived.light,
    borderWidth: 1,
    borderColor: colors.status.lived.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  visitedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.status.lived.color,
  },
  bottomSpacer: {
    height: 36,
  },
}));

export default React.memo(ExploreScreen);
