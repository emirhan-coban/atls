/// <reference types="jest" />
import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeContext';
import Button from '../ui/Button';
import { ErrorBoundary } from '../ErrorBoundary';
import DailyGameCard from '../DailyGameCard';
import { useGameStore } from '../../stores/useGameStore';
import { EMPTY_STATS, dayKeyOf } from '../../game/dailyCountry';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Testing Library v14 renders and fires events asynchronously.
const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Button', () => {
  it('fires onPress and shows its label', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Kaydet" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Kaydet'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire while disabled or loading', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Kaydet" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText('Kaydet'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('ErrorBoundary', () => {
  const Boom = () => {
    throw new Error('boom');
  };

  it('shows the fallback instead of crashing and renders children when fine', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await wrap(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Yeniden Dene')).toBeTruthy();
    spy.mockRestore();
  });

  it('renders children when nothing throws', async () => {
    await wrap(
      <ErrorBoundary>
        <Text>fine</Text>
      </ErrorBoundary>
    );
    expect(screen.getByText('fine')).toBeTruthy();
  });
});

describe('DailyGameCard', () => {
  beforeEach(() => useGameStore.setState({ days: {}, stats: EMPTY_STATS, modeDays: { flag: {}, shape: {} } }));

  it('invites you to play before today is done', async () => {
    const onPress = jest.fn();
    await wrap(<DailyGameCard currentLang="en" onPress={onPress} />);
    await fireEvent.press(screen.getByText("What's today's secret country?"));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows the result and the streak once played', async () => {
    useGameStore.setState({
      days: { [dayKeyOf()]: { guesses: ['TR'], done: true, won: true } },
      stats: { ...EMPTY_STATS, played: 1, won: 1, streak: 3, best: 3, lastWonDay: dayKeyOf() },
    });
    await wrap(<DailyGameCard currentLang="en" onPress={() => {}} />);
    expect(screen.getByText("Today's country found ✓")).toBeTruthy();
    expect(screen.getByText('🔥 3-day streak · 2 bonus puzzles waiting for you')).toBeTruthy();
  });

  it('speaks Turkish when asked', async () => {
    await wrap(<DailyGameCard currentLang="tr" onPress={() => {}} />);
    expect(screen.getByText('Bugünün gizli ülkesi hangisi?')).toBeTruthy();
  });

  it('does not mention the bonus puzzles before the first classic one is finished', async () => {
    await wrap(<DailyGameCard currentLang="en" onPress={() => {}} />);
    expect(screen.queryByText(/bonus/i)).toBeNull();
    expect(screen.queryByText(/puzzles today/)).toBeNull();
  });

  it('celebrates when all three puzzles are done', async () => {
    const today = dayKeyOf();
    const done = { guesses: ['x'], done: true, won: true };
    useGameStore.setState({
      days: { [today]: done },
      modeDays: { flag: { [today]: done }, shape: { [today]: done } },
      stats: { ...EMPTY_STATS, played: 1, won: 1, streak: 1, best: 1, lastWonDay: today },
    });
    await wrap(<DailyGameCard currentLang="en" onPress={() => {}} />);
    expect(screen.getByText("All 3 of today's puzzles are done")).toBeTruthy();
  });
});
