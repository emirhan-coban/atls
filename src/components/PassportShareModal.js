import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { 
  X, 
  Share2, 
  ShieldCheck, 
  MapPin, 
  QrCode,
  Plane,
  Sparkles,
  Download,
  Image as ImageIcon,
} from 'lucide-react-native';
import Svg, { G, Path } from 'react-native-svg';
import GlowSphere from './GlowSphere';
import OrbitalRings from './OrbitalRings';
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';
import { getLocalizedCountryName, availableCatalog } from '../data/travelData';
import { getDynamicLocation } from '../utils/locationHelper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 44, 350);

export default function PassportShareModal({
  isOpen,
  onClose,
  profile,
  countries,
  t,
  currentLang,
}) {
  const cardRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareFormat, setShareFormat] = useState('card'); // 'card' | 'story'

  const visitedCount = countries.filter((c) => c.status === 'visited').length;
  const livedCount = countries.filter((c) => c.status === 'lived').length;
  const wantCount = countries.filter((c) => c.status === 'want').length;
  const totalCount = visitedCount + livedCount;
  const earthPercent = ((totalCount / 195) * 100).toFixed(1);

  // Status mapping for mini world map
  const statusMap = {};
  countries.forEach((c) => {
    statusMap[c.id.toUpperCase()] = c.status;
  });

  const getFill = (id) => {
    const s = statusMap[id];
    if (s === 'lived') return '#10B981'; // Emerald
    if (s === 'visited') return '#3B82F6'; // Electric Sapphire
    if (s === 'want') return '#FF6B35'; // Solar Orange
    return '#182235'; // Base Obsidian Landmass
  };

  // High-res 4:3 Photo Capture & Native Image Share
  const handleSharePhoto = async () => {
    if (!cardRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture card as ultra high-res PNG (pixelRatio: 3)
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: currentLang === 'tr' ? 'atls. Pasaport Kartı' : 'atls. Passport Card',
          UTI: 'public.png',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          currentLang === 'tr' ? 'Bilgi' : 'Notice',
          currentLang === 'tr' ? 'Paylaşım bu cihazda desteklenmiyor.' : 'Sharing is not available on this device.'
        );
      }
    } catch (err) {
      console.warn('[PassportShareModal] Capture error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        currentLang === 'tr' ? 'Hata' : 'Error',
        currentLang === 'tr' ? 'Kart fotoğrafı oluşturulurken bir sorun oluştu.' : 'Failed to capture passport card photo.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  const locationInfo = getDynamicLocation(profile, countries, currentLang);

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.handleBar} />
          {/* Header Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.sheetTitle}>
                {currentLang === 'tr' ? 'Pasaport Kartı' : 'Passport Card'}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {currentLang === 'tr'
                  ? 'Kartını yüksek çözünürlüklü 4:3 fotoğraf olarak paylaş'
                  : 'Share your card as a high-resolution 4:3 photo'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Format Toggle: 4:3 Card vs 9:16 Story */}
          <View style={styles.formatToggleContainer}>
            <TouchableOpacity
              style={[styles.formatToggleBtn, shareFormat === 'card' && styles.formatToggleBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setShareFormat('card');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.formatToggleText, shareFormat === 'card' && styles.formatToggleTextActive]}>
                {currentLang === 'tr' ? '💳 4:3 Kart' : '💳 4:3 Card'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatToggleBtn, shareFormat === 'story' && styles.formatToggleBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setShareFormat('story');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.formatToggleText, shareFormat === 'story' && styles.formatToggleTextActive]}>
                {currentLang === 'tr' ? '📱 9:16 Story' : '📱 9:16 Story'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARD CONTAINER (Wrapped for capture) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContainer}
          >
            {/* 4:3 / 9:16 COSMIC LUXURY PASSPORT PHOTO CARD */}
            <View
              ref={cardRef}
              collapsable={false}
              style={[styles.photoCard, shareFormat === 'story' && styles.photoCardStory]}
            >
              {/* Background Celestial Glowing Sphere & Orbital Lines */}
              <GlowSphere
                size={220}
                colors={['#FF6B35', '#2E5CFF']}
                opacity={0.3}
                style={{ position: 'absolute', top: -30, right: -30 }}
              />
              <OrbitalRings
                size={180}
                style={{ position: 'absolute', top: -15, right: -15, opacity: 0.25 }}
              />

              {/* Card Header: Brand & Security Pill */}
              <View style={styles.cardHeader}>
                <View style={styles.brandRow}>
                  <Text style={styles.brandText}>atls</Text>
                  <Text style={styles.brandDot}>.</Text>
                </View>

                <View style={styles.passportBadge}>
                  <ShieldCheck size={11} color="#E2F952" />
                  <Text style={styles.passportBadgeText}>
                    {currentLang === 'tr' ? 'BİYOMETRİK PASAPORT' : 'BIOMETRIC PASSPORT'}
                  </Text>
                </View>
              </View>

              {/* Profile Bar */}
              <View style={styles.profileSection}>
                <View style={styles.avatarBox}>
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{profile?.avatarInitials || 'TR'}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.profileTextCol}>
                  <Text style={styles.userName}>{profile?.name || 'Traveler'}</Text>
                  <Text style={styles.userHandle}>{profile?.handle || '@traveler'}</Text>
                  <View style={styles.locationRow}>
                    {locationInfo.flag ? (
                      <Text style={styles.locationFlag}>{locationInfo.flag}</Text>
                    ) : (
                      <MapPin size={10} color="#FF6B35" />
                    )}
                    <Text style={styles.locationText}>
                      {locationInfo.text}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mini World Map */}
              <View style={styles.mapBox}>
                <Svg viewBox={worldViewBox} style={styles.mapSvg}>
                  <G stroke="#232F48" strokeWidth={0.5}>
                    {worldMapFeatures.map((f, i) => (
                      <Path
                        key={`${f.id}-${i}`}
                        d={f.d}
                        fill={getFill(f.id)}
                      />
                    ))}
                  </G>
                </Svg>

                <View style={styles.mapPill}>
                  <Plane size={9} color="#60A5FA" style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.mapPillText}>
                    {currentLang === 'tr' ? `%${earthPercent} DÜNYA KEŞFİ` : `%${earthPercent} EXPLORED`}
                  </Text>
                </View>
              </View>

              {/* Stats Bar */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#60A5FA' }]}>
                    {visitedCount < 10 ? `0${visitedCount}` : visitedCount}
                  </Text>
                  <Text style={styles.statLabel}>{t?.visited || 'Gezilen'}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#34D399' }]}>
                    {livedCount < 10 ? `0${livedCount}` : livedCount}
                  </Text>
                  <Text style={styles.statLabel}>{t?.livedIn || 'Yaşanan'}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#FF8A5B' }]}>
                    {wantCount < 10 ? `0${wantCount}` : wantCount}
                  </Text>
                  <Text style={styles.statLabel}>{t?.wishlist || 'Hedef'}</Text>
                </View>
              </View>

              {/* Footer: Tagline, Passport ID & QR Code */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Text style={styles.tagline}>
                    {currentLang === 'tr' ? 'Biraz Buralı, Çokça Meraklı.' : 'Partly local, mostly curious.'}
                  </Text>
                  <Text style={styles.passportIdText}>
                    {`PASAPORT NO: ${profile?.passportNo || 'AT-849201-X'}`}
                  </Text>
                </View>
                <View style={styles.qrContainer}>
                  <QrCode size={22} color="#07090E" />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Button: Share / Save as 4:3 Photo */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handleSharePhoto}
              activeOpacity={0.85}
              disabled={isCapturing}
              style={[styles.primaryActionBtn, isCapturing && { opacity: 0.7 }]}
            >
              {isCapturing ? (
                <>
                  <ActivityIndicator color="#07090E" size="small" />
                  <Text style={styles.primaryActionBtnText}>
                    {currentLang === 'tr' ? 'Fotoğraf Hazırlanıyor...' : 'Generating Photo...'}
                  </Text>
                </>
              ) : (
                <>
                  <ImageIcon size={18} color="#07090E" />
                  <Text style={styles.primaryActionBtnText}>
                    {currentLang === 'tr' ? 'Fotoğraf Olarak Paylaş / Kaydet' : 'Share / Save Photo'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#0D111A',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxHeight: '94%',
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardScrollContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },

  // 4:3 Aspect Ratio Cosmic Card
  photoCard: {
    width: CARD_WIDTH,
    aspectRatio: 3 / 4,
    backgroundColor: '#07090E',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  photoCardStory: {
    aspectRatio: 9 / 16,
    paddingVertical: 24,
  },
  formatToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  formatToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  formatToggleBtnActive: {
    backgroundColor: '#FF6B35',
  },
  formatToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  formatToggleTextActive: {
    color: '#07090E',
    fontWeight: '900',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandDot: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B35',
  },
  passportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(226, 249, 82, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(226, 249, 82, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passportBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#E2F952',
    letterSpacing: 0.5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  userHandle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationFlag: {
    fontSize: 10.5,
    lineHeight: 13,
  },
  locationText: {
    fontSize: 9.5,
    color: '#FF6B35',
    fontWeight: '700',
  },
  mapBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#07090E',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  mapSvg: {
    width: '100%',
    height: '100%',
  },
  mapPill: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 20, 32, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mapPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.4,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  footerLeft: {
    flex: 1,
  },
  tagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  passportIdText: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  qrContainer: {
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  actionsContainer: {
    marginTop: 14,
  },
  primaryActionBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#07090E',
  },
});
