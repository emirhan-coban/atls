import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  X,   
  ChevronRight, 
  Compass, 
  Sparkles,
  Plus
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WorldMap from './WorldMap';
import GlassCard from './GlassCard';
import { availableCatalog } from '../data/travelData';

const TypedWorldMap = WorldMap as React.ComponentType<any>;

interface InteractiveMapModalProps {
  visible: boolean;
  onClose: () => void;
  countries: any[];
  onSelectCountry: (countryId: string) => void;
  currentLang: 'tr' | 'en';
  t?: any;
  initialFilter?: 'all' | 'visited' | 'lived' | 'want';
}

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'visited' | 'lived' | 'want'>(initialFilter);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(true);
  const insets = useSafeAreaInsets();

  // Sync initial filter on open
  useEffect(() => {
    if (visible) {
      setActiveFilter(initialFilter);
      setSelectedCountryId(null);
      setShowTip(true);
    }
  }, [visible, initialFilter]);

  // Hide hint tip after 5 seconds
  useEffect(() => {
    if (visible && showTip) {
      const timer = setTimeout(() => setShowTip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, showTip]);

  // Stats calculation
  const visitedCount = useMemo(() => countries.filter((c) => c.status === 'visited').length, [countries]);
  const livedCount = useMemo(() => countries.filter((c) => c.status === 'lived').length, [countries]);
  const wantCount = useMemo(() => countries.filter((c) => c.status === 'want').length, [countries]);
  const totalMarked = visitedCount + livedCount;
  const earthPercentage = ((totalMarked / 195) * 100).toFixed(1);

  // Country status lookup
  const markedMap = useMemo(() => {
    const map = new Map<string, any>();
    countries.forEach((c) => map.set(c.id.toUpperCase(), c));
    return map;
  }, [countries]);

  // Selected country details
  const selectedCountry = useMemo(() => {
    if (!selectedCountryId) return null;
    const upper = selectedCountryId.toUpperCase();
    const marked = markedMap.get(upper);
    const catalog = availableCatalog.find((c) => c.id.toUpperCase() === upper);

    if (!catalog && !marked) return null;

    return {
      id: upper,
      name: catalog?.name || marked?.name || upper,
      nameTr: catalog?.nameTr || marked?.nameTr || upper,
      flag: catalog?.flag || marked?.flag || '🌍',
      continent: catalog?.continent || marked?.continent || '',
      continentTr: catalog?.continentTr || marked?.continentTr || '',
      status: marked?.status || null,
      visitedYear: marked?.visitedYear || marked?.year || null,
      notes: marked?.notes || null,
    };
  }, [selectedCountryId, markedMap]);

  const handleCountryPress = (countryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountryId(countryId);
    setShowTip(false);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCountryId(null);
    onClose();
  };

  const handleOpenCountryDetail = () => {
    if (!selectedCountryId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const targetId = selectedCountryId;
    setSelectedCountryId(null);
    onClose();
    setTimeout(() => {
      onSelectCountry(targetId);
    }, 150);
  };

  const filterOptions = [
    { id: 'all', label: currentLang === 'tr' ? 'Tümü' : 'All', count: countries.length, color: colors.text.primary },
    { id: 'visited', label: currentLang === 'tr' ? 'Gezilen' : 'Visited', count: visitedCount, color: colors.status.visited.color },
    { id: 'lived', label: currentLang === 'tr' ? 'Yaşanan' : 'Lived', count: livedCount, color: colors.status.lived.color },
    { id: 'want', label: currentLang === 'tr' ? 'Hedef' : 'Wishlist', count: wantCount, color: colors.gold.base },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.canvas.base} />

        {/* Top Header Bar */}
        <SafeAreaView style={styles.safeHeaderArea}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <View style={styles.iconCircle}>
                  <Compass size={18} color={colors.gold.base} />
                </View>
                <Text style={styles.title}>
                  {currentLang === 'tr' ? 'Dünya Haritası' : 'World Map'}
                </Text>
              </View>
              <Text style={styles.subtitle}>
                {currentLang === 'tr'
                  ? `${totalMarked} Ülke • %${earthPercentage} Keşif`
                  : `${totalMarked} Countries • ${earthPercentage}% Explored`}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.75}
              style={styles.closeButton}
            >
              <X size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Filter Bar */}
          <View style={styles.filterBar}>
            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveFilter(opt.id as any);
                  }}
                  activeOpacity={0.75}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                >
                  {opt.id !== 'all' && (
                    <View style={[styles.filterDot, { backgroundColor: opt.color }]} />
                  )}
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      isActive && styles.countBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        isActive && styles.countTextActive,
                      ]}
                    >
                      {opt.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>

        {/* Full-Screen Isolated Map Viewport */}
        <View style={styles.mapViewport}>
          <TypedWorldMap
            countries={countries}
            activeFilter={activeFilter}
            selectedCountryId={selectedCountryId}
            onSelectCountry={handleCountryPress}
            currentLang={currentLang}
            t={t}
            interactive={true}
            fullScreen={true}
          />
        </View>

        {/* Subtle Gesture Tip overlay */}
        {showTip && !selectedCountry && (
          <View style={styles.tipContainer} pointerEvents="none">
            <View style={styles.tipPill}>
              <Sparkles size={12} color={colors.gold.base} />
              <Text style={styles.tipText}>
                {currentLang === 'tr'
                  ? '360° serbestçe kaydırın • Yakınlaştırmak için iki parmağınızı açın'
                  : 'Pan 360° freely • Pinch with two fingers to zoom'}
              </Text>
            </View>
          </View>
        )}

        {/* Selected Country Bottom Info Card */}
        {selectedCountry && (
          <View style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom }]}>
            <GlassCard style={styles.countryCard}>
              <View style={styles.countryCardHeader}>
                <View style={styles.countryCardFlagWrap}>
                  <Text style={styles.countryFlagEmoji}>{selectedCountry.flag}</Text>
                </View>

                <View style={styles.countryCardMeta}>
                  <View style={styles.countryTitleRow}>
                    <Text style={styles.countryCardName} numberOfLines={1}>
                      {currentLang === 'tr' ? selectedCountry.nameTr : selectedCountry.name}
                    </Text>
                  </View>
                  <Text style={styles.countryContinentText}>
                    {currentLang === 'tr' ? selectedCountry.continentTr : selectedCountry.continent}
                  </Text>
                </View>

                {/* Dismiss selection button */}
                <TouchableOpacity
                  onPress={() => setSelectedCountryId(null)}
                  style={styles.cardCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Status pill & Details */}
              <View style={styles.countryStatusRow}>
                {selectedCountry.status === 'lived' && (
                  <View style={[styles.statusTag, styles.statusTagLived]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.status.lived.color }]} />
                    <Text style={[styles.statusTagText, { color: colors.status.lived.bright }]}>
                      {currentLang === 'tr' ? 'İkamet Edilen / Yaşanan' : 'Residence / Lived'}
                    </Text>
                  </View>
                )}

                {selectedCountry.status === 'visited' && (
                  <View style={[styles.statusTag, styles.statusTagVisited]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.status.visited.color }]} />
                    <Text style={[styles.statusTagText, { color: colors.status.visited.bright }]}>
                      {currentLang === 'tr' ? 'Ziyaret Edildi' : 'Visited'}
                      {selectedCountry.visitedYear ? ` • ${selectedCountry.visitedYear}` : ''}
                    </Text>
                  </View>
                )}

                {selectedCountry.status === 'want' && (
                  <View style={[styles.statusTag, styles.statusTagWant]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.gold.base }]} />
                    <Text style={[styles.statusTagText, { color: colors.gold.light }]}>
                      {currentLang === 'tr' ? 'Hedef Seyahat Listesinde' : 'In Wishlist'}
                    </Text>
                  </View>
                )}

                {!selectedCountry.status && (
                  <View style={[styles.statusTag, styles.statusTagUnmarked]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.text.muted }]} />
                    <Text style={[styles.statusTagText, { color: colors.text.secondary }]}>
                      {currentLang === 'tr' ? 'Henüz Keşfedilmedi' : 'Unexplored yet'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleOpenCountryDetail}
                activeOpacity={0.8}
                style={[
                  styles.countryActionBtn,
                  selectedCountry.status ? styles.countryActionBtnPrimary : styles.countryActionBtnAdd,
                ]}
              >
                {selectedCountry.status ? (
                  <>
                    <Text style={styles.countryActionBtnText}>
                      {currentLang === 'tr' ? 'Pasaport Detayını Gör' : 'View Passport Details'}
                    </Text>
                    <ChevronRight size={16} color={colors.text.primary} />
                  </>
                ) : (
                  <>
                    <Plus size={16} color={colors.canvas.base} strokeWidth={2.5} />
                    <Text style={[styles.countryActionBtnText, { color: colors.canvas.base }]}>
                      {currentLang === 'tr' ? 'Haritama Ekle' : 'Add to My Map'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas.base,
    position: 'relative',
  },
  safeHeaderArea: {
    backgroundColor: colors.canvas.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.fillStrong,
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
    marginLeft: 36,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass.fillStrong,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.borderSoft,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.glass.hairline,
    borderColor: colors.glass.borderStrong,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: colors.glass.borderSoft,
  },
  countBadgeActive: {
    backgroundColor: colors.glass.borderStrong,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.muted,
  },
  countTextActive: {
    color: colors.text.primary,
  },
  mapViewport: {
    flex: 1,
    backgroundColor: colors.canvas.base,
    position: 'relative',
  },
  tipContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.panel.base,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.soft,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  countryCard: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 8 : 16,
    padding: 16,
    borderRadius: 20,
        borderWidth: 1,
    borderColor: colors.glass.fillActive,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  countryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCardFlagWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.glass.borderSoft,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countryFlagEmoji: {
    fontSize: 24,
  },
  countryCardMeta: {
    flex: 1,
  },
  countryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryCardName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  countryContinentText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 2,
  },
  cardCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass.fillStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statusTagLived: {
    backgroundColor: colors.status.lived.light,
  },
  statusTagVisited: {
    backgroundColor: colors.status.visited.light,
  },
  statusTagWant: {
    backgroundColor: colors.gold.tint,
  },
  statusTagUnmarked: {
    backgroundColor: colors.glass.fillStrong,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTagText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  countryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  countryActionBtnPrimary: {
    backgroundColor: colors.glass.hairline,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  countryActionBtnAdd: {
    backgroundColor: colors.gold.base,
  },
  countryActionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
}));
