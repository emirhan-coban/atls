import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Calendar,
  MapPin,
  Heart,
  Plane,
  Edit3,
  Sparkles,
  BookOpen,
  Share2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import { availableCatalog, getLocalizedCountryName, formatCountryDate } from '../data/travelData';
import { getCountryTrivia } from '../data/countryTrivia';
import { Country } from '../stores/types';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Continent-themed gradient
  const getContinentGradient = () => {
    const cont = (baseCountry.continent || '').toLowerCase();
    if (cont.includes('europe')) return theme.colors.continents.europe.gradient;
    if (cont.includes('asia')) return theme.colors.continents.asia.gradient;
    if (cont.includes('america')) return theme.colors.continents.americas.gradient;
    if (cont.includes('africa')) return theme.colors.continents.africa.gradient;
    if (cont.includes('oceania')) return theme.colors.continents.oceania.gradient;
    return ['#4F46E5', '#6366F1'];
  };

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
      notes: userCountry?.notes || `Stamped in ${new Date().getFullYear()}`,
      notesTr: userCountry?.notesTr || `${new Date().getFullYear()} yılında mühürlendi`,
      visits: (userCountry?.visits || 0) + 1,
    };
    onStampVisited(payload);
    onClose();
  };

  const handlePickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          currentLang === 'tr' ? 'İzin Gerekli' : 'Permission Required',
          currentLang === 'tr'
            ? 'Fotoğraf eklemek için galeri erişim izni vermelisiniz.'
            : 'Please grant camera roll permissions to add travel photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newUris = result.assets.map((a) => a.uri);
        const existingPhotos = userCountry?.photos || [];
        const mergedPhotos = [...existingPhotos, ...newUris];

        const updatedCountry: Country = {
          ...(userCountry || baseCountry),
          status: userCountry?.status || 'visited',
          photos: mergedPhotos,
        };

        if (onUpdateCountry) {
          onUpdateCountry(updatedCountry);
        }
      }
    } catch (err) {
      console.warn('Error picking image:', err);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header Banner with Continent Gradient */}
          <LinearGradient
            colors={getContinentGradient() as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.bannerContent}>
              <Text style={styles.flagEmoji}>{baseCountry.flag}</Text>
              <View style={styles.bannerBadgeRow}>
                <View style={styles.continentPill}>
                  <Sparkles size={11} color="#FFFFFF" />
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
                    <Calendar size={14} color="#6366F1" />
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
                    <MapPin size={14} color="#10B981" />
                    <Text style={styles.metaLabel}>
                      {currentLang === 'tr' ? 'Mühür Kodu' : 'Stamp ID'}
                    </Text>
                    <Text style={styles.metaValue}>{baseCountry.id}</Text>
                  </View>
                </View>

                {userCountry?.notes ? (
                  <View style={styles.notesBox}>
                    <BookOpen size={13} color="#4F46E5" />
                    <Text style={styles.notesText}>{userCountry.notes}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* PHOTO MEMORIES GALLERY */}
            <View style={styles.memoriesCard}>
              <View style={styles.memoriesHeader}>
                <View style={styles.memoriesTitleRow}>
                  <Camera size={15} color="#4F46E5" />
                  <Text style={styles.memoriesTitle}>
                    {currentLang === 'tr' ? 'SEYAHAT ANILARI' : 'TRAVEL MEMORIES'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handlePickPhotos}
                  activeOpacity={0.7}
                  style={styles.addPhotoPill}
                >
                  <Camera size={12} color="#4F46E5" />
                  <Text style={styles.addPhotoPillText}>
                    {currentLang === 'tr' ? '+ Fotoğraf' : '+ Photo'}
                  </Text>
                </TouchableOpacity>
              </View>

              {userCountry?.photos && userCountry.photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                  {userCountry.photos.map((uri, idx) => (
                    <View key={idx} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photoThumbnail} />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity onPress={handlePickPhotos} activeOpacity={0.8} style={styles.emptyPhotosBox}>
                  <ImageIcon size={20} color="#94A3B8" />
                  <Text style={styles.emptyPhotosText}>
                    {currentLang === 'tr' ? 'Bu seyahatten ilk fotoğrafını ekle' : 'Add your first photo from this trip'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cultural Fun Fact & Trivia */}
            <View style={styles.triviaCard}>
              <View style={styles.triviaHeader}>
                <Sparkles size={14} color="#F59E0B" />
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
                    colors={['#FF6B35', '#FF8A5B']}
                    style={styles.gradientBtn}
                  >
                    <Plane size={18} color="#090B0E" strokeWidth={2.5} />
                    <Text style={styles.primaryActionText}>
                      {currentLang === 'tr' ? 'Pasaporta Mühürle ✈️' : 'Stamp into Passport ✈️'}
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
                    <Edit3 size={16} color="#FFFFFF" />
                    <Text style={styles.secondaryBtnText}>
                      {currentLang === 'tr' ? 'Mühürü Düzenle' : 'Edit Stamp'}
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
                    <Share2 size={16} color="#E5A93C" />
                    <Text style={[styles.secondaryBtnText, { color: '#E5A93C' }]}>
                      {currentLang === 'tr' ? 'Kartı Paylaş' : 'Share Card'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0D111A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continentPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusPill: {
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  wishlistPill: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#FF6B35',
  },
  statusPillText: {
    color: '#FFFFFF',
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
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  countrySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  notesText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },
  triviaCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.10)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
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
    color: '#FF8A5B',
    letterSpacing: 0.8,
  },
  triviaBody: {
    fontSize: 13,
    color: '#FDBA74',
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
    color: '#090B0E',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtnHighlight: {
    borderColor: 'rgba(226, 249, 82, 0.3)',
    backgroundColor: 'rgba(226, 249, 82, 0.10)',
  },
  memoriesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  memoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoriesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memoriesTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#60A5FA',
    letterSpacing: 0.8,
  },
  addPhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  addPhotoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  photosScroll: {
    gap: 10,
  },
  photoContainer: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyPhotosBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyPhotosText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
