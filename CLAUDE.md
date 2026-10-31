# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**atls.** — a React Native / Expo iOS app ("World Passport"): users mark countries as visited/lived/wishlist and see a passport-style profile, world map, and stats. Dark-theme, glassmorphism + gold-accent design. Turkish is the primary dev language in comments/docs/commits; UI supports TR/EN via inline `lang === 'tr' ?` checks (not i18n keys) plus `src/localization/translations.js`.

See `AGENTS.md` for Expo-specific rules (docs lookup, CNG, EAS commands) — read it too. `PLAN.md` is a (Turkish) audit of known issues/tech debt; treat it as background, not as current ground truth — verify against the code before relying on anything in it.

## Commands

```bash
npx expo start               # dev server (Expo Go / dev client)
npx expo run:ios              # build & run in iOS simulator
npx expo run:android          # build & run on Android
npx tsc --noEmit               # typecheck (also: npm run typecheck)
npx expo lint                  # lint (also: npm run lint)
npx jest                       # run all tests
npx jest path/to/file.test.ts  # run a single test file
npx jest -t "test name"        # run tests matching a name
```

Run lint and typecheck before declaring any task done. Use `npx expo install <pkg>` instead of npm/yarn to add dependencies (resolves SDK-compatible versions).

## Architecture

### Entry point is `App.tsx`, not `src/app/`

Despite using Expo Router for routing, the app is still structurally a single-screen app:
- `src/app/index.tsx` just re-exports root `App.tsx`.
- `App.tsx` (~17k chars) holds the real app shell: font loading, `ThemeProvider`, tab state, and every modal (`AddCountryModal`, `CountryDetailModal`, `CountryStatusModal`, `PassportShareModal`, `JourneyModal`, `PlannerModal`, etc.), wired directly to zustand stores.
- `src/app/_layout.tsx` is a bare `<Slot />`. Only a couple of real routes exist under `src/app/` (e.g. `country/[id].tsx`, a deep-link handler that sets store state and redirects back to `/`).
- New routes should be added under `src/app/` per Expo Router convention, but most real UI composition still happens inside `App.tsx` and the three main screens (`HomeScreen`, `ExploreScreen`, `PassportScreen` in `src/components/`), which are kept mounted simultaneously and toggled with `display: none` rather than unmounted.

### State: zustand stores (`src/stores/`)

Each store is a separate concern, re-exported from `src/stores/index.ts`:
- `useAppStore` — app-level UI state (active tab, modals open/closed, language, onboarding flag).
- `useCountryStore` — the core visited/lived/wishlist country records.
- `useProfileStore`, `useTripStore`, `usePlanStore`, `useProgressStore`, `useCelebrationStore` — profile data, trips, trip planning, achievement progress, celebration/confetti triggers.
- Shared types live in `src/stores/types.ts` (e.g. `Country`).
- Stores persist through `src/services/storageService.ts` (AsyncStorage) and sync opportunistically to Supabase (`src/services/supabase.ts`) when configured — `isSupabaseConfigured` gates cloud sync, since the app can run fully offline/local.

### Data layer (`src/data/`)

Static catalogs (countries, continents, climate, trivia, destinations, travel guides, achievements, levels, world map path data) live as plain TS modules here. This is the content the UI renders against, not something fetched at runtime — e.g. `worldMapPaths.ts` backs the world map, `countryFacts.ts`/`countryTrivia.ts` back the country detail sheets.

### Map rendering

Two map implementations coexist:
- `src/components/WorldMap.tsx` — SVG-based map (`react-native-svg`), the original/legacy view.
- Skia-based rendering, backed by `src/utils/mapShapes.ts` (`warmMapShapes`, called once at startup in `App.tsx` to pre-process shapes and show a loading state) and `src/utils/mapView.ts`/`src/utils/mapHelper.ts` for geo projection. `d3-geo`/`topojson-client`/`world-atlas` (devDependencies) are build-time tools for generating map path data, not runtime deps.

### Theming (`src/theme/`)

Token-based: `colors.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`, `passportThemes.ts` (per-passport-cover color themes), wired through `ThemeContext.tsx` (`ThemeProvider`, `makeStyles` hook factory used across components for themed `StyleSheet`s). Not all components consume tokens consistently yet — some still hardcode `rgba(...)`/hex values (see `PLAN.md` §3.1).

### Auth & backend

`src/services/authService.ts` handles Apple/Google/email+OTP sign-in; `src/services/supabase.ts` creates the Supabase client (or `null` if env vars aren't configured, enabling local-only mode). Schema lives in `supabase/schema.sql`. Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`); `EXPO_PUBLIC_DEMO_MODE=1` silences on-screen warning banners for screen recordings/demos only.

### Known lint carve-outs

`eslint.config.js` downgrades `react-hooks/refs`, `react-hooks/purity`, and `react-hooks/set-state-in-effect` to warnings for `SwipeDiscoveryCard`, `WorldMap`, `ConfettiCannon`, and `SkeletonLoader` — these use classic `Animated`/`PanResponder` patterns pending a Reanimated migration (tracked in `PLAN.md`), not accidental violations.

### Tests

Jest (`jest-expo` preset) with `jest.setup.js` mocking AsyncStorage. Test files sit in `__tests__/` directories next to the code they cover, across `src/data`, `src/services`, `src/stores`, `src/theme`, `src/utils`. `web_prototype/` and `ios/` are excluded from the test path.
