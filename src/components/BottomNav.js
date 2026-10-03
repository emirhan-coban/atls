import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Home, User } from 'lucide-react-native';

export default function BottomNav({ activeTab, onTabChange, t }) {
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: t ? t.navHome : 'Home' 
    },
    { 
      id: 'profile', 
      icon: User, 
      label: t ? t.navProfile : 'Profile' 
    },
  ];

  const handlePress = (id) => {
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
            (tab.id === 'profile' && (activeTab === 'profile' || activeTab === 'passport'));

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handlePress(tab.id)}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive,
              ]}
            >
              <Icon
                size={20}
                color={isActive ? '#5B4DFF' : '#94A3B8'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
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
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(91, 77, 255, 0.12)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#5B4DFF',
    fontWeight: '800',
  },
});
