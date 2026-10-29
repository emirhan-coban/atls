/// <reference types="jest" />
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlanStore } from '../usePlanStore';

jest.mock('../../services/supabase', () => ({ isSupabaseConfigured: false, supabase: null }));

const mockNotifications = {
  allowed: true,
  scheduled: [] as { title: string; at: Date }[],
  cancelled: [] as string[],
  counter: 0,
};

jest.mock('../../services/notificationService', () => ({
  notificationService: {
    hasPermission: jest.fn(async () => mockNotifications.allowed),
    scheduleReminders: jest.fn(async (reminders: { title: string; at: Date }[]) =>
      reminders.map((r) => {
        mockNotifications.scheduled.push({ title: r.title, at: r.at });
        return `n${++mockNotifications.counter}`;
      })
    ),
    cancel: jest.fn(async (ids: string[]) => {
      mockNotifications.cancelled.push(...ids);
    }),
  },
}));

const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const input = (days = 40) => ({ countryId: 'IT', startDate: future(days), endDate: null, cities: ['Roma'], notes: '' });

beforeEach(async () => {
  await AsyncStorage.clear();
  usePlanStore.setState({ plans: [], isHydrated: true });
  mockNotifications.allowed = true;
  mockNotifications.scheduled = [];
  mockNotifications.cancelled = [];
  mockNotifications.counter = 0;
});

describe('plan store and reminders', () => {
  it('creates a plan, saves it on the device and schedules reminders', async () => {
    const plan = await usePlanStore.getState().addPlan(input(), 'tr');
    expect(usePlanStore.getState().plans).toHaveLength(1);
    expect(plan.notificationIds.length).toBe(2); // a week before + the day before (checklist is empty)
    expect(JSON.parse((await AsyncStorage.getItem('@atls_plans')) || '[]')).toHaveLength(1);
  });

  it('schedules nothing without notification permission, and still saves the plan', async () => {
    mockNotifications.allowed = false;
    const plan = await usePlanStore.getState().addPlan(input(), 'en');
    expect(plan.notificationIds).toEqual([]);
    expect(mockNotifications.scheduled).toEqual([]);
    expect(usePlanStore.getState().plans).toHaveLength(1);
  });

  it('cancels the old reminders when the dates change and schedules new ones', async () => {
    const plan = await usePlanStore.getState().addPlan(input(40), 'tr');
    await usePlanStore.getState().updatePlan(plan.id, { startDate: future(60) }, 'tr');
    expect(mockNotifications.cancelled).toEqual(plan.notificationIds);
    const updated = usePlanStore.getState().plans[0];
    expect(updated.notificationIds).toHaveLength(2);
    expect(updated.notificationIds).not.toEqual(plan.notificationIds);
  });

  it('adds a checklist reminder while items are open and drops it when everything is ticked', async () => {
    const plan = await usePlanStore.getState().addPlan(input(), 'tr');
    await usePlanStore.getState().setChecklist(plan.id, [{ id: 'a', text: 'x', done: false }], 'tr');
    expect(usePlanStore.getState().plans[0].notificationIds).toHaveLength(3);
    await usePlanStore.getState().setChecklist(plan.id, [{ id: 'a', text: 'x', done: true }], 'tr');
    expect(usePlanStore.getState().plans[0].notificationIds).toHaveLength(2);
  });

  it('cancels reminders when a plan is deleted and when everything is cleared on logout', async () => {
    const a = await usePlanStore.getState().addPlan(input(40), 'tr');
    const b = await usePlanStore.getState().addPlan(input(50), 'tr');
    await usePlanStore.getState().removePlan(a.id);
    expect(mockNotifications.cancelled).toEqual(expect.arrayContaining(a.notificationIds));
    expect(usePlanStore.getState().plans.map((p) => p.id)).toEqual([b.id]);

    usePlanStore.getState().clearPlans();
    expect(usePlanStore.getState().plans).toEqual([]);
    expect(mockNotifications.cancelled).toEqual(expect.arrayContaining(b.notificationIds));
  });

  it('keeps budget changes without touching reminders', async () => {
    const plan = await usePlanStore.getState().addPlan(input(), 'tr');
    const before = [...mockNotifications.scheduled];
    await usePlanStore.getState().setBudget(plan.id, [{ id: '1', label: 'Uçak', amount: 4200 }], 'TRY');
    expect(usePlanStore.getState().plans[0]).toMatchObject({ currency: 'TRY' });
    expect(usePlanStore.getState().plans[0].budget).toHaveLength(1);
    expect(mockNotifications.scheduled).toEqual(before);
  });

  it('re-creates reminders for every plan after permission is granted later', async () => {
    mockNotifications.allowed = false;
    await usePlanStore.getState().addPlan(input(40), 'tr');
    mockNotifications.allowed = true;
    await usePlanStore.getState().rescheduleAll('tr');
    expect(usePlanStore.getState().plans[0].notificationIds).toHaveLength(2);
  });
});
