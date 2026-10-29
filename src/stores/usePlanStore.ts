import { create } from 'zustand';
import { BudgetItem, PlanItem, PlannedTrip } from './types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { buildReminders, daysUntil } from '../utils/planning';
import { removePlanDocuments } from '../utils/vault';

export interface PlanInput {
  countryId: string;
  startDate: string;
  endDate: string | null;
  cities: string[];
  notes: string;
  currency?: string;
}

interface PlanState {
  plans: PlannedTrip[];
  isHydrated: boolean;
  setPlans: (plans: PlannedTrip[]) => void;
  /** Creates a plan and schedules its reminders when notifications are allowed. */
  addPlan: (input: PlanInput, lang: 'tr' | 'en') => Promise<PlannedTrip>;
  updatePlan: (id: string, changes: Partial<PlanInput>, lang: 'tr' | 'en') => Promise<void>;
  setChecklist: (id: string, checklist: PlanItem[], lang: 'tr' | 'en') => Promise<void>;
  setBudget: (id: string, budget: BudgetItem[], currency?: string) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
  clearPlans: () => void;
  /** Schedules reminders for plans that have none, e.g. plans that arrived from the cloud on a new device. */
  restoreReminders: (lang: 'tr' | 'en') => Promise<void>;
  /** Re-creates reminders for all plans, e.g. after the user turns notifications on in system settings. */
  rescheduleAll: (lang: 'tr' | 'en') => Promise<void>;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const countryName = (countryId: string, lang: 'tr' | 'en') => {
  const entry = availableCatalog.find((c: any) => c.id.toUpperCase() === countryId.toUpperCase());
  return entry ? getLocalizedCountryName(entry, lang) : countryId;
};

/** Cancels the plan's old reminders and schedules fresh ones. Returns the new notification ids ([] without permission). */
async function refreshReminders(plan: PlannedTrip, lang: 'tr' | 'en'): Promise<string[]> {
  await notificationService.cancel(plan.notificationIds);
  if (!(await notificationService.hasPermission())) return [];
  const reminders = buildReminders(plan, countryName(plan.countryId, lang), lang);
  return notificationService.scheduleReminders(reminders, { planId: plan.id });
}

export const usePlanStore = create<PlanState>((set, get) => {
  const persist = async (plans: PlannedTrip[], changed?: PlannedTrip) => {
    set({ plans });
    await storageService.savePlans(plans);
    if (changed) await storageService.syncPlan(changed);
  };
  const replace = (plan: PlannedTrip) => get().plans.map((p) => (p.id === plan.id ? plan : p));

  return {
    plans: [],
    isHydrated: false,

    setPlans: (plans) => set({ plans, isHydrated: true }),

    addPlan: async (input, lang) => {
      const now = new Date().toISOString();
      let plan: PlannedTrip = {
        id: newId(),
        countryId: input.countryId,
        startDate: input.startDate,
        endDate: input.endDate,
        cities: input.cities,
        notes: input.notes,
        checklist: [],
        budget: [],
        currency: input.currency ?? 'EUR',
        notificationIds: [],
        createdAt: now,
        updatedAt: now,
      };
      plan = { ...plan, notificationIds: await refreshReminders(plan, lang) };
      await persist([plan, ...get().plans], plan);
      return plan;
    },

    updatePlan: async (id, changes, lang) => {
      const current = get().plans.find((p) => p.id === id);
      if (!current) return;
      let updated: PlannedTrip = { ...current, ...changes, cities: changes.cities ?? current.cities, updatedAt: new Date().toISOString() };
      updated = { ...updated, notificationIds: await refreshReminders(updated, lang) };
      await persist(replace(updated), updated);
    },

    setChecklist: async (id, checklist, lang) => {
      const current = get().plans.find((p) => p.id === id);
      if (!current) return;
      let updated: PlannedTrip = { ...current, checklist, updatedAt: new Date().toISOString() };
      // the "items left" reminder depends on the list, so it is refreshed when the list changes
      updated = { ...updated, notificationIds: await refreshReminders(updated, lang) };
      await persist(replace(updated), updated);
    },

    setBudget: async (id, budget, currency) => {
      const current = get().plans.find((p) => p.id === id);
      if (!current) return;
      const updated = { ...current, budget, currency: currency ?? current.currency, updatedAt: new Date().toISOString() };
      await persist(replace(updated), updated);
    },

    removePlan: async (id) => {
      const current = get().plans.find((p) => p.id === id);
      if (current) await notificationService.cancel(current.notificationIds);
      await persist(get().plans.filter((p) => p.id !== id));
      await storageService.syncPlanRemoval(id);
      removePlanDocuments(id).catch(() => {});
    },

    clearPlans: () => {
      // used on logout/account deletion: pending reminders must not outlive the data they belong to
      const ids = get().plans.flatMap((p) => p.notificationIds);
      notificationService.cancel(ids);
      set({ plans: [] });
    },

    restoreReminders: async (lang) => {
      const needs = get().plans.filter((p) => p.notificationIds.length === 0 && (daysUntil(p.startDate) ?? 0) > 0);
      if (needs.length === 0 || !(await notificationService.hasPermission())) return;
      const ids = new Map<string, string[]>();
      for (const plan of needs) ids.set(plan.id, await refreshReminders(plan, lang));
      // reminders are per device, so this is a local-only write and does not touch updatedAt or the cloud
      await persist(get().plans.map((p) => (ids.has(p.id) ? { ...p, notificationIds: ids.get(p.id)! } : p)));
    },

    rescheduleAll: async (lang) => {
      const next: PlannedTrip[] = [];
      for (const plan of get().plans) {
        next.push({ ...plan, notificationIds: await refreshReminders(plan, lang) });
      }
      await persist(next);
    },
  };
});
