import { inviteRouteFor } from '../utils/inviteLink';

/** Rewrites incoming system URLs: the https invite link becomes the /compare route, everything else is left alone. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    return inviteRouteFor(path) ?? path;
  } catch {
    return path;
  }
}
