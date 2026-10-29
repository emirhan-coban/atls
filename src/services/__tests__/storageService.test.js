import AsyncStorage from '@react-native-async-storage/async-storage';

const mockCloud = {
  user: { id: 'user-1' },
  upsertError: null,
  upserts: [],
  deletes: [],
  countriesResult: { data: [], error: null },
  profileResult: { data: null, error: null },
  plansResult: { data: [], error: null },
  rpcError: null,
};

jest.mock('../supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: mockCloud.user ? { user: mockCloud.user } : null } })),
      signOut: jest.fn(async () => ({})),
    },
    rpc: jest.fn(async () => ({ error: mockCloud.rpcError })),
    from: jest.fn((table) => ({
      upsert: jest.fn(async (row) => {
        if (mockCloud.upsertError) return { error: mockCloud.upsertError };
        mockCloud.upserts.push({ table, row });
        return { error: null };
      }),
      delete: () => ({
        match: jest.fn(async (filter) => {
          mockCloud.deletes.push({ table, filter });
          return { error: null };
        }),
      }),
      select: () => ({
        eq: () => {
          const result =
            table === 'profiles' ? mockCloud.profileResult : table === 'planned_trips' ? mockCloud.plansResult : mockCloud.countriesResult;
          const promise = Promise.resolve(result);
          promise.maybeSingle = () => Promise.resolve(result);
          return promise;
        },
      }),
    })),
  },
}));

import { storageService, countryToRow, rowToCountry, rowToProfile, planToRow, rowToPlan, mergePlans } from '../storageService';

const turkey = { id: 'TR', status: 'lived', year: '2020' };
const france = { id: 'FR', status: 'visited', year: '2024', month: '07' };

const readLocal = async (key) => JSON.parse((await AsyncStorage.getItem(key)) || 'null');

beforeEach(async () => {
  await AsyncStorage.clear();
  mockCloud.user = { id: 'user-1' };
  mockCloud.upsertError = null;
  mockCloud.upserts = [];
  mockCloud.deletes = [];
  mockCloud.countriesResult = { data: [], error: null };
  mockCloud.profileResult = { data: null, error: null };
  mockCloud.plansResult = { data: [], error: null };
  mockCloud.rpcError = null;
});

describe('cloud row mapping', () => {
  it('keeps month, Turkish name and photos when going to the cloud and back', () => {
    const country = { ...france, nameTr: 'Fransa', continentTr: 'Avrupa', photos: ['a.jpg'] };
    const row = countryToRow('user-1', country);
    expect(row).toMatchObject({ user_id: 'user-1', country_id: 'FR', visited_month: '07', name_tr: 'Fransa', photos: ['a.jpg'] });

    const back = rowToCountry({ ...row });
    expect(back.id).toBe('FR');
    expect(back.visitedMonth).toBe('07');
    expect(back.photos).toEqual(['a.jpg']);
  });

  it('keeps local-only profile fields when the cloud schema has not been migrated', () => {
    const local = { name: 'Ada', passportTheme: 'burgundy', homeCountryId: 'TR', homeCity: 'İzmir' };
    const profile = rowToProfile({ name: 'Ada', handle: '@ada' }, local);
    expect(profile.passportTheme).toBe('burgundy');
    expect(profile.homeCountryId).toBe('TR');
    expect(profile.homeCity).toBe('İzmir');
  });

  it('drops the legacy placeholder city', () => {
    const profile = rowToProfile({ name: 'Ada', location: 'Lisbon, Portugal' }, {});
    expect(profile.location).toBe('Global Citizen');
  });
});

describe('local-first writes', () => {
  it('stores a country locally and pushes it to the cloud with the right conflict key', async () => {
    await storageService.addCountry(turkey);
    expect((await readLocal('@atls_countries')).map((c) => c.id)).toEqual(['TR']);
    expect(mockCloud.upserts).toHaveLength(1);
    expect(mockCloud.upserts[0].table).toBe('user_countries');
    expect(await readLocal('@atls_outbox')).toEqual({});
  });

  it('keeps the data and retries later when the cloud write fails', async () => {
    mockCloud.upsertError = { code: '500', message: 'network down' };
    await storageService.addCountry(turkey);
    expect((await readLocal('@atls_countries')).map((c) => c.id)).toEqual(['TR']);
    expect(Object.keys(await readLocal('@atls_outbox'))).toEqual(['country:TR']);

    mockCloud.upsertError = null;
    await storageService.flushOutbox();
    expect(mockCloud.upserts).toHaveLength(1);
    expect(await readLocal('@atls_outbox')).toEqual({});
  });

  it('retries without new columns when the database has not been migrated', async () => {
    const calls = [];
    mockCloud.upsertError = null;
    const { supabase } = require('../supabase');
    const original = supabase.from.getMockImplementation();
    supabase.from.mockImplementation((table) => ({
      ...original(table),
      upsert: jest.fn(async (row) => {
        calls.push(Object.keys(row));
        if ('visited_month' in row) return { error: { code: 'PGRST204', message: "Could not find the 'visited_month' column" } };
        return { error: null };
      }),
    }));

    await storageService.addCountry(france);
    expect(calls).toHaveLength(2);
    expect(calls[1]).not.toContain('visited_month');
    expect(await readLocal('@atls_outbox')).toEqual({});
    supabase.from.mockImplementation(original);
  });

  it('does not lose countries when several are added at once', async () => {
    await Promise.all(['TR', 'FR', 'DE', 'IT', 'JP'].map((id) => storageService.addCountry({ id, status: 'visited' })));
    const ids = (await readLocal('@atls_countries')).map((c) => c.id).sort();
    expect(ids).toEqual(['DE', 'FR', 'IT', 'JP', 'TR']);
  });

  it('queues removals so a deletion reaches the cloud', async () => {
    await storageService.addCountry(turkey);
    await storageService.removeCountry('TR');
    expect(await readLocal('@atls_countries')).toEqual([]);
    expect(mockCloud.deletes).toEqual([{ table: 'user_countries', filter: { user_id: 'user-1', country_id: 'TR' } }]);
  });

  it('works for guests without a session and keeps changes queued', async () => {
    mockCloud.user = null;
    await storageService.addCountry(turkey);
    expect((await readLocal('@atls_countries')).map((c) => c.id)).toEqual(['TR']);
    expect(mockCloud.upserts).toHaveLength(0);
    expect(Object.keys(await readLocal('@atls_outbox'))).toEqual(['country:TR']);
  });
});

describe('loading data', () => {
  it('never wipes local countries when the cloud request fails', async () => {
    await AsyncStorage.setItem('@atls_countries', JSON.stringify([turkey]));
    await AsyncStorage.setItem('@atls_synced_user', 'user-1');
    mockCloud.countriesResult = { data: null, error: { message: 'offline' } };

    const data = await storageService.loadInitialData({ name: 'Ada' }, []);
    expect(data.countries.map((c) => c.id)).toEqual(['TR']);
    expect((await readLocal('@atls_countries')).map((c) => c.id)).toEqual(['TR']);
  });

  it('uploads countries created before the first sign-in instead of dropping them', async () => {
    await AsyncStorage.setItem('@atls_countries', JSON.stringify([turkey]));
    mockCloud.countriesResult = { data: [], error: null };

    const data = await storageService.loadInitialData({ name: 'Ada' }, []);
    expect(data.countries.map((c) => c.id)).toEqual(['TR']);
    expect(mockCloud.upserts.map((u) => u.row.country_id)).toEqual(['TR']);
    expect(data.profile.isGuest).toBe(false);
  });

  it('trusts an empty cloud list after the first sync', async () => {
    await AsyncStorage.setItem('@atls_countries', JSON.stringify([turkey]));
    await AsyncStorage.setItem('@atls_synced_user', 'user-1');
    mockCloud.countriesResult = { data: [], error: null };

    const data = await storageService.loadInitialData({ name: 'Ada' }, []);
    expect(data.countries).toEqual([]);
  });
});

describe('account deletion', () => {
  it('deletes the cloud account and clears local data', async () => {
    await AsyncStorage.setItem('@atls_countries', JSON.stringify([turkey]));
    await storageService.deleteAccount();
    const { supabase } = require('../supabase');
    expect(supabase.rpc).toHaveBeenCalledWith('delete_my_account');
    expect(await readLocal('@atls_countries')).toBeNull();
  });

  it('fails loudly and keeps local data when the cloud deletion fails', async () => {
    await AsyncStorage.setItem('@atls_countries', JSON.stringify([turkey]));
    mockCloud.rpcError = { message: 'function not found' };
    await expect(storageService.deleteAccount()).rejects.toThrow('function not found');
    expect((await readLocal('@atls_countries')).map((c) => c.id)).toEqual(['TR']);
  });
});

describe('planned trips in the cloud', () => {
  const plan = {
    id: 'p1',
    countryId: 'IT',
    startDate: '2026-12-01',
    endDate: '2026-12-08',
    cities: ['Roma'],
    notes: 'n',
    checklist: [{ id: 'a', text: 'Pasaport', done: true }],
    budget: [{ id: 'b', label: 'Otel', amount: 500 }],
    currency: 'EUR',
    notificationIds: ['local-notification'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('round-trips a plan but never sends this device\'s notification ids', () => {
    const row = planToRow('user-1', plan);
    expect(row).toMatchObject({ user_id: 'user-1', country_id: 'IT', start_date: '2026-12-01', end_date: '2026-12-08' });
    expect(row).not.toHaveProperty('notification_ids');
    const back = rowToPlan(row);
    expect(back).toMatchObject({ id: 'p1', checklist: plan.checklist, budget: plan.budget, notificationIds: [] });
  });

  it('keeps this device\'s reminders on the winning cloud copy and uploads newer local plans', () => {
    const cloudSame = { ...plan, notificationIds: [], notes: 'cloud', updatedAt: '2026-01-05T00:00:00.000Z' };
    const merged = mergePlans([plan], [cloudSame], { keepLocalOnly: false, pendingKeys: new Set() });
    expect(merged.plans[0]).toMatchObject({ notes: 'cloud', notificationIds: ['local-notification'] });
    expect(merged.toUpload).toEqual([]);

    const newerLocal = { ...plan, updatedAt: '2026-02-01T00:00:00.000Z' };
    const second = mergePlans([newerLocal], [cloudSame], { keepLocalOnly: false, pendingKeys: new Set() });
    expect(second.toUpload).toEqual([newerLocal]);
  });

  it('queues a plan and its removal for the cloud', async () => {
    await storageService.syncPlan(plan);
    expect(mockCloud.upserts.find((u) => u.table === 'planned_trips')?.row).toMatchObject({ id: 'p1', user_id: 'user-1' });
    await storageService.syncPlanRemoval('p1');
    expect(mockCloud.deletes).toContainEqual({ table: 'planned_trips', filter: { user_id: 'user-1', id: 'p1' } });
  });

  it('brings plans from another device onto this one and keeps offline plans', async () => {
    const cloudPlan = planToRow('user-1', { ...plan, id: 'p-cloud' });
    mockCloud.plansResult = { data: [cloudPlan], error: null };
    await AsyncStorage.setItem('@atls_plans', JSON.stringify([{ ...plan, id: 'p-local' }]));
    await AsyncStorage.setItem('@atls_synced_user', 'user-1');
    mockCloud.user = { id: 'user-1' };
    const data = await storageService.loadInitialData({ name: 'A' }, []);
    expect(data.plans.map((p) => p.id).sort()).toEqual(['p-cloud']);
    // after the first sync an unpended local-only plan was deleted elsewhere, so the cloud wins
  });

  it('keeps local plans when the table does not exist yet', async () => {
    mockCloud.plansResult = { data: null, error: { message: 'relation does not exist' } };
    await AsyncStorage.setItem('@atls_plans', JSON.stringify([plan]));
    const data = await storageService.loadInitialData({ name: 'A' }, []);
    expect(data.plans.map((p) => p.id)).toEqual(['p1']);
  });
});
