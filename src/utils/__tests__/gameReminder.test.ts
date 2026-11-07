/// <reference types="jest" />
import { nextReminderAt, reminderCopy } from '../gameReminder';

describe('game reminder', () => {
  it('fires today at 20:00 when the game is not played and it is earlier', () => {
    const at = nextReminderAt(new Date(2026, 10, 7, 14, 30), false);
    expect([at.getFullYear(), at.getMonth(), at.getDate(), at.getHours(), at.getMinutes()]).toEqual([2026, 10, 7, 20, 0]);
  });

  it('moves to tomorrow once the game is played', () => {
    const at = nextReminderAt(new Date(2026, 10, 7, 14, 30), true);
    expect([at.getDate(), at.getHours()]).toEqual([8, 20]);
  });

  it('moves to tomorrow when 20:00 has already passed, even exactly at 20:00', () => {
    expect(nextReminderAt(new Date(2026, 10, 7, 21, 0), false).getDate()).toBe(8);
    expect(nextReminderAt(new Date(2026, 10, 7, 20, 0), false).getDate()).toBe(8);
  });

  it('rolls over month and year ends', () => {
    const at = nextReminderAt(new Date(2026, 11, 31, 22, 0), false);
    expect([at.getFullYear(), at.getMonth(), at.getDate()]).toEqual([2027, 0, 1]);
  });

  it('writes a streak warning only when there is a streak', () => {
    expect(reminderCopy(4, 'tr').title).toContain('4 günlük');
    expect(reminderCopy(0, 'tr').title).not.toMatch(/\d/);
    expect(reminderCopy(2, 'en').title).toContain('2-day');
    expect(reminderCopy(0, 'en').body).toContain('6 clues');
  });
});
