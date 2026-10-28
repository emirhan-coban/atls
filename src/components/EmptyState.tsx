import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Compass, Sparkles, Plus, Plane, MapPin } from 'lucide-react-native';
import { theme } from '../theme';

interface EmptyStateProps {
  type?: 'passport' | 'wishlist' | 'search' | 'stamps';
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
  const getIcon = () => {
    switch (type) {
      case 'wishlist':
        return <Sparkles size={32} color="#F59E0B" />;
      case 'search':
        return <Compass size={32} color="#6366F1" />;
      case 'stamps':
        return <MapPin size={32} color="#10B981" />;
      default:
        return <Plane size={32} color="#4F46E5" />;
    }
  };

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAction) onAction();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{getIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleAction}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.black,
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
  },
});
