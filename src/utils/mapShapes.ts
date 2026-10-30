import { Skia, SkPath, SkPathBuilder } from '@shopify/react-native-skia';
import { worldMapFeatures } from '../data/worldMapPaths';

export interface MapShape {
  id: string;
  path: SkPath;
}

let cache: MapShape[] | null = null;
let pending: Promise<MapShape[]> | null = null;

/** Shapes already built, or null when they still have to be prepared. */
export const getMapShapes = () => cache;

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Turns the SVG path strings into Skia paths once and keeps them for the rest of the session.
 * Work is done in small batches with a pause between them, so the interface stays responsive while it runs.
 */
export function loadMapShapes(): Promise<MapShape[]> {
  if (cache) return Promise.resolve(cache);
  if (pending) return pending;
  pending = (async () => {
    const shapes: MapShape[] = [];
    for (let i = 0; i < worldMapFeatures.length; i++) {
      const path = Skia.Path.MakeFromSVGString(worldMapFeatures[i].d);
      if (path) shapes.push({ id: worldMapFeatures[i].id, path });
      if (i % 30 === 29) await tick();
    }
    cache = shapes;
    return shapes;
  })();
  return pending;
}

/** Starts preparing the shapes in the background, for example right after the app has opened. */
export const warmMapShapes = () => {
  loadMapShapes().catch(() => {});
};

/** The id of the country under a map point, or null for open sea. */
export function shapeAt(shapes: MapShape[], x: number, y: number): string | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].path.contains(x, y)) return shapes[i].id;
  }
  return null;
}

/** One path per fill colour, so the whole map is drawn with a handful of draw calls. */
export function mergeByColor(shapes: MapShape[], colorOf: (id: string) => string): Map<string, SkPath> {
  const builders = new Map<string, SkPathBuilder>();
  for (const shape of shapes) {
    const color = colorOf(shape.id);
    let builder = builders.get(color);
    if (!builder) {
      builder = Skia.PathBuilder.Make();
      builders.set(color, builder);
    }
    builder.addPath(shape.path);
  }
  const groups = new Map<string, SkPath>();
  builders.forEach((builder, color) => groups.set(color, builder.build()));
  return groups;
}

/** All borders as one path. */
export function mergeAll(shapes: MapShape[]): SkPath {
  const builder = Skia.PathBuilder.Make();
  for (const shape of shapes) builder.addPath(shape.path);
  return builder.build();
}
