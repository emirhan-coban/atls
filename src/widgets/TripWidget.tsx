import { HStack, Image, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  italic,
  kerning,
  lineLimit,
  minimumScaleFactor,
  padding,
  shapes,
  textCase,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { TripProps } from './widgetData';

/**
 * "Sonraki gezi" widget (small and medium): countdown to the next planned trip, with the checklist progress on medium.
 * Pure drawing: texts come in as props from `tripProps`.
 */
const TripWidget = (props: TripProps, environment: WidgetEnvironment) => {
  'widget';
  const dark = environment.colorScheme !== 'light';
  const gold = dark ? '#E5A93C' : '#A96C0B';
  const ink = dark ? '#FFFFFF' : '#1B1A17';
  const muted = dark ? 'rgba(255,255,255,0.66)' : 'rgba(27,26,23,0.66)';
  const onGold = dark ? '#090B0E' : '#FFFFFF';
  const chip = dark ? 'rgba(255,255,255,0.08)' : 'rgba(27,26,23,0.07)';
  const bg = dark
    ? { type: 'linearGradient' as const, colors: ['#18202C', '#0E1218', '#090B0E'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } }
    : { type: 'linearGradient' as const, colors: ['#FBF8F1', '#F4EEE1'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };
  const root = [containerBackground(bg, 'widget'), widgetURL(props.url)];

  const counting = props.kind === 'upcoming' || props.kind === 'ongoing';

  const eyebrow = (
    <Text modifiers={[font({ size: 9, weight: 'bold' }), kerning(1.2), textCase('uppercase'), foregroundStyle(gold), lineLimit(1)]}>
      {props.eyebrow}
    </Text>
  );

  const middle = counting ? (
    <HStack alignment="lastTextBaseline" spacing={4}>
      <Text modifiers={[font({ size: 54, design: 'serif' }), foregroundStyle(ink), lineLimit(1), minimumScaleFactor(0.6)]}>
        {String(props.days)}
      </Text>
      <Text modifiers={[font({ size: 19, design: 'serif' }), italic(), foregroundStyle(gold)]}>{props.unit}</Text>
    </HStack>
  ) : (
    <Text modifiers={[font({ size: 24, design: 'serif' }), foregroundStyle(ink), lineLimit(2), minimumScaleFactor(0.8)]}>
      {props.headline}
    </Text>
  );

  const nameBlock = (
    <VStack alignment="leading" spacing={2}>
      <Text modifiers={[font({ size: 20, design: 'serif' }), foregroundStyle(ink), lineLimit(1), minimumScaleFactor(0.7)]}>{props.country}</Text>
      <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1)]}>
        {props.kind === 'ongoing' ? props.range : props.dateLine}
      </Text>
    </VStack>
  );

  const pill = (text: string, icon?: string) => (
    <HStack spacing={5} modifiers={[padding({ horizontal: 11, vertical: 6 }), background(gold, shapes.capsule())]}>
      {icon ? <Image systemName={icon as 'airplane'} size={12} color={onGold} /> : null}
      <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(onGold), lineLimit(1)]}>{text}</Text>
    </HStack>
  );

  const bottom =
    props.kind === 'today' ? (
      <VStack alignment="leading" spacing={4}>
        {pill(props.cta, 'airplane')}
        <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1)]}>{props.country}</Text>
      </VStack>
    ) : props.kind === 'empty' ? (
      <VStack alignment="leading" spacing={4}>
        {pill(props.cta)}
        {props.suggestionLine ? (
          <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1), minimumScaleFactor(0.8)]}>
            {props.suggestionLine}
          </Text>
        ) : null}
      </VStack>
    ) : (
      nameBlock
    );

  const small = (
    <VStack alignment="leading" spacing={0} modifiers={root}>
      <HStack>
        {eyebrow}
        <Spacer />
        {props.flag ? <Text modifiers={[font({ size: 24 })]}>{props.flag}</Text> : null}
      </HStack>
      <Spacer />
      {middle}
      <Spacer />
      {bottom}
    </VStack>
  );

  if (environment.widgetFamily !== 'systemMedium' || !counting) return small;

  const cities = props.cities.map((c, i) => (
    <Text
      key={`c${i}`}
      modifiers={[
        font({ size: 11, weight: 'semibold' }),
        foregroundStyle(ink),
        lineLimit(1),
        padding({ horizontal: 9, vertical: 4 }),
        background(chip, shapes.capsule()),
      ]}
    >
      {c}
    </Text>
  ));

  return (
    <HStack spacing={16} modifiers={root}>
      <VStack alignment="leading" spacing={0} modifiers={[frame({ width: 140 })]}>
        <HStack spacing={4}>
          {eyebrow}
        </HStack>
        <Spacer />
        {middle}
        <Spacer />
        <HStack spacing={5}>
          <Text modifiers={[font({ size: 20, design: 'serif' }), foregroundStyle(ink), lineLimit(1), minimumScaleFactor(0.7)]}>{props.country}</Text>
          {props.flag ? <Text modifiers={[font({ size: 15 })]}>{props.flag}</Text> : null}
        </HStack>
        <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1)]}>{props.range}</Text>
      </VStack>
      <VStack alignment="leading" spacing={8} modifiers={[padding({ leading: 4 })]}>
        <HStack spacing={6}>{cities}</HStack>
        <Spacer />
        {props.total > 0 ? (
          <VStack alignment="leading" spacing={5}>
            <HStack>
              <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(ink)]}>{props.progressLabel}</Text>
              <Spacer />
              <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(gold)]}>{`${props.done} / ${props.total}`}</Text>
            </HStack>
            <ProgressView value={props.done / props.total} modifiers={[tint(gold)]} />
          </VStack>
        ) : null}
        {props.nextTask ? (
          <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(2)]}>{props.nextTask}</Text>
        ) : null}
      </VStack>
    </HStack>
  );
};

export default createWidget('TripWidget', TripWidget);
