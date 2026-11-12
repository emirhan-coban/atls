jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Icons are irrelevant to behaviour tests and the package ships untranspiled ESM.
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_t, name) => (name === '__esModule' ? false : () => null) }));

// Crash reporting is off in tests.
jest.mock('@sentry/react-native', () => ({ init: jest.fn(), captureException: jest.fn() }));
