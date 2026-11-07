import { notificationService } from './notificationService';
import { useGameStore } from '../stores/useGameStore';
import { useAppStore } from '../stores/useAppStore';
import { dayKeyOf, liveStreak } from '../game/dailyCountry';
import { nextReminderAt, reminderCopy } from '../utils/gameReminder';

/**
 * Rebuilds the evening reminder from the current state (switch on/off, played today, streak, language).
 * Call it after the game ends, when the switch changes and whenever the app comes to the foreground.
 */
export async function refreshGameReminder(): Promise<void> {
  const { reminder, days, stats } = useGameStore.getState();
  if (!reminder) {
    await notificationService.setGameReminder(null);
    return;
  }
  const today = dayKeyOf();
  const copy = reminderCopy(liveStreak(stats, today), useAppStore.getState().currentLang);
  await notificationService.setGameReminder({
    at: nextReminderAt(new Date(), Boolean(days[today]?.done)),
    kind: 'game',
    ...copy,
  });
}
