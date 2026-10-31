/**
 * Sphere maths for the Home globe. Pure functions, shared by the shader uniforms (UI thread),
 * the tap picker (JS thread) and the later overlay layers (routes, share card).
 *
 * Conventions (same as three.js SphereGeometry, so the equirectangular textures line up):
 *  - local direction of (lon, lat): (cos lon cos lat, sin lat, -sin lon cos lat)
 *  - u = fract(atan2(z, -x) / 2π + 1), v = acos(y) / π
 *  - view space: x right, y up, +z toward the camera; the screen y axis points down
 *  - model matrix M = Rx(tiltX) · Rz(AXIAL_TILT) · Ry(spinY), world = M · local
 */

export const AXIAL_TILT = -0.409;
export const PITCH_LIMIT = 1.2;
const TWO_PI = Math.PI * 2;

export type Vec3 = [number, number, number];
export type Mat3 = [number, number, number, number, number, number, number, number, number]; // row-major

/** Wraps an angle to (-π, π]. */
export function wrapAngle(a: number): number {
  'worklet';
  const r = a - TWO_PI * Math.floor((a + Math.PI) / TWO_PI);
  return r === -Math.PI ? Math.PI : r;
}

/** Signed shortest rotation from `from` to `to`. */
export function shortestDelta(from: number, to: number): number {
  'worklet';
  return wrapAngle(to - from);
}

export function clamp(v: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
}

export function lonLatToDir(lon: number, lat: number): Vec3 {
  'worklet';
  const c = Math.cos(lat);
  return [Math.cos(lon) * c, Math.sin(lat), -Math.sin(lon) * c];
}

export function dirToLonLat(d: Vec3): { lon: number; lat: number } {
  'worklet';
  return { lon: Math.atan2(-d[2], d[0]), lat: Math.asin(clamp(d[1], -1, 1)) };
}

/** Texture coordinates (0..1) of a local direction. */
export function dirToUv(d: Vec3): { u: number; v: number } {
  'worklet';
  const u = Math.atan2(d[2], -d[0]) / TWO_PI + 1;
  return { u: u - Math.floor(u), v: Math.acos(clamp(d[1], -1, 1)) / Math.PI };
}

/** M = Rx(tiltX) · Rz(AXIAL_TILT) · Ry(spinY), row-major. */
export function modelMatrix(spinY: number, tiltX: number): Mat3 {
  'worklet';
  const cy = Math.cos(spinY), sy = Math.sin(spinY);
  const cz = Math.cos(AXIAL_TILT), sz = Math.sin(AXIAL_TILT);
  const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
  // Rz · Ry
  const a = [cz * cy, -sz, cz * sy, sz * cy, cz, sz * sy, -sy, 0, cy];
  // Rx · (Rz · Ry)
  return [
    a[0], a[1], a[2],
    cx * a[3] - sx * a[6], cx * a[4] - sx * a[7], cx * a[5] - sx * a[8],
    sx * a[3] + cx * a[6], sx * a[4] + cx * a[7], sx * a[5] + cx * a[8],
  ];
}

/** Inverse of a rotation matrix is its transpose; returned column-major, ready for a float3x3 uniform. */
export function toLocalUniform(spinY: number, tiltX: number): number[] {
  'worklet';
  const m = modelMatrix(spinY, tiltX);
  // toLocal = Mᵀ. Column-major storage of Mᵀ is the row-major storage of M.
  return [m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]];
}

export function mulVec(m: Mat3, v: Vec3): Vec3 {
  'worklet';
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

export function mulVecT(m: Mat3, v: Vec3): Vec3 {
  'worklet';
  return [
    m[0] * v[0] + m[3] * v[1] + m[6] * v[2],
    m[1] * v[0] + m[4] * v[1] + m[7] * v[2],
    m[2] * v[0] + m[5] * v[1] + m[8] * v[2],
  ];
}

export interface GlobeView {
  spinY: number;
  tiltX: number;
  cx: number;
  cy: number;
  radius: number;
}

/** Screen point of a lon/lat (radians), and whether it is on the visible hemisphere. */
export function lonLatToScreen(lon: number, lat: number, view: GlobeView): { x: number; y: number; visible: boolean } {
  'worklet';
  const w = mulVec(modelMatrix(view.spinY, view.tiltX), lonLatToDir(lon, lat));
  return { x: view.cx + w[0] * view.radius, y: view.cy - w[1] * view.radius, visible: w[2] > 0 };
}

/** Local direction under a screen point, or null outside the disc. */
export function screenToLocalDir(x: number, y: number, view: GlobeView): Vec3 | null {
  'worklet';
  const px = (x - view.cx) / view.radius;
  const py = (y - view.cy) / view.radius;
  const r2 = px * px + py * py;
  if (r2 > 1) return null;
  return mulVecT(modelMatrix(view.spinY, view.tiltX), [px, -py, Math.sqrt(1 - r2)]);
}

export function screenToLonLat(x: number, y: number, view: GlobeView): { lon: number; lat: number } | null {
  'worklet';
  const d = screenToLocalDir(x, y, view);
  return d ? dirToLonLat(d) : null;
}

/** Index into a W×H equirectangular raster for a local direction (same sampling the shader does). */
export function pixelIndex(d: Vec3, width: number, height: number): number {
  'worklet';
  const { u, v } = dirToUv(d);
  const px = Math.min(width - 1, Math.floor(u * width));
  const py = Math.min(height - 1, Math.floor(v * height));
  return py * width + px;
}

/**
 * Rotation that puts lon/lat on +z (facing the camera). The axial tilt is part of the model, so the
 * pitch is solved from the latitude: sin(tilt) = sin(lat) / cos(AXIAL_TILT). Beyond the pitch limit the
 * point is brought as close to the centre as the clamp allows.
 */
export function solveFlyTo(lon: number, lat: number): { spinY: number; tiltX: number } {
  'worklet';
  const sinT = clamp(Math.sin(lat) / Math.cos(AXIAL_TILT), -Math.sin(PITCH_LIMIT), Math.sin(PITCH_LIMIT));
  const tiltX = Math.asin(sinT);
  // q = Rz(-AXIAL_TILT) · (0, sin t, cos t): where the point must be after Ry(spin)
  const qx = sinT * Math.sin(AXIAL_TILT);
  const qz = Math.cos(tiltX);
  const d = lonLatToDir(lon, lat);
  const spinY = Math.atan2(qx, qz) - Math.atan2(d[0], d[2]);
  return { spinY: wrapAngle(spinY), tiltX };
}
