import React from 'react';
import Svg, { Circle, Ellipse, G, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { getStampStyle } from '../utils/stamp';
import { CountryStatus } from '../stores/types';

interface StampViewProps {
  countryId: string;
  /** Short name shown on the top of the stamp (already localised). */
  title: string;
  /** Short date text, for example "Nis 2025". */
  dateText: string;
  status?: CountryStatus;
  size?: number;
  /** Changes the look for repeat visits to the same country. */
  salt?: string;
  /** Apply the stamp's own tilt (off when an animation controls rotation). */
  tilted?: boolean;
}

const SIZE = 200;
const C = SIZE / 2;

/** A passport-style stamp: shape, tilt and texture are derived from the country so each one is recognisable. */
function StampView({ countryId, title, dateText, status = 'visited', size = 120, salt = '', tilted = true }: StampViewProps) {
  const { colors } = useTheme();
  const style = getStampStyle(countryId, salt);
  const ink = status === 'lived' ? colors.status.lived.color : status === 'want' ? colors.gold.base : colors.status.visited.color;
  const dash = style.worn ? '9 5' : undefined;
  const rotation = tilted ? style.rotation : 0;
  const code = countryId.toUpperCase();
  const label = title.length > 16 ? `${title.slice(0, 15)}…` : title;

  const outline = (inset: number, strokeWidth: number, dashed?: string) => {
    const props = { stroke: ink, strokeWidth, fill: 'none', strokeDasharray: dashed } as const;
    const r = C - inset;
    switch (style.shape) {
      case 'circle':
        return <Circle cx={C} cy={C} r={r} {...props} />;
      case 'oval':
        return <Ellipse cx={C} cy={C} rx={r} ry={r * 0.78} {...props} />;
      case 'rounded':
        return <Rect x={inset} y={inset + 20} width={SIZE - inset * 2} height={SIZE - inset * 2 - 40} rx={24} {...props} />;
      case 'octagon': {
        const k = r * 0.41;
        const pts = [
          [C - k, C - r], [C + k, C - r], [C + r, C - k], [C + r, C + k],
          [C + k, C + r], [C - k, C + r], [C - r, C + k], [C - r, C - k],
        ]
          .map((p) => p.join(','))
          .join(' ');
        return <Polygon points={pts} {...props} />;
      }
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <G opacity={0.92}>
        {outline(8, 5, dash)}
        {style.doubleBorder && outline(20, 2)}
        <SvgText x={C} y={C - 28} fontSize={17} fontWeight="800" fill={ink} textAnchor="middle" letterSpacing={1.5}>
          {label.toUpperCase()}
        </SvgText>
        <SvgText x={C} y={C + 22} fontSize={54} fontWeight="900" fill={ink} textAnchor="middle" letterSpacing={2}>
          {code}
        </SvgText>
        <SvgText x={C} y={C + 52} fontSize={15} fontWeight="700" fill={ink} textAnchor="middle" letterSpacing={1}>
          {dateText.toUpperCase()}
        </SvgText>
      </G>
    </Svg>
  );
}

export default React.memo(StampView);
