import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Search, Check, Plus, MapPin, Home, Heart, Sparkles } from 'lucide-react-native';
import { availableCatalog, getLocalizedCountryName, getLocalizedContinent } from '../data/travelData';

export default function AddCountryModal({
  isOpen,
  onClose,
  onAddCountry,
  onUpdateCountry,
  existingCountryIds = [],
  existingCountries = [],
  t,
  currentLang,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('visited');
  const [notes, setNotes] = useState('');

  const normalizeText = (str) => {
    if (!str) return '';
    return str
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filteredCatalog = availableCatalog.filter((c) => {
    const existing = existingCountries.find((ec) => ec.id === c.id);
    if (existing && existing.status !== 'want') return false;
    if (!existing && existingCountries.length === 0 && existingCountryIds.includes(c.id)) return false;

    const raw = searchTerm.trim();
    if (!raw) return true;
    const term = normalizeText(raw);
    const code = c.id.toLowerCase();

    // Common aliases
    if ((term === 'abd' || term === 'amerika' || term === 'usa') && c.id === 'US') return true;
    if ((term === 'uk' || term === 'ingiltere') && c.id === 'GB') return true;
    if ((term === 'bae' || term === 'dubai') && c.id === 'AE') return true;

    const matchCode = code.includes(term);
    const matchEn = normalizeText(c.name).includes(term);
    const matchTr = c.nameTr && normalizeText(c.nameTr).includes(term);
    return matchCode || matchEn || matchTr;
  });

  const handleSubmit = () => {
    if (!selectedCountry) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const countryNameEn = selectedCountry.name;
    const countryNameTr = selectedCountry.nameTr || selectedCountry.name;
    const currentYear = new Date().getFullYear().toString();
    const defaultNote = t.defaultMarkedNote
      ? t.defaultMarkedNote.replace('{year}', currentYear)
      : `Marked in ${currentYear}`;

    const existing = existingCountries.find((ec) => ec.id === selectedCountry.id);
    const isConverting = existing && existing.status === 'want' && selectedStatus !== 'want';

    const payload = {
      id: selectedCountry.id,
      name: countryNameEn,
      nameTr: countryNameTr,
      flag: selectedCountry.flag,
      status: selectedStatus,
      year: currentYear,
      yearTr: currentYear,
      notes: notes || defaultNote,
      notesTr: notes || defaultNote,
      visits: selectedStatus === 'want' ? 0 : 1,
    };

    if (existing && onUpdateCountry) {
      onUpdateCountry(payload);
    } else {
      onAddCountry(payload);
    }

    setSelectedCountry(null);
    setSearchTerm('');
    setNotes('');
    onClose();

    if (isConverting) {
      setTimeout(() => {
        Alert.alert(
          currentLang === 'tr' ? '🎉 Pasaportuna Mühürlendi!' : '🎉 Stamped in Your Passport!',
          currentLang === 'tr'
            ? `Tebrikler! ${selectedCountry.flag} ${countryNameTr} hedeflerinden pasaportuna resmi ${selectedStatus === 'lived' ? 'ikamet' : 'giriş'} mührü olarak eklendi!`
            : `Congratulations! ${selectedCountry.flag} ${countryNameEn} is now officially stamped into your passport!`
        );
      }, 300);
    }
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
          {/* Handlebar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{t.markCountry}</Text>
                <Text style={styles.titleDot}>.</Text>
              </View>
              <Text style={styles.subtitle}>{t.markCountrySubtitle}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={16} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          {/* Catalog Selection List */}
          <ScrollView
            style={[
              styles.catalogList,
              selectedCountry ? styles.catalogListCompact : styles.catalogListExpanded,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {filteredCatalog.map((c) => {
              const isSelected = selectedCountry?.id === c.id;
              const displayName = getLocalizedCountryName(c, currentLang);
              const displayContinent = getLocalizedContinent(c, currentLang);
              const existing = existingCountries.find((ec) => ec.id === c.id);
              const isWishlist = existing && existing.status === 'want';

              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCountry(c);
                    if (isWishlist) {
                      setSelectedStatus('visited');
                      if (existing.notes) setNotes(existing.notes);
                    }
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.catalogItem,
                    isSelected && styles.catalogItemSelected,
                  ]}
                >
                  <View style={styles.catalogItemLeft}>
                    <Text style={styles.catalogFlag}>{c.flag}</Text>
                    <View style={styles.catalogTextGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.catalogName,
                            isSelected && styles.catalogNameSelected,
                          ]}
                        >
                          {displayName}
                        </Text>
                        {isWishlist && (
                          <View style={styles.wishlistTagBadge}>
                            <Text style={styles.wishlistTagText}>
                              {t.inWishlistBadge || (currentLang === 'tr' ? 'HEDEFİNDE' : 'WISHLIST')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.catalogContinent}>{displayContinent}</Text>
                    </View>
                  </View>
                  {isSelected && <Check size={16} color="#5B4DFF" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Status Options */}
          {selectedCountry && (
            <View style={styles.formSection}>
              {existingCountries.some((ec) => ec.id === selectedCountry.id && ec.status === 'want') && (
                <View style={styles.convertNoticeBox}>
                  <Sparkles size={14} color="#2563EB" />
                  <Text style={styles.convertNoticeText}>
                    {currentLang === 'tr'
                      ? 'Bu ülke hedeflerinizde kayıtlı. Şimdi resmi giriş mührü basabilirsiniz!'
                      : 'This country is in your wishlist. You can now stamp it into your passport!'}
                  </Text>
                </View>
              )}
              <Text style={styles.sectionLabel}>{t.travelStatus}</Text>
              <View style={styles.statusButtonsRow}>
                <TouchableOpacity
                  onPress={() => setSelectedStatus('visited')}
                  style={[
                    styles.statusBtn,
                    selectedStatus === 'visited' && styles.statusBtnActiveVisited,
                  ]}
                >
                  <MapPin
                    size={16}
                    color={selectedStatus === 'visited' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      selectedStatus === 'visited' && styles.statusBtnTextActive,
                    ]}
                  >
                    {t.visited}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedStatus('lived')}
                  style={[
                    styles.statusBtn,
                    selectedStatus === 'lived' && styles.statusBtnActiveLived,
                  ]}
                >
                  <Home
                    size={16}
                    color={selectedStatus === 'lived' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      selectedStatus === 'lived' && styles.statusBtnTextActive,
                    ]}
                  >
                    {t.livedIn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedStatus('want')}
                  style={[
                    styles.statusBtn,
                    selectedStatus === 'want' && styles.statusBtnActiveWant,
                  ]}
                >
                  <Heart
                    size={16}
                    color={selectedStatus === 'want' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      selectedStatus === 'want' && styles.statusBtnTextActive,
                    ]}
                  >
                    {t.wishlist}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Note input */}
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={t.notesPlaceholder}
                placeholderTextColor="#94A3B8"
                style={styles.notesInput}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                style={styles.submitButton}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.submitText}>{t.confirmStamp}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    paddingBottom: 40,
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
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  titleDot: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5B4DFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  catalogList: {
    marginBottom: 14,
  },
  catalogListExpanded: {
    maxHeight: 280,
    minHeight: 180,
  },
  catalogListCompact: {
    maxHeight: 140,
  },
  catalogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  catalogItemSelected: {
    backgroundColor: 'rgba(91, 77, 255, 0.08)',
  },
  catalogItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  catalogTextGroup: {
    flex: 1,
    gap: 2,
  },
  catalogFlag: {
    fontSize: 22,
  },
  catalogName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  catalogNameSelected: {
    color: '#5B4DFF',
    fontWeight: '800',
  },
  catalogContinent: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  wishlistTagBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  wishlistTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  convertNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  convertNoticeText: {
    fontSize: 11.5,
    color: '#1D4ED8',
    fontWeight: '700',
    flex: 1,
  },
  formSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBtnActiveVisited: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusBtnActiveLived: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusBtnActiveWant: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5B4DFF',
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
