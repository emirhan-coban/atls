import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Edit3, Share2, MapPin } from 'lucide-react-native';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import { usePanelStyles } from './Panels.styles';
import type { PassportCtx } from './usePassportScreen';

/** Compact identity header: the passport cover colours, the avatar, name and where the person lives. */
export function PassportHeader({ ctx }: { ctx: PassportCtx }) {
  const { colors, currentLang, currentTheme, handleShare, locationInfo, profile, setIsEditProfileOpen, t } = ctx;
  const styles = usePanelStyles();
  return (
    <LinearGradient
      colors={currentTheme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { borderColor: currentTheme.borderColor }]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.glass.fillActive, borderColor: currentTheme.accentColor }]}>
        <Text style={[styles.avatarText, { color: currentTheme.textColor }]}>{profile.avatarInitials}</Text>
      </View>
      <View style={styles.headerText}>
        <Text style={[styles.headerName, { color: currentTheme.textColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {profile.name}
        </Text>
        <Text style={[styles.headerHandle, { color: currentTheme.subtextColor }]} numberOfLines={1}>
          {profile.handle}
        </Text>
        <View style={styles.headerLocation}>
          {locationInfo.flag ? (
            <Text style={styles.headerFlag}>{locationInfo.flag}</Text>
          ) : (
            <MapPin size={13} color={currentTheme.accentColor} />
          )}
          <Text style={[styles.headerLocationText, { color: currentTheme.textColor }]} numberOfLines={1}>
            {locationInfo.text}
          </Text>
        </View>
      </View>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t.edit || tPassportScreen('edit', currentLang)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsEditProfileOpen(true);
          }}
          activeOpacity={0.7}
          style={styles.iconButton}
        >
          <Edit3 size={16} color={currentTheme.accentColor} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t.sharePassport}
          onPress={handleShare}
          activeOpacity={0.7}
          style={styles.iconButton}
        >
          <Share2 size={16} color={currentTheme.accentColor} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
