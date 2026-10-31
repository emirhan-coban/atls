// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'web_prototype/*', 'public_docs/*'],
  },
  {
    files: ['**/__tests__/**', '**/*.test.*', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  {
    // The React Compiler rules flag the classic Animated/PanResponder ref patterns used by
    // SwipeDiscoveryCard, WorldMap, ConfettiCannon and SkeletonLoader. They are not bugs today;
    // they are tracked as warnings until those components move to Reanimated (see PLAN.md).
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Reanimated shared values are written through `.value` by design; the React Compiler
    // immutability rule reads that as mutating a hook result.
    files: ['src/globe/**/*.{ts,tsx}', 'src/components/HomeScreen.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
]);
