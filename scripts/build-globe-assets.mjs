#!/usr/bin/env node
/**
 * Builds the bundled textures for the Home globe into assets/globe/. Run: node scripts/build-globe-assets.mjs
 * (macOS only: image resizing/re-encoding uses `sips`.)
 *
 * Sources (fetched at build time only; the app never touches the network for these):
 *  - NASA Blue Marble "land & oceans" via Wikimedia Commons, File:Whole_world_-_land_and_oceans.jpg
 *    (public domain, NASA Goddard Space Flight Center)
 *  - NASA "Earth at night" city lights, earth_lights_2048.png from the three.js examples repo
 *    (NASA imagery, public domain; the repo itself is MIT)
 *  - Natural Earth 50m borders through the world-atlas package (public domain) for the country ID map
 *  - mledoze/countries (ODbL) for numeric ISO -> alpha-2, same as scripts/build-world-map.mjs
 *
 * Outputs:
 *  earth-day.jpg        4096x2048 (resampled from the largest thumbnail Commons serves)
 *  earth-day-small.jpg  1024x512, shown at once while the big one decodes
 *  earth-night.jpg      2048x1024
 *  country-id.png       4096x2048, R = country index (1..N, 0 = sea), G = B = 0, A = 255, no antialiasing
 *  country-index.json   { countries: { [index]: { iso2, labelLon, labelLat } }, names: [{ id, iso2, name, nameTr }] }
 *
 * The ID map is rasterised here with an even-odd scanline fill, so there are no blended border pixels and
 * the app can sample it with nearest filtering and no vote.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoCentroid, geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets/globe');
const work = join(tmpdir(), 'atls-globe-build');
mkdirSync(outDir, { recursive: true });
mkdirSync(work, { recursive: true });
const UA = 'atls-app-data-build/1.0 (contact: emirhancob4n@gmail.com)';

const W = 4096;
const H = 2048;

async function download(url, file) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}
const sips = (...args) => execFileSync('sips', args, { stdio: 'pipe' });

// --- textures -------------------------------------------------------------------------------------
const dayRaw = join(work, 'day.jpg');
const nightRaw = join(work, 'night.png');
await download('https://commons.wikimedia.org/wiki/Special:FilePath/Whole_world_-_land_and_oceans.jpg?width=4096', dayRaw);
await download('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png', nightRaw);

const jpeg = ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80'];
sips('-z', String(H), String(W), dayRaw, ...jpeg, '--out', join(outDir, 'earth-day.jpg'));
sips('-z', '512', '1024', dayRaw, ...jpeg, '--out', join(outDir, 'earth-day-small.jpg'));
sips('-z', '1024', '2048', nightRaw, ...jpeg, '--out', join(outDir, 'earth-night.jpg'));

// --- country ID map -------------------------------------------------------------------------------
const topo = require('world-atlas/countries-50m.json');
const dataset = await (await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json')).json();
const numericToAlpha2 = new Map(dataset.map((c) => [String(Number(c.ccn3)), c.cca2]));
// Kosovo has no numeric code; the two de facto states are folded into the country that claims them.
const BY_NAME = { Kosovo: 'XK', Somaliland: 'SO', 'N. Cyprus': 'CY' };
const SKIP = new Set(['Antarctica', 'Fr. S. Antarctic Lands', 'Indian Ocean Ter.', 'Siachen Glacier']);

const catalogSrc = readFileSync(join(root, 'src/data/travelData.ts'), 'utf8');
const catalog = new Map(
  [...catalogSrc.matchAll(/"id": "([A-Z]{2})",\s*"name": "([^"]+)",\s*"nameTr": "([^"]+)"/g)].map((m) => [m[1], { name: m[2], nameTr: m[3] }])
);

const features = feature(topo, topo.objects.countries).features.filter((f) => !SKIP.has(f.properties.name));
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]).precision(0.1);

// group features by alpha-2 so merged territories share one id
const byIso = new Map();
for (const f of features) {
  const iso = f.id !== undefined ? numericToAlpha2.get(String(Number(f.id))) : BY_NAME[f.properties.name];
  if (!iso) {
    console.warn('unmatched:', f.properties.name);
    continue;
  }
  if (!byIso.has(iso)) byIso.set(iso, []);
  byIso.get(iso).push(f);
}
// Catalog nations missing from the 50m dataset: drawn as a minimum dot at this point (lon, lat)
const EXTRA_POINTS = { TV: [179.2, -8.52] };
for (const iso of Object.keys(EXTRA_POINTS)) if (!byIso.has(iso)) byIso.set(iso, []);
const isos = [...byIso.keys()].sort();
if (isos.length > 254) throw new Error(`${isos.length} countries do not fit in one 8-bit channel`);
const idOf = new Map(isos.map((iso, i) => [iso, i + 1]));

/** Rings in pixel space, collected through the path context so d3 does the antimeridian clipping. */
function rings(f) {
  const out = [];
  let cur = null;
  const ctx = {
    moveTo: (x, y) => { cur = [[x, y]]; },
    lineTo: (x, y) => { cur.push([x, y]); },
    closePath: () => { if (cur && cur.length > 2) out.push(cur); cur = null; },
    arc() {}, rect() {}, bezierCurveTo() {}, quadraticCurveTo() {},
  };
  geoPath(projection, ctx)(f);
  return out;
}

const ids = new Uint8Array(W * H);
const fillCount = new Map();

/** Even-odd scanline fill, sampled at pixel centres, no antialiasing. */
function fill(polys, id) {
  let count = 0;
  let minY = Infinity, maxY = -Infinity;
  for (const r of polys) for (const [, y] of r) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(H - 1, Math.ceil(maxY));
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    const xs = [];
    for (const r of polys) {
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const [xa, ya] = r[j], [xb, yb] = r[i];
        if ((ya <= yc && yb > yc) || (yb <= yc && ya > yc)) xs.push(xa + ((yc - ya) / (yb - ya)) * (xb - xa));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k] - 0.5)), xb = Math.min(W - 1, Math.ceil(xs[k + 1] - 0.5) - 1);
      for (let x = xa; x <= xb; x++) { ids[y * W + x] = id; count++; }
    }
  }
  fillCount.set(id, (fillCount.get(id) || 0) + count);
}

// Label point = centroid of the largest part of the country
const labels = new Map();
for (const iso of isos) {
  if (EXTRA_POINTS[iso] && byIso.get(iso).length === 0) {
    const [labelLon, labelLat] = EXTRA_POINTS[iso];
    labels.set(iso, { labelLon, labelLat, area: 0 });
    continue;
  }
  let best = null, bestArea = -1;
  for (const f of byIso.get(iso)) {
    const parts = f.geometry.type === 'MultiPolygon'
      ? f.geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }))
      : [f.geometry];
    for (const p of parts) {
      const a = geoArea(p);
      if (a > bestArea) { bestArea = a; best = p; }
    }
  }
  const [lon, lat] = geoCentroid(best);
  labels.set(iso, { labelLon: +lon.toFixed(3), labelLat: +lat.toFixed(3), area: bestArea });
}

// Large first, so a small country inside a bigger bounding area is never overwritten
const order = [...isos].sort((a, b) => {
  const area = (iso) => byIso.get(iso).reduce((s, f) => s + geoArea(f), 0);
  return area(b) - area(a);
});
for (const iso of order) fill(byIso.get(iso).flatMap(rings), idOf.get(iso));

// Nations too small to cover a pixel get a minimum dot at their label point
const dotted = [];
for (const iso of isos) {
  const id = idOf.get(iso);
  if ((fillCount.get(id) || 0) >= 4) continue;
  const { labelLon, labelLat } = labels.get(iso);
  const [px, py] = projection([labelLon, labelLat]);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = Math.round(px) + dx, y = Math.round(py) + dy;
    if (x >= 0 && x < W && y >= 0 && y < H) ids[y * W + x] = id;
  }
  dotted.push(iso);
}

const rgba = new PNG({ width: W, height: H });
for (let i = 0; i < W * H; i++) {
  rgba.data[i * 4] = ids[i];
  rgba.data[i * 4 + 1] = 0;
  rgba.data[i * 4 + 2] = 0;
  rgba.data[i * 4 + 3] = 255;
}
writeFileSync(join(outDir, 'country-id.png'), PNG.sync.write(rgba, { colorType: 6, filterType: 0 }));

const countries = {};
const names = [];
for (const iso of isos) {
  const id = idOf.get(iso);
  const { labelLon, labelLat } = labels.get(iso);
  countries[id] = { iso2: iso, labelLon, labelLat };
  const cat = catalog.get(iso);
  const first = byIso.get(iso)[0]?.properties.name ?? iso;
  names.push({ id, iso2: iso, name: cat?.name ?? first, nameTr: cat?.nameTr ?? first, inCatalog: Boolean(cat) });
}
names.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(outDir, 'country-index.json'), JSON.stringify({ countries, names }));

const missing = [...catalog.keys()].filter((iso) => !idOf.has(iso));
console.log(`countries: ${isos.length}`);
console.log(`drawn as a minimum dot: ${dotted.join(', ') || 'none'}`);
console.log(`catalog countries without a shape: ${missing.join(', ') || 'none'}`);
