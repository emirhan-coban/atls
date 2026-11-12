import { AccessoryWidgetBackground, Gauge, HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  gaugeStyle,
  kerning,
  lineLimit,
  minimumScaleFactor,
  padding,
  shapes,
  textCase,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { GameProps } from './widgetData';

/**
 * "Gizli Ülke" widget: home screen (small) and lock screen (circular, rectangular, inline).
 * The lock screen is tinted to one colour by the system, so state is told apart by shape and words, never by colour alone.
 * Pure drawing: texts and the state come in as props from `gameProps`.
 */
const GameWidget = (props: GameProps, environment: WidgetEnvironment) => {
  'widget';
  const family = environment.widgetFamily;

  if (family === 'accessoryInline') {
    return <Text modifiers={[widgetURL(props.url)]}>{props.inline}</Text>;
  }

  if (family === 'accessoryCircular') {
    return (
      <ZStack modifiers={[widgetURL(props.url)]}>
        <AccessoryWidgetBackground />
        <Gauge value={props.done ? 1 : 0} modifiers={[gaugeStyle('circularCapacity')]} currentValueLabel={<Text>{String(props.streak)}</Text>}>
          <Image systemName="flame.fill" />
        </Gauge>
      </ZStack>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[widgetURL(props.url)]}>
        <HStack spacing={4}>
          <Image systemName="flame.fill" size={12} />
          <Text modifiers={[font({ size: 12, weight: 'bold' }), lineLimit(1)]}>{props.lockTitle}</Text>
        </HStack>
        <Text modifiers={[font({ size: 14, weight: 'semibold' }), lineLimit(1), minimumScaleFactor(0.8)]}>{props.lockStatus}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle('rgba(255,255,255,0.7)'), lineLimit(1)]}>{props.lockSub}</Text>
      </VStack>
    );
  }

  // --- home screen, small ---
  const dark = environment.colorScheme !== 'light';
  const gold = dark ? '#E5A93C' : '#A96C0B';
  const amber = dark ? '#F59E0B' : '#B45309';
  const green = dark ? '#34D399' : '#047857';
  const ink = dark ? '#FFFFFF' : '#1B1A17';
  const muted = dark ? 'rgba(255,255,255,0.66)' : 'rgba(27,26,23,0.66)';
  const onGold = dark ? '#090B0E' : '#FFFFFF';
  const bg = dark
    ? { type: 'linearGradient' as const, colors: ['#18202C', '#0E1218', '#090B0E'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } }
    : { type: 'linearGradient' as const, colors: ['#FBF8F1', '#F4EEE1'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };

  const accent = props.state === 'risk' ? amber : props.state === 'won' ? green : props.state === 'lost' ? muted : gold;
  const label = props.state === 'risk' ? props.cta : props.eyebrow;
  const flameColor = props.state === 'lost' ? muted : accent;

  const header = (
    <HStack>
      <Text modifiers={[font({ size: 9, weight: 'bold' }), kerning(1.2), textCase('uppercase'), foregroundStyle(accent), lineLimit(1)]}>
        {label}
      </Text>
      <Spacer />
      {props.state === 'won' ? <Image systemName="checkmark.circle.fill" size={18} color={green} /> : null}
      {props.state === 'lost' ? <Image systemName="xmark.circle.fill" size={18} color={muted} /> : null}
    </HStack>
  );

  const middle =
    props.state === 'won' ? (
      <Text modifiers={[font({ size: 50, design: 'serif' }), foregroundStyle(ink)]}>{props.score}</Text>
    ) : props.state === 'lost' ? (
      <Text modifiers={[font({ size: 24, design: 'serif' }), foregroundStyle(ink), lineLimit(2), minimumScaleFactor(0.8)]}>{props.headline}</Text>
    ) : (
      <HStack spacing={6}>
        <Image systemName="flame.fill" size={32} color={flameColor} />
        <Text modifiers={[font({ size: 54, design: 'serif' }), foregroundStyle(ink)]}>{String(props.streak)}</Text>
      </HStack>
    );

  const bottom =
    props.state === 'unplayed' ? (
      <Text
        modifiers={[
          font({ size: 12, weight: 'bold' }),
          foregroundStyle(onGold),
          padding({ horizontal: 11, vertical: 6 }),
          background(gold, shapes.capsule()),
        ]}
      >
        {`${props.cta} →`}
      </Text>
    ) : (
      <VStack alignment="leading" spacing={2}>
        {props.state === 'lost' ? null : (
          <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(ink), lineLimit(2), minimumScaleFactor(0.8)]}>
            {props.headline}
          </Text>
        )}
        <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1)]}>{props.sub}</Text>
      </VStack>
    );

  return (
    <VStack alignment="leading" spacing={0} modifiers={[containerBackground(bg, 'widget'), widgetURL(props.url)]}>
      {header}
      <Spacer />
      {middle}
      <Spacer />
      {bottom}
    </VStack>
  );
};

export default createWidget('GameWidget', GameWidget);
