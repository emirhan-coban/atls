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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Search, Check, Plus, MapPin, Home, Heart } from 'lucide-react-native';
import { availableCatalog } from '../data/travelData';

export default function AddCountryModal({
  isOpen,
  onClose,
  onAddCountry,
  existingCountryIds,
  t,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('visited');
  const [notes, setNotes] = useState('');

  const filteredCatalog = availableCatalog.filter(
    (c) =>
      !existingCountryIds.includes(c.id) &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedCountry) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onAddCountry({
      id: selectedCountry.id,
      name: selectedCountry.name,
      flag: selectedCountry.flag,
      status: selectedStatus,
      year: new Date().getFullYear().toString(),
      notes: notes || `Marked in ${new Date().getFullYear()}`,
      visits: selectedStatus === 'want' ? 0 : 1,
    });

    setSelectedCountry(null);
    setSearchTerm('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
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
          <ScrollView style={styles.catalogList} showsVerticalScrollIndicator={false}>
            {filteredCatalog.map((c) => {
              const isSelected = selectedCountry?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCountry(c);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.catalogItem,
                    isSelected && styles.catalogItemSelected,
                  ]}
                >
                  <View style={styles.catalogItemLeft}>
                    <Text style={styles.catalogFlag}>{c.flag}</Text>
                    <Text
                      style={[
                        styles.catalogName,
                        isSelected && styles.catalogNameSelected,
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text style={styles.catalogContinent}>{c.continent}</Text>
                  </View>
                  {isSelected && <Check size={16} color="#5B4DFF" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Status Options */}
          {selectedCountry && (
            <View style={styles.formSection}>
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
    maxHeight: 160,
    marginBottom: 14,
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
    gap: 10,
  },
  catalogFlag: {
    fontSize: 20,
  },
  catalogName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  catalogNameSelected: {
    color: '#5B4DFF',
    fontWeight: '800',
  },
  catalogContinent: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
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
