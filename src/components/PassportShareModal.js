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
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';
import { getLocalizedCountryName, availableCatalog } from '../data/travelData';

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
    if (s === 'lived') return '#1D4ED8'; // Darker Royal Blue
    if (s === 'visited') return '#2563EB'; // Royal Blue
    if (s === 'want') return '#60A5FA'; // Light Blue
    return '#E2E8F0'; // Default Slate
  };

  const getDynamicLocation = () => {
    // 1. Explicit country selection
    if (profile?.homeCountryId) {
      const country = availableCatalog.find(
        (c) => c.id.toUpperCase() === profile.homeCountryId.toUpperCase()
      );
      if (country) {
        const cName = currentLang === 'tr' ? (country.nameTr || country.name) : country.name;
        const text = profile.homeCity && profile.homeCity.trim()
          ? `${profile.homeCity.trim()}, ${cName}`
          : cName;
        return {
          flag: country.flag || '📍',
          text,
        };
      }
    }

    // 2. Custom location string (if set directly)
    if (profile?.customLocation && profile.customLocation.trim()) {
      const trimmed = profile.customLocation.trim();
      const match = trimmed.match(/^([\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\uFE0F\u200D]+)\s*(.*)$/);
      if (match) {
        return {
          flag: match[1],
          text: match[2],
        };
      }
      const lower = trimmed.toLowerCase();
      const matchedCountry = availableCatalog.find(
        (c) => lower.includes(c.name.toLowerCase()) || (c.nameTr && lower.includes(c.nameTr.toLowerCase()))
      );
      if (matchedCountry) {
        return {
          flag: matchedCountry.flag,
          text: trimmed,
        };
      }
      return {
        flag: null,
        text: trimmed,
      };
    }

    // 3. Dynamic: Lived-in country
    const lived = countries.find((c) => c.status === 'lived');
    if (lived) {
      const locName = getLocalizedCountryName(lived, currentLang);
      return {
        flag: lived.flag || '📍',
        text: `${locName} (${currentLang === 'tr' ? 'İkamet' : 'Home'})`,
      };
    }

    // 4. Dynamic: Latest visited country
    const visited = countries.find((c) => c.status === 'visited');
    if (visited) {
      const locName = getLocalizedCountryName(visited, currentLang);
      return {
        flag: visited.flag || '📍',
        text: `${locName} (${currentLang === 'tr' ? 'Son Durak' : 'Latest'})`,
      };
    }

    return {
      flag: '🌍',
      text: currentLang === 'tr' ? 'Dünya Vatandaşı' : 'Global Citizen',
    };
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

  const locationInfo = getDynamicLocation();

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

          {/* CARD CONTAINER (Wrapped for capture) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContainer}
          >
            {/* 4:3 PURE WHITE PASSPORT PHOTO CARD */}
            <View
              ref={cardRef}
              collapsable={false}
              style={styles.photoCard}
            >
              {/* Card Header: Brand & Security Pill */}
              <View style={styles.cardHeader}>
                <View style={styles.brandRow}>
                  <Text style={styles.brandText}>atls</Text>
                  <Text style={styles.brandDot}>.</Text>
                </View>

                <View style={styles.passportBadge}>
                  <ShieldCheck size={11} color="#2563EB" />
                  <Text style={styles.passportBadgeText}>
                    {currentLang === 'tr' ? 'BİYOMETRİK PASAPORT' : 'BIOMETRIC PASSPORT'}
                  </Text>
                </View>
              </View>

              {/* Profile Bar */}
              <View style={styles.profileSection}>
                <View style={styles.avatarBox}>
                  <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
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
                      <MapPin size={10} color="#2563EB" />
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
                  <G stroke="#FFFFFF" strokeWidth={0.6}>
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
                  <Plane size={9} color="#2563EB" style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.mapPillText}>
                    {currentLang === 'tr' ? `%${earthPercent} DÜNYA KEŞFİ` : `%${earthPercent} EXPLORED`}
                  </Text>
                </View>
              </View>

              {/* Stats Bar */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#2563EB' }]}>
                    {visitedCount < 10 ? `0${visitedCount}` : visitedCount}
                  </Text>
                  <Text style={styles.statLabel}>{t?.visited || 'Gezilen'}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#1D4ED8' }]}>
                    {livedCount < 10 ? `0${livedCount}` : livedCount}
                  </Text>
                  <Text style={styles.statLabel}>{t?.livedIn || 'Yaşanan'}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: '#0284C7' }]}>
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
                  <QrCode size={22} color="#0F172A" />
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
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryActionBtnText}>
                    {currentLang === 'tr' ? 'Fotoğraf Hazırlanıyor...' : 'Generating Photo...'}
                  </Text>
                </>
              ) : (
                <>
                  <ImageIcon size={18} color="#FFFFFF" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '94%',
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
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
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
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
  cardScrollContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },

  // 4:3 Aspect Ratio White Card
  photoCard: {
    width: CARD_WIDTH,
    aspectRatio: 3 / 4, // 3:4 portrait photo standard (4:3 ratio)
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
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
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandDot: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  passportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passportBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
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
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userHandle: {
    fontSize: 11,
    color: '#64748B',
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
    color: '#2563EB',
    fontWeight: '700',
  },
  mapBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mapPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  footerLeft: {
    flex: 1,
  },
  tagline: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
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
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  actionsContainer: {
    marginTop: 14,
  },
  primaryActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
