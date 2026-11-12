/// <reference types="jest" />
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeContext';
import CompareModal from '../CompareModal';
import DailyGameModal from '../DailyGameModal';
import { useCompareStore } from '../../stores/useCompareStore';
import { useGameStore } from '../../stores/useGameStore';
import { EMPTY_STATS, dayKeyOf } from '../../game/dailyCountry';
import { encodeVisited } from '../../utils/compareCode';
import { emptyModeStats, modeCountryId } from '../../game/modes';
import type { Country, Profile } from '../../stores/types';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const passthrough = ({ children, ...p }: any) => React.createElement(View, p, children);
  const anim = { duration: () => anim, delay: () => anim, springify: () => anim, damping: () => anim };
  return {
    __esModule: true,
    default: { View: passthrough, Text, createAnimatedComponent: (c: any) => c },
    FadeIn: anim, FadeInDown: anim, FadeInUp: anim, FadeOut: anim,
    useSharedValue: (v: any) => ({ value: v }), useAnimatedStyle: () => ({}), withTiming: (v: any) => v, withSpring: (v: any) => v,
    useDerivedValue: (f: any) => ({ value: f() }), useAnimatedProps: () => ({}), runOnJS: (f: any) => f, Easing: { out: (x: any) => x, cubic: 1, inOut: (x: any) => x },
  };
});
jest.mock('../../services/gameReminder', () => ({ refreshGameReminder: jest.fn() }));

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const country = (id: string): Country => ({ id, name: id, nameTr: id, continent: 'Europe', continentTr: 'Avrupa', flag: '🏳️', status: 'visited' }) as Country;
const profile = { name: 'Ada' } as Profile;

describe('CompareModal', () => {
  beforeEach(() => useCompareStore.setState({ isOpen: false, invite: null }));

  const open = (lang: 'tr' | 'en' = 'en') =>
    wrap(<CompareModal visible onClose={() => {}} countries={[country('FR'), country('JP')]} profile={profile} currentLang={lang} />);

  it('offers to send your passport and to paste a friend\'s code', async () => {
    await open();
    expect(screen.getByText('Send my passport')).toBeTruthy();
    expect(screen.getByText('GOT ONE FROM A FRIEND?')).toBeTruthy();
  });

  it('says so when the pasted text is not a passport code', async () => {
    await open();
    await fireEvent.changeText(screen.getByLabelText('Paste the message, link or code here'), 'hello there');
    await fireEvent.press(screen.getByText('Compare'));
    expect(screen.getByText("That doesn't look like an atls. passport code.")).toBeTruthy();
  });

  it('asks to update when the code comes from a newer version of the app', async () => {
    await open();
    const body = encodeVisited(['FR']).slice(1);
    await fireEvent.changeText(screen.getByLabelText('Paste the message, link or code here'), `https://x/c/?c=9${body}`);
    await fireEvent.press(screen.getByText('Compare'));
    expect(screen.getByText('This code comes from a newer version of atls. Update the app to compare.')).toBeTruthy();
  });

  it('compares with a valid pasted code and shows what you share', async () => {
    await open();
    const code = encodeVisited(['FR', 'US']);
    await fireEvent.changeText(screen.getByLabelText('Paste the message, link or code here'), `link?c=${code}&n=Bo`);
    await fireEvent.press(screen.getByText('Compare'));
    expect(screen.getByText('Passport match with Bo')).toBeTruthy();
    expect(screen.getByText('YOU BOTH WENT · 1')).toBeTruthy();
    expect(screen.getByText('ONLY YOU · 1')).toBeTruthy();
    expect(screen.getByText('ONLY BO · 1')).toBeTruthy();
  });
});

describe('DailyGameModal', () => {
  beforeEach(() => useGameStore.setState({ days: {}, stats: EMPTY_STATS, reminder: false, isOpen: true, modeDays: { flag: {}, shape: {} }, modeStats: { flag: emptyModeStats('flag'), shape: emptyModeStats('shape') } }));

  it('starts with the first clue open and the rest locked', async () => {
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    expect(screen.getByText("Today's secret country")).toBeTruthy();
    expect(screen.getByText('Clue 2 opens after a wrong guess')).toBeTruthy();
    expect(screen.getByText('6 guesses left')).toBeTruthy();
  });

  it('shows the result with the guess distribution once the day is done', async () => {
    const today = dayKeyOf();
    useGameStore.setState({
      days: { [today]: { guesses: ['a', 'b', 'c'], done: true, won: true } },
      stats: { ...EMPTY_STATS, played: 4, won: 3, streak: 2, best: 2, lastWonDay: today, dist: [0, 1, 2, 0, 0, 0] },
    });
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    expect(screen.getByText('Found in 3!')).toBeTruthy();
    expect(screen.getByText('GUESSES TO SOLVE')).toBeTruthy();
    expect(screen.getByText('Missed: 1')).toBeTruthy();
    expect(screen.getByText('Streak 2 · Best 2 · Won 3/4')).toBeTruthy();
  });

  it('speaks Turkish', async () => {
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="tr" />);
    expect(screen.getByText('Bugünün gizli ülkesi')).toBeTruthy();
    expect(screen.getByText('2. ipucu yanlış tahminle açılır')).toBeTruthy();
  });
});

describe('DailyGameModal bonus modes', () => {
  const unlock = () =>
    useGameStore.setState({
      days: { [dayKeyOf()]: { guesses: ['x'], done: true, won: true } },
      stats: { ...EMPTY_STATS, played: 1, won: 1, streak: 1, best: 1, lastWonDay: dayKeyOf() },
      modeDays: { flag: {}, shape: {} },
      modeStats: { flag: emptyModeStats('flag'), shape: emptyModeStats('shape') },
    });

  it('shows a single puzzle and no mode switch to a new player', async () => {
    useGameStore.setState({ days: {}, stats: EMPTY_STATS, modeDays: { flag: {}, shape: {} } });
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    expect(screen.queryByText('Flag')).toBeNull();
    expect(screen.queryByText('Silhouette')).toBeNull();
  });

  it('introduces the new modes right after the first classic result', async () => {
    unlock();
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    expect(screen.getByText('New: Flag and Silhouette')).toBeTruthy();
    expect(screen.getByText('Flag')).toBeTruthy();
    expect(screen.getByText('Silhouette')).toBeTruthy();
  });

  it('flag mode: a neutral label, four guesses, first clue only after a miss', async () => {
    unlock();
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    await fireEvent.press(screen.getByText('Flag'));
    expect(screen.getByLabelText("Today's flag")).toBeTruthy(); // never the country's name
    expect(screen.getByText('4 guesses left')).toBeTruthy();
    expect(screen.getByText('Clue 1 opens after a wrong guess')).toBeTruthy();
    expect(screen.queryByText('Clue 2 opens after a wrong guess')).toBeNull(); // only the next locked clue is hinted
    expect(screen.getByText(/BONUS · FLAG/)).toBeTruthy();
  });

  it('silhouette mode draws the outline and shows a bonus result without touching the streak', async () => {
    unlock();
    await wrap(<DailyGameModal visible onClose={() => {}} currentLang="en" />);
    await fireEvent.press(screen.getByText('Silhouette'));
    expect(screen.getByLabelText('The outline of a country')).toBeTruthy();
    expect(screen.getByText('5 guesses left')).toBeTruthy();

    const today = dayKeyOf();
    await act(async () => {
      useGameStore.setState({
        modeDays: { flag: {}, shape: { [today]: { guesses: ['a', modeCountryId('shape', today)], done: true, won: true } } },
        modeStats: { flag: emptyModeStats('flag'), shape: { played: 1, won: 1, dist: [0, 1, 0, 0, 0] } },
      });
    });
    expect(screen.getByText('Bonus puzzle, your streak is safe')).toBeTruthy();
    expect(screen.queryByText('Evening reminder at 20:00')).toBeNull(); // the reminder belongs to the classic streak
  });
});
