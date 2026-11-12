/// <reference types="jest" />
import { NEVER_ASKED, REVIEW_GAP_DAYS, REVIEW_MAX_ASKS, shouldAskForReview } from '../reviewPrompt';

const DAY = 86400000;

describe('review prompt rules', () => {
  const now = Date.UTC(2026, 10, 7);

  it('asks when it never asked before', () => {
    expect(shouldAskForReview(NEVER_ASKED, now)).toBe(true);
  });

  it('waits for the gap after an ask', () => {
    const recent = { lastAskedAt: now - (REVIEW_GAP_DAYS - 1) * DAY, asked: 1 };
    expect(shouldAskForReview(recent, now)).toBe(false);
    const old = { lastAskedAt: now - REVIEW_GAP_DAYS * DAY, asked: 1 };
    expect(shouldAskForReview(old, now)).toBe(true);
  });

  it('stops after the maximum number of asks', () => {
    expect(shouldAskForReview({ lastAskedAt: now - 1000 * DAY, asked: REVIEW_MAX_ASKS }, now)).toBe(false);
  });
});
