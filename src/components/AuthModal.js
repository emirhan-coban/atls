import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Apple, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react-native';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  t,
}) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLoginSuccess({
      name: name || (tab === 'register' ? 'Alex Rivera' : 'Maya Chen'),
      handle: `@${(name || 'mayachen').toLowerCase().replace(/\s+/g, '')}`,
      email: email || 'traveler@atls.app',
      avatarInitials: name ? name.substring(0, 2).toUpperCase() : 'MC',
      location: 'Lisbon, Portugal',
    });
    onClose();
  };

  const handleAppleAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLoginSuccess({
      name: 'Maya Chen',
      handle: '@mayachen',
      email: 'maya.apple@icloud.com',
      avatarInitials: 'MC',
      location: 'Lisbon, Portugal',
    });
    onClose();
  };

  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.content}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.title}>atls</Text>
                <Text style={styles.dot}>.</Text>
              </View>
              <Text style={styles.subtitle}>{t.authSubtitle}</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('login');
              }}
              style={[styles.tabItem, tab === 'login' && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'login' && styles.tabTextActive,
                ]}
              >
                {t.loginTab}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setTab('register');
              }}
              style={[styles.tabItem, tab === 'register' && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'register' && styles.tabTextActive,
                ]}
              >
                {t.registerTab}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputBox}>
                <User size={16} color="#94A3B8" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t.fullName}
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                />
              </View>
            )}

            <View style={styles.inputBox}>
              <Mail size={16} color="#94A3B8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t.email}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputBox}>
              <Lock size={16} color="#94A3B8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t.password}
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {tab === 'login' ? t.loginTab : t.registerTab}
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Apple & Guest Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              onPress={handleAppleAuth}
              activeOpacity={0.8}
              style={styles.appleBtn}
            >
              <Apple size={18} color="#FFFFFF" />
              <Text style={styles.appleBtnText}>{t.continueWithApple}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGuest}
              activeOpacity={0.7}
              style={styles.guestBtn}
            >
              <Text style={styles.guestBtnText}>{t.guestMode}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  dot: {
    fontSize: 26,
    fontWeight: '900',
    color: '#5B4DFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 3,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 13,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  form: {
    gap: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5B4DFF',
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  orText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  socialButtons: {
    gap: 10,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 14,
  },
  appleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
