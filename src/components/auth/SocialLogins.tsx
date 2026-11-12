import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { tAuthScreen } from '../../localization/screens/AuthScreen';
import type { AuthCtx } from './useAuthScreen';
import { GoogleIcon, AppleIcon } from './shared';

export function SocialLogins({ ctx }: { ctx: AuthCtx }) {
  const { currentLang, handleAppleSignIn, handleGoogleSignIn, handleGuest, isLoading, styles, t } = ctx;
  return (
    <View style={styles.socialCol}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  style={[styles.socialBtn, styles.appleBtn]}
                >
                  <AppleIcon />
                  <Text style={styles.appleBtnText}>
                    {t?.continueWithApple || (tAuthScreen('continue_with_apple', currentLang))}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                disabled={isLoading}
                style={[styles.socialBtn, styles.googleBtn]}
              >
                <GoogleIcon />
                <Text style={styles.googleBtnText}>
                  {t?.continueWithGoogle || (tAuthScreen('continue_with_google', currentLang))}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGuest}
                activeOpacity={0.7}
                disabled={isLoading}
                style={styles.guestBtn}
              >
                <Text style={styles.guestBtnText}>
                  {tAuthScreen('continue_without_an_account', currentLang)}
                </Text>
              </TouchableOpacity>
              <Text style={styles.guestHint}>
                {tAuthScreen('your_data_stays_on_this_device_you', currentLang)}
              </Text>
            </View>
  );
}
