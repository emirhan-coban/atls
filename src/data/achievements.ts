import { Country, Profile } from '../stores/types';

export interface Achievement {
  id: string;
  titleEn: string;
  titleTr: string;
  descEn: string;
  descTr: string;
  badgeEmoji: string;
  accentColor: string;
  gradientColors: [string, string];
  category: 'milestone' | 'explorer' | 'continent' | 'curator';
  isUnlocked: (countries: Country[], profile?: Profile) => boolean;
  getProgress: (countries: Country[], profile?: Profile) => { current: number; target: number; percent: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    titleEn: 'First Step',
    titleTr: 'İlk Adım',
    descEn: 'Mark your very first visited or lived-in country',
    descTr: 'İlk ziyaret ettiğin veya yaşadığın ülkeyi kaydet',
    badgeEmoji: '🌟',
    accentColor: '#6366F1',
    gradientColors: ['#6366F1', '#4F46E5'],
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
    gradientColors: ['#38BDF8', '#2563EB'],
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
    accentColor: '#F59E0B',
    gradientColors: ['#FBBF24', '#D97706'],
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
    accentColor: '#EC4899',
    gradientColors: ['#F472B6', '#DB2777'],
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
    accentColor: '#EF4444',
    gradientColors: ['#F87171', '#DC2626'],
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
];
