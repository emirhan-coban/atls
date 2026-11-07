/**
 * Compact, link-safe list of visited countries for the "passport clash" link.
 * A bitset over the catalog sorted by id, written as base64url with a version prefix, so ~200 countries fit in ~35 characters
 * and nothing but the country list leaves the phone. Adding countries to the catalog later requires a new version prefix.
 */
import { availableCatalog } from '../data/travelData';
import { INVITE_URL } from './links';

const VERSION = '1';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const order = (): string[] => availableCatalog.map((c) => c.id).sort();

export function encodeVisited(ids: string[]): string {
  const all = order();
  const set = new Set(ids.map((i) => i.toUpperCase()));
  const bits = all.map((id) => (set.has(id) ? 1 : 0));
  while (bits.length % 6) bits.push(0);
  let out = '';
  for (let i = 0; i < bits.length; i += 6) {
    out += ALPHABET[(bits[i] << 5) | (bits[i + 1] << 4) | (bits[i + 2] << 3) | (bits[i + 3] << 2) | (bits[i + 4] << 1) | bits[i + 5]];
  }
  return VERSION + out;
}

/** Country ids in a code, or null when the code is not one we produced. */
export function decodeVisited(code: string): string[] | null {
  if (!code || code[0] !== VERSION) return null;
  const all = order();
  const body = code.slice(1);
  if (body.length !== Math.ceil(all.length / 6)) return null;
  const bits: number[] = [];
  for (const ch of body) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    for (let b = 5; b >= 0; b--) bits.push((v >> b) & 1);
  }
  return all.filter((_, i) => bits[i] === 1);
}

export interface Comparison {
  both: string[];
  onlyMine: string[];
  onlyTheirs: string[];
  /** Shared countries as a share of everything either of you has visited, 0..100. */
  overlap: number;
}

export function compareVisited(mine: string[], theirs: string[]): Comparison {
  const a = new Set(mine.map((i) => i.toUpperCase()));
  const b = new Set(theirs.map((i) => i.toUpperCase()));
  const both = [...a].filter((x) => b.has(x)).sort();
  const onlyMine = [...a].filter((x) => !b.has(x)).sort();
  const onlyTheirs = [...b].filter((x) => !a.has(x)).sort();
  const union = a.size + b.size - both.length;
  return { both, onlyMine, onlyTheirs, overlap: union ? Math.round((both.length / union) * 100) : 0 };
}

export function buildCompareLink(ids: string[], name: string): string {
  return `${INVITE_URL}?c=${encodeVisited(ids)}&n=${encodeURIComponent(name.slice(0, 30))}`;
}

export interface Invite {
  code: string;
  name: string;
}

/** Pulls an invite out of whatever the user pasted: the whole share message, the link, or just the code. */
export function parseInvite(text: string): Invite | null {
  const fromLink = text.match(/[?&]c=([A-Za-z0-9_-]+)/);
  const candidate = fromLink?.[1] ?? text.trim();
  if (!decodeVisited(candidate)) return null;
  const nameMatch = text.match(/[?&]n=([^&\s]*)/);
  let name = '';
  try {
    name = nameMatch ? decodeURIComponent(nameMatch[1]) : '';
  } catch {
    // a half-pasted name is not worth failing the whole invite
  }
  return { code: candidate, name };
}
