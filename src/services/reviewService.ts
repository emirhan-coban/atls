import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireOptionalNativeModule } from 'expo';
import { NEVER_ASKED, ReviewState, shouldAskForReview } from '../utils/reviewPrompt';

const KEY = '@atls_review_prompt';

/**
 * Shows the system rating dialog if the rules allow it. Call only right after something good happened. Never throws.
 *
 * The native module is looked up first: importing expo-store-review when the binary does not contain it (an older dev client)
 * makes Metro report a fatal error even inside try/catch, so the import only happens once the module is known to exist.
 */
export async function maybeAskForReview(now = Date.now()): Promise<boolean> {
  try {
    if (!requireOptionalNativeModule('ExpoStoreReview')) return false;
    const raw = await AsyncStorage.getItem(KEY);
    const state: ReviewState = raw ? { ...NEVER_ASKED, ...JSON.parse(raw) } : NEVER_ASKED;
    if (!shouldAskForReview(state, now)) return false;
    const StoreReview = await import('expo-store-review');
    if (!(await StoreReview.isAvailableAsync())) return false;
    // recorded first: if the dialog crashes or is suppressed by iOS we still do not ask again on the next win
    await AsyncStorage.setItem(KEY, JSON.stringify({ lastAskedAt: now, asked: state.asked + 1 }));
    await StoreReview.requestReview();
    return true;
  } catch {
    return false;
  }
}
