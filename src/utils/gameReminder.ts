/** Evening reminder for the daily Secret Country game. Pure: scheduling lives in services/gameReminder.ts. */
export const REMINDER_HOUR = 20;

/**
 * The next 20:00 the reminder should fire: today if the game is not played yet and it is still before 20:00,
 * otherwise tomorrow. A single one-off notification is scheduled each time (not a repeating one), so someone who
 * stops opening the app gets at most one more reminder instead of being nagged every evening.
 */
export function nextReminderAt(now: Date, playedToday: boolean, hour = REMINDER_HOUR): Date {
  const at = new Date(now.getTime());
  at.setHours(hour, 0, 0, 0);
  if (playedToday || at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

export function reminderCopy(streak: number, lang: 'tr' | 'en'): { title: string; body: string } {
  if (lang === 'tr') {
    return streak > 0
      ? { title: `🔥 ${streak} günlük serin tehlikede`, body: 'Bugünün gizli ülkesi seni bekliyor. Kaç tahminde bulursun?' }
      : { title: 'Bugünün gizli ülkesi hazır', body: '6 ipucu, 6 tahmin. Kaç tahminde bulursun?' };
  }
  return streak > 0
    ? { title: `🔥 Your ${streak}-day streak is at risk`, body: "Today's secret country is waiting. How many guesses will it take?" }
    : { title: "Today's secret country is ready", body: '6 clues, 6 guesses. How many will it take?' };
}
