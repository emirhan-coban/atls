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
import {
  X,
  Search,
  Check,
  Plus,
  Minus,
  MapPin,
  Home,
  Heart,
  Sparkles,
  Calendar,
  RotateCcw,
} from 'lucide-react-native';
import {
  availableCatalog,
  getLocalizedCountryName,
  getLocalizedContinent,
  MONTHS,
} from '../data/travelData';

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
  const now = new Date();
  const currentMonthId = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('visited');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthId);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
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

  const handleStepYear = (delta) => {
    Haptics.selectionAsync();
    const cur = parseInt(selectedYear, 10) || now.getFullYear();
    setSelectedYear(String(cur + delta));
  };

  const handleSubmit = () => {
    if (!selectedCountry) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const countryNameEn = selectedCountry.name;
    const countryNameTr = selectedCountry.nameTr || selectedCountry.name;
    const isWant = selectedStatus === 'want';

    const finalYear = isWant ? null : (selectedYear.trim() || currentYearStr);
    const finalMonth = isWant ? null : selectedMonth;
    const foundMonth = MONTHS.find((m) => m.id === finalMonth);
    const monthShortTr = foundMonth ? foundMonth.shortTr : finalMonth;
    const dateFormatted = finalMonth && finalYear ? `${finalMonth}/${finalYear}` : (finalYear || '');

    const defaultNote = t.defaultMarkedNote
      ? t.defaultMarkedNote.replace('{year}', isWant ? currentYearStr : (dateFormatted || currentYearStr))
      : `Marked in ${dateFormatted || currentYearStr}`;

    const existing = existingCountries.find((ec) => ec.id === selectedCountry.id);
    const isConverting = existing && existing.status === 'want' && selectedStatus !== 'want';

    const payload = {
      id: selectedCountry.id,
      name: countryNameEn,
      nameTr: countryNameTr,
      flag: selectedCountry.flag,
      status: selectedStatus,
      year: finalYear,
      visitedYear: finalYear,
      month: finalMonth,
      visitedMonth: finalMonth,
      date: dateFormatted,
      yearTr: isWant ? '' : `${monthShortTr} ${finalYear}`,
      notes: notes || defaultNote,
      notesTr: notes || defaultNote,
      visits: isWant ? 0 : 1,
    };

    if (existing && onUpdateCountry) {
      onUpdateCountry(payload);
    } else {
      onAddCountry(payload);
    }

    setSelectedCountry(null);
    setSearchTerm('');
    setNotes('');
    setSelectedMonth(currentMonthId);
    setSelectedYear(currentYearStr);
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

  const handleCloseModal = () => {
    setSelectedCountry(null);
    setSearchTerm('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCloseModal}
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
              <Text style={styles.subtitle}>
                {selectedCountry
                  ? (currentLang === 'tr' ? 'Tarih ve seyahat durumunu belirle' : 'Set date and travel status')
                  : t.markCountrySubtitle}
              </Text>
            </View>

            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <X size={16} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Step 1: Country Selection (Shown before country is selected) */}
          {!selectedCountry && (
            <>
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
                {Boolean(searchTerm) && (
                  <TouchableOpacity
                    onPress={() => setSearchTerm('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Catalog Selection List */}
              <ScrollView
                style={styles.catalogList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredCatalog.map((c) => {
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
                      style={styles.catalogItem}
                    >
                      <View style={styles.catalogItemLeft}>
                        <Text style={styles.catalogFlag}>{c.flag}</Text>
                        <View style={styles.catalogTextGroup}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                            <Text
                              style={styles.catalogName}
                              numberOfLines={1}
                              ellipsizeMode="tail"
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
                      <Plus size={16} color="#2563EB" strokeWidth={2.5} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* Step 2: Date & Status Form (Shown after country is selected) */}
          {selectedCountry && (
            <ScrollView
              style={styles.formSectionScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Selected Country Card (Positioned directly above Date & Status) */}
              <View style={styles.selectedCountryCard}>
                <View style={styles.selectedCountryLeft}>
                  <Text style={styles.selectedCountryFlag}>{selectedCountry.flag}</Text>
                  <View style={styles.selectedCountryInfo}>
                    <Text
                      style={styles.selectedCountryName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {getLocalizedCountryName(selectedCountry, currentLang)}
                    </Text>
                    <Text style={styles.selectedCountrySub}>
                      {getLocalizedContinent(selectedCountry, currentLang)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCountry(null);
                  }}
                  style={styles.changeCountryBtn}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={11} color="#2563EB" />
                  <Text style={styles.changeCountryBtnText}>
                    {t.changeCountry || (currentLang === 'tr' ? 'Değiştir' : 'Change')}
                  </Text>
                </TouchableOpacity>
              </View>

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

              {/* Status Selector */}
              <Text style={styles.sectionLabel}>{t.travelStatus}</Text>
              <View style={styles.statusButtonsRow}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedStatus('visited');
                  }}
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
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.visited}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedStatus('lived');
                  }}
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
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.livedIn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedStatus('want');
                  }}
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
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.wishlist}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Selection: Only for Visited & Lived (Hidden for Want / Target) */}
              {selectedStatus !== 'want' && (
                <View style={styles.datePickerSection}>
                  <View style={styles.dateSectionHeaderRow}>
                    <Calendar size={13} color="#2563EB" />
                    <Text style={styles.sectionLabel}>
                      {t.travelDate || (currentLang === 'tr' ? 'SEYAHAT TARİHİ (AY / YIL)' : 'TRAVEL DATE (MONTH / YEAR)')}
                    </Text>
                  </View>

                  {/* Year Stepper & Input */}
                  <View style={styles.yearRow}>
                    <TouchableOpacity
                      onPress={() => handleStepYear(-1)}
                      style={styles.yearStepperBtn}
                      activeOpacity={0.7}
                    >
                      <Minus size={13} color="#475569" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View style={styles.yearInputBox}>
                      <TextInput
                        value={selectedYear}
                        onChangeText={(txt) => setSelectedYear(txt.replace(/[^0-9]/g, '').slice(0, 4))}
                        keyboardType="numeric"
                        maxLength={4}
                        placeholder={t.selectYear || 'Yıl'}
                        placeholderTextColor="#94A3B8"
                        style={styles.yearInputText}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => handleStepYear(1)}
                      style={styles.yearStepperBtn}
                      activeOpacity={0.7}
                    >
                      <Plus size={13} color="#475569" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>

                  {/* Horizontal Months Scroll */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.monthsScrollRow}
                  >
                    {MONTHS.map((m) => {
                      const isMonthSelected = selectedMonth === m.id;
                      const monthLabel = currentLang === 'tr' ? m.shortTr : m.shortEn;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedMonth(m.id);
                          }}
                          activeOpacity={0.7}
                          style={[
                            styles.monthPill,
                            isMonthSelected && styles.monthPillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthPillText,
                              isMonthSelected && styles.monthPillTextActive,
                            ]}
                          >
                            {monthLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

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
            </ScrollView>
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
    backgroundColor: '#0D111A',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '92%',
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  titleDot: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B35',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  catalogList: {
    maxHeight: 380,
    marginBottom: 8,
  },
  selectedCountryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 14,
  },
  selectedCountryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  selectedCountryFlag: {
    fontSize: 28,
  },
  selectedCountryInfo: {
    flex: 1,
    minWidth: 0,
  },
  selectedCountryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  selectedCountrySub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#60A5FA',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeCountryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
  },
  changeCountryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
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
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  catalogItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  catalogTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  catalogFlag: {
    fontSize: 22,
  },
  catalogName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  catalogNameSelected: {
    color: '#FF6B35',
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
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    flexShrink: 0,
  },
  wishlistTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.3,
  },
  convertNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 10,
  },
  convertNoticeText: {
    fontSize: 11.5,
    color: '#60A5FA',
    fontWeight: '700',
    flex: 1,
  },
  formSectionScroll: {
    maxHeight: 460,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  statusBtnActiveVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3B82F6',
  },
  statusBtnActiveLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10B981',
  },
  statusBtnActiveWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.25)',
    borderColor: '#FF6B35',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  datePickerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
    gap: 8,
  },
  dateSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  yearStepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  yearInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    minWidth: 90,
    alignItems: 'center',
  },
  yearInputText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  monthsScrollRow: {
    gap: 6,
    paddingVertical: 4,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  monthPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  monthPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  submitText: {
    color: '#07090E',
    fontSize: 14,
    fontWeight: '900',
  },
});
