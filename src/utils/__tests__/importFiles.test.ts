/// <reference types="jest" />
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { pickAndImportBackup } from '../importFiles';
import { buildExportJson } from '../exportData';
import { useCountryStore } from '../../stores/useCountryStore';
import { useTripStore } from '../../stores/useTripStore';
import type { Country, Trip } from '../../stores/types';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-notifications', () => ({}));
jest.mock('../../services/storageService', () => ({
  storageService: { addCountry: jest.fn(async () => {}), saveTrip: jest.fn(async () => {}) },
  enrichCountry: (c: object) => c,
}));
jest.mock('../../stores/useCelebrationStore', () => ({ useCelebrationStore: { getState: () => ({ burstConfetti: jest.fn() }) } }));

const picker = DocumentPicker.getDocumentAsync as jest.Mock;
const pick = (text: string, size = text.length) => {
  picker.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///b.json', size }] });
  (File as unknown as jest.Mock).mockImplementation(() => ({ text: async () => text }));
};
const country = (id: string, status: Country['status']): Country =>
  ({ id, name: id, nameTr: id, continent: 'Europe', continentTr: 'Avrupa', flag: '🏳️', status }) as Country;
const trip = (id: string, countryId: string): Trip => ({
  id, countryId, year: '2024', month: '06', days: 7, cities: [], type: 'leisure', rating: null, notes: '', photos: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
});

describe('pickAndImportBackup', () => {
  beforeEach(() => {
    useCountryStore.setState({ countries: [country('FR', 'lived')] });
    useTripStore.setState({ trips: [] });
  });

  it('does nothing when the picker is cancelled', async () => {
    picker.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickAndImportBackup()).toEqual({ kind: 'cancelled' });
  });

  it('rejects a file that is not an atls. backup, and an oversized one', async () => {
    pick('{"hello":1}');
    expect(await pickAndImportBackup()).toEqual({ kind: 'invalid' });
    pick('x', 10 * 1024 * 1024);
    expect(await pickAndImportBackup()).toEqual({ kind: 'invalid' });
  });

  it('adds only what is missing and leaves existing records alone', async () => {
    pick(buildExportJson(undefined, [country('FR', 'visited'), country('JP', 'visited')], [trip('t1', 'JP'), trip('t2', 'IT')]));
    const result = await pickAndImportBackup();
    expect(result).toEqual({ kind: 'done', countries: 2, trips: 2, skipped: 1 });
    const countries = useCountryStore.getState().countries;
    expect(countries.find((c) => c.id === 'FR')?.status).toBe('lived'); // untouched
    expect(countries.map((c) => c.id).sort()).toEqual(['FR', 'IT', 'JP']);
    expect(useTripStore.getState().trips.map((t) => t.id).sort()).toEqual(['t1', 't2']);
  });

  it('a second import of the same file adds nothing', async () => {
    pick(buildExportJson(undefined, [country('JP', 'visited')], [trip('t1', 'JP')]));
    await pickAndImportBackup();
    expect(await pickAndImportBackup()).toEqual({ kind: 'done', countries: 0, trips: 0, skipped: 2 });
  });
});
