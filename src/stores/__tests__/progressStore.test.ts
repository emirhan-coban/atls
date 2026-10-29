/// <reference types="jest" />
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProgressStore } from '../useProgressStore';
import { useTripStore } from '../useTripStore';
import { Country, Trip } from '../types';

jest.mock('../../services/supabase', () => ({ isSupabaseConfigured: false, supabase: null }));

const visited = (id: string): Country => ({
  id,
  name: id,
  nameTr: id,
  continent: 'Europe',
  continentTr: 'Avrupa',
  flag: '🏳️',
  status: 'visited',
});

const trip = (id: string, countryId: string, extra: Partial<Trip> = {}): Trip => ({
  id,
  countryId,
  year: '2024',
  cities: [],
  type: 'leisure',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...extra,
});

beforeEach(async () => {
  await AsyncStorage.clear();
  useProgressStore.getState().reset();
  useTripStore.setState({ trips: [], isHydrated: false, seeded: [] });
});

describe('progress store', () => {
  it('records the starting state on the first run without announcing old badges', () => {
    useProgressStore.getState().checkUnlocks([visited('FR')], undefined, []);
    const state = useProgressStore.getState();
    expect(state.initialized).toBe(true);
    expect(Object.keys(state.unlocked)).toContain('first_step');
    expect(state.queue).toEqual([]);
  });

  it('queues a badge exactly once when it is newly unlocked', () => {
    const store = useProgressStore.getState();
    store.checkUnlocks([visited('FR')], undefined, []);

    const five = ['FR', 'DE', 'IT', 'ES', 'PT'].map(visited);
    useProgressStore.getState().checkUnlocks(five, undefined, []);
    expect(useProgressStore.getState().queue).toContain('explorer_5');

    const before = useProgressStore.getState().queue.length;
    useProgressStore.getState().checkUnlocks(five, undefined, []);
    expect(useProgressStore.getState().queue.length).toBe(before);
  });

  it('unlocks journal badges from trips', () => {
    useProgressStore.getState().checkUnlocks([visited('FR')], undefined, []);
    useProgressStore
      .getState()
      .checkUnlocks([visited('FR')], undefined, [trip('1', 'FR'), trip('2', 'FR'), trip('3', 'FR')]);
    expect(useProgressStore.getState().queue).toContain('return_visitor');
  });

  it('shows queued badges one at a time', () => {
    useProgressStore.setState({ queue: ['explorer_5', 'first_step'] });
    expect(useProgressStore.getState().currentBadge()?.id).toBe('explorer_5');
    useProgressStore.getState().dismissCurrent();
    expect(useProgressStore.getState().currentBadge()?.id).toBe('first_step');
  });

  it('saves the yearly goal', () => {
    useProgressStore.getState().setYearlyGoal({ year: 2026, target: 4 });
    expect(useProgressStore.getState().yearlyGoal).toEqual({ year: 2026, target: 4 });
    useProgressStore.getState().setYearlyGoal(null);
    expect(useProgressStore.getState().yearlyGoal).toBeNull();
  });
});

describe('trip store', () => {
  it('does not recreate a trip the user deleted', async () => {
    useTripStore.getState().setTrips([], []);
    const countries = [{ ...visited('FR'), year: '2023' }];

    await useTripStore.getState().ensureLegacyTrips(countries);
    expect(useTripStore.getState().trips).toHaveLength(1);

    const id = useTripStore.getState().trips[0].id;
    await useTripStore.getState().removeTrip(id);
    await useTripStore.getState().ensureLegacyTrips(countries);
    expect(useTripStore.getState().trips).toHaveLength(0);
  });

  it('does nothing before storage has loaded', async () => {
    await useTripStore.getState().ensureLegacyTrips([{ ...visited('FR'), year: '2023' }]);
    expect(useTripStore.getState().trips).toEqual([]);
  });
});
