/// <reference types="jest" />
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockRequireOptional = jest.fn();
const mockRequestReview = jest.fn().mockResolvedValue(undefined);
const mockIsAvailable = jest.fn().mockResolvedValue(true);
const mockStoreReviewLoaded = jest.fn();

jest.mock('expo', () => ({ requireOptionalNativeModule: (name: string) => mockRequireOptional(name) }));
jest.mock('expo-store-review', () => {
  // counts how often the module is evaluated: with no native module it must never be loaded
  mockStoreReviewLoaded();
  return { isAvailableAsync: () => mockIsAvailable(), requestReview: () => mockRequestReview() };
});

import { maybeAskForReview } from '../reviewService';

const DAY = 86400000;

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockIsAvailable.mockResolvedValue(true);
});

describe('maybeAskForReview', () => {
  it('does nothing, and never loads expo-store-review, when the native module is missing', async () => {
    mockRequireOptional.mockReturnValue(null);
    expect(await maybeAskForReview()).toBe(false);
    expect(mockStoreReviewLoaded).not.toHaveBeenCalled();
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('asks once, records it, and then waits for the gap', async () => {
    mockRequireOptional.mockReturnValue({});
    const now = Date.UTC(2026, 10, 8);
    expect(await maybeAskForReview(now)).toBe(true);
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await AsyncStorage.getItem('@atls_review_prompt'))!)).toEqual({ lastAskedAt: now, asked: 1 });

    expect(await maybeAskForReview(now + 10 * DAY)).toBe(false);
    expect(await maybeAskForReview(now + 91 * DAY)).toBe(true);
    expect(mockRequestReview).toHaveBeenCalledTimes(2);
  });

  it('does not record an ask when the system cannot show the dialog', async () => {
    mockRequireOptional.mockReturnValue({});
    mockIsAvailable.mockResolvedValue(false);
    expect(await maybeAskForReview()).toBe(false);
    expect(await AsyncStorage.getItem('@atls_review_prompt')).toBeNull();
  });

  it('never throws', async () => {
    mockRequireOptional.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(maybeAskForReview()).resolves.toBe(false);
  });
});
