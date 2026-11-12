# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**atls.** — a React Native / Expo iOS app ("World Passport"): users mark countries as visited/lived/wishlist and see a passport-style profile, world map, and stats. Dark-theme, glassmorphism + gold-accent design. Turkish is the primary dev language in comments/docs/commits; UI supports TR/EN. Older screens still use inline `lang === 'tr' ?` checks plus `src/localization/translations.js`; new text goes through the catalog helper `src/localization/i18n.ts` (`createT`, see `game.ts`/`compare.ts`; `en` is the fallback language, `i18n.test.ts` checks every entry has both languages and matching placeholders).

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
- `App.tsx` (~20k chars) holds the real app shell: font loading, `ThemeProvider`, tab state, and every modal (`AddCountryModal`, `CountryDetailModal`, `CountryStatusModal`, `PassportShareModal`, `JourneyModal`, `PlannerModal`, etc.), wired directly to zustand stores.
- `src/app/_layout.tsx` is a bare `<Slot />`. Only a couple of real routes exist under `src/app/` (e.g. `country/[id].tsx`, a deep-link handler that sets store state and redirects back to `/`).
- New routes should be added under `src/app/` per Expo Router convention, but most real UI composition still happens inside `App.tsx` and the three main screens (`HomeScreen`, `ExploreScreen`, `PassportScreen` in `src/components/`), which are kept mounted simultaneously and toggled with `display: none` rather than unmounted.

### State: zustand stores (`src/stores/`)

Each store is a separate concern, re-exported from `src/stores/index.ts`:
- `useAppStore` — app-level UI state (active tab, modals open/closed, language, onboarding flag).
- `useCountryStore` — the core visited/lived/wishlist country records.
- `useProfileStore`, `useTripStore`, `usePlanStore`, `useProgressStore`, `useCelebrationStore`, `useGameStore`, `useCompareStore` — profile data, trips, trip planning, achievement progress, celebration/confetti triggers, the daily game, passport clash.
- Shared types live in `src/stores/types.ts` (e.g. `Country`).
- Stores persist through `src/services/storageService.ts` (AsyncStorage) and sync opportunistically to Supabase (`src/services/supabase.ts`) when configured — `isSupabaseConfigured` gates cloud sync, since the app can run fully offline/local.

### Data layer (`src/data/`)

Static catalogs (countries, continents, climate, trivia, destinations, travel guides, achievements, levels, world map path data) live as plain TS modules here. This is the content the UI renders against, not something fetched at runtime — e.g. `worldMapPaths.ts` backs the world map, `countryFacts.ts`/`countryTrivia.ts` back the country detail sheets.

### Home globe & map rendering

- **Home screen is a 3D globe** (`src/globe/`, composed in `HomeScreen.tsx`): `GlobeView.tsx` ray-traces an orthographic sphere in a single Skia SkSL fragment shader (`globeShader.ts`) driven by Reanimated shared values + gesture-handler. A country-ID texture map (`countryIndex.ts`, `useGlobeTextures.ts`) plus a status LUT (`statusLut.ts`) tints visited/lived/wishlist countries and selection on the GPU. `GlobeOverlay`, `HomeSheet` (bottom sheet with snap points) and `CountryPanel` sit on top; `globeMath.ts` holds the coordinate conventions and has the unit tests. The globe stops drawing when a full-screen modal covers it.
- **Flat maps** (`src/components/WorldMap.tsx`, SVG via `react-native-svg`, plus Skia rendering backed by `src/utils/mapShapes.ts` — `App.tsx` calls `warmMapShapes` only while onboarding is showing — and `mapView.ts`/`mapHelper.ts` for projection) still exist; `WorldMap` is currently imported only by `OnboardingScreen`.
- `d3-geo`/`topojson-client`/`world-atlas` (devDependencies) are build-time tools for generating map path data, not runtime deps.

### Engagement features

- **Daily "Secret Country"** (`src/game/dailyCountry.ts`, pure and tested; state in `useGameStore`, persisted to AsyncStorage; UI in `DailyGameModal`/`DailyGameCard`). The country is a hash of the local date over the pool of countries that have facts, climate and trivia, so every device agrees without a backend. Clue text must never contain the country's name (the test enforces it).
- **Journey story** (`JourneyStoryModal`, numbers from `utils/storyFacts.ts`): one 9:16 view whose elements animate in with Reanimated; sharing captures the finished frame as a PNG (there is no video export).
- **Rarity** (`utils/rarity.ts`, `services/rarityService.ts`, shown in `globe/CountryPanel.tsx`): reads the `country_visit_stats()` Supabase function, which returns nothing until 50 travelers exist, so the badge stays hidden offline or early on. The SQL must be applied from `supabase/schema.sql` §12.
- **Passport clash** (`utils/compareCode.ts`, `CompareModal`, `app/compare.tsx`): visited countries are encoded as a bitset over the id-sorted catalog (versioned prefix). Changing the catalog requires a new version prefix. The shared link is an https invite page (`public_docs/c/index.html`, `INVITE_URL` in `utils/links.ts`) that opens the app through a universal link (`associatedDomains` in `app.json`, `src/app/+native-intent.tsx` rewrites `/atls/c` to `/compare`) or offers the App Store. The AASA file must be served from the domain root, so it lives in the GitHub user-site repo `emirhan-coban/emirhan-coban.github.io`; its source is `scripts/user-site/` (published; `scripts/user-site/publish.sh` only adds the AASA files and never overwrites the repo's existing `index.html`). The modal also accepts a pasted message or code, and old `atls://compare` links still work.

### Growth hooks

Shared text carries `APP_STORE_URL` (`utils/links.ts`); the journey story PNG carries a "Free on the App Store" line because an image cannot hold a link. `services/reviewService.ts` asks for an App Store rating only after a Secret Country win or the third marked country (`utils/reviewPrompt.ts` keeps it to 3 asks, 90 days apart). The optional 20:00 Secret Country reminder (`services/gameReminder.ts`, `utils/gameReminder.ts`) is a single one-off notification rebuilt on app start, on foreground and after each game; tapping it opens the game (`useLastNotificationResponse` in `App.tsx`).


### Crash reporting & OTA

- `src/services/crashReporting.ts` wraps Sentry and is a no-op unless `EXPO_PUBLIC_SENTRY_DSN` is set and the build is not `__DEV__`; no PII, no breadcrumbs. `ErrorBoundary` reports through it. Turning the DSN on requires updating the privacy page (`public_docs/index.html` says "no analytics") and the App Store privacy label (crash data). Source-map upload is disabled in `eas.json` (`SENTRY_DISABLE_AUTO_UPLOAD`).
- `expo-updates` is configured (`runtimeVersion` policy `appVersion`, channels `preview`/`production`). JS-only fixes ship with `eas update --channel production`; anything touching native modules or `app.json` needs a new build. `runtimeVersion` follows `version`, so two binaries with the same version but different native modules share one OTA stream: while 1.3.0 is unreleased, do **not** run `eas update` on the production channel until the build that contains expo-image, expo-document-picker and the widget extension is the only 1.3.0 binary in circulation (older TestFlight builds of 1.3.0 lack those modules). Bump `version` for the next native change after release.
- `store/` (App Store screenshots, listing text) and `scripts/store-shots/` were removed from the repo on purpose; they live in git history only.

### Launch / splash

`App.tsx` calls `SplashScreen.preventAutoHideAsync()` at module load and hides the native splash only once `appReady` (fonts, stores, map shapes) is true, with an 8 s failsafe. There is no JS skeleton boot screen; don't reintroduce one.

### Widgets (`src/widgets/`, `expo-widgets`)

Three iOS widgets: `PassportWidget` (small, medium), `GameWidget` (small plus lock screen circular, rectangular, inline) and `TripWidget` (small, medium). They run in an isolated runtime: no hooks, state, async or imports, and constants must live inside the `'widget'` function; Babel turns that function into source text the widget extension evaluates, with the SwiftUI components and modifiers as globals. So the widget files only draw props. **All logic is in `widgetData.ts`** (pure, tested): texts in the app language, state selection, and a timeline (7 days for the game incl. an 18:00 "streak at risk" entry, 30 days for the trip countdown) so widgets stay truthful without the app opening. `services/widgetSync.ts` pushes props on start, on foreground and (debounced) on store changes, iOS only, lazily requiring the widgets so an older binary without the native module does not crash. Taps open `atls://game` (`src/app/game.tsx`) and `atls://planner` (`src/app/planner.tsx`, flag `isPlannerOpen` in `useAppStore`) through the `widgetURL` modifier. `layouts.test.ts` evaluates each layout against stand-in globals. Fonts: the widget uses the system serif, not Instrument Serif. The App Group is `group.com.atlas.passport` and the extension target is `com.atlas.passport.ExpoWidgetsTarget` (both need to exist in the Apple developer account; EAS creates them on the first build).

### Big screens

`OnboardingScreen`, `AuthScreen`, `PassportScreen` and `HomeScreen` keep their `useStyles` in a sibling `<Name>.styles.ts`. They are still single large components with shared state; split further by extracting render sections that take props, not by moving state.

### Backup

`utils/exportData.ts` writes the JSON/CSV export; `utils/importData.ts` (pure, tested) reads a JSON export back and `utils/importFiles.ts` runs the picker. Import only adds countries and trips missing on the phone and never overwrites; photos are not part of the backup.

### Theming (`src/theme/`)

Token-based: `colors.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`, `passportThemes.ts` (per-passport-cover color themes), wired through `ThemeContext.tsx` (`ThemeProvider`, `makeStyles` hook factory used across components for themed `StyleSheet`s). Not all components consume tokens consistently yet — some still hardcode `rgba(...)`/hex values (see `PLAN.md` §3.1).

### Auth & backend

`src/services/authService.ts` handles Apple/Google/email+OTP sign-in; `src/services/supabase.ts` creates the Supabase client (or `null` if env vars aren't configured, enabling local-only mode). Schema lives in `supabase/schema.sql`. Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`); `EXPO_PUBLIC_DEMO_MODE=1` silences on-screen warning banners for screen recordings/demos only.

### Known lint carve-outs

`eslint.config.js` downgrades `react-hooks/refs`, `react-hooks/purity`, and `react-hooks/set-state-in-effect` to warnings (the components that still use them are `WorldMap` and `ConfettiCannon`) — these use classic `Animated`/`PanResponder` patterns pending a Reanimated migration (tracked in `PLAN.md`), not accidental violations.

### Tests

Jest (`jest-expo` preset) with `jest.setup.js` mocking AsyncStorage. Test files sit in `__tests__/` directories next to the code they cover, across `src/data`, `src/services`, `src/stores`, `src/theme`, `src/utils`, `src/game`, `src/localization`, `src/components`. Component tests use `@testing-library/react-native` v14, whose `render` and `fireEvent` are async (`await` them); `jest.setup.js` stubs `lucide-react-native` and `@sentry/react-native`. `ios/` is excluded from the test path.
