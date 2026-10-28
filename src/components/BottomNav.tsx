import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Home, Compass, User } from 'lucide-react-native';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  t?: Record<string, string>;
}

function BottomNav({ activeTab, onTabChange, t }: BottomNavProps) {
  // Optimistic tab state for instantaneous visual reaction without waiting for parent tree re-render
  const [selectedTab, setSelectedTab] = useState(activeTab);

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: t ? t.navHome : 'Home',
    },
    { 
      id: 'explore', 
      icon: Compass, 
      label: t ? t.navExplore : 'Explore',
    },
    { 
      id: 'profile', 
      icon: User, 
      label: t ? (t.navPassport || t.navProfile) : 'Passport',
    },
  ];

  const handlePress = (id: string) => {
    setSelectedTab(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(id);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.dockOuter}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 45 : 80}
          tint="dark"
          style={styles.blurContainer}
        >
          <View style={styles.dockInner}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = 
                (tab.id === 'home' && selectedTab === 'home') ||
                (tab.id === 'explore' && selectedTab === 'explore') ||
                (tab.id === 'profile' && (selectedTab === 'profile' || selectedTab === 'passport'));

              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => handlePress(tab.id)}
                  delayPressIn={0}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                  ]}
                >
                  <Icon
                    size={17}
                    color={isActive ? '#E5A93C' : '#94A3B8'}
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
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  dockOuter: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(10, 13, 18, 0.75)',
  },
  blurContainer: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  dockInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(229, 169, 60, 0.35)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default React.memo(BottomNav);
