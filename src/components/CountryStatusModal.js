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
} from 'lucide-react-native';
import { getLocalizedCountryName } from '../data/travelData';

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
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && country) {
      // If currently want, default recommendation is to convert to 'visited'
      setSelectedStatus(country.status === 'want' ? 'visited' : country.status);
      setYear(country.year || country.visitedYear || new Date().getFullYear().toString());
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

    const updated = {
      ...country,
      status: selectedStatus,
      year: year.trim() || new Date().getFullYear().toString(),
      visitedYear: year.trim() || new Date().getFullYear().toString(),
      notes: notes.trim(),
      notesTr: notes.trim(),
      visits: selectedStatus === 'want' ? 0 : Math.max(1, country.visits || 1),
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
              <View>
                <Text style={styles.countryTitle}>{countryName}</Text>
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
                  <Text style={styles.countryContinent}>
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
                  >
                    {t.wishlist || (currentLang === 'tr' ? 'Hedef' : 'Wishlist')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Year Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Calendar size={12} color="#2563EB" />
                <Text style={styles.sectionLabel}>
                  {selectedStatus === 'want'
                    ? (currentLang === 'tr' ? 'HEDEF YILI' : 'TARGET YEAR')
                    : (currentLang === 'tr' ? 'ZİYARET / İKAMET YILI' : 'YEAR OF VISIT / RESIDENCE')}
                </Text>
              </View>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="2026"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={4}
                style={styles.textInput}
              />
            </View>

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagLarge: {
    fontSize: 34,
  },
  countryTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  currentStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  badgeVisited: {
    backgroundColor: '#EFF6FF',
  },
  badgeLived: {
    backgroundColor: '#EEF2FF',
  },
  badgeWant: {
    backgroundColor: '#F0F9FF',
  },
  currentStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeTextVisited: {
    color: '#2563EB',
  },
  badgeTextLived: {
    color: '#1D4ED8',
  },
  badgeTextWant: {
    color: '#0284C7',
  },
  countryContinent: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
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
  convertBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
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
    color: '#1E40AF',
  },
  convertBannerDesc: {
    fontSize: 12,
    color: '#3B82F6',
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
    color: '#64748B',
    letterSpacing: 0.8,
  },
  statusSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  statusOptionActiveLived: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  statusOptionActiveWant: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statusOptionTextActiveVisited: {
    color: '#2563EB',
    fontWeight: '800',
  },
  statusOptionTextActiveLived: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  statusOptionTextActiveWant: {
    color: '#0284C7',
    fontWeight: '800',
  },
  textInput: {
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
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  convertSaveBtn: {
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
});
