import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { Rarity, VisitStatsRow, buildRarityMap } from '../utils/rarity';

const KEY = '@atls_rarity_stats';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

let memory: Map<string, Rarity> | null = null;
let inflight: Promise<Map<string, Rarity> | null> | null = null;

async function load(): Promise<Map<string, Rarity> | null> {
  if (memory) return memory;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { at: number; rows: VisitStatsRow[] };
      if (Date.now() - saved.at < MAX_AGE_MS) {
        memory = buildRarityMap(saved.rows);
        return memory;
      }
    }
  } catch {
    // an unreadable cache just means we ask the server
  }
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.rpc('country_visit_stats');
    if (error || !Array.isArray(data)) return null;
    await AsyncStorage.setItem(KEY, JSON.stringify({ at: Date.now(), rows: data })).catch(() => {});
    memory = buildRarityMap(data as VisitStatsRow[]);
    return memory;
  } catch {
    return null; // offline: no badge is better than a wrong one
  }
}

/** Rarity lookup for the whole catalog; null until loaded, and stays null while the server has too few travelers or is unreachable. */
export function useRarityMap(): Map<string, Rarity> | null {
  const [map, setMap] = useState<Map<string, Rarity> | null>(memory);
  useEffect(() => {
    let alive = true;
    inflight ??= load().finally(() => {
      inflight = null;
    });
    inflight.then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return map;
}
