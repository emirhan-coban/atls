import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Compass, Sparkles, Plus, Plane } from 'lucide-react-native';
import { theme } from '../theme';
import Button from './ui/Button';
import Heading from './ui/Heading';

interface EmptyStateProps {
  type?: 'passport' | 'wishlist' | 'search';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'passport',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const getIcon = () => {
    switch (type) {
      case 'wishlist':
        return <Sparkles size={32} color={colors.gold.base} />;
      case 'search':
        return <Compass size={32} color={colors.gold.base} />;
      default:
        return <Plane size={32} color={colors.gold.base} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{getIcon()}</View>
      <Heading style={styles.title}>{title}</Heading>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          size="md"
          icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.glass.fill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: fonts.display,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 20,
  },
}));
