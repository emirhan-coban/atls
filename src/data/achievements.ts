import { Country, Profile, Trip } from '../stores/types';

export interface Achievement {
  id: string;
  titleEn: string;
  titleTr: string;
  descEn: string;
  descTr: string;
  badgeEmoji: string;
  accentColor: string;
  gradientColors: [string, string];
  category: 'milestone' | 'explorer' | 'continent' | 'curator' | 'journal';
  isUnlocked: (countries: Country[], profile?: Profile, trips?: Trip[]) => boolean;
  getProgress: (
    countries: Country[],
    profile?: Profile,
    trips?: Trip[]
  ) => { current: number; target: number; percent: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    titleEn: 'First Step',
    titleTr: 'İlk Adım',
    descEn: 'Mark your very first visited or lived-in country',
    descTr: 'İlk ziyaret ettiğin veya yaşadığın ülkeyi kaydet',
    badgeEmoji: '🌟',
    accentColor: '#B7791F',
    gradientColors: ['#F3C766', '#B45309'],
    category: 'milestone',
    isUnlocked: (countries) => {
      return countries.some((c) => c.status === 'visited' || c.status === 'lived');
    },
    getProgress: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return { current: Math.min(count, 1), target: 1, percent: count >= 1 ? 100 : 0 };
    },
  },
  {
    id: 'explorer_5',
    titleEn: 'Wanderer',
    titleTr: 'Gezgin',
    descEn: 'Visit at least 5 different countries across the globe',
    descTr: 'Dünyada en az 5 farklı ülkeyi ziyaret et',
    badgeEmoji: '🧭',
    accentColor: '#3B82F6',
    gradientColors: ['#60A5FA', '#2563EB'],
    category: 'milestone',
    isUnlocked: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return count >= 5;
    },
    getProgress: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return { current: Math.min(count, 5), target: 5, percent: Math.min(Math.round((count / 5) * 100), 100) };
    },
  },
  {
    id: 'globetrotter_10',
    titleEn: 'Globetrotter',
    titleTr: 'Kaşif',
    descEn: 'Reach a milestone of 10 visited countries',
    descTr: '10 ülke sınırını aşarak gerçek bir kaşif ol',
    badgeEmoji: '🗺️',
    accentColor: '#10B981',
    gradientColors: ['#34D399', '#059669'],
    category: 'milestone',
    isUnlocked: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return count >= 10;
    },
    getProgress: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return { current: Math.min(count, 10), target: 10, percent: Math.min(Math.round((count / 10) * 100), 100) };
    },
  },
  {
    id: 'world_citizen_25',
    titleEn: 'World Citizen',
    titleTr: 'Dünya Vatandaşı',
    descEn: 'Stamp 25 countries in your digital passport',
    descTr: 'Pasaportuna tam 25 ülkenin damgasını vur',
    badgeEmoji: '🌍',
    accentColor: '#B7791F',
    gradientColors: ['#F3C766', '#D97706'],
    category: 'milestone',
    isUnlocked: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return count >= 25;
    },
    getProgress: (countries) => {
      const count = countries.filter((c) => c.status === 'visited' || c.status === 'lived').length;
      return { current: Math.min(count, 25), target: 25, percent: Math.min(Math.round((count / 25) * 100), 100) };
    },
  },
  {
    id: 'dreamer_wishlist',
    titleEn: 'Dreamer',
    titleTr: 'Hayalperest',
    descEn: 'Add 5 dream destinations to your bucket list',
    descTr: 'Görmek istediğin 5 ülkeyi istek listene ekle',
    badgeEmoji: '✨',
    accentColor: '#E06D53',
    gradientColors: ['#F0907B', '#C2410C'],
    category: 'curator',
    isUnlocked: (countries) => {
      const count = countries.filter((c) => c.status === 'want').length;
      return count >= 5;
    },
    getProgress: (countries) => {
      const count = countries.filter((c) => c.status === 'want').length;
      return { current: Math.min(count, 5), target: 5, percent: Math.min(Math.round((count / 5) * 100), 100) };
    },
  },
  {
    id: 'europe_hopper',
    titleEn: 'Euro Hopper',
    titleTr: 'Avrupa Fatihi',
    descEn: 'Travel to 3 or more European destinations',
    descTr: 'Avrupa kıtasında en az 3 ülkeyi ziyaret et',
    badgeEmoji: '🏰',
    accentColor: '#2563EB',
    gradientColors: ['#60A5FA', '#1D4ED8'],
    category: 'continent',
    isUnlocked: (countries) => {
      const count = countries.filter(
        (c) => (c.status === 'visited' || c.status === 'lived') && (c.continent === 'Europe' || c.continentTr === 'Avrupa')
      ).length;
      return count >= 3;
    },
    getProgress: (countries) => {
      const count = countries.filter(
        (c) => (c.status === 'visited' || c.status === 'lived') && (c.continent === 'Europe' || c.continentTr === 'Avrupa')
      ).length;
      return { current: Math.min(count, 3), target: 3, percent: Math.min(Math.round((count / 3) * 100), 100) };
    },
  },
  {
    id: 'asia_seeker',
    titleEn: 'Silk Road Seeker',
    titleTr: 'İpek Yolu Yolcusu',
    descEn: 'Set foot in 2 or more Asian destinations',
    descTr: 'Asya kıtasında en az 2 ülkeyi ziyaret et',
    badgeEmoji: '⛩️',
    accentColor: '#E06D53',
    gradientColors: ['#F0907B', '#C2410C'],
    category: 'continent',
    isUnlocked: (countries) => {
      const count = countries.filter(
        (c) => (c.status === 'visited' || c.status === 'lived') && (c.continent === 'Asia' || c.continentTr === 'Asya')
      ).length;
      return count >= 2;
    },
    getProgress: (countries) => {
      const count = countries.filter(
        (c) => (c.status === 'visited' || c.status === 'lived') && (c.continent === 'Asia' || c.continentTr === 'Asya')
      ).length;
      return { current: Math.min(count, 2), target: 2, percent: Math.min(Math.round((count / 2) * 100), 100) };
    },
  },
  {
    id: 'local_resident',
    titleEn: 'Expat & Local',
    titleTr: 'Dünya İkametgâhı',
    descEn: 'Mark at least one country as your lived-in home',
    descTr: 'En az bir ülkeyi yaşadığın yer (ikamet) olarak kaydet',
    badgeEmoji: '🏡',
    accentColor: '#059669',
    gradientColors: ['#34D399', '#047857'],
    category: 'curator',
    isUnlocked: (countries) => {
      return countries.some((c) => c.status === 'lived');
    },
    getProgress: (countries) => {
      const hasLived = countries.some((c) => c.status === 'lived');
      return { current: hasLived ? 1 : 0, target: 1, percent: hasLived ? 100 : 0 };
    },
  },
  {
    id: 'return_visitor',
    titleEn: 'Return Visitor',
    titleTr: 'Geri Dönen',
    descEn: 'Travel to the same country 3 times',
    descTr: 'Aynı ülkeye 3 kez gez',
    badgeEmoji: '🔁',
    accentColor: '#B7791F',
    gradientColors: ['#F3C766', '#B45309'],
    category: 'journal',
    isUnlocked: (_countries, _profile, trips = []) => mostRepeatedTrips(trips) >= 3,
    getProgress: (_countries, _profile, trips = []) => progressOf(mostRepeatedTrips(trips), 3),
  },
  {
    id: 'seasoned_traveler',
    titleEn: 'Seasoned Traveler',
    titleTr: 'Deneyimli Gezgin',
    descEn: 'Log 10 trips in your journal',
    descTr: 'Günlüğüne 10 gezi ekle',
    badgeEmoji: '📖',
    accentColor: '#2563EB',
    gradientColors: ['#60A5FA', '#1D4ED8'],
    category: 'journal',
    isUnlocked: (_countries, _profile, trips = []) => trips.length >= 10,
    getProgress: (_countries, _profile, trips = []) => progressOf(trips.length, 10),
  },
  {
    id: 'long_haul',
    titleEn: 'Long Haul',
    titleTr: 'Uzun Yol',
    descEn: 'Spend 30 days abroad in total',
    descTr: 'Toplamda 30 gün yurt dışında geçir',
    badgeEmoji: '🧳',
    accentColor: '#059669',
    gradientColors: ['#34D399', '#047857'],
    category: 'journal',
    isUnlocked: (_countries, _profile, trips = []) => totalDays(trips) >= 30,
    getProgress: (_countries, _profile, trips = []) => progressOf(totalDays(trips), 30),
  },
];

function totalDays(trips: Trip[]): number {
  return trips.reduce((sum, t) => sum + (t.days && t.days > 0 ? t.days : 0), 0);
}

function mostRepeatedTrips(trips: Trip[]): number {
  const counts = new Map<string, number>();
  for (const t of trips) counts.set(t.countryId, (counts.get(t.countryId) || 0) + 1);
  return Math.max(0, ...counts.values());
}

function progressOf(value: number, target: number) {
  return { current: Math.min(value, target), target, percent: Math.min(Math.round((value / target) * 100), 100) };
}
