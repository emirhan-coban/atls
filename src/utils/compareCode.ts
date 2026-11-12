/**
 * Compact, link-safe list of visited countries for the "passport clash" link.
 * A bitset over the catalog sorted by id, written as base64url with a version prefix, so ~200 countries fit in ~35 characters
 * and nothing but the country list leaves the phone. Each version decodes against its own frozen id list (compareCatalogs.ts),
 * so growing the catalog means adding a version, not breaking old links.
 */
import { availableCatalog } from '../data/travelData';
import { CATALOG_VERSIONS, LATEST_VERSION } from './compareCatalogs';
import { INVITE_URL } from './links';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const currentIds = new Set(availableCatalog.map((c) => c.id));

export function encodeVisited(ids: string[]): string {
  const all = CATALOG_VERSIONS[LATEST_VERSION];
  const set = new Set(ids.map((i) => i.toUpperCase()));
  const bits = all.map((id) => (set.has(id) ? 1 : 0));
  while (bits.length % 6) bits.push(0);
  let out = '';
  for (let i = 0; i < bits.length; i += 6) {
    out += ALPHABET[(bits[i] << 5) | (bits[i + 1] << 4) | (bits[i + 2] << 3) | (bits[i + 3] << 2) | (bits[i + 4] << 1) | bits[i + 5]];
  }
  return LATEST_VERSION + out;
}

/** Country ids in a code, or null when the code is not one we produced. */
export function decodeVisited(code: string): string[] | null {
  const all = code ? CATALOG_VERSIONS[code[0]] : undefined;
  if (!all) return null;
  const body = code.slice(1);
  if (body.length !== Math.ceil(all.length / 6)) return null;
  const bits: number[] = [];
  for (const ch of body) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return null;
    for (let b = 5; b >= 0; b--) bits.push((v >> b) & 1);
  }
  // a country that left the catalog since the code was made has nothing to show
  return all.filter((id, i) => bits[i] === 1 && currentIds.has(id));
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

export type InviteProblem = 'invalid' | 'newer';

/**
 * Why pasted text is not an invite. 'newer' means a well-formed code from a version this build does not know,
 * so the sender has a newer app and the receiver should update.
 */
export function inviteProblem(text: string): InviteProblem {
  const fromLink = text.match(/[?&]c=([A-Za-z0-9_-]+)/);
  const candidate = fromLink?.[1] ?? text.trim();
  const version = Number(candidate[0]);
  const bodyLooksRight = /^[A-Za-z0-9_-]{20,80}$/.test(candidate.slice(1));
  return Number.isInteger(version) && version > Number(LATEST_VERSION) && bodyLooksRight ? 'newer' : 'invalid';
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
