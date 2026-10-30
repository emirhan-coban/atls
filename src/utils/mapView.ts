/** Pan and zoom maths for the world map, kept apart from the component so it can be tested. */

/** Extent of the map artwork, in SVG units. */
export const MAP_BOUNDS = { minX: 30.767, minY: 241.591, width: 784.077, height: 458.627 };

/** Zoom 1 shows the whole map by its width. On a tall container the rest is left as sea, and the map is centred in it. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 12;

export interface MapView {
  zoom: number;
  /** Centre of the visible area, in SVG units. */
  cx: number;
  cy: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Point {
  x: number;
  y: number;
}

export const INITIAL_VIEW: MapView = {
  zoom: MIN_ZOOM,
  cx: MAP_BOUNDS.minX + MAP_BOUNDS.width / 2,
  cy: MAP_BOUNDS.minY + MAP_BOUNDS.height / 2,
};

/** Screen points per SVG unit. At zoom 1 the map is exactly as wide as the container. */
export const scaleOf = (zoom: number, size: Size) => (size.width / MAP_BOUNDS.width) * zoom;


const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Keeps the view inside the map. When the visible area is larger than the map in one direction
 * (a tall phone at zoom 1) the map is centred in that direction instead.
 */
export function clampView(view: MapView, size: Size): MapView {
  const zoom = clamp(view.zoom, MIN_ZOOM, MAX_ZOOM);
  const s = scaleOf(zoom, size);
  const visW = size.width / s;
  const visH = size.height / s;
  const cx = visW >= MAP_BOUNDS.width ? INITIAL_VIEW.cx : clamp(view.cx, MAP_BOUNDS.minX + visW / 2, MAP_BOUNDS.minX + MAP_BOUNDS.width - visW / 2);
  const cy = visH >= MAP_BOUNDS.height ? INITIAL_VIEW.cy : clamp(view.cy, MAP_BOUNDS.minY + visH / 2, MAP_BOUNDS.minY + MAP_BOUNDS.height - visH / 2);
  return { zoom, cx, cy };
}

/** SVG viewBox string for a view; its aspect ratio equals the container's, so nothing is letterboxed. */
export function viewBoxOf(view: MapView, size: Size): string {
  const s = scaleOf(view.zoom, size);
  const w = size.width / s;
  const h = size.height / s;
  return `${(view.cx - w / 2).toFixed(2)} ${(view.cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
}

/** SVG point under a container point. */
export function toMapPoint(view: MapView, size: Size, point: Point): Point {
  const s = scaleOf(view.zoom, size);
  return { x: view.cx - size.width / (2 * s) + point.x / s, y: view.cy - size.height / (2 * s) + point.y / s };
}

/**
 * Zooms so the map point that was under `from` (at the start of a gesture) ends up under `to` (now).
 * With from = to this is a pinch around a fixed spot; with a moving midpoint it also pans.
 */
export function zoomAround(start: MapView, size: Size, nextZoom: number, from: Point, to: Point): MapView {
  const anchor = toMapPoint(start, size, from);
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const s = scaleOf(zoom, size);
  return clampView({ zoom, cx: anchor.x + size.width / (2 * s) - to.x / s, cy: anchor.y + size.height / (2 * s) - to.y / s }, size);
}

/** Moves the view by a finger drag of (dx, dy) screen points. */
export function panBy(start: MapView, size: Size, dx: number, dy: number): MapView {
  const s = scaleOf(start.zoom, size);
  return clampView({ ...start, cx: start.cx - dx / s, cy: start.cy - dy / s }, size);
}
