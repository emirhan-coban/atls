import { useEffect, useMemo, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { Canvas, Group, Path } from '@shopify/react-native-skia';
import { getMapShapes, loadMapShapes, mergeByColor, MapShape } from '../../utils/mapShapes';
import { worldBounds } from '../../data/worldMapPaths';
import { Country } from '../../stores/types';
import { useTheme } from '../../theme/ThemeContext';

/** Small flat world map for the stats tab: land in one colour, each marked country in its status colour. */
export function PassportMiniMap({ countries }: { countries: Country[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [shapes, setShapes] = useState<MapShape[] | null>(getMapShapes());

  useEffect(() => {
    if (shapes) return;
    let alive = true;
    loadMapShapes().then((s) => alive && setShapes(s)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [shapes]);

  const groups = useMemo(() => {
    if (!shapes) return null;
    const colorById = new Map<string, string>();
    for (const c of countries) {
      colorById.set(c.id, c.status === 'visited' ? colors.status.visited.color : c.status === 'lived' ? colors.status.lived.color : colors.gold.base);
    }
    return mergeByColor(shapes, (id) => colorById.get(id) ?? colors.map.land);
  }, [shapes, countries, colors]);

  const scale = width / worldBounds.width;
  const height = worldBounds.height * scale;

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%', height: height || 120 }}>
      {groups && width > 0 ? (
        <Canvas style={{ width, height }}>
          <Group transform={[{ scale }]}>
            {Array.from(groups.entries()).map(([color, path]) => (
              <Path key={color} path={path} color={color} />
            ))}
          </Group>
        </Canvas>
      ) : null}
    </View>
  );
}
