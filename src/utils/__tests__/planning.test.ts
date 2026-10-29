/// <reference types="jest" />
import {
  addItems, addTemplate, budgetTotal, buildReminders, checklistProgress, daysInMonth, daysUntil, entryRequirementItems,
  formatDateKey, nextPlan, parseAmount, parseDate, planPhase, sortPlans, toDateKey, tripLengthDays,
} from '../planning';
import { PlannedTrip } from '../../stores/types';

const plan = (id: string, startDate: string, endDate: string | null = null): PlannedTrip => ({
  id, countryId: 'IT', startDate, endDate, cities: [], notes: '', checklist: [], budget: [], currency: 'EUR',
  notificationIds: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
});

// fixed "today": 10 June 2026, 15:30 local
const NOW = new Date(2026, 5, 10, 15, 30);

describe('dates', () => {
  it('accepts real dates only', () => {
    expect(parseDate('2026-02-28')).toEqual({ y: 2026, m: 2, d: 28 });
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('2026-13-01')).toBeNull();
    expect(parseDate('26-1-1')).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('2028-02-29')).not.toBeNull(); // leap year
    expect(parseDate('2027-02-29')).toBeNull();
  });

  it('knows month lengths and builds keys', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(formatDateKey(2026, 3, 5)).toBe('2026-03-05');
    expect(toDateKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });

  it('counts calendar days regardless of the time of day', () => {
    expect(daysUntil('2026-06-10', NOW)).toBe(0);
    expect(daysUntil('2026-06-11', new Date(2026, 5, 10, 23, 59))).toBe(1);
    expect(daysUntil('2026-06-09', NOW)).toBe(-1);
    expect(daysUntil('2026-12-25', NOW)).toBe(198);
    expect(daysUntil('nonsense', NOW)).toBeNull();
  });

  it('is not thrown off by a daylight-saving change', () => {
    // 28 March 2026 -> 30 March 2026 crosses the European DST switch
    expect(daysUntil('2026-03-30', new Date(2026, 2, 28, 12, 0))).toBe(2);
  });

  it('measures trip length with both ends included', () => {
    expect(tripLengthDays('2026-07-01', '2026-07-07')).toBe(7);
    expect(tripLengthDays('2026-07-01', '2026-07-01')).toBe(1);
    expect(tripLengthDays('2026-07-07', '2026-07-01')).toBeNull();
    expect(tripLengthDays('2026-07-01', null)).toBeNull();
  });
});

describe('plan phase and order', () => {
  it('classifies upcoming, ongoing and past plans', () => {
    expect(planPhase(plan('a', '2026-06-20'), NOW)).toBe('upcoming');
    expect(planPhase(plan('b', '2026-06-08', '2026-06-12'), NOW)).toBe('ongoing');
    expect(planPhase(plan('c', '2026-06-10'), NOW)).toBe('ongoing'); // single day, today
    expect(planPhase(plan('d', '2026-05-01', '2026-05-05'), NOW)).toBe('past');
    expect(planPhase(plan('e', '2026-06-09'), NOW)).toBe('past'); // single day, yesterday
  });

  it('puts soonest upcoming first and finished plans last', () => {
    const plans = [plan('past', '2026-01-01', '2026-01-05'), plan('far', '2026-12-01'), plan('soon', '2026-06-20')];
    expect(sortPlans(plans, NOW).map((p) => p.id)).toEqual(['soon', 'far', 'past']);
    expect(nextPlan(plans, NOW)?.id).toBe('soon');
    expect(nextPlan([plan('past', '2026-01-01')], NOW)).toBeNull();
  });
});

describe('budget', () => {
  it('parses amounts typed in Turkish and English formats', () => {
    expect(parseAmount('1250')).toBe(1250);
    expect(parseAmount('1.250,50')).toBe(1250.5);
    expect(parseAmount('1,250.50')).toBe(1250.5);
    expect(parseAmount('1.250')).toBe(1250);
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount('€ 40')).toBe(40);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('0')).toBeNull();
  });

  it('adds up items', () => {
    expect(budgetTotal([{ id: '1', label: 'a', amount: 100.5 }, { id: '2', label: 'b', amount: 20 }])).toBe(120.5);
    expect(budgetTotal([])).toBe(0);
  });
});

describe('checklists', () => {
  it('adds a template once, even if added twice', () => {
    const once = addTemplate([], 'beach', 'tr');
    expect(once.length).toBeGreaterThan(0);
    expect(addTemplate(once, 'beach', 'tr')).toHaveLength(once.length);
  });

  it('keeps ticked items when a template is added again', () => {
    const list = addTemplate([], 'city', 'en').map((i, idx) => (idx === 0 ? { ...i, done: true } : i));
    const again = addTemplate(list, 'city', 'en');
    expect(again[0].done).toBe(true);
  });

  it('adds entry items according to the visa rule', () => {
    expect(entryRequirementItems('free', false, 'tr')).toEqual([]);
    expect(entryRequirementItems('required', false, 'en').map((i) => i.id)).toEqual(['entry:visa']);
    expect(entryRequirementItems('required', true, 'en').map((i) => i.id)).toEqual(['entry:visa', 'entry:schengen']);
    expect(entryRequirementItems('evisa', false, 'tr')[0].text).toMatch(/e-Vize/);
    expect(entryRequirementItems(null, false, 'tr')).toEqual([]);
    expect(addItems(entryRequirementItems('required', false, 'en'), entryRequirementItems('required', false, 'en'))).toHaveLength(1);
  });

  it('reports progress', () => {
    expect(checklistProgress([{ id: 'a', text: 'x', done: true }, { id: 'b', text: 'y', done: false }])).toEqual({ done: 1, total: 2 });
  });
});

describe('reminders', () => {
  const withItems = (start: string, done: boolean) => ({ startDate: start, checklist: [{ id: 'a', text: 'x', done }] });

  it('schedules a week before, 3 days before (if items are open) and the day before at 09:00', () => {
    const reminders = buildReminders(withItems('2026-06-30', false), 'İtalya', 'tr', NOW);
    expect(reminders.map((r) => r.kind)).toEqual(['week', 'checklist', 'day']);
    expect(reminders[0].at).toEqual(new Date(2026, 5, 23, 9, 0));
    expect(reminders[2].at).toEqual(new Date(2026, 5, 29, 9, 0));
  });

  it('skips the checklist nudge when everything is done', () => {
    expect(buildReminders(withItems('2026-06-30', true), 'Italy', 'en', NOW).map((r) => r.kind)).toEqual(['week', 'day']);
  });

  it('never schedules reminders in the past', () => {
    // trip in 4 days: the week-before moment has passed, 3-days-before (11 June) and the day before are still ahead
    expect(buildReminders(withItems('2026-06-14', false), 'Italy', 'en', NOW).map((r) => r.kind)).toEqual(['checklist', 'day']);
    // trip in 2 days: only the day-before reminder (11 June, 09:00) is left
    expect(buildReminders(withItems('2026-06-12', false), 'Italy', 'en', NOW).map((r) => r.kind)).toEqual(['day']);
    expect(buildReminders(withItems('2026-06-10', false), 'Italy', 'en', NOW)).toEqual([]);
    expect(buildReminders(withItems('bad-date', false), 'Italy', 'en', NOW)).toEqual([]);
  });

  it('writes the country into the message in the chosen language', () => {
    expect(buildReminders(withItems('2026-07-30', true), 'Japonya', 'tr', NOW)[0].title).toContain('Japonya');
    expect(buildReminders(withItems('2026-07-30', true), 'Japan', 'en', NOW)[0].title).toContain('Japan');
  });
});

import { buildMemoryReminders } from '../memories';

describe('anniversary reminders', () => {
  const trip = (id: string, countryId: string, year: string, month: string | null) =>
    ({ id, countryId, year, month, cities: [], type: 'leisure', createdAt: '', updatedAt: '' }) as any;
  const now = new Date(2026, 5, 15, 12, 0, 0); // 15 June 2026
  const nameOf = (id: string) => id;

  it('schedules the next 1st of the trip month and counts the years', () => {
    const [r] = buildMemoryReminders([trip('a', 'JP', '2023', '10')], nameOf, 'en', now);
    expect(r.at).toEqual(new Date(2026, 9, 1, 10, 0, 0));
    expect(r.title).toContain('3 years ago');
  });

  it('rolls to next year when the month already passed this year', () => {
    const [r] = buildMemoryReminders([trip('a', 'FR', '2024', '03')], nameOf, 'tr', now);
    expect(r.at).toEqual(new Date(2027, 2, 1, 10, 0, 0));
    expect(r.title).toContain('3 yıl önce');
  });

  it('skips trips without a month, with an unknown year, or from this very year', () => {
    const list = buildMemoryReminders(
      [trip('a', 'IT', '2020', null), trip('b', 'DE', '', '08'), trip('c', 'ES', '2026', '09')],
      nameOf,
      'en',
      now
    );
    expect(list).toEqual([]);
  });

  it('sends one reminder per country and month, soonest first, capped', () => {
    const trips = [trip('a', 'JP', '2021', '10'), trip('b', 'JP', '2023', '10'), trip('c', 'FR', '2022', '07')];
    const list = buildMemoryReminders(trips, nameOf, 'en', now);
    expect(list.map((r) => r.at.getMonth())).toEqual([6, 9]);
    const many = Array.from({ length: 30 }, (_, i) => trip(`t${i}`, `C${i}`, '2020', String((i % 12) + 1).padStart(2, '0')));
    expect(buildMemoryReminders(many, nameOf, 'en', now).length).toBeLessThanOrEqual(12);
  });
});
