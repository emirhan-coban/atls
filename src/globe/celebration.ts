/**
 * Finds the countries the user just marked visited/lived by diffing store snapshots.
 * The first snapshot (hydration) and any snapshot that replaces most of the list at once (cloud sync,
 * login, clear) are baselines, never celebrations.
 */
import type { Country } from '../stores/types';

export interface CelebrationEvent {
  id: string;
  status: 'visited' | 'lived' | 'want';
}

type Snapshot = Pick<Country, 'id' | 'status'>[];

const MARKED = (s: string) => s === 'visited' || s === 'lived';

export function createCelebrationDetector(hydrated: () => boolean) {
  let previous: Map<string, string> | null = null;

  return function diff(countries: Snapshot): CelebrationEvent[] {
    const next = new Map(countries.map((c) => [c.id, c.status as string]));
    const before = previous;
    previous = next;
    if (!before || !hydrated()) return [];

    // A bulk change is a load, not a user action
    let added = 0;
    next.forEach((_, id) => { if (!before.has(id)) added++; });
    if (added > 1 || Math.abs(next.size - before.size) > 1) return [];

    const events: CelebrationEvent[] = [];
    next.forEach((status, id) => {
      const old = before.get(id);
      if (old === status) return;
      if (MARKED(status) && !(old && MARKED(old))) events.push({ id, status: status as 'visited' | 'lived' });
      else if (status === 'want' && !old) events.push({ id, status: 'want' });
    });
    return events;
  };
}

/** Holds events while Home is hidden and releases them, in order, once it is visible. */
export function createCelebrationQueue() {
  const queue: CelebrationEvent[] = [];
  return {
    push(events: CelebrationEvent[]) { queue.push(...events); },
    drain(visible: boolean): CelebrationEvent[] {
      if (!visible) return [];
      return queue.splice(0, queue.length);
    },
    /** The oldest queued event, or undefined while hidden or empty. */
    next(visible: boolean): CelebrationEvent | undefined {
      return visible ? queue.shift() : undefined;
    },
    size: () => queue.length,
  };
}
