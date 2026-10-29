import { fonts } from '../theme/typography';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Languages, User } from 'lucide-react-native';

interface AppHeaderProps {
  currentLang: 'tr' | 'en';
  onToggleLang?: () => void;
  onOpenProfile?: () => void;
}

function AppHeader({ currentLang, onToggleLang, onOpenProfile }: AppHeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const handleToggleLang = () => {
    Haptics.selectionAsync();
    if (onToggleLang) {
      onToggleLang();
    }
  };

  const handleOpenProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Fixed Brand Identity Logo (Never Jumps or Moves) */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>atls</Text>
        <Text style={styles.logoDot}>.</Text>
      </View>

      {/* Global Quick Action Buttons */}
      <View style={styles.actionsRow}>
        {onToggleLang && (
          <TouchableOpacity
            onPress={handleToggleLang}
            activeOpacity={0.75}
            style={styles.langPill}
            delayPressIn={0}
            accessibilityRole="button"
            accessibilityLabel="Language switch"
          >
            <Languages size={13} color={colors.gold.base} />
            <Text style={styles.langPillText}>
              {currentLang === 'tr' ? 'EN' : 'TR'}
            </Text>
          </TouchableOpacity>
        )}

        {onOpenProfile && (
          <TouchableOpacity
            onPress={handleOpenProfile}
            activeOpacity={0.75}
            style={styles.profileBtn}
            delayPressIn={0}
            accessibilityRole="button"
            accessibilityLabel="Profile and account"
          >
            <User size={16} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  headerContainer: {
    height: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.canvas.base, // 60% dominant canvas
    zIndex: 90,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 27,
    color: colors.text.primary,
    letterSpacing: -0.8,
    fontFamily: fonts.displayHeavy,
  },
  logoDot: {
    fontSize: 29,
    color: colors.text.primary,
    fontFamily: fonts.displayHeavy,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    paddingHorizontal: 11,
    height: 34,
    borderRadius: 17,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass.fill,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export default React.memo(AppHeader);
