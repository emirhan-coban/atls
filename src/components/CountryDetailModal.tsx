import CountryProfileSection from './CountryProfileSection';
import TripEditorSheet from './TripEditorSheet';
import PlanEditorSheet from './PlanEditorSheet';
import { lt as lt2 } from '../localization/planner';
import CelebrationLayer from './CelebrationLayer';
import Button from './ui/Button';
import { useTripStore } from '../stores/useTripStore';
import { sortTripsNewestFirst } from '../utils/stats';
import { monthShort } from '../data/months';
import { jt } from '../localization/journey';
import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  X,
  Calendar,
  MapPin,
  Plane,
  Edit3,
  Sparkles,
  BookOpen,
  Share2,
  Plus,
  CalendarClock,
} from 'lucide-react-native';
import { availableCatalog, getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { Country, Trip } from '../stores/types';
import GlassCard from './GlassCard';
import { theme } from '../theme';


interface CountryDetailModalProps {
  isOpen: boolean;
  countryId: string | null;
  countries: Country[];
  onClose: () => void;
  onStampVisited: (country: Country) => void;
  onUpdateCountry?: (country: Country) => void;
  onOpenEditModal: (country: Country) => void;
  onOpenShareModal?: (country: Country) => void;
  currentLang: 'tr' | 'en';
  t: any;
}

export default function CountryDetailModal({
  isOpen,
  countryId,
  countries,
  onClose,
  onStampVisited,
  onUpdateCountry,
  onOpenEditModal,
  onOpenShareModal,
  currentLang,
  t,
}: CountryDetailModalProps) {
  const [editor, setEditor] = useState<{ trip?: Trip | null } | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const { colors } = useTheme();
  const styles = useStyles();
  const allTrips = useTripStore((s) => s.trips);
  if (!isOpen || !countryId) return null;

  // Find in user's marked countries or catalog
  const userCountry = countries.find((c) => c.id.toUpperCase() === countryId.toUpperCase());
  const catalogEntry = availableCatalog.find((c) => c.id.toUpperCase() === countryId.toUpperCase());

  if (!catalogEntry && !userCountry) return null;

  const baseCountry = userCountry || {
    id: catalogEntry?.id || countryId,
    name: catalogEntry?.name || countryId,
    nameTr: catalogEntry?.nameTr || catalogEntry?.name || countryId,
    continent: catalogEntry?.continent || 'World',
    continentTr: catalogEntry?.continentTr || 'Dünya',
    flag: catalogEntry?.flag || '🌍',
    status: null,
  };

  const localizedName = getLocalizedCountryName(baseCountry, currentLang);
  const secondaryName = currentLang === 'tr' ? baseCountry.name : baseCountry.nameTr;
  const continent =
    currentLang === 'tr'
      ? baseCountry.continentTr || baseCountry.continent
      : baseCountry.continent;
  const trivia = getCountryTrivia(baseCountry.id, localizedName, currentLang);

  const isVisited = userCountry?.status === 'visited';
  const isLived = userCountry?.status === 'lived';
  const isWant = userCountry?.status === 'want';
  const isMarked = isVisited || isLived;
  const countryTrips = sortTripsNewestFirst(allTrips.filter((trip) => trip.countryId === baseCountry.id));

  // Continent-themed gradient
  const getContinentGradient = () => {
    const cont = (baseCountry.continent || '').toLowerCase();
    if (cont.includes('europe')) return theme.colors.continents.europe.gradient;
    if (cont.includes('asia')) return theme.colors.continents.asia.gradient;
    if (cont.includes('america')) return theme.colors.continents.americas.gradient;
    if (cont.includes('africa')) return theme.colors.continents.africa.gradient;
    if (cont.includes('oceania')) return theme.colors.continents.oceania.gradient;
    return [colors.gold.deep, colors.gold.base];
  };

  // Soft continent glow: a translucent wash of the continent colour fading into the sheet
  const bannerGradient: [string, string] = [`${getContinentGradient()[0]}40`, 'rgba(0, 0, 0, 0)'];

  const handleQuickStamp = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dateFormatted = `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    const payload: Country = {
      id: baseCountry.id,
      name: baseCountry.name,
      nameTr: baseCountry.nameTr,
      flag: baseCountry.flag,
      status: 'visited',
      year: new Date().getFullYear().toString(),
      visitedYear: new Date().getFullYear().toString(),
      month: String(new Date().getMonth() + 1).padStart(2, '0'),
      visitedMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
      date: dateFormatted,
      continent: baseCountry.continent,
      continentTr: baseCountry.continentTr,
      notes: userCountry?.notes || `Added in ${new Date().getFullYear()}`,
      notesTr: userCountry?.notesTr || `${new Date().getFullYear()} yılında eklendi`,
      visits: (userCountry?.visits || 0) + 1,
    };
    onStampVisited(payload);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <GlassCard style={styles.modalContainer}>
          {/* Header Banner with Continent Gradient */}
          <LinearGradient
            colors={bannerGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.bannerHeader}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onClose();
              }}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X size={18} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.bannerContent}>
              <Text style={styles.flagEmoji}>{baseCountry.flag}</Text>
              <View style={styles.bannerBadgeRow}>
                <View style={styles.continentPill}>
                  <Sparkles size={11} color={colors.text.primary} />
                  <Text style={styles.continentPillText}>{continent}</Text>
                </View>

                {isMarked && (
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>
                      {isLived
                        ? currentLang === 'tr'
                          ? 'İKAMET EDİLDİ 🏡'
                          : 'RESIDENCE 🏡'
                        : currentLang === 'tr'
                        ? 'ZİYARET EDİLDİ ✈️'
                        : 'VISITED ✈️'}
                    </Text>
                  </View>
                )}

                {isWant && (
                  <View style={[styles.statusPill, styles.wishlistPill]}>
                    <Text style={styles.statusPillText}>
                      {currentLang === 'tr' ? 'HEDEFLERDE ❤️' : 'IN WISHLIST ❤️'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Modal Body */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title & Subtitle */}
            <View style={styles.titleSection}>
              <Text style={styles.countryTitle}>{localizedName}</Text>
              {secondaryName && secondaryName !== localizedName && (
                <Text style={styles.countrySubtitle}>{secondaryName}</Text>
              )}
            </View>

            {/* Travel Metadata (if marked) */}
            {isMarked && (
              <View style={styles.metaCard}>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={colors.gold.base} />
                    <Text style={styles.metaLabel}>
                      {currentLang === 'tr' ? 'Ziyaret Yılı' : 'Visited Year'}
                    </Text>
                    <Text style={styles.metaValue}>
                      {formatCountryDate(userCountry, currentLang) ||
                        userCountry?.year ||
                        userCountry?.visitedYear ||
                        '—'}
                    </Text>
                  </View>

                  <View style={styles.metaDivider} />

                  <View style={styles.metaItem}>
                    <MapPin size={14} color={colors.status.lived.color} />
                    <Text style={styles.metaLabel}>
                      {currentLang === 'tr' ? 'Ülke Kodu' : 'Country code'}
                    </Text>
                    <Text style={styles.metaValue}>{baseCountry.id}</Text>
                  </View>
                </View>

                {userCountry?.notes ? (
                  <View style={styles.notesBox}>
                    <BookOpen size={13} color={colors.gold.base} />
                    <Text style={styles.notesText}>{userCountry.notes}</Text>
                  </View>
                ) : null}
              </View>
            )}

            <CountryProfileSection
              countryId={baseCountry.id}
              currentLang={currentLang}
              isHomeCountry={baseCountry.id === 'TR' && userCountry?.status === 'lived'}
            />

            {/* Wishlist country: plan the trip */}
            {isWant && (
              <Button
                label={lt2('planTrip', currentLang)}
                onPress={() => setPlanOpen(true)}
                icon={(color) => <CalendarClock size={16} color={color} />}
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Trips to this country */}
            {isMarked && (
              <View style={styles.tripsSection}>
                <View style={styles.tripsHeader}>
                  <Text style={styles.tripsTitle}>
                    {jt('tripsOfCountry', currentLang)} ({countryTrips.length})
                  </Text>
                  {(
                    <Button
                      size="sm"
                      variant="secondary"
                      label={jt('addTrip', currentLang)}
                      onPress={() => setEditor({})}
                      icon={(color) => <Plus size={14} color={color} strokeWidth={2.5} />}
                    />
                  )}
                </View>
                {countryTrips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    onPress={() => setEditor({ trip })}
                    activeOpacity={0.8}
                    style={styles.tripRow}
                    accessibilityRole="button"
                  >
                    <Text style={styles.tripRowDate}>
                      {[monthShort(trip.month, currentLang), trip.year].filter(Boolean).join(' ')}
                    </Text>
                    <Text style={styles.tripRowMeta} numberOfLines={1}>
                      {[
                        trip.days ? `${trip.days} ${jt('daysUnit', currentLang)}` : null,
                        trip.cities.join(', ') || null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Cultural Fun Fact & Trivia */}
            <View style={styles.triviaCard}>
              <View style={styles.triviaHeader}>
                <Sparkles size={14} color={colors.gold.base} />
                <Text style={styles.triviaHeaderTitle}>
                  {currentLang === 'tr' ? 'BUNU BİLİYOR MUYDUN?' : 'CULTURAL TRIVIA'}
                </Text>
              </View>
              <Text style={styles.triviaBody}>{trivia}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {!isMarked && (
                <TouchableOpacity
                  onPress={handleQuickStamp}
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.gold.base, colors.gold.light]}
                    style={styles.gradientBtn}
                  >
                    <Plane size={18} color={colors.canvas.base} strokeWidth={2.5} />
                    <Text style={styles.primaryActionText}>
                      {currentLang === 'tr' ? 'Pasaporta Ekle ✈️' : 'Add to Passport ✈️'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={styles.secondaryButtonsRow}>
                {userCountry && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      onClose();
                      onOpenEditModal(userCountry);
                    }}
                    style={styles.secondaryBtn}
                    activeOpacity={0.8}
                  >
                    <Edit3 size={16} color={colors.text.primary} />
                    <Text style={styles.secondaryBtnText}>
                      {currentLang === 'tr' ? 'Düzenle' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                )}

                {isMarked && onOpenShareModal && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      onClose();
                      onOpenShareModal(userCountry);
                    }}
                    style={styles.secondaryBtn}
                    activeOpacity={0.8}
                  >
                    <Share2 size={16} color={colors.gold.base} />
                    <Text style={[styles.secondaryBtnText, { color: colors.gold.base }]}>
                      {currentLang === 'tr' ? 'Kartı Paylaş' : 'Share Card'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </GlassCard>
        <CelebrationLayer hostId="detail" active={isOpen} currentLang={currentLang} />
        <PlanEditorSheet visible={planOpen} onClose={() => setPlanOpen(false)} currentLang={currentLang} countryId={baseCountry.id} />
        <TripEditorSheet
          visible={editor !== null}
          onClose={() => setEditor(null)}
          currentLang={currentLang}
          countryId={baseCountry.id}
          trip={editor?.trip}
        />
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  bannerHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
  },
  bannerContent: {
    alignItems: 'center',
    marginTop: 6,
  },
  flagEmoji: {
    fontSize: 58,
    marginBottom: 8,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glass.fillActive,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  continentPillText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusPill: {
    backgroundColor: colors.panel.base,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glass.fillActive,
  },
  wishlistPill: {
    backgroundColor: colors.gold.glow,
    borderColor: colors.gold.base,
  },
  statusPillText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  scrollBody: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  countryTitle: {
    fontSize: 32,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  countrySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: colors.glass.fill,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.glass.hairline,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glass.fillStrong,
  },
  notesText: {
    fontSize: 13,
    color: colors.text.soft,
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
  tripsSection: {
    gap: 8,
    marginBottom: 16,
  },
  tripsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.text.secondary,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  tripRowDate: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
  },
  tripRowMeta: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  triviaCard: {
    backgroundColor: colors.gold.tint,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold.glow,
    marginBottom: 24,
  },
  triviaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  triviaHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.gold.light,
    letterSpacing: 0.8,
  },
  triviaBody: {
    fontSize: 13,
    color: colors.text.soft,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryActionBtn: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  primaryActionText: {
    color: colors.canvas.base,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.glass.borderSoft,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  secondaryBtnText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtnHighlight: {
    borderColor: colors.gold.glow,
    backgroundColor: colors.gold.tint,
  },
}));
