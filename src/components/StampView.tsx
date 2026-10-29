import React from 'react';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { CountryStatus } from '../stores/types';

interface StampViewProps {
  countryId: string;
  /** Short name shown on the top of the stamp (already localised). */
  title: string;
  /** Short date text, for example "Nis 2025". */
  dateText: string;
  status?: CountryStatus;
  size?: number;
}

const W = 200;
const H = 200;

/**
 * Entry stamp: one flat design for every country, like a passport page. A single-colour frame, the country name on top,
 * the country code in the display face, and the date below a rule. Colour is the only thing that varies (visited / lived).
 */
function StampView({ countryId, title, dateText, status = 'visited', size = 120 }: StampViewProps) {
  const { colors } = useTheme();
  const ink = status === 'lived' ? colors.status.lived.color : status === 'want' ? colors.gold.base : colors.status.visited.color;
  const code = countryId.toUpperCase();
  const label = title.length > 18 ? `${title.slice(0, 17)}…` : title;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${W} ${H}`}>
      <G opacity={0.95}>
        <Rect x={10} y={30} width={W - 20} height={H - 60} rx={14} stroke={ink} strokeWidth={4} fill="none" />
        <SvgText x={W / 2} y={62} fontSize={15} fontWeight="700" fill={ink} textAnchor="middle" letterSpacing={2}>
          {label.toUpperCase()}
        </SvgText>
        <SvgText x={W / 2} y={118} fontSize={62} fill={ink} textAnchor="middle" fontFamily={fonts.display}>
          {code}
        </SvgText>
        <Line x1={34} y1={134} x2={W - 34} y2={134} stroke={ink} strokeWidth={2} />
        <SvgText x={W / 2} y={158} fontSize={14} fontWeight="700" fill={ink} textAnchor="middle" letterSpacing={1.5}>
          {dateText.toUpperCase()}
        </SvgText>
      </G>
    </Svg>
  );
}

export default React.memo(StampView);
