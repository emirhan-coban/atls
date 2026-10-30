/// <reference types="jest" />
import { clampView, INITIAL_VIEW, MAP_BOUNDS, MAX_ZOOM, panBy, scaleOf, toMapPoint, viewBoxOf, zoomAround } from '../mapView';

const phone = { width: 360, height: 700 };

describe('map view', () => {
  it('shows the whole map width at zoom 1 and centres it on a tall screen', () => {
    const view = clampView({ zoom: 1, cx: 0, cy: 0 }, phone);
    expect(viewBoxOf(view, phone).split(' ').map(Number)[2]).toBeCloseTo(MAP_BOUNDS.width, 1);
    expect(view.cx).toBeCloseTo(INITIAL_VIEW.cx);
    expect(view.cy).toBeCloseTo(INITIAL_VIEW.cy);
  });

  it('never leaves the map when zoomed in and panned far', () => {
    const view = clampView({ zoom: 4, cx: -999, cy: 99999 }, phone);
    const [x, y, w, h] = viewBoxOf(view, phone).split(' ').map(Number);
    expect(x).toBeGreaterThanOrEqual(MAP_BOUNDS.minX - 0.01);
    expect(x + w).toBeLessThanOrEqual(MAP_BOUNDS.minX + MAP_BOUNDS.width + 0.01);
    expect(y + h).toBeLessThanOrEqual(MAP_BOUNDS.minY + MAP_BOUNDS.height + 0.01);
    expect(y).toBeGreaterThanOrEqual(MAP_BOUNDS.minY - 0.01);
  });

  it('limits zoom to the allowed range', () => {
    expect(clampView({ ...INITIAL_VIEW, zoom: 99 }, phone).zoom).toBe(MAX_ZOOM);
    expect(clampView({ ...INITIAL_VIEW, zoom: 0.2 }, phone).zoom).toBe(1);
  });

  it('keeps the point under the fingers fixed while pinching', () => {
    const start = { zoom: 2, cx: 400, cy: 470 };
    const finger = { x: 120, y: 300 };
    const before = toMapPoint(start, phone, finger);
    const next = zoomAround(start, phone, 5, finger, finger);
    const after = toMapPoint(next, phone, finger);
    expect(after.x).toBeCloseTo(before.x, 3);
    expect(after.y).toBeCloseTo(before.y, 3);
    expect(next.zoom).toBe(5);
  });

  it('drags the map with the finger', () => {
    const start = { zoom: 3, cx: 420, cy: 470 };
    const moved = panBy(start, phone, 60, 0);
    // dragging right shows what was to the left
    expect(moved.cx).toBeCloseTo(start.cx - 60 / scaleOf(3, phone), 3);
  });
});
