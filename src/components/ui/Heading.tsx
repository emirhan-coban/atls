import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/typography';

interface HeadingProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  /** How many words at the end are set in the italic accent. 0 turns the accent off. Default 1. */
  accentWords?: number;
  numberOfLines?: number;
}

const HAS_LETTER = /\p{L}/u;

/** Splits a headline into the plain lead and the last `count` words that carry letters (trailing emoji or punctuation-only tokens stay plain). */
export function splitAccent(text: string, count = 1): { lead: string; accent: string; tail: string } | null {
  const tokens = text.split(' ');
  const wordIdx = tokens.map((t, i) => (HAS_LETTER.test(t) ? i : -1)).filter((i) => i >= 0);
  if (wordIdx.length < 2 || count < 1) return null;
  const start = wordIdx[Math.max(0, wordIdx.length - count)];
  const end = wordIdx[wordIdx.length - 1];
  return {
    lead: tokens.slice(0, start).join(' '),
    accent: tokens.slice(start, end + 1).join(' '),
    tail: tokens.slice(end + 1).join(' '),
  };
}

/**
 * Headline in Instrument Serif with the closing word in Instrument Serif Italic and the accent colour:
 * "Seyahat <i>Günlüğü</i>". One-word titles and non-text children are drawn unchanged.
 */
export default function Heading({ children, style, accentWords = 1, numberOfLines }: HeadingProps) {
  const { colors } = useTheme();
  const text = Array.isArray(children) && children.every((c) => typeof c === 'string') ? children.join('') : children;
  const parts = typeof text === 'string' ? splitAccent(text, accentWords) : null;

  if (!parts) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {children}
      </Text>
    );
  }
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.lead}
      {' '}
      <Text style={{ fontFamily: fonts.displayItalic, color: colors.gold.base }}>{parts.accent}</Text>
      {parts.tail ? ` ${parts.tail}` : ''}
    </Text>
  );
}
