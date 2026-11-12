import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowRight, KeyRound, RefreshCw, Edit3 } from 'lucide-react-native';
import GlowSphere from '../GlowSphere';
import Heading from '../ui/Heading';
import { tAuthScreen } from '../../localization/screens/AuthScreen';
import type { AuthCtx } from './useAuthScreen';

export function OtpView({ ctx }: { ctx: AuthCtx }) {
  const { canResendOtp, colors, currentLang, email, focusedField, handleOtpChange, handleOtpKeyPress, handleResendOtp, handleVerifyOtp, isLoading, otpDigits, otpInputsRef, otpTimer, setFocusedField, setIsOtpStep, styles, t } = ctx;
  return (
      <View style={styles.outerWrapper}>
        <GlowSphere
          size={300}
          colors={[colors.gold.base, 'transparent']}
          opacity={0.16}
          style={{ position: 'absolute', top: -70, right: -80, pointerEvents: 'none' }}
        />
        <GlowSphere
          size={260}
          colors={[colors.status.visited.color, 'transparent']}
          opacity={0.14}
          style={{ position: 'absolute', bottom: 100, left: -80, pointerEvents: 'none' }}
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>atls</Text>
              <Text style={styles.logoDot}>.</Text>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.headerTextCol}>
                <View style={styles.otpIconBadge}>
                  <KeyRound size={28} color={colors.gold.base} strokeWidth={2} />
                </View>

                <Heading style={styles.mainTitle}>
                  {t?.otpTitle || (tAuthScreen('verify_your_email', currentLang))}
                </Heading>
                
                <Text style={styles.subTitle}>
                  {tAuthScreen('enter_the_6_digit_security_code_se', currentLang)}
                </Text>

                {/* Target Email Capsule with Edit Button */}
                <View style={styles.emailBadge}>
                  <Mail size={14} color={colors.gold.base} />
                  <Text style={styles.emailBadgeText} numberOfLines={1}>{email}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={tAuthScreen('edit_email', currentLang)}
                    onPress={() => setIsOtpStep(false)}
                    style={styles.editEmailBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit3 size={13} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      focusedField === `otp_${idx}` ? styles.otpBoxFocused : null,
                    ]}
                  >
                    <TextInput
                      accessibilityLabel={tAuthScreen('verification_code_digit', currentLang, { p1: idx + 1 })}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, idx)}
                      onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                      onFocus={() => setFocusedField(`otp_${idx}`)}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="number-pad"
                      maxLength={idx === 0 ? 6 : 1}
                      selectTextOnFocus
                      placeholderTextColor={colors.text.muted}
                      style={styles.otpInput}
                    />
                  </View>
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerifyOtp}
                activeOpacity={0.85}
                disabled={isLoading}
                style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {t?.otpVerifyBtn || (tAuthScreen('verify_enter_passport', currentLang))}
                    </Text>
                    <ArrowRight size={17} color={colors.text.primary} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Code Section */}
              <View style={styles.resendRow}>
                {canResendOtp ? (
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    style={styles.resendBtn}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <RefreshCw size={14} color={colors.gold.base} />
                    <Text style={styles.resendBtnText}>
                      {t?.otpResend || (tAuthScreen('resend_code', currentLang))}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    {t?.otpResendIn?.replace('{seconds}', otpTimer) || `${otpTimer}s sonra tekrar gönder`}
                  </Text>
                )}
              </View>

              {/* Back to Edit Button */}
              <TouchableOpacity
                onPress={() => setIsOtpStep(false)}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>
                  {t?.otpChangeEmail || (tAuthScreen('try_with_different_email', currentLang))}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
}
