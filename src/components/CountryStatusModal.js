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
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  Sparkles,
  Trash2,
  Calendar,
  FileText,
  Plane,
  Home,
  Target,
  ArrowRight,
  Plus,
  Minus,
} from 'lucide-react-native';
import { getLocalizedCountryName, MONTHS } from '../data/travelData';

export default function CountryStatusModal({
  isOpen,
  onClose,
  country,
  onUpdateCountry,
  onRemoveCountry,
  t,
  currentLang,
}) {
  const [selectedStatus, setSelectedStatus] = useState('visited');
  const [year, setYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && country) {
      // If currently want, default recommendation is to convert to 'visited'
      setSelectedStatus(country.status === 'want' ? 'visited' : country.status);
      setYear(country.year || country.visitedYear || new Date().getFullYear().toString());
      setSelectedMonth(country.month || country.visitedMonth || String(new Date().getMonth() + 1).padStart(2, '0'));
      setNotes(country.notes || '');
    }
  }, [isOpen, country]);

  if (!country) return null;

  const countryName = getLocalizedCountryName(country, currentLang);
  const wasWishlist = country.status === 'want';
  const isConverting = wasWishlist && selectedStatus !== 'want';

  const handleStatusChange = (status) => {
    Haptics.selectionAsync();
    setSelectedStatus(status);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isWant = selectedStatus === 'want';
    const finalYear = isWant ? null : (year.trim() || new Date().getFullYear().toString());
    const finalMonth = isWant ? null : selectedMonth;
    const foundMonth = MONTHS.find((m) => m.id === finalMonth);
    const monthShortTr = foundMonth ? foundMonth.shortTr : finalMonth;
    const dateFormatted = finalMonth && finalYear ? `${finalMonth}/${finalYear}` : (finalYear || '');

    const updated = {
      ...country,
      status: selectedStatus,
      year: finalYear,
      visitedYear: finalYear,
      month: finalMonth,
      visitedMonth: finalMonth,
      date: dateFormatted,
      yearTr: isWant ? '' : `${monthShortTr} ${finalYear}`,
      notes: notes.trim(),
      notesTr: notes.trim(),
      visits: isWant ? 0 : Math.max(1, country.visits || 1),
    };

    onUpdateCountry(updated);
    onClose();

    if (isConverting) {
      setTimeout(() => {
        Alert.alert(
          currentLang === 'tr' ? '🎉 Pasaportuna Mühürlendi!' : '🎉 Stamped in Your Passport!',
          currentLang === 'tr'
            ? `Tebrikler! ${country.flag} ${countryName} hedeflerinden pasaportuna resmi ${selectedStatus === 'lived' ? 'ikamet' : 'giriş'} mührü olarak işlendi!`
            : `Congratulations! ${country.flag} ${countryName} is now officially stamped in your passport!`
        );
      }, 300);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.removeConfirmTitle || (currentLang === 'tr' ? 'Ülkeyi Kaldır' : 'Remove Country'),
      (t.removeConfirmMsg || '{country} pasaportunuzdan silinsin mi?').replace('{country}', countryName),
      [
        { text: t.cancel || (currentLang === 'tr' ? 'Vazgeç' : 'Cancel'), style: 'cancel' },
        {
          text: t.remove || (currentLang === 'tr' ? 'Kaldır' : 'Remove'),
          style: 'destructive',
          onPress: () => {
            onRemoveCountry(country.id);
            onClose();
          },
        },
      ]
    );
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
            <View style={styles.headerLeft}>
              <Text style={styles.flagLarge}>{country.flag}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={styles.countryTitle}
                  numberOfLines={2}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                >
                  {countryName}
                </Text>
                <View style={styles.statusBadgeRow}>
                  <View
                    style={[
                      styles.currentStatusBadge,
                      country.status === 'lived' && styles.badgeLived,
                      country.status === 'want' && styles.badgeWant,
                      country.status === 'visited' && styles.badgeVisited,
                    ]}
                  >
                    <Text
                      style={[
                        styles.currentStatusBadgeText,
                        country.status === 'lived' && styles.badgeTextLived,
                        country.status === 'want' && styles.badgeTextWant,
                        country.status === 'visited' && styles.badgeTextVisited,
                      ]}
                    >
                      {country.status === 'lived'
                        ? (currentLang === 'tr' ? 'YAŞANDI' : 'LIVED')
                        : country.status === 'want'
                          ? (currentLang === 'tr' ? 'HEDEFİNDE' : 'WISHLIST')
                          : (currentLang === 'tr' ? 'GEZİLDİ' : 'VISITED')}
                    </Text>
                  </View>
                  <Text style={styles.countryContinent} numberOfLines={1} ellipsizeMode="tail">
                    {currentLang === 'tr' ? (country.continentTr || country.continent) : country.continent}
                  </Text>
                </View>
              </View>
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
            {/* Conversion Banner when country was in Wishlist */}
            {wasWishlist && (
              <View style={styles.convertBanner}>
                <View style={styles.convertBannerHeader}>
                  <Sparkles size={16} color="#2563EB" />
                  <Text style={styles.convertBannerTitle}>
                    {currentLang === 'tr'
                      ? 'Hedefini Gerçeğe Dönüştür'
                      : 'Fulfill Your Dream Destination'}
                  </Text>
                </View>
                <Text style={styles.convertBannerDesc}>
                  {currentLang === 'tr'
                    ? `Bu ülkeyi ziyaret ettin mi veya oraya mı taşındın? Durumunu güncelleyerek pasaportuna resmi mührünü basabilirsin.`
                    : `Have you visited or moved here? Update its status to stamp it into your official passport.`}
                </Text>
              </View>
            )}

            {/* Status Selector Segment */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>
                {currentLang === 'tr' ? 'PASAPORT STATÜSÜ' : 'PASSPORT STATUS'}
              </Text>
              <View style={styles.statusSegment}>
                {/* Visited */}
                <TouchableOpacity
                  onPress={() => handleStatusChange('visited')}
                  activeOpacity={0.7}
                  style={[
                    styles.statusOption,
                    selectedStatus === 'visited' && styles.statusOptionActiveVisited,
                  ]}
                >
                  <Plane
                    size={14}
                    color={selectedStatus === 'visited' ? '#2563EB' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === 'visited' && styles.statusOptionTextActiveVisited,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.visited || (currentLang === 'tr' ? 'Gezildi' : 'Visited')}
                  </Text>
                </TouchableOpacity>

                {/* Lived */}
                <TouchableOpacity
                  onPress={() => handleStatusChange('lived')}
                  activeOpacity={0.7}
                  style={[
                    styles.statusOption,
                    selectedStatus === 'lived' && styles.statusOptionActiveLived,
                  ]}
                >
                  <Home
                    size={14}
                    color={selectedStatus === 'lived' ? '#1D4ED8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === 'lived' && styles.statusOptionTextActiveLived,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.livedIn || (currentLang === 'tr' ? 'Yaşandı' : 'Lived')}
                  </Text>
                </TouchableOpacity>

                {/* Want / Wishlist */}
                <TouchableOpacity
                  onPress={() => handleStatusChange('want')}
                  activeOpacity={0.7}
                  style={[
                    styles.statusOption,
                    selectedStatus === 'want' && styles.statusOptionActiveWant,
                  ]}
                >
                  <Target
                    size={14}
                    color={selectedStatus === 'want' ? '#0284C7' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === 'want' && styles.statusOptionTextActiveWant,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {t.wishlist || (currentLang === 'tr' ? 'Hedef' : 'Wishlist')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Selection: Only for Visited & Lived (hidden for Want / Wishlist) */}
            {selectedStatus !== 'want' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Calendar size={12} color="#2563EB" />
                  <Text style={styles.sectionLabel}>
                    {currentLang === 'tr' ? 'SEYAHAT TARİHİ (AY / YIL)' : 'TRAVEL DATE (MONTH / YEAR)'}
                  </Text>
                </View>

                {/* Year Stepper & Input */}
                <View style={styles.yearRow}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      const y = parseInt(year, 10) || new Date().getFullYear();
                      setYear(String(y - 1));
                    }}
                    style={styles.yearStepperBtn}
                    activeOpacity={0.7}
                  >
                    <Minus size={13} color="#475569" strokeWidth={2.5} />
                  </TouchableOpacity>

                  <View style={styles.yearInputBox}>
                    <TextInput
                      value={year}
                      onChangeText={(txt) => setYear(txt.replace(/[^0-9]/g, '').slice(0, 4))}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder={t.selectYear || 'Yıl'}
                      placeholderTextColor="#94A3B8"
                      style={styles.yearInputText}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      const y = parseInt(year, 10) || new Date().getFullYear();
                      setYear(String(y + 1));
                    }}
                    style={styles.yearStepperBtn}
                    activeOpacity={0.7}
                  >
                    <Plus size={13} color="#475569" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* Months Horizontal Scroll */}
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

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={12} color="#2563EB" />
                <Text style={styles.sectionLabel}>
                  {currentLang === 'tr' ? 'SEYAHAT ANISI / NOTUN' : 'TRAVEL MEMORY / NOTES'}
                </Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={
                  selectedStatus === 'want'
                    ? (currentLang === 'tr' ? 'Örn: Kuzey ışıklarını izlemek istiyorum...' : 'e.g. Want to see the Northern Lights...')
                    : (currentLang === 'tr' ? 'Örn: İlk kez Tokyo sokaklarında yürüdüm...' : 'e.g. First time walking Tokyo streets...')
                }
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={3}
                style={[styles.textInput, styles.textArea]}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.85}
                style={[
                  styles.saveBtn,
                  isConverting && styles.convertSaveBtn,
                ]}
              >
                {isConverting ? (
                  <>
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>
                      {currentLang === 'tr' ? 'Mührü Pasaporta İşle ✈️' : 'Stamp into Passport ✈️'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.saveBtnText}>
                      {t.saveChanges || (currentLang === 'tr' ? 'Değişiklikleri Kaydet' : 'Save Changes')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                activeOpacity={0.7}
                style={styles.deleteBtn}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text style={styles.deleteBtnText}>
                  {currentLang === 'tr' ? 'Pasaporttan Kaldır' : 'Remove from Passport'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  flagLarge: {
    fontSize: 34,
  },
  countryTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  currentStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    flexShrink: 0,
  },
  badgeVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  badgeLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  currentStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeTextVisited: {
    color: '#60A5FA',
  },
  badgeTextLived: {
    color: '#34D399',
  },
  badgeTextWant: {
    color: '#FF8A5B',
  },
  countryContinent: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    flexShrink: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 20,
  },
  convertBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  convertBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  convertBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#60A5FA',
  },
  convertBannerDesc: {
    fontSize: 12,
    color: '#93C5FD',
    lineHeight: 17,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statusOptionActiveVisited: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  statusOptionActiveLived: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusOptionActiveWant: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusOptionTextActiveVisited: {
    color: '#60A5FA',
    fontWeight: '800',
  },
  statusOptionTextActiveLived: {
    color: '#34D399',
    fontWeight: '800',
  },
  statusOptionTextActiveWant: {
    color: '#FF8A5B',
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  convertSaveBtn: {
    backgroundColor: '#FF6B35',
    borderWidth: 1,
    borderColor: '#FF8A5B',
  },
  saveBtnText: {
    color: '#07090E',
    fontSize: 14,
    fontWeight: '900',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
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
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
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
    color: '#F8FAFC',
    textAlign: 'center',
  },
  monthsScrollRow: {
    gap: 6,
    paddingVertical: 6,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  monthPillTextActive: {
    color: '#FFFFFF',
  },
});
