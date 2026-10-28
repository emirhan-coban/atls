import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Home, Compass, User } from 'lucide-react-native';
import { theme } from '../theme';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  t?: Record<string, string>;
}

export default function BottomNav({ activeTab, onTabChange, t }: BottomNavProps) {
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: t ? t.navHome : 'Home',
      activeColor: '#3B82F6',
      activeBg: 'rgba(59, 130, 246, 0.16)',
      glowBorder: 'rgba(59, 130, 246, 0.35)',
    },
    { 
      id: 'explore', 
      icon: Compass, 
      label: t ? t.navExplore : 'Explore',
      activeColor: '#FF6B35',
      activeBg: 'rgba(255, 107, 53, 0.16)',
      glowBorder: 'rgba(255, 107, 53, 0.35)',
    },
    { 
      id: 'profile', 
      icon: User, 
      label: t ? (t.navPassport || t.navProfile) : 'Passport',
      activeColor: '#E2F952',
      activeBg: 'rgba(226, 249, 82, 0.14)',
      glowBorder: 'rgba(226, 249, 82, 0.35)',
    },
  ];

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(id);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.dock}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = 
            (tab.id === 'home' && activeTab === 'home') ||
            (tab.id === 'explore' && activeTab === 'explore') ||
            (tab.id === 'profile' && (activeTab === 'profile' || activeTab === 'passport'));

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handlePress(tab.id)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              style={[
                styles.tabButton,
                isActive && { 
                  backgroundColor: tab.activeBg,
                  borderWidth: 1,
                  borderColor: tab.glowBorder,
                },
              ]}
            >
              <Icon
                size={18}
                color={isActive ? tab.activeColor : '#64748B'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && { color: tab.activeColor, fontWeight: '800' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.88)',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.2,
  },
});
