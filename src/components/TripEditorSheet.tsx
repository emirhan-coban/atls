import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, ImagePlus, Minus, Plus, Search, Star, Trash2, X } from 'lucide-react-native';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Chip from './ui/Chip';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { MONTHS } from '../data/months';
import { jt, TRIP_TYPES } from '../localization/journey';
import { Trip, TripType } from '../stores/types';
import { TripInput, useTripStore } from '../stores/useTripStore';
import { deletePhotoFile, MAX_PHOTOS_PER_TRIP, photoUri, pickTripPhotos } from '../utils/photos';

interface TripEditorSheetProps {
  visible: boolean;
  onClose: () => void;
  currentLang: 'tr' | 'en';
  /** Fixed country (opened from a country). When omitted the user picks one. */
  countryId?: string | null;
  /** When set the sheet edits this trip instead of creating a new one. */
  trip?: Trip | null;
}

const thisYear = () => new Date().getFullYear();

export default function TripEditorSheet({ visible, onClose, currentLang, countryId, trip }: TripEditorSheetProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const addTrip = useTripStore((s) => s.addTrip);
  const updateTrip = useTripStore((s) => s.updateTrip);
  const removeTrip = useTripStore((s) => s.removeTrip);

  const [pickedCountryId, setPickedCountryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState(thisYear());
  const [month, setMonth] = useState<string | null>(null);
  const [days, setDays] = useState('');
  const [cities, setCities] = useState('');
  const [type, setType] = useState<TripType>('leisure');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  // files added in this session that are not saved yet: removed from disk again if the user cancels
  const addedThisSession = React.useRef<string[]>([]);

  // Load the trip being edited, or reset to blank values each time the sheet opens
  useEffect(() => {
    if (!visible) return;
    setPickedCountryId(null);
    setSearch('');
    setYear(trip && trip.year ? Number(trip.year) : thisYear());
    setMonth(trip?.month ?? null);
    setDays(trip?.days ? String(trip.days) : '');
    setCities(trip?.cities.join(', ') ?? '');
    setType(trip?.type ?? 'leisure');
    setRating(trip?.rating ?? null);
    setNotes(trip?.notes ?? '');
    setPhotos(trip?.photos ?? []);
    addedThisSession.current = [];
  }, [visible, trip]);

  const activeCountryId = trip?.countryId ?? countryId ?? pickedCountryId;
  const activeCountry = useMemo(
    () => availableCatalog.find((c: any) => c.id.toUpperCase() === (activeCountryId || '').toUpperCase()),
    [activeCountryId]
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableCatalog.slice(0, 8);
    return availableCatalog
      .filter((c: any) => c.name.toLowerCase().includes(q) || (c.nameTr || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [search]);

  const handleSave = async () => {
    if (!activeCountryId) return;
    const parsedDays = parseInt(days, 10);
    const input: TripInput = {
      countryId: activeCountryId,
      year: String(year),
      month,
      days: Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : null,
      cities: cities
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      type,
      rating,
      notes: notes.trim(),
      photos,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // photos the user removed from an existing trip are deleted from the device now that the change is saved
    (trip?.photos ?? []).filter((name) => !photos.includes(name)).forEach(deletePhotoFile);
    addedThisSession.current = [];
    if (trip) {
      await updateTrip(trip.id, input);
    } else {
      await addTrip(input);
    }
    onClose();
  };

  const handleAddPhotos = async () => {
    try {
      const added = await pickTripPhotos(MAX_PHOTOS_PER_TRIP - photos.length);
      if (added.length > 0) {
        addedThisSession.current = [...addedThisSession.current, ...added];
        setPhotos((current) => [...current, ...added]);
      }
    } catch (err) {
      console.warn('[TripEditor] picking photos failed:', err);
    }
  };

  const handleRemovePhoto = (name: string) => {
    Haptics.selectionAsync();
    setPhotos((current) => current.filter((p) => p !== name));
  };

  const handleClose = () => {
    addedThisSession.current.forEach(deletePhotoFile);
    addedThisSession.current = [];
    onClose();
  };

  const handleDelete = () => {
    if (!trip) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(jt('deleteTitle', currentLang), jt('deleteMsg', currentLang), [
      { text: jt('cancel', currentLang), style: 'cancel' },
      {
        text: jt('deleteTrip', currentLang),
        style: 'destructive',
        onPress: async () => {
          await removeTrip(trip.id);
          (trip.photos ?? []).forEach(deletePhotoFile);
          onClose();
        },
      },
    ]);
  };

  return (
    <Sheet visible={visible} onClose={handleClose} maxHeight="92%">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{trip ? jt('editTrip', currentLang) : jt('addTrip', currentLang)}</Text>
          {activeCountry ? (
            <Text style={styles.subtitle}>
              {activeCountry.flag} {getLocalizedCountryName(activeCountry, currentLang)}
            </Text>
          ) : (
            <Text style={styles.subtitle}>{jt('chooseCountry', currentLang)}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={18} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!activeCountryId && (
          <View style={styles.section}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.text.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={jt('searchCountry', currentLang)}
                placeholderTextColor={colors.text.muted}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>
            {results.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPickedCountryId(c.id);
                }}
                style={styles.countryRow}
                activeOpacity={0.7}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text style={styles.countryName}>{getLocalizedCountryName(c, currentLang)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeCountryId && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>{jt('year', currentLang)}</Text>
              <View style={styles.yearRow}>
                <TouchableOpacity
                  onPress={() => setYear((y) => Math.max(1950, y - 1))}
                  style={styles.stepBtn}
                  accessibilityLabel="Previous year"
                >
                  <Minus size={16} color={colors.text.secondary} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity
                  onPress={() => setYear((y) => Math.min(thisYear() + 1, y + 1))}
                  style={styles.stepBtn}
                  accessibilityLabel="Next year"
                >
                  <Plus size={16} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('month', currentLang)}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {MONTHS.map((m) => (
                  <Chip
                    key={m.id}
                    label={currentLang === 'tr' ? m.shortTr : m.shortEn}
                    selected={month === m.id}
                    onPress={() => setMonth(month === m.id ? null : m.id)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('days', currentLang)}</Text>
              <TextInput
                value={days}
                onChangeText={(v) => setDays(v.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder={jt('daysPlaceholder', currentLang)}
                placeholderTextColor={colors.text.muted}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('cities', currentLang)}</Text>
              <TextInput
                value={cities}
                onChangeText={setCities}
                placeholder={jt('citiesPlaceholder', currentLang)}
                placeholderTextColor={colors.text.muted}
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('type', currentLang)}</Text>
              <View style={styles.wrapRow}>
                {TRIP_TYPES.map((t) => (
                  <Chip key={t.id} label={t[currentLang]} selected={type === t.id} onPress={() => setType(t.id)} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('rating', currentLang)}</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRating(rating === n ? null : n);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${n}`}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Star
                      size={30}
                      color={colors.gold.base}
                      fill={rating !== null && n <= rating ? colors.gold.base : 'transparent'}
                      strokeWidth={1.8}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('photos', currentLang)}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {photos.map((name) => (
                  <View key={name} style={styles.photoWrap}>
                    <Image source={{ uri: photoUri(name) }} style={styles.photo} />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(name)}
                      style={styles.photoRemove}
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                    >
                      <X size={12} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < MAX_PHOTOS_PER_TRIP && (
                  <TouchableOpacity onPress={handleAddPhotos} style={styles.photoAdd} accessibilityRole="button" accessibilityLabel={jt('addPhotos', currentLang)}>
                    <ImagePlus size={22} color={colors.gold.base} />
                    <Text style={styles.photoAddText}>{jt('addPhotos', currentLang)}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
              <Text style={styles.photoHint}>{jt('photosHint', currentLang)}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{jt('notes', currentLang)}</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={jt('notesPlaceholder', currentLang)}
                placeholderTextColor={colors.text.muted}
                multiline
                style={[styles.input, styles.notesInput]}
              />
            </View>

            <Button
              label={jt('save', currentLang)}
              onPress={handleSave}
              icon={(color) => <Check size={17} color={color} strokeWidth={2.5} />}
              style={styles.saveBtn}
            />
            {trip && (
              <Button
                label={jt('deleteTrip', currentLang)}
                onPress={handleDelete}
                variant="danger"
                size="md"
                icon={(color) => <Trash2 size={15} color={color} />}
                style={styles.deleteBtn}
              />
            )}
          </>
        )}
      </ScrollView>
    </Sheet>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerText: { flex: 1 },
    title: {
      fontSize: 24,
      color: colors.text.primary,
      fontFamily: fonts.display,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass.fillStrong,
    },
    section: { marginBottom: 18 },
    label: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      height: 46,
      borderRadius: 16,
      backgroundColor: colors.glass.fill,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
      marginBottom: 8,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text.primary },
    countryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.glass.borderSoft,
    },
    countryFlag: { fontSize: 24 },
    countryName: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    yearRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass.fillStrong,
    },
    yearText: { fontSize: 22, fontWeight: '800', color: colors.text.primary, minWidth: 70, textAlign: 'center' },
    chipRow: { gap: 8 },
    wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    input: {
      minHeight: 46,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text.primary,
      backgroundColor: colors.glass.fill,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    photoRow: { gap: 10 },
    photoWrap: { width: 84, height: 84 },
    photo: { width: 84, height: 84, borderRadius: 16, backgroundColor: colors.glass.fillStrong },
    photoRemove: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    photoAdd: {
      width: 84,
      height: 84,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.gold.tint,
      borderWidth: 1,
      borderColor: colors.gold.border,
      borderStyle: 'dashed',
    },
    photoAddText: { fontSize: 10, fontWeight: '800', color: colors.gold.base, textAlign: 'center' },
    photoHint: { fontSize: 11, color: colors.text.muted, marginTop: 6 },
    notesInput: { minHeight: 90, textAlignVertical: 'top' },
    starRow: { flexDirection: 'row', gap: 10 },
    saveBtn: { marginTop: 6 },
    deleteBtn: { marginTop: 12, marginBottom: 6 },
  })
);
