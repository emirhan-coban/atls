/** How rare a country is among atls travelers. Pure; the numbers come from the `country_visit_stats` function. */

export type RarityTier = 'legendary' | 'rare' | 'uncommon';

export interface VisitStatsRow {
  country_id: string;
  travelers: number;
  total_travelers: number;
}

export interface Rarity {
  /** Percent of atls travelers who have been here, 0..100. */
  percent: number;
  tier: RarityTier | null;
}

/** Share of travelers below which a country is called legendary / rare / uncommon. */
export const TIER_LIMITS: { tier: RarityTier; below: number }[] = [
  { tier: 'legendary', below: 2 },
  { tier: 'rare', below: 8 },
  { tier: 'uncommon', below: 25 },
];

export function tierOf(percent: number): RarityTier | null {
  return TIER_LIMITS.find((t) => percent < t.below)?.tier ?? null;
}

/** Rows to a lookup. A country nobody has visited has no row, which means 0% of a known population. */
export function buildRarityMap(rows: VisitStatsRow[]): Map<string, Rarity> {
  const map = new Map<string, Rarity>();
  for (const r of rows) {
    const total = Number(r.total_travelers);
    if (!r.country_id || !(total > 0)) continue;
    const percent = Math.min(100, (Number(r.travelers) / total) * 100);
    map.set(r.country_id.toUpperCase(), { percent, tier: tierOf(percent) });
  }
  return map;
}

/** Looks up a country; when stats exist but the country is absent nobody has been, so it is the rarest. */
export function rarityOf(map: Map<string, Rarity> | null, countryId: string): Rarity | null {
  if (!map || map.size === 0) return null;
  return map.get(countryId.toUpperCase()) ?? { percent: 0, tier: 'legendary' };
}

export function formatPercent(percent: number): string {
  if (percent === 0) return '0';
  return percent < 1 ? '<1' : String(Math.round(percent));
}
