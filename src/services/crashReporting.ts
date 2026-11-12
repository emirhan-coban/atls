import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let started = false;

/**
 * Crash reporting is off unless EXPO_PUBLIC_SENTRY_DSN is set and the build is not a dev build.
 * No PII is attached: no user id, no IP, no breadcrumbs from the UI or console.
 */
export function initCrashReporting(): void {
  if (started || !DSN || __DEV__) return;
  started = true;
  Sentry.init({
    dsn: DSN,
    sendDefaultPii: false,
    enableAutoSessionTracking: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeSend(event) {
      delete event.user;
      delete event.request;
      return event;
    },
  });
}

export function reportError(error: unknown, context?: string): void {
  if (!started) return;
  Sentry.captureException(error, context ? { tags: { context } } : undefined);
}
