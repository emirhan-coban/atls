import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BookCheck, Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import Button from './ui/Button';
import Chip from './ui/Chip';
import EmptyState from './EmptyState';
import DocumentVault from './DocumentVault';
import PlanEditorSheet from './PlanEditorSheet';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { getCountryFacts } from '../data/countryProfile';
import { CURRENCIES, lt } from '../localization/planner';
import {
  addItems, addTemplate, budgetTotal, CHECKLIST_TEMPLATES, CHECKLIST_TEMPLATE_IDS, checklistProgress, daysUntil,
  entryRequirementItems, formatMoney, parseAmount, parseDate, planPhase, sortPlans, tripLengthDays,
} from '../utils/planning';
import { monthShort } from '../data/months';
import { BudgetItem, PlannedTrip } from '../stores/types';
import { usePlanStore } from '../stores/usePlanStore';
import { useTripStore } from '../stores/useTripStore';
import { notificationService } from '../services/notificationService';
import Heading from './ui/Heading';
import { layout } from '../theme/spacing';

interface PlannerModalProps {
  visible: boolean;
  onClose: () => void;
  currentLang: 'tr' | 'en';
}

const entry = (id: string) => availableCatalog.find((c: any) => c.id.toUpperCase() === id.toUpperCase());

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function formatDate(key: string, lang: 'tr' | 'en') {
  const p = parseDate(key);
  return p ? `${p.d} ${monthShort(String(p.m).padStart(2, '0'), lang)} ${p.y}` : key;
}

export default function PlannerModal({ visible, onClose, currentLang }: PlannerModalProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const plans = usePlanStore((s) => s.plans);
  const setChecklist = usePlanStore((s) => s.setChecklist);
  const setBudget = usePlanStore((s) => s.setBudget);
  const removePlan = usePlanStore((s) => s.removePlan);
  const rescheduleAll = usePlanStore((s) => s.rescheduleAll);
  const addTrip = useTripStore((s) => s.addTrip);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ plan?: PlannedTrip | null } | null>(null);
  const [newItem, setNewItem] = useState('');
  const [budgetLabel, setBudgetLabel] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [remindersAllowed, setRemindersAllowed] = useState<boolean | null>(null);

  const sorted = useMemo(() => sortPlans(plans), [plans]);
  const selected = plans.find((p) => p.id === selectedId) ?? null;

  React.useEffect(() => {
    if (visible) notificationService.hasPermission().then(setRemindersAllowed);
  }, [visible, selected?.id]);

  const nameOf = (id: string) => {
    const c = entry(id);
    return c ? getLocalizedCountryName(c, currentLang) : id;
  };

  const countdown = (plan: PlannedTrip) => {
    const phase = planPhase(plan);
    if (phase === 'past') return lt('ended', currentLang);
    if (phase === 'ongoing') return lt('ongoing', currentLang);
    const n = daysUntil(plan.startDate) ?? 0;
    return n === 1 ? lt('oneDayLeft', currentLang) : lt('daysLeft', currentLang, { n });
  };

  const handleAllowReminders = async () => {
    const granted = await notificationService.requestPermissions();
    setRemindersAllowed(granted);
    if (granted) await rescheduleAll(currentLang);
    else Alert.alert(lt('remindersDenied', currentLang));
  };

  const handleLog = async (plan: PlannedTrip) => {
    const start = parseDate(plan.startDate);
    if (!start) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTrip({
      countryId: plan.countryId,
      year: String(start.y),
      month: String(start.m).padStart(2, '0'),
      days: tripLengthDays(plan.startDate, plan.endDate),
      cities: plan.cities,
      notes: plan.notes,
    });
    await removePlan(plan.id);
    setSelectedId(null);
  };

  const addChecklistItem = () => {
    if (!selected || !newItem.trim()) return;
    setChecklist(selected.id, [...selected.checklist, { id: `custom:${newId()}`, text: newItem.trim(), done: false }], currentLang);
    setNewItem('');
  };

  const addBudgetItem = () => {
    if (!selected) return;
    const amount = parseAmount(budgetAmount);
    if (!budgetLabel.trim() || amount === null) return;
    setBudget(selected.id, [...selected.budget, { id: newId(), label: budgetLabel.trim(), amount }]);
    setBudgetLabel('');
    setBudgetAmount('');
  };

  const facts = selected ? getCountryFacts(selected.countryId) : null;
  const entryItems = selected ? entryRequirementItems(facts?.visa.status, Boolean(facts?.schengen), currentLang) : [];
  const entryMissing = selected ? entryItems.filter((i) => !selected.checklist.some((c) => c.id === i.id)) : [];

  const renderList = () => (
    <>
      <Button
        label={lt('addPlan', currentLang)}
        onPress={() => setEditor({})}
        size="md"
        icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
        style={styles.addBtn}
      />
      {sorted.length === 0 ? (
        <EmptyState type="wishlist" title={lt('emptyTitle', currentLang)} description={lt('emptyDesc', currentLang)} />
      ) : (
        sorted.map((plan) => {
          const phase = planPhase(plan);
          const progress = checklistProgress(plan.checklist);
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedId(plan.id)}
              activeOpacity={0.85}
              style={[styles.planCard, phase === 'past' && styles.planCardPast]}
              accessibilityRole="button"
              accessibilityLabel={nameOf(plan.countryId)}
            >
              <Text style={styles.planFlag}>{entry(plan.countryId)?.flag ?? '🌍'}</Text>
              <View style={styles.planBody}>
                <Text style={styles.planName}>{nameOf(plan.countryId)}</Text>
                <Text style={styles.planDates}>
                  {formatDate(plan.startDate, currentLang)}
                  {plan.endDate && plan.endDate !== plan.startDate ? ` → ${formatDate(plan.endDate, currentLang)}` : ''}
                </Text>
                {progress.total > 0 && (
                  <Text style={styles.planMeta}>
                    {progress.done}/{progress.total} {lt('items', currentLang)}
                  </Text>
                )}
              </View>
              <View style={styles.planRight}>
                <Text style={[styles.countdown, phase === 'ongoing' && { color: colors.status.lived.color }, phase === 'past' && { color: colors.text.muted }]}>
                  {countdown(plan)}
                </Text>
                <ChevronRight size={16} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </>
  );

  const renderDetail = (plan: PlannedTrip) => {
    const phase = planPhase(plan);
    const progress = checklistProgress(plan.checklist);
    const total = budgetTotal(plan.budget);
    return (
      <>
        <View style={styles.detailHero}>
          <Text style={styles.heroFlag}>{entry(plan.countryId)?.flag ?? '🌍'}</Text>
          <Text style={styles.heroName}>{nameOf(plan.countryId)}</Text>
          <Text style={styles.heroDates}>
            {formatDate(plan.startDate, currentLang)}
            {plan.endDate && plan.endDate !== plan.startDate ? ` → ${formatDate(plan.endDate, currentLang)}` : ''}
          </Text>
          <Text style={styles.heroCountdown}>{countdown(plan)}</Text>
          {plan.cities.length > 0 && <Text style={styles.heroCities}>{plan.cities.join(' → ')}</Text>}
        </View>

        {phase === 'past' && (
          <View style={styles.card}>
            <Text style={styles.cardHint}>{lt('logTripHint', currentLang)}</Text>
            <Button
              label={lt('logTrip', currentLang)}
              onPress={() => handleLog(plan)}
              size="md"
              icon={(color) => <BookCheck size={16} color={color} />}
            />
          </View>
        )}

        {phase !== 'past' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{lt('reminders', currentLang).toUpperCase()}</Text>
            {remindersAllowed === false ? (
              <>
                <Text style={styles.cardHint}>{lt('remindersOff', currentLang)}</Text>
                <Button label={lt('remindersAsk', currentLang)} onPress={handleAllowReminders} size="sm" variant="secondary" />
              </>
            ) : (
              <Text style={styles.cardHint}>{lt('remindersOn', currentLang)}</Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {lt('checklist', currentLang)} {progress.total > 0 ? `· ${progress.done}/${progress.total}` : ''}
          </Text>
          {progress.total > 0 && (
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${Math.round((progress.done / progress.total) * 100)}%` }]} />
            </View>
          )}
          {plan.checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                Haptics.selectionAsync();
                setChecklist(plan.id, plan.checklist.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)), currentLang);
              }}
              onLongPress={() => setChecklist(plan.id, plan.checklist.filter((i) => i.id !== item.id), currentLang)}
              style={styles.itemRow}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
            >
              <View style={[styles.box, item.done && styles.boxDone]}>{item.done && <Check size={13} color={colors.gold.onGold} strokeWidth={3} />}</View>
              <Text style={[styles.itemText, item.done && styles.itemDone]}>{item.text}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.addRow}>
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={addChecklistItem}
              placeholder={lt('addItem', currentLang)}
              placeholderTextColor={colors.text.muted}
              style={styles.addInput}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addChecklistItem} style={styles.addIcon} accessibilityRole="button" accessibilityLabel={lt('addItem', currentLang)}>
              <Plus size={18} color={colors.gold.base} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subLabel}>{lt('addTemplate', currentLang)}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CHECKLIST_TEMPLATE_IDS.map((id) => (
              <Chip key={id} label={CHECKLIST_TEMPLATES[id][currentLang]} onPress={() => setChecklist(plan.id, addTemplate(plan.checklist, id, currentLang), currentLang)} />
            ))}
            {entryMissing.length > 0 && (
              <Chip label={lt('entryItems', currentLang)} selected onPress={() => setChecklist(plan.id, addItems(plan.checklist, entryItems), currentLang)} />
            )}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{lt('budget', currentLang)}</Text>
          {plan.budget.map((item: BudgetItem) => (
            <View key={item.id} style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>{item.label}</Text>
              <Text style={styles.budgetAmount}>{formatMoney(item.amount, plan.currency, currentLang)}</Text>
              <TouchableOpacity
                onPress={() => setBudget(plan.id, plan.budget.filter((b) => b.id !== item.id))}
                accessibilityRole="button"
                accessibilityLabel="Remove"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={14} color={colors.text.muted} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addRow}>
            <TextInput value={budgetLabel} onChangeText={setBudgetLabel} placeholder={lt('budgetLabel', currentLang)} placeholderTextColor={colors.text.muted} style={[styles.addInput, { flex: 2 }]} />
            <TextInput
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder={lt('budgetAmount', currentLang)}
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
              style={[styles.addInput, { flex: 1 }]}
            />
            <TouchableOpacity onPress={addBudgetItem} style={styles.addIcon} accessibilityRole="button" accessibilityLabel={lt('addBudget', currentLang)}>
              <Plus size={18} color={colors.gold.base} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CURRENCIES.map((code) => (
              <Chip key={code} label={code} selected={plan.currency === code} onPress={() => setBudget(plan.id, plan.budget, code)} />
            ))}
          </ScrollView>
          {plan.budget.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{lt('budgetTotal', currentLang)}</Text>
              <Text style={styles.totalValue}>{formatMoney(total, plan.currency, currentLang)}</Text>
            </View>
          )}
          <Text style={styles.note}>{lt('budgetNote', currentLang)}</Text>
        </View>

        <DocumentVault planId={plan.id} currentLang={currentLang} />

        {plan.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{lt('notes', currentLang)}</Text>
            <Text style={styles.noteText}>{plan.notes}</Text>
          </View>
        ) : null}

        <Button
          label={lt('editPlan', currentLang)}
          onPress={() => setEditor({ plan })}
          variant="secondary"
          size="md"
          icon={(color) => <Pencil size={15} color={color} />}
        />
        <Button
          label={lt('deletePlan', currentLang)}
          onPress={() =>
            Alert.alert(lt('deleteTitle', currentLang), lt('deleteMsg', currentLang), [
              { text: lt('cancel', currentLang), style: 'cancel' },
              { text: lt('deletePlan', currentLang), style: 'destructive', onPress: async () => { await removePlan(plan.id); setSelectedId(null); } },
            ])
          }
          variant="danger"
          size="md"
          icon={(color) => <Trash2 size={15} color={color} />}
        />
      </>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <View style={styles.header}>
          {selected ? (
            <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
              <ChevronLeft size={20} color={colors.text.primary} />
            </TouchableOpacity>
          ) : null}
          <Heading style={styles.title}>{lt('title', currentLang)}</Heading>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {selected ? renderDetail(selected) : renderList()}
        </ScrollView>

        <PlanEditorSheet
          visible={editor !== null}
          onClose={() => setEditor(null)}
          currentLang={currentLang}
          plan={editor?.plan}
          onSaved={(saved) => !editor?.plan && setSelectedId(saved.id)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: layout.screen, paddingTop: 22, paddingBottom: 12 },
    backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    title: { flex: 1, fontSize: 32, color: colors.text.primary, fontFamily: fonts.display },
    closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    content: { paddingHorizontal: layout.screen, paddingBottom: 40, gap: layout.section },
    addBtn: { alignSelf: 'flex-start' },
    planCard: {
      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22,
      backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    planCardPast: { opacity: 0.7 },
    planFlag: { fontSize: 32 },
    planBody: { flex: 1, gap: 2 },
    planName: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
    planDates: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    planMeta: { fontSize: 11, fontWeight: '700', color: colors.text.muted },
    planRight: { alignItems: 'flex-end', gap: 6 },
    countdown: { fontSize: 13, fontWeight: '800', color: colors.gold.base },
    detailHero: { alignItems: 'center', gap: 4, paddingVertical: 8 },
    heroFlag: { fontSize: 56 },
    heroName: { fontSize: 38, color: colors.text.primary, fontFamily: fonts.display },
    heroDates: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
    heroCountdown: { fontSize: 18, fontWeight: '800', color: colors.gold.base, marginTop: 4 },
    heroCities: { fontSize: 13, fontWeight: '600', color: colors.text.soft },
    card: { padding: 16, borderRadius: 22, backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline, gap: 10 },
    cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary },
    cardHint: { fontSize: 13, color: colors.text.secondary },
    subLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.text.muted, marginTop: 4 },
    track: { height: 6, borderRadius: 3, backgroundColor: colors.glass.fillStrong, overflow: 'hidden' },
    trackFill: { height: '100%', borderRadius: 3, backgroundColor: colors.gold.base },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
    box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.glass.borderStrong, alignItems: 'center', justifyContent: 'center' },
    boxDone: { backgroundColor: colors.gold.base, borderColor: colors.gold.base },
    itemText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text.primary },
    itemDone: { color: colors.text.muted, textDecorationLine: 'line-through' },
    addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addInput: {
      height: 42, borderRadius: 14, paddingHorizontal: 12, fontSize: 14, color: colors.text.primary, flex: 1,
      backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline,
    },
    addIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold.tint, borderWidth: 1, borderColor: colors.gold.border },
    chips: { gap: 8 },
    budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
    budgetLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text.primary },
    budgetAmount: { fontSize: 14, fontWeight: '800', color: colors.text.primary },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.glass.hairline },
    totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text.secondary },
    totalValue: { fontSize: 18, fontWeight: '800', color: colors.gold.base },
    note: { fontSize: 11, color: colors.text.muted },
    noteText: { fontSize: 14, color: colors.text.soft, lineHeight: 20 },
  })
);
