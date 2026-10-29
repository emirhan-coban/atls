import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { availableCatalog } from '../data/travelData';

const KEYS = {
  LANG: '@atls_lang',
  THEME: '@atls_theme',
  ONBOARDING: '@atls_onboarding_completed',
  AUTH: '@atls_is_authenticated',
  PROFILE: '@atls_profile',
  COUNTRIES: '@atls_countries',
  TRIPS: '@atls_trips',
  TRIPS_SEEDED: '@atls_trips_seeded',
  PROGRESS: '@atls_progress',
  PLANS: '@atls_plans',
  OUTBOX: '@atls_outbox',
  SYNCED_USER: '@atls_synced_user',
};

export function enrichCountry(c) {
  if (!c || !c.id) return c;
  const cat = availableCatalog.find((item) => item.id.toUpperCase() === c.id.toUpperCase());
  return {
    ...c,
    name: cat ? cat.name : (c.name || ''),
    nameTr: cat ? cat.nameTr : (c.nameTr || c.name || ''),
    continent: cat ? cat.continent : (c.continent || ''),
    continentTr: cat ? cat.continentTr : (c.continentTr || c.continent || ''),
    flag: cat ? cat.flag : (c.flag || '🌍'),
    year: c.year || c.visitedYear || (c.status === 'want' ? null : new Date().getFullYear().toString()),
    visitedYear: c.visitedYear || c.year || (c.status === 'want' ? null : new Date().getFullYear().toString()),
    month: c.month || c.visitedMonth || null,
    visitedMonth: c.visitedMonth || c.month || null,
  };
}

// Generates a unique passport number, e.g. AT-492810-X
export function generatePassportNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `AT-${digits}-X`;
}

// Transliterates Turkish and other non-ASCII characters to standard ASCII characters
export function slugifyUsername(name) {
  if (!name) return 'traveler';
  const charMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'i': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  let converted = name;
  for (const [key, value] of Object.entries(charMap)) {
    converted = converted.replaceAll(key, value);
  }

  // Normalize any other accents (é -> e, etc.)
  converted = converted
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const clean = converted.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean || 'traveler';
}

export function generateHandle(name) {
  return `@${slugifyUsername(name)}`;
}

// Builds a new profile from user input
export function buildNewProfile({ name = 'Traveler', email = '', location = 'Global Citizen', locationTr = 'Dünya Vatandaşı' } = {}) {
  const cleanName = name.trim() || 'Traveler';
  const handle = generateHandle(cleanName);
  const initials = cleanName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TR';

  return {
    name: cleanName,
    handle,
    email,
    avatarInitials: initials,
    location,
    locationTr,
    nationality: 'Global Citizen',
    passportNo: generatePassportNumber(),
    issueDate: new Date().getFullYear().toString(),
    expiryDate: 'LIFETIME',
    bio: 'Exploring the world one border at a time.',
  };
}

// ---------------------------------------------------------------------------
// Local-first sync helpers
//
// The device is the source of truth. Every change is written to AsyncStorage
// first, then queued in an outbox that is flushed to Supabase whenever a
// session exists. A failed or offline request never touches local data.
// ---------------------------------------------------------------------------

const DEFAULT_LOCATION_PATTERN = /lisbon|lizbon/i;

// Serialises read-modify-write cycles on AsyncStorage so rapid calls
// (e.g. onboarding adding several countries at once) cannot overwrite each other.
let localChain = Promise.resolve();
function serial(task) {
  const run = localChain.then(task, task);
  localChain = run.catch(() => {});
  return run;
}

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Columns added after the first schema release. If the database has not been
// migrated yet, requests that include them are retried without them.
const EXTRA_COUNTRY_COLUMNS = ['name_tr', 'continent_tr', 'visited_month', 'photos'];
const EXTRA_PROFILE_COLUMNS = ['passport_theme', 'home_country_id', 'home_city', 'custom_location'];

function isMissingColumnError(error) {
  return Boolean(error) && (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    /column .* (does not exist|of relation)|could not find the .* column/i.test(error.message || '')
  );
}

async function upsertWithFallback(table, row, extraColumns, options) {
  let { error } = await supabase.from(table).upsert(row, options);
  if (error && isMissingColumnError(error)) {
    const slim = { ...row };
    extraColumns.forEach((col) => delete slim[col]);
    ({ error } = await supabase.from(table).upsert(slim, options));
  }
  return { error };
}

export function countryToRow(userId, country) {
  return {
    user_id: userId,
    country_id: country.id,
    name: country.name,
    name_tr: country.nameTr || null,
    flag: country.flag,
    continent: country.continent,
    continent_tr: country.continentTr || null,
    status: country.status,
    visited_year: country.visitedYear || country.year || new Date().getFullYear().toString(),
    visited_month: country.visitedMonth || country.month || null,
    notes: country.notes || '',
    photos: Array.isArray(country.photos) ? country.photos : [],
  };
}

export function rowToCountry(row) {
  return enrichCountry({
    id: row.country_id,
    name: row.name,
    nameTr: row.name_tr || undefined,
    flag: row.flag,
    continent: row.continent,
    continentTr: row.continent_tr || undefined,
    status: row.status,
    visitedYear: row.visited_year,
    year: row.visited_year,
    visitedMonth: row.visited_month || null,
    month: row.visited_month || null,
    notes: row.notes,
    photos: Array.isArray(row.photos) ? row.photos : [],
  });
}

export function tripToRow(userId, trip) {
  return {
    user_id: userId,
    id: trip.id,
    country_id: trip.countryId,
    year: trip.year,
    month: trip.month || null,
    days: trip.days || null,
    cities: Array.isArray(trip.cities) ? trip.cities : [],
    type: trip.type || 'leisure',
    rating: trip.rating || null,
    notes: trip.notes || '',
    created_at: trip.createdAt,
    updated_at: trip.updatedAt,
  };
}

export function rowToTrip(row) {
  return {
    id: row.id,
    countryId: row.country_id,
    year: row.year,
    month: row.month || null,
    days: row.days || null,
    cities: Array.isArray(row.cities) ? row.cities : [],
    type: row.type || 'leisure',
    rating: row.rating || null,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Last write wins per trip, using updatedAt. Returns the merged list plus the local trips that are
// newer than (or missing from) the cloud, which still need to be uploaded.
export function mergeTrips(localTrips, cloudTrips, { keepLocalOnly, pendingKeys }) {
  const cloudById = new Map(cloudTrips.map((t) => [t.id, t]));
  const merged = new Map(cloudById);
  const toUpload = [];
  for (const local of localTrips) {
    const cloud = cloudById.get(local.id);
    const pending = pendingKeys.has(`trip:${local.id}`);
    if (!cloud) {
      if (keepLocalOnly || pending) {
        merged.set(local.id, local);
        toUpload.push(local);
      }
    } else if ((local.updatedAt || '') > (cloud.updatedAt || '')) {
      merged.set(local.id, local);
      toUpload.push(local);
    } else if (local.photos && local.photos.length > 0) {
      // Photos stay on the device, so the cloud version never has them: keep them on the winning copy
      merged.set(local.id, { ...cloud, photos: local.photos });
    }
  }
  return { trips: [...merged.values()], toUpload };
}

function sanitizeProfile(profile) {
  if (!profile) return profile;
  const next = { ...profile };
  if (typeof next.location === 'string' && DEFAULT_LOCATION_PATTERN.test(next.location)) {
    next.location = 'Global Citizen';
  }
  if (typeof next.locationTr === 'string' && DEFAULT_LOCATION_PATTERN.test(next.locationTr)) {
    next.locationTr = 'Dünya Vatandaşı';
  }
  if (typeof next.customLocation === 'string' && DEFAULT_LOCATION_PATTERN.test(next.customLocation)) {
    next.customLocation = null;
  }
  return next;
}

export function profileToRow(userId, profile) {
  return {
    id: userId,
    name: profile.name,
    handle: profile.handle,
    email: profile.email,
    avatar_initials: profile.avatarInitials,
    avatar_url: profile.avatarUrl || null,
    location: profile.location,
    location_tr: profile.locationTr,
    nationality: profile.nationality,
    passport_no: profile.passportNo,
    bio: profile.bio,
    passport_theme: profile.passportTheme || null,
    home_country_id: profile.homeCountryId || null,
    home_city: profile.homeCity || null,
    custom_location: profile.customLocation || null,
    updated_at: new Date().toISOString(),
  };
}

// Cloud fields win, but anything the cloud does not know about (older schema)
// is kept from the local copy so it is never silently dropped.
export function rowToProfile(row, localProfile) {
  const local = localProfile || {};
  const pick = (column, localValue) => (column in row ? row[column] : localValue);
  return sanitizeProfile({
    ...local,
    name: row.name ?? local.name,
    handle: row.handle ?? local.handle,
    avatarInitials: row.avatar_initials ?? local.avatarInitials,
    avatarUrl: row.avatar_url ?? local.avatarUrl,
    email: row.email ?? local.email,
    location: row.location ?? local.location,
    locationTr: row.location_tr ?? local.locationTr,
    nationality: row.nationality ?? local.nationality,
    passportNo: row.passport_no ?? local.passportNo,
    issueDate: row.issue_date ?? local.issueDate,
    expiryDate: row.expiry_date ?? local.expiryDate,
    bio: row.bio ?? local.bio,
    passportTheme: pick('passport_theme', local.passportTheme) || local.passportTheme,
    homeCountryId: pick('home_country_id', local.homeCountryId) || undefined,
    homeCity: pick('home_city', local.homeCity) || undefined,
    customLocation: pick('custom_location', local.customLocation ?? null),
  });
}

async function getSessionUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  } catch {
    return null;
  }
}

// --- Outbox: pending cloud writes, one entry per entity (latest wins) -------

async function enqueue(op) {
  await serial(async () => {
    const outbox = await readJson(KEYS.OUTBOX, {});
    outbox[op.key] = { ...op, ts: Date.now() + Math.random() };
    await AsyncStorage.setItem(KEYS.OUTBOX, JSON.stringify(outbox));
  });
}

async function applyOp(userId, op) {
  if (op.kind === 'country-upsert') {
    const { error } = await upsertWithFallback(
      'user_countries',
      countryToRow(userId, op.country),
      EXTRA_COUNTRY_COLUMNS,
      { onConflict: 'user_id,country_id' }
    );
    return !error;
  }
  if (op.kind === 'country-remove') {
    const { error } = await supabase
      .from('user_countries')
      .delete()
      .match({ user_id: userId, country_id: op.countryId });
    return !error;
  }
  if (op.kind === 'trip-upsert') {
    const { error } = await supabase
      .from('trips')
      .upsert(tripToRow(userId, op.trip), { onConflict: 'user_id,id' });
    return !error;
  }
  if (op.kind === 'trip-remove') {
    const { error } = await supabase.from('trips').delete().match({ user_id: userId, id: op.tripId });
    return !error;
  }
  if (op.kind === 'profile-upsert') {
    const { error } = await upsertWithFallback(
      'profiles',
      profileToRow(userId, op.profile),
      EXTRA_PROFILE_COLUMNS
    );
    return !error;
  }
  return true;
}

let flushing = false;
let flushAgain = false;

async function flushOutbox() {
  if (flushing) {
    flushAgain = true;
    return;
  }
  const user = await getSessionUser();
  if (!user) return;

  flushing = true;
  try {
    do {
      flushAgain = false;
      const snapshot = await readJson(KEYS.OUTBOX, {});
      const ops = Object.values(snapshot).sort((a, b) => a.ts - b.ts);
      let consecutiveFailures = 0;
      for (const op of ops) {
        let ok = false;
        try {
          ok = await applyOp(user.id, op);
        } catch (err) {
          console.warn('[storageService] outbox op failed:', err?.message);
        }
        if (!ok) {
          // Every entry is independent (one per country / trip / profile), so a failing entry,
          // e.g. a table that is not migrated yet, must not block the others. Stop early when
          // several fail in a row: that means the network is down.
          consecutiveFailures += 1;
          if (consecutiveFailures >= 3) break;
          continue;
        }
        consecutiveFailures = 0;
        await serial(async () => {
          const current = await readJson(KEYS.OUTBOX, {});
          if (current[op.key] && current[op.key].ts === op.ts) {
            delete current[op.key];
            await AsyncStorage.setItem(KEYS.OUTBOX, JSON.stringify(current));
          }
        });
      }
    } while (flushAgain);
  } finally {
    flushing = false;
  }
}

// Pulls cloud state for a signed-in user without ever deleting local data on failure.
// Returns null when the cloud could not be reached, so callers fall back to local data.
async function pullCloudState(user, localCountries, localProfile, localTrips = []) {
  await flushOutbox();

  const [profileRes, countriesRes, tripsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_countries').select('*').eq('user_id', user.id),
    supabase.from('trips').select('*').eq('user_id', user.id),
  ]);
  if (profileRes.error || countriesRes.error) return null;
  const pendingKeys = new Set(Object.keys(await readJson(KEYS.OUTBOX, {})));

  const cloudCountries = (countriesRes.data || []).map(rowToCountry);
  const syncedUser = await AsyncStorage.getItem(KEYS.SYNCED_USER);
  let countries = cloudCountries;

  // Changes that could not be uploaded yet are still the newest truth for that country.
  const cloudCountryIds = new Set(cloudCountries.map((c) => c.id));
  const stillPending = (localCountries || []).filter(
    (c) => c && c.id && !cloudCountryIds.has(c.id) && pendingKeys.has(`country:${c.id}`)
  );
  if (stillPending.length > 0) countries = [...stillPending, ...cloudCountries];

  // First sync of this account on this device: keep countries created offline or as a guest.
  if (syncedUser !== user.id) {
    const cloudIds = new Set(cloudCountries.map((c) => c.id));
    const localOnly = (localCountries || []).filter((c) => c && c.id && !cloudIds.has(c.id));
    if (localOnly.length > 0) {
      for (const country of localOnly) {
        await enqueue({ key: `country:${country.id}`, kind: 'country-upsert', country });
      }
      countries = [...localOnly, ...cloudCountries];
      flushOutbox().catch(() => {});
    }
    await AsyncStorage.setItem(KEYS.SYNCED_USER, user.id);
  }

  // Trips: the table may not exist yet (database not migrated), in which case local trips are kept as-is.
  let trips = localTrips;
  if (!tripsRes.error) {
    const merged = mergeTrips(localTrips, (tripsRes.data || []).map(rowToTrip), {
      keepLocalOnly: syncedUser !== user.id,
      pendingKeys,
    });
    trips = merged.trips;
    for (const trip of merged.toUpload) {
      await enqueue({ key: `trip:${trip.id}`, kind: 'trip-upsert', trip });
    }
    if (merged.toUpload.length > 0) flushOutbox().catch(() => {});
  }
  await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));

  const baseProfile = profileRes.data ? rowToProfile(profileRes.data, localProfile) : localProfile;
  const profile = baseProfile ? { ...baseProfile, isGuest: false } : baseProfile;
  await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(countries));
  if (profile) await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  return { profile, countries, trips };
}

export const storageService = {
  // Load full app state: local first, refreshed from the cloud when a session exists.
  async loadInitialData(fallbackProfile, fallbackCountries) {
    try {
      const [storedLang, storedOnboarding, storedAuth, storedProfile, storedCountries, storedTheme, storedTrips, storedSeeded, storedProgress, storedPlans] = await Promise.all([
        AsyncStorage.getItem(KEYS.LANG),
        AsyncStorage.getItem(KEYS.ONBOARDING),
        AsyncStorage.getItem(KEYS.AUTH),
        readJson(KEYS.PROFILE, null),
        readJson(KEYS.COUNTRIES, null),
        AsyncStorage.getItem(KEYS.THEME),
        readJson(KEYS.TRIPS, []),
        readJson(KEYS.TRIPS_SEEDED, []),
        readJson(KEYS.PROGRESS, null),
        readJson(KEYS.PLANS, []),
      ]);

      const lang = storedLang || 'tr';
      const theme = ['system', 'light', 'dark'].includes(storedTheme) ? storedTheme : 'system';
      const hasCompletedOnboarding = storedOnboarding === 'true';
      const localProfile = sanitizeProfile(storedProfile || fallbackProfile);
      if (localProfile && localProfile.name && (!localProfile.handle || localProfile.handle === `@${localProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`)) {
        localProfile.handle = generateHandle(localProfile.name);
      }
      const localCountries = (storedCountries || fallbackCountries || []).map(enrichCountry);

      const user = await getSessionUser();
      if (user) {
        try {
          const cloud = await pullCloudState(user, localCountries, localProfile, storedTrips || []);
          if (cloud) {
            return {
              lang,
              theme,
              hasCompletedOnboarding,
              isAuthenticated: true,
              profile: cloud.profile,
              countries: cloud.countries,
              trips: cloud.trips,
              tripsSeeded: storedSeeded || [],
              progress: storedProgress,
              plans: storedPlans || [],
            };
          }
        } catch (err) {
          console.warn('[storageService] cloud refresh failed, using local data:', err?.message);
        }
        // Signed in but offline: keep working from the local copy.
        return { lang, theme, hasCompletedOnboarding, isAuthenticated: true, profile: localProfile, countries: localCountries, trips: storedTrips || [], tripsSeeded: storedSeeded || [], progress: storedProgress, plans: storedPlans || [] };
      }

      return {
        lang,
        theme,
        hasCompletedOnboarding,
        isAuthenticated: storedAuth === 'true',
        profile: localProfile,
        countries: localCountries,
        trips: storedTrips || [],
        tripsSeeded: storedSeeded || [],
        progress: storedProgress,
        plans: storedPlans || [],
      };
    } catch (err) {
      console.warn('[storageService] Failed to load initial data:', err);
      return {
        lang: 'tr',
        hasCompletedOnboarding: false,
        isAuthenticated: false,
        profile: fallbackProfile,
        countries: fallbackCountries,
      };
    }
  },

  async saveLang(lang) {
    try {
      await AsyncStorage.setItem(KEYS.LANG, lang);
    } catch (err) {
      console.warn('[storageService] Failed to save lang:', err);
    }
  },

  async saveTheme(theme) {
    try {
      await AsyncStorage.setItem(KEYS.THEME, theme);
    } catch (err) {
      console.warn('[storageService] Failed to save theme:', err);
    }
  },

  async saveOnboarding(completed) {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING, completed ? 'true' : 'false');
    } catch (err) {
      console.warn('[storageService] Failed to save onboarding:', err);
    }
  },

  async saveAuth(isAuthenticated) {
    try {
      await AsyncStorage.setItem(KEYS.AUTH, isAuthenticated ? 'true' : 'false');
    } catch (err) {
      console.warn('[storageService] Failed to save auth state:', err);
    }
  },

  // Signs out and wipes this device's copy of the user's data.
  async clearAuth() {
    try {
      await AsyncStorage.multiRemove([KEYS.AUTH, KEYS.PROFILE, KEYS.COUNTRIES, KEYS.TRIPS, KEYS.TRIPS_SEEDED, KEYS.PROGRESS, KEYS.PLANS, KEYS.OUTBOX, KEYS.SYNCED_USER]);
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log('[storageService] Failed to clear auth state:', err);
    }
  },

  // Called right after a login: returns cloud data merged with anything created before signing in.
  async loadUserSessionData(fallbackUserData) {
    const user = await getSessionUser();
    if (!user) return null;
    try {
      const [localProfile, localCountries, localTrips] = await Promise.all([
        readJson(KEYS.PROFILE, null),
        readJson(KEYS.COUNTRIES, []),
        readJson(KEYS.TRIPS, []),
      ]);
      const seedProfile = { ...(localProfile || {}), ...(fallbackUserData || {}) };
      const cloud = await pullCloudState(user, localCountries, seedProfile, localTrips);
      if (cloud) return cloud;
    } catch (err) {
      console.log('[storageService] loadUserSessionData notice:', err?.message);
    }
    return null;
  },

  async flushOutbox() {
    try {
      await flushOutbox();
    } catch (err) {
      console.warn('[storageService] flushOutbox notice:', err?.message);
    }
  },

  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
      await enqueue({ key: 'profile', kind: 'profile-upsert', profile });
      await flushOutbox();
    } catch (err) {
      console.warn('[storageService] Failed to save profile:', err);
    }
  },

  async saveCountries(countries) {
    try {
      await serial(() => AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(countries)));
    } catch (err) {
      console.warn('[storageService] Failed to save countries:', err);
    }
  },

  async addCountry(rawCountry) {
    try {
      const country = enrichCountry(rawCountry);
      const updated = await serial(async () => {
        const current = await readJson(KEYS.COUNTRIES, []);
        const next = [country, ...current.filter((c) => c.id !== country.id)];
        await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(next));
        return next;
      });
      await enqueue({ key: `country:${country.id}`, kind: 'country-upsert', country });
      await flushOutbox();
      return updated;
    } catch (err) {
      console.warn('[storageService] Failed to add country:', err);
      return null;
    }
  },

  async updateCountry(rawCountry) {
    return this.addCountry(rawCountry);
  },

  async removeCountry(countryId) {
    try {
      const updated = await serial(async () => {
        const current = await readJson(KEYS.COUNTRIES, []);
        const next = current.filter((c) => c.id !== countryId);
        await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(next));
        return next;
      });
      await enqueue({ key: `country:${countryId}`, kind: 'country-remove', countryId });
      await flushOutbox();
      return updated;
    } catch (err) {
      console.warn('[storageService] Failed to remove country:', err);
      return null;
    }
  },

  async savePlans(plans) {
    try {
      await AsyncStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
    } catch (err) {
      console.warn('[storageService] Failed to save plans:', err);
    }
  },

  async saveProgress(progress) {
    try {
      await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    } catch (err) {
      console.warn('[storageService] Failed to save progress:', err);
    }
  },

  async saveTripsSeeded(ids) {
    try {
      await AsyncStorage.setItem(KEYS.TRIPS_SEEDED, JSON.stringify(ids));
    } catch (err) {
      console.warn('[storageService] Failed to save seeded trips:', err);
    }
  },

  async saveTrip(trip) {
    try {
      await serial(async () => {
        const current = await readJson(KEYS.TRIPS, []);
        const next = [trip, ...current.filter((t) => t.id !== trip.id)];
        await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(next));
      });
      await enqueue({ key: `trip:${trip.id}`, kind: 'trip-upsert', trip });
      await flushOutbox();
    } catch (err) {
      console.warn('[storageService] Failed to save trip:', err);
    }
  },

  async removeTrip(tripId) {
    try {
      await serial(async () => {
        const current = await readJson(KEYS.TRIPS, []);
        await AsyncStorage.setItem(KEYS.TRIPS, JSON.stringify(current.filter((t) => t.id !== tripId)));
      });
      await enqueue({ key: `trip:${tripId}`, kind: 'trip-remove', tripId });
      await flushOutbox();
    } catch (err) {
      console.warn('[storageService] Failed to remove trip:', err);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.LANG,
        KEYS.ONBOARDING,
        KEYS.PROFILE,
        KEYS.COUNTRIES,
        KEYS.TRIPS,
        KEYS.TRIPS_SEEDED,
        KEYS.PROGRESS,
        KEYS.PLANS,
        KEYS.OUTBOX,
        KEYS.SYNCED_USER,
      ]);
    } catch (err) {
      console.warn('[storageService] Failed to clear storage:', err);
    }
  },

  // Permanently deletes the account (auth user, profile, countries) and local data.
  // Needs the `delete_my_account` function from supabase/schema.sql. Throws when the
  // cloud account could not be deleted so the caller can tell the user instead of
  // pretending it worked.
  async deleteAccount() {
    const user = await getSessionUser();
    if (user) {
      const { error } = await supabase.rpc('delete_my_account');
      if (error) {
        throw new Error(error.message || 'Account deletion failed');
      }
      try {
        await supabase.auth.signOut();
      } catch {
        // the auth user is already gone; a local sign-out failure is harmless
      }
    }

    await AsyncStorage.multiRemove([
      KEYS.AUTH,
      KEYS.PROFILE,
      KEYS.COUNTRIES,
      KEYS.TRIPS,
      KEYS.TRIPS_SEEDED,
      KEYS.PROGRESS,
      KEYS.PLANS,
      KEYS.OUTBOX,
      KEYS.SYNCED_USER,
    ]);
  },
};
