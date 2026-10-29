import { fonts } from '../theme/typography';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  MapPin,
  User,
  RotateCcw,
  Globe,
  Search,
  ChevronDown,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { availableCatalog, CatalogCountry } from '../data/travelData';
import { Profile } from '../stores/types';
import { generateHandle } from '../services/storageService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSaveProfile: (profile: any) => void;
  onDeleteAccount?: () => void;
  t: Record<string, any>;
  currentLang: 'tr' | 'en';
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onDeleteAccount,
  t,
  currentLang,
}: EditProfileModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CatalogCountry | null>(null);
  const [homeCity, setHomeCity] = useState('');
  const [isPickingCountry, setIsPickingCountry] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setHomeCity(profile.homeCity || '');

      // Resolve country from profile
      if (profile.homeCountryId) {
        const found = availableCatalog.find(
          (c) => c.id.toUpperCase() === profile.homeCountryId.toUpperCase()
        );
        setSelectedCountry(found || null);
      } else if (profile.customLocation) {
        // Fallback: search country name in customLocation text
        const lowerLoc = profile.customLocation.toLowerCase();
        const found = availableCatalog.find((c) => {
          return (
            lowerLoc.includes(c.name.toLowerCase()) ||
            (c.nameTr && lowerLoc.includes(c.nameTr.toLowerCase()))
          );
        });
        setSelectedCountry(found || null);
      } else {
        setSelectedCountry(null);
      }

      setIsPickingCountry(false);
      setCountrySearch('');
    }
  }, [isOpen, profile]);

  const filteredCountries = availableCatalog.filter((c) => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = c.name.toLowerCase().includes(q);
    const nameTrMatch = c.nameTr && c.nameTr.toLowerCase().includes(q);
    const codeMatch = c.id.toLowerCase().includes(q);
    return nameMatch || nameTrMatch || codeMatch;
  });

  const handleSelectCountry = (country: CatalogCountry) => {
    Haptics.selectionAsync();
    setSelectedCountry(country);
    setIsPickingCountry(false);
    setCountrySearch('');
  };

  const handleClearCountry = () => {
    Haptics.selectionAsync();
    setSelectedCountry(null);
    setIsPickingCountry(false);
  };

  const handleResetToAuto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(null);
    setHomeCity('');
    setIsPickingCountry(false);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const cleanName =
      name.trim() || profile?.name || (currentLang === 'tr' ? 'Dünya Gezgini' : 'Global Citizen');
    const cleanCity = homeCity.trim() || null;

    // Generate initials from cleanName
    const initials =
      cleanName
        .split(' ')
        .map((w: string) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'AT';

    const countryName = selectedCountry
      ? currentLang === 'tr'
        ? selectedCountry.nameTr || selectedCountry.name
        : selectedCountry.name
      : null;

    const formattedCustomLocation = selectedCountry
      ? `${selectedCountry.flag || '📍'} ${cleanCity ? `${cleanCity}, ` : ''}${countryName}`
      : cleanCity || null;

    onSaveProfile({
      ...profile,
      name: cleanName,
      handle: generateHandle(cleanName),
      avatarInitials: initials,
      homeCountryId: selectedCountry?.id || null,
      homeCountryFlag: selectedCountry?.flag || null,
      homeCountryName: countryName,
      homeCity: cleanCity,
      customLocation: formattedCustomLocation,
    });

    onClose();
  };

  // Preview computation
  const getPreviewText = () => {
    if (selectedCountry) {
      const cName =
        currentLang === 'tr'
          ? selectedCountry.nameTr || selectedCountry.name
          : selectedCountry.name;
      return `${selectedCountry.flag} ${homeCity.trim() ? `${homeCity.trim()}, ` : ''}${cName}`;
    }
    if (homeCity.trim()) {
      return `📍 ${homeCity.trim()}`;
    }
    return `🌍 ${t.autoLocationPreview || 'Otomatik (Dinamik Konum)'}`;
  };

  return (
    <Sheet visible={isOpen} onClose={onClose} maxHeight="88%">

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t.editProfile || 'Profili Düzenle'}</Text>
              <Text style={styles.subtitle}>
                {t.editProfileSubtitle || 'Pasaport kimlik ve konum tercihlerini güncelle'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeBtn}
            >
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={12} color={colors.gold.base} />
                <Text style={styles.label}>
                  {currentLang === 'tr' ? 'AD SOYAD' : 'FULL NAME'}
                </Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={currentLang === 'tr' ? 'Adın Soyadın' : 'Your Name'}
                placeholderTextColor={colors.text.secondary}
                style={styles.input}
              />
            </View>

            {/* Home Country (With Flag) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={12} color={colors.gold.base} />
                <Text style={styles.label}>
                  {t.homeCountryLabel || 'YAŞADIĞIN ÜLKE'}
                </Text>
              </View>

              {selectedCountry ? (
                <View style={styles.selectedCountryCard}>
                  <View style={styles.countryInfoRow}>
                    <Text style={styles.countryFlagLarge}>{selectedCountry.flag}</Text>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={styles.countryNameSelected}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {currentLang === 'tr'
                          ? selectedCountry.nameTr || selectedCountry.name
                          : selectedCountry.name}
                      </Text>
                      <Text style={styles.countryCodeBadge}>{selectedCountry.id}</Text>
                    </View>
                  </View>

                  <View style={styles.countryActions}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setIsPickingCountry(!isPickingCountry);
                      }}
                      activeOpacity={0.7}
                      style={styles.changeCountryBtn}
                    >
                      <Text style={styles.changeCountryText}>
                        {t.changeCountry || 'Değiştir'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleClearCountry}
                      activeOpacity={0.7}
                      style={styles.clearCountryBtn}
                    >
                      <X size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIsPickingCountry(!isPickingCountry);
                  }}
                  activeOpacity={0.7}
                  style={styles.countryPickerTrigger}
                >
                  <View style={styles.pickerTriggerLeft}>
                    <Globe size={16} color={colors.text.muted} />
                    <Text style={styles.pickerTriggerPlaceholder}>
                      {t.noCountrySelected || 'Ülke Seç (İsteğe Bağlı)'}
                    </Text>
                  </View>
                  <ChevronDown size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              )}

              {/* Expandable Country Search List */}
              {isPickingCountry && (
                <View style={styles.pickerContainer}>
                  <View style={styles.searchRow}>
                    <Search size={14} color={colors.text.secondary} />
                    <TextInput
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      placeholder={t.searchCountry || 'Ülke ara...'}
                      placeholderTextColor={colors.text.secondary}
                      style={styles.countrySearchInput}
                      autoFocus={true}
                    />
                    {Boolean(countrySearch) && (
                      <TouchableOpacity onPress={() => setCountrySearch('')}>
                        <X size={14} color={colors.text.secondary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView
                    nestedScrollEnabled={true}
                    style={styles.countryListScroll}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredCountries.slice(0, 40).map((country) => (
                      <TouchableOpacity
                        key={country.id}
                        onPress={() => handleSelectCountry(country)}
                        activeOpacity={0.7}
                        style={[
                          styles.countryOption,
                          selectedCountry?.id === country.id && styles.countryOptionActive,
                        ]}
                      >
                        <Text style={styles.countryOptionFlag}>{country.flag}</Text>
                        <Text
                          style={styles.countryOptionName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {currentLang === 'tr'
                            ? country.nameTr || country.name
                            : country.name}
                        </Text>
                        <Text style={styles.countryOptionCode}>{country.id}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Home City / Region (Optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MapPin size={12} color={colors.gold.base} />
                <Text style={styles.label}>
                  {t.homeCityLabel || 'ŞEHİR / BÖLGE (İSTEĞE BAĞLI)'}
                </Text>
              </View>
              <TextInput
                value={homeCity}
                onChangeText={setHomeCity}
                placeholder={t.homeCityPlaceholder || 'Örn: Kadıköy, İstanbul'}
                placeholderTextColor={colors.text.secondary}
                style={styles.input}
              />
            </View>

            {/* Live Passport Preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Sparkles size={12} color={colors.gold.base} />
                <Text style={styles.previewLabel}>{t.previewLabel || 'PASAPORT GÖRÜNÜMÜ'}</Text>
              </View>
              <View style={styles.previewPill}>
                <Text style={styles.previewText} numberOfLines={1}>
                  {getPreviewText()}
                </Text>
              </View>
            </View>

            {/* Reset to Auto Button */}
            {(Boolean(selectedCountry) || Boolean(homeCity)) && (
              <TouchableOpacity
                onPress={handleResetToAuto}
                activeOpacity={0.7}
                style={styles.resetBtn}
              >
                <RotateCcw size={12} color={colors.gold.base} />
                <Text style={styles.resetBtnText}>
                  {t.resetToAuto || 'Otomatik Konuma Dön'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <Button
              onPress={handleSave}
              label={t.saveChanges || 'Değişiklikleri Kaydet'}
              icon={(color) => <Check size={17} color={color} strokeWidth={2.5} />}
            />

            {/* Account Deletion (App Store Guideline 5.1.1(v) Compliant) */}
            {onDeleteAccount && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  Alert.alert(
                    t?.deleteAccountConfirmTitle || (currentLang === 'tr' ? 'Hesabı Kalıcı Olarak Sil' : 'Permanently Delete Account'),
                    t?.deleteAccountConfirmMsg ||
                      (currentLang === 'tr'
                        ? 'Hesabınızı silmek istediğinize emin misiniz? Tüm seyahatleriniz, pasaport mühürleriniz ve profil verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.'
                        : 'Are you sure you want to delete your account? All your travels, stamps, and profile data will be permanently wiped. This action cannot be undone.'),
                    [
                      { text: t?.cancel || (currentLang === 'tr' ? 'Vazgeç' : 'Cancel'), style: 'cancel' },
                      {
                        text: t?.deleteAccount || (currentLang === 'tr' ? 'Hesabı Sil' : 'Delete Account'),
                        style: 'destructive',
                        onPress: () => {
                          onClose();
                          onDeleteAccount();
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.7}
                style={styles.modalDeleteAccountBtn}
              >
                <Trash2 size={13} color={colors.dangerDeep} />
                <Text style={styles.modalDeleteAccountText}>
                  {t?.deleteAccount || (currentLang === 'tr' ? 'Hesabı Sil' : 'Delete Account')}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Sheet>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    color: colors.text.primary,
    letterSpacing: -0.5,
    fontFamily: fonts.display,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass.fillStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  pickerTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerTriggerPlaceholder: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '500',
  },
  selectedCountryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.status.visited.light,
    borderWidth: 1,
    borderColor: colors.status.visited.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  countryFlagLarge: {
    fontSize: 26,
  },
  countryNameSelected: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    flexShrink: 1,
  },
  countryCodeBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold.light,
    marginTop: 1,
  },
  countryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  changeCountryBtn: {
    backgroundColor: colors.status.visited.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  changeCountryText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold.light,
  },
  clearCountryBtn: {
    backgroundColor: colors.dangerTint,
    padding: 6,
    borderRadius: 10,
  },
  pickerContainer: {
    backgroundColor: colors.canvas.raised,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    borderRadius: 16,
    padding: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.glass.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 0,
  },
  countryListScroll: {
    maxHeight: 180,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  countryOptionActive: {
    backgroundColor: colors.status.visited.light,
  },
  countryOptionFlag: {
    fontSize: 18,
  },
  countryOptionName: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  countryOptionCode: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '700',
    flexShrink: 0,
  },
  previewBox: {
    backgroundColor: colors.glass.fill,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glass.fillStrong,
    gap: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.gold.base,
    letterSpacing: 0.5,
  },
  previewPill: {
    backgroundColor: colors.glass.borderSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold.base,
  },
  modalDeleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.dangerTint,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginTop: 10,
    marginBottom: 6,
  },
  modalDeleteAccountText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
}));
