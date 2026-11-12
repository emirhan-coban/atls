/**
 * When it is fair to ask for an App Store rating. iOS itself shows the dialog at most three times a year,
 * so we also stay well under that and only ask right after something good (a game win, a new country).
 */
export const REVIEW_GAP_DAYS = 90;
export const REVIEW_MAX_ASKS = 3;

export interface ReviewState {
  lastAskedAt: number | null;
  asked: number;
}

export const NEVER_ASKED: ReviewState = { lastAskedAt: null, asked: 0 };

export function shouldAskForReview(state: ReviewState, now: number): boolean {
  if (state.asked >= REVIEW_MAX_ASKS) return false;
  if (state.lastAskedAt !== null && now - state.lastAskedAt < REVIEW_GAP_DAYS * 86400000) return false;
  return true;
}
