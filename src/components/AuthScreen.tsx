import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Languages, ShieldCheck } from 'lucide-react-native';
import GlowSphere from './GlowSphere';
import Heading from './ui/Heading';
import { tAuthScreen } from '../localization/screens/AuthScreen';
import { useAuthScreen } from './auth/useAuthScreen';
import { OtpView } from './auth/OtpView';
import { PasswordStrength } from './auth/PasswordStrength';
import { SocialLogins } from './auth/SocialLogins';
import { AuthScreenProps } from './auth/shared';

export default function AuthScreen({
  onLoginSuccess,
  t,
  currentLang,
  onToggleLang,
}: AuthScreenProps) {
  const ctx = useAuthScreen({ onLoginSuccess, t, currentLang, onToggleLang });
  const { colors, email, emailInputRef, focusedField, handleSubmit, isLoading, isOtpStep, name, nameInputRef, password, passwordInputRef, setEmail, setFocusedField, setName, setPassword, setShowPassword, setTab, showPassword, styles, tab } = ctx;

  if (isOtpStep) return <OtpView ctx={ctx} />;

  // Standard Login / Register View
  return (
    <View style={styles.outerWrapper}>
      <GlowSphere
        size={320}
        colors={[colors.gold.base, 'transparent']}
        opacity={0.16}
        style={{ position: 'absolute', top: -70, right: -80, pointerEvents: 'none' }}
      />
      <GlowSphere
        size={280}
        colors={[colors.status.visited.color, 'transparent']}
        opacity={0.14}
        style={{ position: 'absolute', top: 380, left: -90, pointerEvents: 'none' }}
      />
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>atls</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>

          {onToggleLang && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onToggleLang();
              }}
              activeOpacity={0.7}
              style={styles.langPill}
            >
              <Languages size={13} color={colors.gold.base} />
              <Text style={styles.langPillText}>
                {t?.langSwitch || (tAuthScreen('tr', currentLang))}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Text */}
          <View style={styles.headerTextCol}>
            <Heading style={styles.mainTitle}>
              {tab === 'login' 
                ? (tAuthScreen('welcome_back', currentLang))
                : (tAuthScreen('create_your_passport', currentLang))}
            </Heading>
            <Text style={styles.subTitle}>
              {tab === 'login'
                ? (tAuthScreen('sign_in_to_synchronize_all_your_vi', currentLang))
                : (tAuthScreen('fill_in_your_details_to_start_your', currentLang))}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('login');
              }}
              activeOpacity={0.8}
              style={[styles.tabItem, tab === 'login' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
                {t?.loginTab || 'Giriş Yap'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('register');
              }}
              activeOpacity={0.8}
              style={[styles.tabItem, tab === 'register' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
                {t?.registerTab || 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'register' && (
              <TouchableOpacity accessible={false}
                activeOpacity={1}
                onPress={() => nameInputRef.current?.focus()}
                style={[
                  styles.inputBox,
                  focusedField === 'name' && styles.inputBoxFocused,
                ]}
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
              style={[
                styles.inputBox,
                focusedField === 'email' && styles.inputBoxFocused,
              ]}
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
              style={[
                styles.inputBox,
                focusedField === 'password' && styles.inputBoxFocused,
              ]}
            >
              <Lock size={18} color={focusedField === 'password' ? colors.gold.base : colors.text.muted} />
              <TextInput accessibilityLabel={tab === 'register' ? (t?.password || 'Şifre (en az 8 karakter)') : (t?.password || 'Şifre')}
                ref={passwordInputRef}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder={tab === 'register' ? (t?.password || 'Şifre (en az 8 karakter)') : (t?.password || 'Şifre')}
                placeholderTextColor={colors.text.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                style={styles.input}
              />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? (tAuthScreen('hide_password', currentLang)) : (tAuthScreen('show_password', currentLang))}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.text.secondary} />
                ) : (
                  <Eye size={18} color={colors.text.secondary} />
                )}
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Password Strength Indicator (Register Tab Only) */}
            {tab === 'register' && password.length > 0 && (
              <PasswordStrength ctx={ctx} />
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
              style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.primary} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    {tab === 'login' ? (t?.loginTab || 'Giriş Yap') : (t?.registerTab || 'Kayıt Ol')}
                  </Text>
                  <ArrowRight size={17} color={colors.text.primary} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{tAuthScreen('or', currentLang)}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <SocialLogins ctx={ctx} />
          </View>

          {/* Security & Official Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck size={14} color={colors.gold.light} />
            <Text style={styles.securityText}>
              {tAuthScreen('verified_biometric_passport_secure', currentLang)}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>
  );
}
