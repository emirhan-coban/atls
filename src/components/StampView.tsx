import React from 'react';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { useAppStore } from '../stores/useAppStore';
import { availableCatalog } from '../data/travelData';
import { CountryStatus } from '../stores/types';

interface StampViewProps {
  countryId: string;
  /** Country name shown on the stamp (already localised). */
  title: string;
  /** Short date text, for example "Nis 2025". */
  dateText: string;
  status?: CountryStatus;
  /** Width in points; the stamp is twice as wide as it is tall. */
  size?: number;
}

const W = 240;
const H = 120;
const MONO = 'Menlo';

/** Country-name size so the name fits the left panel (136 units wide); Instrument Serif averages about 0.43 em per letter. */
const nameSize = (name: string) => Math.round(Math.min(38, 136 / (Math.max(name.length, 1) * 0.43)));

/**
 * Entry ticket: a perforated stub with the flag, the country name and date on the left and the country code and year on
 * the right. One flat design for every country; colour is the only thing that varies (visited / lived).
 */
function StampView({ countryId, title, dateText, status = 'visited', size = 156 }: StampViewProps) {
  const { colors } = useTheme();
  const lang = useAppStore((s) => s.currentLang);
  const ink = status === 'lived' ? colors.status.lived.color : status === 'want' ? colors.gold.base : colors.status.visited.color;
  const code = countryId.toUpperCase();
  const flag = availableCatalog.find((c) => c.id.toUpperCase() === code)?.flag ?? '';
  const name = title.length > 16 ? `${title.slice(0, 15)}…` : title;
  const kind = status === 'lived' ? (lang === 'tr' ? 'İKAMET' : 'RESIDENCE') : lang === 'tr' ? 'GİRİŞ' : 'ENTRY';
  const year = (dateText.match(/\d{4}/) || [''])[0];

  return (
    <Svg width={size} height={size / 2} viewBox={`0 0 ${W} ${H}`}>
      <G opacity={0.95}>
        <Path d="M8 6 H232 V48 a10 10 0 0 0 0 24 V114 H8 V72 a10 10 0 0 0 0 -24 Z" fill="none" stroke={ink} strokeWidth={3} />
        <Line x1={168} y1={14} x2={168} y2={106} stroke={ink} strokeWidth={1.5} strokeDasharray="4 4" />
        {flag ? (
          <SvgText x={24} y={44} fontSize={26}>
            {flag}
          </SvgText>
        ) : null}
        <SvgText x={62} y={36} fontSize={10} fontFamily={MONO} fontWeight="600" letterSpacing={2} fill={ink}>
          {kind}
        </SvgText>
        <SvgText x={24} y={80} fontSize={nameSize(name)} fontFamily={fonts.display} fill={ink}>
          {name}
        </SvgText>
        <SvgText x={24} y={102} fontSize={11} fontFamily={MONO} fontWeight="600" letterSpacing={1.5} fill={ink}>
          {dateText.toUpperCase()}
        </SvgText>
        <SvgText x={200} y={64} fontSize={36} fontFamily={fonts.display} fill={ink} textAnchor="middle">
          {code}
        </SvgText>
        {year ? (
          <SvgText x={200} y={86} fontSize={9} fontFamily={MONO} fontWeight="600" letterSpacing={1.5} fill={ink} textAnchor="middle">
            {year}
          </SvgText>
        ) : null}
      </G>
    </Svg>
  );
}

export default React.memo(StampView);
