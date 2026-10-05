import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { availableCatalog } from '../data/travelData';

const KEYS = {
  LANG: '@atls_lang',
  ONBOARDING: '@atls_onboarding_completed',
  AUTH: '@atls_is_authenticated',
  PROFILE: '@atls_profile',
  COUNTRIES: '@atls_countries',
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
    year: c.year || c.visitedYear || new Date().getFullYear().toString(),
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

export const storageService = {
  // Load full app state from local storage or cloud
  async loadInitialData(fallbackProfile, fallbackCountries) {
    try {
      const [storedLang, storedOnboarding, storedAuth, storedProfileJson, storedCountriesJson] = await Promise.all([
        AsyncStorage.getItem(KEYS.LANG),
        AsyncStorage.getItem(KEYS.ONBOARDING),
        AsyncStorage.getItem(KEYS.AUTH),
        AsyncStorage.getItem(KEYS.PROFILE),
        AsyncStorage.getItem(KEYS.COUNTRIES),
      ]);

      const lang = storedLang || 'tr';
      const hasCompletedOnboarding = storedOnboarding === 'true';
      const profile = storedProfileJson ? JSON.parse(storedProfileJson) : fallbackProfile;
      const countries = storedCountriesJson ? JSON.parse(storedCountriesJson) : fallbackCountries;

      // Sanitize legacy mock locations from earlier builds
      if (profile) {
        if (typeof profile.location === 'string' && /lisbon|lizbon/i.test(profile.location)) {
          profile.location = 'Global Citizen';
        }
        if (typeof profile.locationTr === 'string' && /lisbon|lizbon/i.test(profile.locationTr)) {
          profile.locationTr = 'Dünya Vatandaşı';
        }
        if (typeof profile.customLocation === 'string' && /lisbon|lizbon/i.test(profile.customLocation)) {
          profile.customLocation = null;
        }
        // Auto-fix handle with Turkish transliteration
        if (profile.name && (!profile.handle || profile.handle === `@${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`)) {
          profile.handle = generateHandle(profile.name);
        }
      }

      // If Supabase is configured and a session is active, fetch cloud data
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: cloudProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const { data: cloudCountries } = await supabase
            .from('user_countries')
            .select('*')
            .eq('user_id', session.user.id);

          return {
            lang,
            hasCompletedOnboarding,
            isAuthenticated: true,
            profile: cloudProfile ? {
              name: cloudProfile.name,
              handle: cloudProfile.handle,
              avatarInitials: cloudProfile.avatar_initials,
              email: cloudProfile.email,
              location: cloudProfile.location,
              locationTr: cloudProfile.location_tr,
              customLocation: cloudProfile.location || profile?.customLocation || null,
              nationality: cloudProfile.nationality,
              passportNo: cloudProfile.passport_no,
              issueDate: cloudProfile.issue_date,
              expiryDate: cloudProfile.expiry_date,
              bio: cloudProfile.bio,
            } : profile,
            countries: cloudCountries && cloudCountries.length > 0 ? cloudCountries.map((c) => enrichCountry({
              id: c.country_id,
              name: c.name,
              flag: c.flag,
              continent: c.continent,
              status: c.status,
              visitedYear: c.visited_year,
              year: c.visited_year,
              notes: c.notes,
            })) : (countries || []).map(enrichCountry),
          };
        }
      }

      const isAuthenticated = storedAuth === 'true';

      return {
        lang,
        hasCompletedOnboarding,
        isAuthenticated,
        profile,
        countries: (countries || []).map(enrichCountry),
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

  async clearAuth() {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH);
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[storageService] Failed to clear auth state:', err);
    }
  },

  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
      
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            name: profile.name,
            handle: profile.handle,
            email: profile.email,
            avatar_initials: profile.avatarInitials,
            location: profile.customLocation !== undefined ? profile.customLocation : profile.location,
            location_tr: profile.customLocation !== undefined ? profile.customLocation : profile.locationTr,
            passport_no: profile.passportNo,
            bio: profile.bio,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('[storageService] Failed to save profile:', err);
    }
  },

  async saveCountries(countries) {
    try {
      await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(countries));
    } catch (err) {
      console.warn('[storageService] Failed to save countries:', err);
    }
  },

  async addCountry(rawCountry) {
    try {
      const country = enrichCountry(rawCountry);
      const stored = await AsyncStorage.getItem(KEYS.COUNTRIES);
      const current = stored ? JSON.parse(stored) : [];
      const updated = [country, ...current.filter((c) => c.id !== country.id)];
      await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(updated));

      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('user_countries').upsert({
            user_id: session.user.id,
            country_id: country.id,
            name: country.name,
            flag: country.flag,
            continent: country.continent,
            status: country.status,
            visited_year: country.visitedYear || new Date().getFullYear().toString(),
            notes: country.notes || '',
          });
        }
      }
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
      const stored = await AsyncStorage.getItem(KEYS.COUNTRIES);
      const current = stored ? JSON.parse(stored) : [];
      const updated = current.filter((c) => c.id !== countryId);
      await AsyncStorage.setItem(KEYS.COUNTRIES, JSON.stringify(updated));

      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from('user_countries')
            .delete()
            .match({ user_id: session.user.id, country_id: countryId });
        }
      }
      return updated;
    } catch (err) {
      console.warn('[storageService] Failed to remove country:', err);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.LANG,
        KEYS.ONBOARDING,
        KEYS.PROFILE,
        KEYS.COUNTRIES,
      ]);
    } catch (err) {
      console.warn('[storageService] Failed to clear storage:', err);
    }
  },
};
