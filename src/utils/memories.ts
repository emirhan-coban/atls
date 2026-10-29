import { Trip } from '../stores/types';
import { Reminder } from './planning';

type Lang = 'tr' | 'en';

export const MEMORY_HOUR = 10;
/** iOS keeps at most 64 pending notifications, and trip plans need room too. */
export const MAX_MEMORY_REMINDERS = 12;

/**
 * "This month, N years ago" reminders. A trip only stores year and month, so the reminder is sent on
 * the 1st of that month at 10:00. For every trip the next such date within a year is used, and
 * one reminder per country and month keeps repeat trips from sending twice.
 */
export function buildMemoryReminders(
  trips: Trip[],
  nameOf: (countryId: string) => string,
  lang: Lang,
  now: Date = new Date()
): Reminder[] {
  const seen = new Set<string>();
  const out: Reminder[] = [];

  for (const trip of trips) {
    const year = Number(trip.year);
    const month = Number(trip.month);
    if (!/^\d{4}$/.test(trip.year) || !month || month < 1 || month > 12) continue;

    // next 1st of that month that is still ahead of now
    let target = new Date(now.getFullYear(), month - 1, 1, MEMORY_HOUR, 0, 0);
    if (target.getTime() <= now.getTime()) target = new Date(now.getFullYear() + 1, month - 1, 1, MEMORY_HOUR, 0, 0);
    const yearsAgo = target.getFullYear() - year;
    if (yearsAgo < 1) continue;

    const key = `${trip.countryId}-${month}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const country = nameOf(trip.countryId);
    out.push({
      at: target,
      kind: 'memory',
      title:
        lang === 'tr'
          ? `${yearsAgo} yıl önce bu ay: ${country} 🗺️`
          : `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago this month: ${country} 🗺️`,
      body:
        lang === 'tr'
          ? 'O geziyi hatırla, fotoğraflarına ve notlarına göz at.'
          : 'Look back at that trip, your photos and your notes.',
    });
  }

  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_MEMORY_REMINDERS);
}
