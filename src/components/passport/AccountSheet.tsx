import Sheet from '../ui/Sheet';
import { PRIVACY_URL } from '../../utils/links';
import { jt } from '../../localization/journey';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Edit3, Trash2, LogOut, ShieldAlert, X, ChevronRight, Cloud, Download, Upload, FileText, Sun, Moon, Smartphone } from 'lucide-react-native';
import { ThemePreference } from '../../stores/types';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import type { PassportCtx } from './usePassportScreen';

export function AccountSheet({ ctx }: { ctx: PassportCtx }) {
  const { colors, currentLang, handleExport, handleImport, isAccountModalOpen, onCreateAccount, onDeleteAccount, onLogout, profile, setIsAccountModalOpen, setIsEditProfileOpen, setThemePreference, styles, t, themePreference } = ctx;
  return (
    <Sheet
      visible={isAccountModalOpen}
      onClose={() => setIsAccountModalOpen(false)}
      maxHeight="92%"
    >

          {/* Modal Header */}
          <View style={styles.accountSheetHeader}>
            <View>
              <Text style={styles.accountSheetTitle}>
                {t.accountManagement || (tPassportScreen('account_management', currentLang))}
              </Text>
              <Text style={styles.accountSheetSubtitle}>
                {tPassportScreen('your_profile_and_session_settings', currentLang)}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={tPassportScreen('close', currentLang)}
              onPress={() => setIsAccountModalOpen(false)}
              style={styles.sheetCloseBtn}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Profile Summary Card */}
          <View style={styles.accountModalCard}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>{profile.avatarInitials || 'AT'}</Text>
            </View>
            <View style={styles.accountInfoText}>
              <Text style={styles.accountNameText} numberOfLines={1}>{profile.name}</Text>
              <Text style={styles.accountHandleText} numberOfLines={1}>
                {profile.email || profile.handle || (tPassportScreen('biometric_passport_account', currentLang))}
              </Text>
              {Boolean(profile.passportNo) && (
                <View style={styles.accountDocBadge}>
                  <Text style={styles.accountDocText}>NO: {profile.passportNo}</Text>
                </View>
              )}
            </View>
          </View>

          {/* APPEARANCE (system / light / dark) */}
          <View style={styles.themePickerSection}>
            <View style={styles.themePickerHeader}>
              <Sun size={14} color={colors.gold.base} />
              <Text style={styles.themePickerTitle}>
                {tPassportScreen('appearance', currentLang)}
              </Text>
            </View>
            <View style={styles.appearanceRow}>
              {[
                { key: 'system', Icon: Smartphone, label: tPassportScreen('system', currentLang) },
                { key: 'light', Icon: Sun, label: tPassportScreen('light', currentLang) },
                { key: 'dark', Icon: Moon, label: tPassportScreen('dark', currentLang) },
              ].map(({ key, Icon, label }) => {
                const isSelected = themePreference === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setThemePreference(key as ThemePreference);
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={label}
                    style={[styles.appearanceChip, isSelected && styles.appearanceChipActive]}
                  >
                    <Icon size={15} color={isSelected ? colors.gold.base : colors.text.secondary} />
                    <Text style={[styles.appearanceChipText, isSelected && styles.appearanceChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Account Actions */}
          <View style={styles.accountActionsList}>
            {/* Edit Profile */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsAccountModalOpen(false);
                setTimeout(() => {
                  setIsEditProfileOpen(true);
                }, 250);
              }}
              activeOpacity={0.7}
              style={styles.accountListItem}
            >
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Edit3 size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>
                  {t.editProfile || (tPassportScreen('edit_profile', currentLang))}
                </Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Guest: move local data into a real account */}
            {profile?.isGuest && onCreateAccount && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsAccountModalOpen(false);
                  onCreateAccount();
                }}
                activeOpacity={0.7}
                style={styles.accountListItem}
              >
                <View style={styles.accountListItemLeft}>
                  <View style={[styles.accountActionIconBox, { backgroundColor: colors.gold.tint }]}>
                    <Cloud size={17} color={colors.gold.base} />
                  </View>
                  <Text style={styles.accountListItemLabel}>
                    {tPassportScreen('create_account_sync', currentLang)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Data portability: JSON or CSV copy of everything the user entered */}
            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={styles.accountListItem}>
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Download size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>{jt('exportData', currentLang)}</Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Restore: merges an earlier JSON export, adding only what is missing */}
            <TouchableOpacity onPress={handleImport} activeOpacity={0.7} style={styles.accountListItem}>
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <Upload size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>{jt('importData', currentLang)}</Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Privacy policy: required to be reachable from inside the app */}
            <TouchableOpacity
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL).catch(() => {})}
              activeOpacity={0.7}
              style={styles.accountListItem}
              accessibilityRole="link"
            >
              <View style={styles.accountListItemLeft}>
                <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                  <FileText size={17} color={colors.gold.base} />
                </View>
                <Text style={styles.accountListItemLabel}>
                  {tPassportScreen('privacy_policy', currentLang)}
                </Text>
              </View>
              <ChevronRight size={17} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Log Out */}
            {onLogout && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    t.logOut || (tPassportScreen('log_out', currentLang)),
                    profile?.isGuest
                      ? (tPassportScreen('you_have_no_account_so_logging_out', currentLang))
                      : (tPassportScreen('are_you_sure_you_want_to_log_out_o', currentLang)),
                    [
                      { text: t.cancel || (tPassportScreen('cancel', currentLang)), style: 'cancel' },
                      {
                        text: t.logOut || (tPassportScreen('log_out', currentLang)),
                        style: 'destructive',
                        onPress: () => {
                          setIsAccountModalOpen(false);
                          onLogout();
                        } },
                    ]
                  );
                }}
                activeOpacity={0.7}
                style={styles.accountListItem}
              >
                <View style={styles.accountListItemLeft}>
                  <View style={[styles.accountActionIconBox, { backgroundColor: colors.glass.fillStrong }]}>
                    <LogOut size={17} color={colors.text.secondary} />
                  </View>
                  <Text style={styles.accountListItemLabel}>
                    {t.logOut || (tPassportScreen('log_out', currentLang))}
                  </Text>
                </View>
                <ChevronRight size={17} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Danger Zone: Delete Account */}
          {onDeleteAccount && (
            <View style={styles.dangerZoneBox}>
              <View style={styles.dangerZoneHeader}>
                <ShieldAlert size={14} color={colors.danger} />
                <Text style={styles.dangerZoneTitle}>
                  {t.dangerZone || (tPassportScreen('danger_zone', currentLang))}
                </Text>
              </View>
              <Text style={styles.dangerZoneDesc}>
                {tPassportScreen('permanently_delete_your_account_an', currentLang)}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  Alert.alert(
                    t.deleteAccountConfirmTitle || (tPassportScreen('permanently_delete_account', currentLang)),
                    t.deleteAccountConfirmMsg ||
                      (tPassportScreen('are_you_sure_you_want_to_delete_yo', currentLang)),
                    [
                      { text: t.cancel || (tPassportScreen('cancel', currentLang)), style: 'cancel' },
                      {
                        text: t.deleteAccount || (tPassportScreen('delete_account', currentLang)),
                        style: 'destructive',
                        onPress: () => {
                          setIsAccountModalOpen(false);
                          onDeleteAccount();
                        } },
                    ]
                  );
                }}
                activeOpacity={0.7}
                style={styles.modalDeleteBtn}
              >
                <Trash2 size={16} color={colors.dangerDeep} />
                <Text style={styles.modalDeleteBtnText}>
                  {t.deleteAccount || (tPassportScreen('delete_account', currentLang))}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          </ScrollView>
    </Sheet>
  );
}
