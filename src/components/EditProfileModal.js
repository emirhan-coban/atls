import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
} from 'lucide-react-native';
import { availableCatalog } from '../data/travelData';
import { generateHandle } from '../services/storageService';

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  t,
  currentLang,
}) {
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
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

  const handleSelectCountry = (country) => {
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
        .map((w) => w[0])
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
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.handleBar} />

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
              <X size={18} color="#64748B" />
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
                <User size={12} color="#2563EB" />
                <Text style={styles.label}>
                  {currentLang === 'tr' ? 'AD SOYAD' : 'FULL NAME'}
                </Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={currentLang === 'tr' ? 'Adın Soyadın' : 'Your Name'}
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            {/* Home Country (With Flag) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Globe size={12} color="#2563EB" />
                <Text style={styles.label}>
                  {t.homeCountryLabel || 'YAŞADIĞIN ÜLKE'}
                </Text>
              </View>

              {selectedCountry ? (
                <View style={styles.selectedCountryCard}>
                  <View style={styles.countryInfoRow}>
                    <Text style={styles.countryFlagLarge}>{selectedCountry.flag}</Text>
                    <View>
                      <Text style={styles.countryNameSelected}>
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
                      <X size={14} color="#EF4444" />
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
                    <Globe size={16} color="#64748B" />
                    <Text style={styles.pickerTriggerPlaceholder}>
                      {t.noCountrySelected || 'Ülke Seç (İsteğe Bağlı)'}
                    </Text>
                  </View>
                  <ChevronDown size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}

              {/* Expandable Country Search List */}
              {isPickingCountry && (
                <View style={styles.pickerContainer}>
                  <View style={styles.searchRow}>
                    <Search size={14} color="#94A3B8" />
                    <TextInput
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      placeholder={t.searchCountry || 'Ülke ara...'}
                      placeholderTextColor="#94A3B8"
                      style={styles.countrySearchInput}
                      autoFocus={true}
                    />
                    {Boolean(countrySearch) && (
                      <TouchableOpacity onPress={() => setCountrySearch('')}>
                        <X size={14} color="#94A3B8" />
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
                        <Text style={styles.countryOptionName}>
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
                <MapPin size={12} color="#2563EB" />
                <Text style={styles.label}>
                  {t.homeCityLabel || 'ŞEHİR / BÖLGE (İSTEĞE BAĞLI)'}
                </Text>
              </View>
              <TextInput
                value={homeCity}
                onChangeText={setHomeCity}
                placeholder={t.homeCityPlaceholder || 'Örn: Kadıköy, İstanbul'}
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            {/* Live Passport Preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Sparkles size={12} color="#2563EB" />
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
                <RotateCcw size={12} color="#2563EB" />
                <Text style={styles.resetBtnText}>
                  {t.resetToAuto || 'Otomatik Konuma Dön'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={styles.saveBtn}
            >
              <Check size={17} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>
                {t.saveChanges || 'Değişiklikleri Kaydet'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
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
    color: '#64748B',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedCountryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryFlagLarge: {
    fontSize: 26,
  },
  countryNameSelected: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  countryCodeBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },
  countryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeCountryBtn: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  changeCountryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  clearCountryBtn: {
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 10,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  countrySearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
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
    backgroundColor: '#EFF6FF',
  },
  countryOptionFlag: {
    fontSize: 18,
  },
  countryOptionName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  countryOptionCode: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  previewPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
    color: '#2563EB',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
