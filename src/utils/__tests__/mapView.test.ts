/// <reference types="jest" />
import { clampView, transformForView, viewFromTransform, INITIAL_VIEW, MAP_BOUNDS, MAX_ZOOM, panBy, scaleOf, toMapPoint, viewBoxOf, zoomAround } from '../mapView';

const phone = { width: 360, height: 700 };

describe('map view', () => {
  it('shows the whole map width at zoom 1 and centres it on a tall screen', () => {
    const view = clampView({ zoom: 1, cx: 0, cy: 0 }, phone);
    expect(viewBoxOf(view, phone).split(' ').map(Number)[2]).toBeCloseTo(MAP_BOUNDS.width, 1);
    expect(view.cx).toBeCloseTo(INITIAL_VIEW.cx);
    expect(view.cy).toBeCloseTo(INITIAL_VIEW.cy);
  });

  it('never leaves the map when zoomed in and panned far', () => {
    const view = clampView({ zoom: 8, cx: -999, cy: 99999 }, phone);
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
    const start = clampView({ zoom: 6, cx: INITIAL_VIEW.cx, cy: INITIAL_VIEW.cy }, phone);
    const finger = { x: 120, y: 300 };
    const before = toMapPoint(start, phone, finger);
    const next = zoomAround(start, phone, 8, finger, finger);
    const after = toMapPoint(next, phone, finger);
    expect(after.x).toBeCloseTo(before.x, 3);
    expect(after.y).toBeCloseTo(before.y, 3);
    expect(next.zoom).toBe(8);
  });

  it('drags the map with the finger', () => {
    const start = clampView({ zoom: 3, cx: INITIAL_VIEW.cx, cy: INITIAL_VIEW.cy }, phone);
    const moved = panBy(start, phone, 60, 0);
    // dragging right shows what was to the left
    expect(moved.cx).toBeCloseTo(start.cx - 60 / scaleOf(3, phone), 3);
  });

  it('converts between a live transform and the view it shows, both ways', () => {
    const from = clampView({ zoom: 6, cx: 600, cy: 220 }, phone);
    const to = clampView({ zoom: 9, cx: 480, cy: 200 }, phone);
    const t = transformForView(from, to, phone);
    const back = viewFromTransform(from, phone, t);
    expect(back.zoom).toBeCloseTo(to.zoom, 4);
    expect(back.cx).toBeCloseTo(to.cx, 3);
    expect(back.cy).toBeCloseTo(to.cy, 3);
  });

  it('an unchanged view is the identity transform', () => {
    const view = clampView({ zoom: 3, cx: 500, cy: 220 }, phone);
    const t = transformForView(view, view, phone);
    expect(t.s).toBeCloseTo(1, 6);
    expect(t.tx).toBeCloseTo(0, 6);
    expect(t.ty).toBeCloseTo(0, 6);
  });

  it('clamps a transform that drags the map out of bounds', () => {
    const view = clampView({ zoom: 3, cx: 500, cy: 220 }, phone);
    const far = viewFromTransform(clampView({ zoom: 8, cx: 500, cy: 220 }, phone), phone, { s: 1, tx: 5000, ty: -5000 });
    const [x, y] = viewBoxOf(far, phone).split(' ').map(Number);
    expect(x).toBeGreaterThanOrEqual(MAP_BOUNDS.minX - 0.01);
    expect(y + 0).toBeGreaterThanOrEqual(MAP_BOUNDS.minY - 0.01);
  });
});
