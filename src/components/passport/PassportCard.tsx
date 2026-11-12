import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ShieldCheck, Check, MapPin, Edit3, QrCode } from 'lucide-react-native';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import type { PassportCtx } from './usePassportScreen';

export function PassportCard({ ctx }: { ctx: PassportCtx }) {
  const { colors, countries, currentLang, currentTheme, locationInfo, mrzCodeString, profile, setIsEditProfileOpen, styles, t } = ctx;
  return (
    <LinearGradient
            colors={currentTheme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.passportCard, { borderColor: currentTheme.borderColor }]}
          >
        {/* Top Card Row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.glass.hairline, borderColor: colors.glass.borderStrong }]}>
            <ShieldCheck size={16} color={currentTheme.accentColor} />
            <Text style={[styles.verifiedText, { color: currentTheme.textColor }]}>{t.officialPassport}</Text>
          </View>

          <View style={styles.cardTopRight}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditProfileOpen(true);
              }}
              activeOpacity={0.7}
              style={[styles.cardEditBtn, { backgroundColor: colors.glass.hairline }]}
            >
              <Edit3 size={11} color={currentTheme.accentColor} />
              <Text style={[styles.cardEditBtnText, { color: currentTheme.textColor }]}>{t.edit || (tPassportScreen('edit', currentLang))}</Text>
            </TouchableOpacity>

            {/* Chip Graphic */}
            <View style={[styles.chipContainer, { borderColor: currentTheme.chipColor }]}>
              <View style={[styles.chipInner, { backgroundColor: currentTheme.chipColor }]}>
                <View style={styles.chipLine} />
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          {/* Avatar Monogram */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarBox, { backgroundColor: colors.glass.fillActive, borderColor: colors.glass.borderStrong }]}>
              <Text style={[styles.avatarText, { color: currentTheme.textColor }]}>{profile.avatarInitials}</Text>
            </View>
            <View style={styles.verifiedDot}>
              <Check size={10} color={colors.text.primary} strokeWidth={3} />
            </View>
          </View>

          {/* Name & Handle */}
          <View style={styles.profileDetails}>
            <Text
              style={[styles.profileName, { color: currentTheme.textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {profile.name}
            </Text>
            <Text style={[styles.profileHandle, { color: currentTheme.subtextColor }]} numberOfLines={1}>
              {profile.handle}
            </Text>
            <View style={styles.locationRow}>
              {locationInfo.flag ? (
                <Text style={styles.locationFlag}>{locationInfo.flag}</Text>
              ) : (
                <MapPin size={13} color={currentTheme.accentColor} />
              )}
              <Text
                style={[styles.locationText, { color: currentTheme.textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {locationInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={[styles.metadataStrip, { backgroundColor: colors.glass.fillStrong, borderColor: colors.glass.hairline }]}>
          <View style={styles.metaCol}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.docNo}</Text>
            <Text
              style={[styles.metaValue, { color: currentTheme.textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {profile.passportNo}
            </Text>
          </View>
          <View style={styles.metaColMiddle}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.borders}</Text>
            <Text
              style={[styles.metaValue, { color: currentTheme.accentColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.recorded ? t.recorded.replace('{count}', countries.length) : `${countries.length} Recorded`}
            </Text>
          </View>
          <View style={styles.metaColEnd}>
            <Text style={[styles.metaLabel, { color: currentTheme.subtextColor }]}>{t.status}</Text>
            <Text
              style={[styles.metaValue, { color: colors.status.lived.color }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {t.active}
            </Text>
          </View>
        </View>

        {/* Security / MRZ Strip */}
        <View style={styles.mrzRow}>
          <Text
            style={[styles.mrzCode, { color: currentTheme.subtextColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            {mrzCodeString}
          </Text>
          <QrCode size={22} color={currentTheme.textColor} />
        </View>
      </LinearGradient>
  );
}
