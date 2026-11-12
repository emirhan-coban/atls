/// <reference types="jest" />
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPTY_STATS, dayKeyOf } from '../../game/dailyCountry';
import { emptyModeStats, modeCountryId } from '../../game/modes';
import { useGameStore } from '../useGameStore';

jest.mock('../../services/notificationService', () => ({ notificationService: { requestPermissions: jest.fn(async () => true) } }));

const reset = () =>
  useGameStore.setState({
    days: {},
    stats: EMPTY_STATS,
    reminder: false,
    modeDays: { flag: {}, shape: {} },
    modeStats: { flag: emptyModeStats('flag'), shape: emptyModeStats('shape') },
  });

describe('useGameStore bonus modes', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    reset();
  });

  it('a bonus win is counted in its own mode and never touches the streak or the classic stats', () => {
    const today = dayKeyOf();
    useGameStore.getState().guess(modeCountryId('flag', today), 'flag');
    const s = useGameStore.getState();
    expect(s.modeDays.flag[today]).toMatchObject({ done: true, won: true });
    expect(s.modeStats.flag).toMatchObject({ played: 1, won: 1, dist: [1, 0, 0, 0] });
    expect(s.modeStats.shape.played).toBe(0);
    expect(s.stats).toEqual(EMPTY_STATS);
    expect(s.days).toEqual({});
  });

  it('a lost bonus puzzle ends after the mode limit and does not reset a streak', () => {
    const today = dayKeyOf();
    const wrong = ['AA', 'AB', 'AC', 'AD', 'AE', 'AF'].filter((id) => id !== modeCountryId('flag', today));
    useGameStore.setState({ stats: { ...EMPTY_STATS, streak: 4, best: 4, played: 4, won: 4, lastWonDay: today } });
    for (const id of wrong.slice(0, 4)) useGameStore.getState().guess(id, 'flag');
    const s = useGameStore.getState();
    expect(s.modeDays.flag[today]).toMatchObject({ done: true, won: false });
    expect(s.modeStats.flag).toMatchObject({ played: 1, won: 0 });
    expect(s.stats.streak).toBe(4);
  });

  it('guesses after the end are ignored, and the classic game still works as before', () => {
    const today = dayKeyOf();
    const secret = modeCountryId('shape', today);
    useGameStore.getState().guess(secret, 'shape');
    useGameStore.getState().guess('FR', 'shape');
    expect(useGameStore.getState().modeStats.shape.played).toBe(1);
    expect(useGameStore.getState().modeDays.shape[today].guesses).toEqual([secret]);

    const classic = modeCountryId('clues', today);
    useGameStore.getState().guess(classic);
    expect(useGameStore.getState().stats).toMatchObject({ played: 1, won: 1, streak: 1, dist: [1, 0, 0, 0, 0, 0] });
  });

  it('saves and reloads the bonus records; saved data from before the modes still loads', async () => {
    const today = dayKeyOf();
    useGameStore.getState().guess(modeCountryId('shape', today), 'shape');
    await Promise.resolve();
    const saved = await AsyncStorage.getItem('@atls_daily_game');
    expect(saved).toContain('modeStats');

    reset();
    await useGameStore.getState().hydrate();
    expect(useGameStore.getState().modeStats.shape.won).toBe(1);

    // an older build wrote only days, stats and reminder
    await AsyncStorage.setItem('@atls_daily_game', JSON.stringify({ days: {}, stats: { played: 2, won: 1, streak: 1, best: 1, lastWonDay: today }, reminder: true }));
    reset();
    await useGameStore.getState().hydrate();
    const s = useGameStore.getState();
    expect(s.stats.played).toBe(2);
    expect(s.reminder).toBe(true);
    expect(s.modeStats.flag).toEqual(emptyModeStats('flag'));
    expect(s.modeDays).toEqual({ flag: {}, shape: {} });
  });
});
