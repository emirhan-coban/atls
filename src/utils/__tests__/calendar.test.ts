/// <reference types="jest" />
import { daysInMonth, firstWeekdayOffset } from '../planning';

describe('calendar grid', () => {
  it('starts the week on Monday', () => {
    expect(firstWeekdayOffset(2026, 11)).toBe(6); // 1 Nov 2026 is a Sunday
    expect(firstWeekdayOffset(2026, 6)).toBe(0); // 1 Jun 2026 is a Monday
    expect(firstWeekdayOffset(2024, 2)).toBe(3); // 1 Feb 2024 is a Thursday
  });

  it('knows leap years', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });
});
