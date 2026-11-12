import { HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
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
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { PassportProps } from './widgetData';

/**
 * Home screen "Pasaport" widget (small and medium). Pure drawing: every number and text comes in as props from
 * `passportProps`. Widgets run in an isolated runtime, so constants live inside the function.
 */
const PassportWidget = (props: PassportProps, environment: WidgetEnvironment) => {
  'widget';
  const dark = environment.colorScheme !== 'light';
  const gold = dark ? '#E5A93C' : '#A96C0B';
  const ink = dark ? '#FFFFFF' : '#1B1A17';
  const muted = dark ? 'rgba(255,255,255,0.64)' : 'rgba(27,26,23,0.66)';
  const tile = dark ? 'rgba(255,255,255,0.07)' : 'rgba(27,26,23,0.06)';
  const bg = dark
    ? { type: 'linearGradient' as const, colors: ['#18202C', '#0E1218', '#090B0E'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } }
    : { type: 'linearGradient' as const, colors: ['#FBF8F1', '#F4EEE1'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };

  const brand = (
    <HStack spacing={0}>
      <Text modifiers={[font({ size: 17, design: 'serif' }), foregroundStyle(ink)]}>atls</Text>
      <Text modifiers={[font({ size: 17, design: 'serif' }), foregroundStyle(gold)]}>.</Text>
    </HStack>
  );

  const figure = (
    <VStack alignment="leading" spacing={2}>
      <Text modifiers={[font({ size: 9, weight: 'bold' }), kerning(1.2), foregroundStyle(gold)]}>{props.eyebrow}</Text>
      <HStack alignment="lastTextBaseline" spacing={4}>
        <Text modifiers={[font({ size: 54, weight: 'regular', design: 'serif' }), foregroundStyle(ink), lineLimit(1), minimumScaleFactor(0.6)]}>
          {String(props.count)}
        </Text>
        <Text modifiers={[font({ size: 19, design: 'serif' }), italic(), foregroundStyle(gold)]}>{props.unit}</Text>
      </HStack>
    </VStack>
  );

  const progress = (
    <VStack alignment="leading" spacing={5}>
      <ProgressView value={props.percent / 100} modifiers={[tint(gold)]} />
      <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(muted), lineLimit(1), minimumScaleFactor(0.8)]}>
        {props.worldLine}
      </Text>
    </VStack>
  );

  const root = [containerBackground(bg, 'widget'), widgetURL(props.url)];

  if (environment.widgetFamily === 'systemMedium') {
    const flagCell = (flag: string, key: string) => (
      <Text
        key={key}
        modifiers={[
          font({ size: 27 }),
          frame({ width: 52, height: 46 }),
          background(tile, shapes.roundedRectangle({ cornerRadius: 12 })),
        ]}
      >
        {flag}
      </Text>
    );
    const flags = props.flags;
    return (
      <HStack spacing={18} modifiers={root}>
        <VStack alignment="leading" spacing={0} modifiers={[frame({ width: 132 })]}>
          {brand}
          <Spacer />
          {figure}
          <Spacer minLength={6} />
          {progress}
        </VStack>
        <VStack alignment="leading" spacing={8}>
          <Text modifiers={[font({ size: 9, weight: 'bold' }), kerning(1.2), foregroundStyle(gold)]}>{props.recentLabel}</Text>
          <HStack spacing={6}>{flags.slice(0, 3).map((f, i) => flagCell(f, `a${i}`))}</HStack>
          <HStack spacing={6}>{flags.slice(3, 6).map((f, i) => flagCell(f, `b${i}`))}</HStack>
          <Spacer />
          <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(muted), lineLimit(1), padding({ top: 0 })]}>
            {props.metaLine}
          </Text>
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={0} modifiers={root}>
      {brand}
      <Spacer />
      {figure}
      <Spacer minLength={6} />
      {progress}
    </VStack>
  );
};

export default createWidget('PassportWidget', PassportWidget);
