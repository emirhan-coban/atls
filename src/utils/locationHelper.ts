import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { Country, Profile } from '../stores/types';

export function getDynamicLocation(profile: Profile, countries: Country[], currentLang: 'tr' | 'en' = 'tr') {
  // 1. Explicit country selection
  if (profile?.homeCountryId) {
    const country = availableCatalog.find(
      (c) => c.id.toUpperCase() === profile.homeCountryId?.toUpperCase()
    );
    if (country) {
      const cName = currentLang === 'tr' ? (country.nameTr || country.name) : country.name;
      const text = profile.homeCity && profile.homeCity.trim()
        ? `${profile.homeCity.trim()}, ${cName}`
        : cName;
      return {
        flag: country.flag || '📍',
        text,
      };
    }
  }

  // 2. Custom location string (if set directly)
  if (profile?.customLocation && profile.customLocation.trim()) {
    const trimmed = profile.customLocation.trim();
    const match = trimmed.match(/^([\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE0F\u200D]+)\s*(.*)$/);
    if (match) {
      return {
        flag: match[1],
        text: match[2],
      };
    }
    const lower = trimmed.toLowerCase();
    const matchedCountry = availableCatalog.find(
      (c) => lower.includes(c.name.toLowerCase()) || (c.nameTr && lower.includes(c.nameTr.toLowerCase()))
    );
    if (matchedCountry) {
      return {
        flag: matchedCountry.flag,
        text: trimmed,
      };
    }
    return {
      flag: null,
      text: trimmed,
    };
  }

  // 3. Dynamic: Lived-in country
  const lived = countries.find((c) => c.status === 'lived');
  if (lived) {
    const locName = getLocalizedCountryName(lived, currentLang);
    return {
      flag: lived.flag || '📍',
      text: `${locName} (${currentLang === 'tr' ? 'İkamet' : 'Home'})`,
    };
  }

  // 4. Dynamic: Latest visited country
  const visited = countries.find((c) => c.status === 'visited');
  if (visited) {
    const locName = getLocalizedCountryName(visited, currentLang);
    return {
      flag: visited.flag || '📍',
      text: `${locName} (${currentLang === 'tr' ? 'Son Durak' : 'Latest'})`,
    };
  }

  // 5. Fallback: Profile static location
  const fallbackText = currentLang === 'tr'
    ? (profile?.locationTr || profile?.location || 'Dünya Vatandaşı')
    : (profile?.location || 'Global Citizen');

  return {
    flag: '🌍',
    text: fallbackText,
  };
}
