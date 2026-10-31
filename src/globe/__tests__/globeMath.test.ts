import {
  AXIAL_TILT,
  dirToLonLat,
  lonLatToDir,
  lonLatToScreen,
  mulVec,
  modelMatrix,
  pixelIndex,
  screenToLonLat,
  shortestDelta,
  solveFlyTo,
  wrapAngle,
} from '../globeMath';

const deg = (d: number) => (d * Math.PI) / 180;

describe('globeMath', () => {
  it('wraps angles and picks the shortest way round', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 9);
    expect(shortestDelta(deg(350), deg(10))).toBeCloseTo(deg(20), 9);
    expect(shortestDelta(deg(10), deg(350))).toBeCloseTo(deg(-20), 9);
  });

  it('lon/lat <-> direction round trip', () => {
    for (const [lon, lat] of [[0, 0], [1.2, 0.5], [-2.8, -0.9], [3, 1.4]]) {
      const back = dirToLonLat(lonLatToDir(lon, lat));
      expect(back.lat).toBeCloseTo(lat, 9);
      expect(Math.cos(back.lon)).toBeCloseTo(Math.cos(lon), 9);
      expect(Math.sin(back.lon)).toBeCloseTo(Math.sin(lon), 9);
    }
  });

  it('model matrix is a rotation', () => {
    const m = modelMatrix(0.7, -0.3);
    const v = mulVec(m, [0.2, 0.5, Math.sqrt(1 - 0.29)]);
    expect(Math.hypot(...v)).toBeCloseTo(1, 9);
    expect(AXIAL_TILT).toBeCloseTo(-0.409, 3);
  });

  it('fly-to puts the label point on +z within 1e-3', () => {
    const places = [
      [deg(35.4), deg(39.1)], // Türkiye
      [deg(8.1), deg(9.6)], // Nigeria
      [deg(-100), deg(40)],
      [deg(135), deg(-25)],
      [deg(179), deg(-8.5)],
      [deg(-170), deg(20)],
      [deg(10), deg(55)],
    ];
    for (const [lon, lat] of places) {
      const { spinY, tiltX } = solveFlyTo(lon, lat);
      const w = mulVec(modelMatrix(spinY, tiltX), lonLatToDir(lon, lat));
      expect(w[0]).toBeCloseTo(0, 3);
      expect(w[1]).toBeCloseTo(0, 3);
      expect(w[2]).toBeCloseTo(1, 3);
    }
  });

  it('fly-to clamps near the poles but keeps the point visible', () => {
    const { spinY, tiltX } = solveFlyTo(deg(20), deg(85));
    expect(Math.abs(tiltX)).toBeLessThanOrEqual(1.2 + 1e-9);
    const w = mulVec(modelMatrix(spinY, tiltX), lonLatToDir(deg(20), deg(85)));
    expect(w[2]).toBeGreaterThan(0.3);
  });

  it('lon/lat -> screen -> lon/lat round trip', () => {
    const view = { spinY: 0.9, tiltX: -0.4, cx: 200, cy: 300, radius: 150 };
    for (const [lon, lat] of [[deg(30), deg(10)], [deg(-20), deg(-35)], [deg(60), deg(50)]]) {
      const s = lonLatToScreen(lon, lat, view);
      if (!s.visible) continue;
      const back = screenToLonLat(s.x, s.y, view)!;
      expect(back.lat).toBeCloseTo(lat, 6);
      expect(wrapAngle(back.lon - lon)).toBeCloseTo(0, 6);
    }
  });

  it('rejects points outside the disc and reports the far side as hidden', () => {
    const view = { spinY: 0, tiltX: 0, cx: 100, cy: 100, radius: 50 };
    expect(screenToLonLat(10, 10, view)).toBeNull();
    const { spinY, tiltX } = solveFlyTo(0, 0);
    const far = lonLatToScreen(Math.PI, 0, { ...view, spinY, tiltX });
    expect(far.visible).toBe(false);
  });

  it('picks the same pixel the shader would sample', () => {
    const view = { spinY: 0, tiltX: 0, cx: 0, cy: 0, radius: 100 };
    // a point on the centre of the disc, with the prime meridian flown to centre
    const { spinY, tiltX } = solveFlyTo(0, 0);
    const d = (function () {
      const px = 0, py = 0;
      const w: [number, number, number] = [px, -py, 1];
      const m = modelMatrix(spinY, tiltX);
      return [m[0] * w[0] + m[3] * w[1] + m[6] * w[2], m[1] * w[0] + m[4] * w[1] + m[7] * w[2], m[2] * w[0] + m[5] * w[1] + m[8] * w[2]] as [number, number, number];
    })();
    void view;
    expect(pixelIndex(d, 4096, 2048)).toBe(1024 * 4096 + 2048);
  });
});
