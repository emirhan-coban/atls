import { AppState, Platform } from 'react-native';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { useAppStore } from '../stores/useAppStore';
import { useCountryStore } from '../stores/useCountryStore';
import { useGameStore } from '../stores/useGameStore';
import { usePlanStore } from '../stores/usePlanStore';
import { useTripStore } from '../stores/useTripStore';
import { gameTimeline, passportProps, tripTimeline, WidgetLang } from '../widgets/widgetData';
import { reportError } from './crashReporting';

const flagOf = new Map(availableCatalog.map((c) => [c.id.toUpperCase(), c.flag]));

/** Computes what every widget shows right now and hands it to the native side. Cheap, so it is safe to call often. */
export function pushWidgets(widgets: typeof import('../widgets'), now: Date = new Date()): void {
  const lang: WidgetLang = useAppStore.getState().currentLang === 'en' ? 'en' : 'tr';
  const countries = useCountryStore.getState().countries;
  const { trips } = useTripStore.getState();
  const { plans } = usePlanStore.getState();
  const { days, stats } = useGameStore.getState();
  const visited = countries.filter((c) => c.status === 'visited' || c.status === 'lived');

  widgets.PassportWidget.updateSnapshot(passportProps(countries, trips.length, lang));
  widgets.GameWidget.updateTimeline(gameTimeline({ days, stats, lang, visitedCount: visited.length }, now));
  widgets.TripWidget.updateTimeline(
    tripTimeline(
      {
        plans,
        lang,
        place: (id) => ({ name: getLocalizedCountryName(id, lang), flag: flagOf.get(id.toUpperCase()) ?? '' }),
        wishlist: countries.filter((c) => c.status === 'want').map((c) => c.id),
      },
      now
    )
  );
}

/**
 * Starts keeping the widgets up to date: once now, when the app comes to the foreground, and shortly after any
 * store the widgets depend on changes. iOS only; returns a function that stops it.
 */
export function startWidgetSync(): () => void {
  if (Platform.OS !== 'ios') return () => {};

  let widgets: typeof import('../widgets');
  try {
    // loaded lazily: the native module is missing in builds made before the widget extension existed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    widgets = require('../widgets');
  } catch (error) {
    reportError(error, 'widgets-load');
    return () => {};
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  const push = () => {
    try {
      pushWidgets(widgets);
    } catch (error) {
      reportError(error, 'widgets-push');
    }
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 500);
  };

  push();
  const unsubscribes = [
    useAppStore.subscribe((s, prev) => s.currentLang !== prev.currentLang && schedule()),
    useCountryStore.subscribe((s, prev) => s.countries !== prev.countries && schedule()),
    useTripStore.subscribe((s, prev) => s.trips !== prev.trips && schedule()),
    usePlanStore.subscribe((s, prev) => s.plans !== prev.plans && schedule()),
    useGameStore.subscribe((s, prev) => (s.days !== prev.days || s.stats !== prev.stats) && schedule()),
  ];
  const appState = AppState.addEventListener('change', (state) => state === 'active' && schedule());

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribes.forEach((u) => u());
    appState.remove();
  };
}
