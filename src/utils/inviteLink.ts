/**
 * The invite page (https://emirhan-coban.github.io/atls/c/?c=...) is what people tap in a chat. When the app is installed
 * iOS hands that https URL to the app as a universal link; this maps it onto the in-app route that shows the comparison.
 */
export function inviteRouteFor(path: string): string | null {
  const q = path.indexOf('?');
  const pathname = (q === -1 ? path : path.slice(0, q)).replace(/\/+$/, '');
  if (!/(^|\/)atls\/c$/.test(pathname)) return null;
  return `/compare${q === -1 ? '' : path.slice(q)}`;
}
