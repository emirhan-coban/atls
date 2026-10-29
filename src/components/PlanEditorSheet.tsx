import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Search, Trash2, X } from 'lucide-react-native';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Chip from './ui/Chip';
import DateField from './ui/DateField';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { lt } from '../localization/planner';
import { daysUntil, parseDate, toDateKey } from '../utils/planning';
import { PlannedTrip } from '../stores/types';
import { usePlanStore } from '../stores/usePlanStore';
import { notificationService } from '../services/notificationService';

interface PlanEditorSheetProps {
  visible: boolean;
  onClose: () => void;
  currentLang: 'tr' | 'en';
  /** Fixed country (opened from a country). Without it the user picks one. */
  countryId?: string | null;
  /** When set the sheet edits this plan. */
  plan?: PlannedTrip | null;
  onSaved?: (plan: PlannedTrip) => void;
}

const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

export default function PlanEditorSheet({ visible, onClose, currentLang, countryId, plan, onSaved }: PlanEditorSheetProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const addPlan = usePlanStore((s) => s.addPlan);
  const updatePlan = usePlanStore((s) => s.updatePlan);
  const removePlan = usePlanStore((s) => s.removePlan);
  const hasPlans = usePlanStore((s) => s.plans.length > 0);

  const [picked, setPicked] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [start, setStart] = useState(plusDays(30));
  const [end, setEnd] = useState<string | null>(null);
  const [cities, setCities] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPicked(null);
    setSearch('');
    setStart(plan?.startDate ?? plusDays(30));
    setEnd(plan?.endDate ?? null);
    setCities(plan?.cities.join(', ') ?? '');
    setNotes(plan?.notes ?? '');
    setError(null);
  }, [visible, plan]);

  const activeId = plan?.countryId ?? countryId ?? picked;
  const country = useMemo(
    () => availableCatalog.find((c: any) => c.id.toUpperCase() === (activeId || '').toUpperCase()),
    [activeId]
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? availableCatalog.filter((c: any) => c.name.toLowerCase().includes(q) || (c.nameTr || '').toLowerCase().includes(q))
      : availableCatalog;
    return list.slice(0, 8);
  }, [search]);

  const handleSave = async () => {
    if (!activeId) return;
    if (end && parseDate(end) && start > end) {
      setError(lt('endBeforeStart', currentLang));
      return;
    }
    const input = {
      countryId: activeId,
      startDate: start,
      endDate: end,
      cities: cities.split(',').map((c) => c.trim()).filter(Boolean),
      notes: notes.trim(),
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Ask for notification permission only now, with the reason in plain words, and only for a plan that is still ahead
    const startsLater = (daysUntil(start) ?? 0) > 0;
    if (!plan && startsLater && !hasPlans && !(await notificationService.hasPermission())) {
      await new Promise<void>((resolve) => {
        Alert.alert(lt('askTitle', currentLang), lt('askMsg', currentLang), [
          { text: lt('notNow', currentLang), style: 'cancel', onPress: () => resolve() },
          {
            text: lt('allow', currentLang),
            onPress: async () => {
              await notificationService.requestPermissions();
              resolve();
            },
          },
        ]);
      });
    }

    if (plan) {
      await updatePlan(plan.id, input, currentLang);
      onSaved?.({ ...plan, ...input });
    } else {
      onSaved?.(await addPlan(input, currentLang));
    }
    onClose();
  };

  const handleDelete = () => {
    if (!plan) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(lt('deleteTitle', currentLang), lt('deleteMsg', currentLang), [
      { text: lt('cancel', currentLang), style: 'cancel' },
      {
        text: lt('deletePlan', currentLang),
        style: 'destructive',
        onPress: async () => {
          await removePlan(plan.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Sheet visible={visible} onClose={onClose} maxHeight="92%">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{plan ? lt('editPlan', currentLang) : lt('addPlan', currentLang)}</Text>
          <Text style={styles.subtitle}>
            {country ? `${country.flag} ${getLocalizedCountryName(country, currentLang)}` : lt('chooseCountry', currentLang)}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <X size={18} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!activeId && (
          <View style={styles.section}>
            <View style={styles.searchBox}>
              <Search size={16} color={colors.text.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={lt('searchCountry', currentLang)}
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
                  setPicked(c.id);
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

        {activeId && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>{lt('startDate', currentLang)}</Text>
              <DateField value={start} onChange={(v) => { setStart(v); setError(null); }} lang={currentLang} minYear={new Date().getFullYear() - 1} />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{lt('endDate', currentLang)}</Text>
              {end ? (
                <>
                  <DateField value={end} onChange={(v) => { setEnd(v); setError(null); }} lang={currentLang} minYear={new Date().getFullYear() - 1} />
                  <Chip label={lt('noEndDate', currentLang)} onPress={() => setEnd(null)} style={styles.clearEnd} />
                </>
              ) : (
                <Chip label={lt('setEndDate', currentLang)} onPress={() => setEnd(start)} style={styles.clearEnd} />
              )}
              {error && <Text style={styles.error}>{error}</Text>}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{lt('cities', currentLang)}</Text>
              <TextInput
                value={cities}
                onChangeText={setCities}
                placeholderTextColor={colors.text.muted}
                placeholder="Roma, Floransa"
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{lt('notes', currentLang)}</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={lt('notesPlaceholder', currentLang)}
                placeholderTextColor={colors.text.muted}
                multiline
                style={[styles.input, styles.notesInput]}
              />
            </View>

            <Button
              label={lt('save', currentLang)}
              onPress={handleSave}
              icon={(color) => <Check size={17} color={color} strokeWidth={2.5} />}
              style={styles.saveBtn}
            />
            {plan && (
              <Button
                label={lt('deletePlan', currentLang)}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerText: { flex: 1 },
    title: { fontSize: 30, color: colors.text.primary, fontFamily: fonts.display },
    subtitle: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginTop: 2 },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    section: { marginBottom: 18 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary, marginBottom: 8 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 46, borderRadius: 16,
      backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline, marginBottom: 8,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text.primary },
    countryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.glass.borderSoft },
    countryFlag: { fontSize: 24 },
    countryName: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    clearEnd: { alignSelf: 'flex-start', marginTop: 4 },
    error: { marginTop: 8, fontSize: 12, fontWeight: '700', color: colors.danger },
    input: {
      minHeight: 46, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text.primary,
      backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    notesInput: { minHeight: 80, textAlignVertical: 'top' },
    saveBtn: { marginTop: 6 },
    deleteBtn: { marginTop: 12, marginBottom: 6 },
  })
);
