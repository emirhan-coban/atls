import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Globe2, ArrowRight, CheckCircle2, Circle, Lock, Mail, User, Eye, EyeOff, ChevronLeft, KeyRound } from 'lucide-react-native';
import Heading from '../ui/Heading';
import { tOnboardingScreen } from '../../localization/screens/OnboardingScreen';
import type { OnboardingCtx } from './useOnboarding';
import { GoogleIcon, AppleIcon } from './shared';

export function AuthStep({ ctx }: { ctx: OnboardingCtx }) {
  const { authTab, colors, currentLang, email, emailInputRef, exploredPercent, focusedField, handleAuthSubmit, handleGuest, handleSocialAuth, handleVerifyOtp, hasMinLength, hasNumber, hasUppercase, isLoading, isOtpStep, name, nameInputRef, otpDigits, otpInputsRef, password, passwordInputRef, renderTopBar, setAuthTab, setEmail, setFocusedField, setIsOtpStep, setName, setOtpDigits, setPassword, setShowPassword, showPassword, strength, styles, t, totalCount } = ctx;
  // If OTP Sub-step is active
    if (isOtpStep) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.topBarRow}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={tOnboardingScreen('back', currentLang)} onPress={() => setIsOtpStep(false)} style={styles.backBtn}>
              <ChevronLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.logoText}>atls<Text style={styles.logoDot}>.</Text></Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepScrollContent}>
              <View style={styles.otpHeader}>
                <View style={styles.otpIconBadge}>
                  <KeyRound size={28} color={colors.gold.base} />
                </View>
                <Heading style={styles.stepTitle}>{t?.otpTitle || 'E-postanızı Doğrulayın'}</Heading>
                <Text style={styles.stepSub}>
                  {email} adresine gönderilen 6 haneli güvenlik kodunu girin.
                </Text>
              </View>

              {/* 6 Digit Input Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, idx) => (
                  <View key={idx} style={[styles.otpBox, digit && styles.otpBoxFilled]}>
                    <TextInput
                      accessibilityLabel={tOnboardingScreen('verification_code_digit', currentLang, { p1: idx + 1 })}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      value={digit}
                      onChangeText={(val) => {
                        const clean = val.replace(/[^0-9]/g, '');
                        const updated = [...otpDigits];
                        if (clean.length > 1) {
                          clean.slice(0, 6).split('').forEach((c, i) => (updated[i] = c));
                          setOtpDigits(updated);
                          otpInputsRef.current[Math.min(clean.length, 5)]?.focus();
                          return;
                        }
                        updated[idx] = clean;
                        setOtpDigits(updated);
                        if (clean && idx < 5) otpInputsRef.current[idx + 1]?.focus();
                      }}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                          otpInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={idx === 0 ? 6 : 1}
                      selectTextOnFocus
                      style={styles.otpInput}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                style={[styles.primaryActionButton, isLoading && { opacity: 0.7 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionButtonText}>Doğrula ve Pasaporta Gir</Text>
                    <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(4, 4)}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepScrollContent}
          >
            {/* Value Preview Pill */}
            <View style={styles.savePassportHeaderCard}>
              <View style={styles.passportChip}>
                <Globe2 size={13} color={colors.gold.base} />
                <Text style={styles.passportChipText}>
                  {totalCount} Ülke • %{exploredPercent} Dünya Keşfi
                </Text>
              </View>
              <Heading style={styles.savePassportTitle}>
                {t?.savePassportTitle || 'Pasaportunu Kaydet & Kilitle'}
              </Heading>
              <Text style={styles.savePassportSub}>
                {t?.savePassportSub || 'Emek verdiğin bu harita ve istatistiklerinin silinmemesi için hesabını oluştur.'}
              </Text>
            </View>

            {/* Auth Tab Switcher */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthTab('register');
                }}
                style={[styles.tabItem, authTab === 'register' && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, authTab === 'register' && styles.tabTextActive]}>
                  {t?.registerTab || 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthTab('login');
                }}
                style={[styles.tabItem, authTab === 'login' && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, authTab === 'login' && styles.tabTextActive]}>
                  {t?.loginTab || 'Giriş Yap'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formCol}>
              {authTab === 'register' && (
                <TouchableOpacity accessible={false}
                  activeOpacity={1}
                  onPress={() => nameInputRef.current?.focus()}
                  style={[styles.inputBox, focusedField === 'name' && styles.inputBoxFocused]}
                >
                  <User size={18} color={focusedField === 'name' ? colors.gold.base : colors.text.muted} />
                  <TextInput accessibilityLabel={t?.fullName || 'Ad Soyad'}
                    ref={nameInputRef}
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t?.fullName || 'Ad Soyad'}
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity accessible={false}
                activeOpacity={1}
                onPress={() => emailInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'email' && styles.inputBoxFocused]}
              >
                <Mail size={18} color={focusedField === 'email' ? colors.gold.base : colors.text.muted} />
                <TextInput accessibilityLabel={t?.email || 'E-posta adresi'}
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={t?.email || 'E-posta adresi'}
                  placeholderTextColor={colors.text.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  style={styles.input}
                />
              </TouchableOpacity>

              <TouchableOpacity accessible={false}
                activeOpacity={1}
                onPress={() => passwordInputRef.current?.focus()}
                style={[styles.inputBox, focusedField === 'password' && styles.inputBoxFocused]}
              >
                <Lock size={18} color={focusedField === 'password' ? colors.gold.base : colors.text.muted} />
                <TextInput accessibilityLabel={authTab === 'register' ? 'Şifre (en az 8 karakter)' : 'Şifre'}
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={authTab === 'register' ? 'Şifre (en az 8 karakter)' : 'Şifre'}
                  placeholderTextColor={colors.text.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  style={styles.input}
                />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? (tOnboardingScreen('hide_password', currentLang)) : (tOnboardingScreen('show_password', currentLang))} onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  {showPassword ? <EyeOff size={18} color={colors.text.secondary} /> : <Eye size={18} color={colors.text.secondary} />}
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Password Strength Checklist */}
              {authTab === 'register' && password.length > 0 && (
                <View style={styles.strengthCard}>
                  <View style={styles.strengthHeaderRow}>
                    <Text style={styles.strengthTitle}>
                      Şifre Gücü: <Text style={{ color: strength.color, fontWeight: '800' }}>{strength.label}</Text>
                    </Text>
                  </View>
                  <View style={styles.strengthBarRow}>
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 1 ? strength.color : colors.glass.hairline }]} />
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 2 ? strength.color : colors.glass.hairline }]} />
                    <View style={[styles.strengthBarSegment, { backgroundColor: strength.score >= 3 ? strength.color : colors.glass.hairline }]} />
                  </View>
                  <View style={styles.criteriaList}>
                    <View style={styles.criteriaRow}>
                      {hasMinLength ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>8+ karakter</Text>
                    </View>
                    <View style={styles.criteriaRow}>
                      {hasUppercase ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasUppercase && styles.criteriaTextMet]}>1 büyük harf</Text>
                    </View>
                    <View style={styles.criteriaRow}>
                      {hasNumber ? <CheckCircle2 size={13} color={colors.status.lived.color} /> : <Circle size={13} color={colors.text.muted} />}
                      <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>1 rakam</Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleAuthSubmit}
                style={[styles.primaryActionButton, isLoading && { opacity: 0.7 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryActionButtonText}>
                      {authTab === 'register' ? 'Pasaportumu Kaydet' : 'Giriş Yap ve Senkronize Et'}
                    </Text>
                    <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>VEYA</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Logins */}
              <View style={styles.socialCol}>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    onPress={() => handleSocialAuth('apple')}
                    style={[styles.socialBtn, styles.appleBtn]}
                    disabled={isLoading}
                  >
                    <AppleIcon />
                    <Text style={styles.appleBtnText}>Apple ile Kaydet</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleSocialAuth('google')}
                  style={[styles.socialBtn, styles.googleBtn]}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  <Text style={styles.googleBtnText}>Google ile Kaydet</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleGuest} style={styles.guestBtn} disabled={isLoading}>
                  <Text style={styles.guestBtnText}>
                    {tOnboardingScreen('continue_without_an_account', currentLang)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.guestHint}>
                  {tOnboardingScreen('your_data_stays_on_this_device_you', currentLang)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
