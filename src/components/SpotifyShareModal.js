import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  MapPin, 
  QrCode,
  Plane,
  Sparkles,
  Instagram
} from 'lucide-react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { worldViewBox, worldMapFeatures } from '../data/worldMapPaths';

const { width, height } = Dimensions.get('window');

export default function SpotifyShareModal({
  isOpen,
  onClose,
  profile,
  countries,
  t,
}) {
  const [copied, setCopied] = useState(false);

  const visitedCount = countries.filter((c) => c.status === 'visited').length;
  const livedCount = countries.filter((c) => c.status === 'lived').length;
  const wantCount = countries.filter((c) => c.status === 'want').length;
  const totalCount = visitedCount + livedCount;
  const earthPercent = ((totalCount / 195) * 100).toFixed(1);

  // Quick lookup
  const statusMap = {};
  countries.forEach((c) => {
    statusMap[c.id.toUpperCase()] = c.status;
  });

  const getFill = (id) => {
    const s = statusMap[id];
    if (s === 'lived') return '#6366F1';
    if (s === 'visited') return '#38BDF8';
    if (s === 'want') return '#C084FC';
    return 'rgba(255, 255, 255, 0.18)';
  };

  const handleShareStory = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🌍 ${profile.name}'s World Passport on atls.\n✨ ${totalCount} Countries Explored (${earthPercent}% of Earth)\n✈️ Follow my journey: https://atls.app/${profile.handle}`,
        title: 'atls. Story Card',
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const handleCopyLink = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.sheetTitle}>{t.shareTitle}</Text>
              <Text style={styles.sheetSubtitle}>{t.shareSubtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* SPOTIFY-STYLE 9:16 VERTICAL STORY CARD */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContainer}
          >
            <LinearGradient
              colors={['#1E1035', '#0F172A', '#130B24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.storyCard}
            >
              {/* Ambient Glow Orbs */}
              <View style={styles.glowOrb1} />
              <View style={styles.glowOrb2} />

              {/* Card Header */}
              <View style={styles.storyCardHeader}>
                <View style={styles.brandRow}>
                  <Text style={styles.storyBrand}>atls</Text>
                  <Text style={styles.storyDot}>.</Text>
                </View>
                <View style={styles.passportBadge}>
                  <ShieldCheck size={11} color="#A78BFA" />
                  <Text style={styles.passportBadgeText}>{t.officialPassport}</Text>
                </View>
              </View>

              {/* User Avatar & Name */}
              <View style={styles.storyProfileSection}>
                <View style={styles.avatarBorder}>
                  <LinearGradient
                    colors={['#818CF8', '#C084FC']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.profileTextCol}>
                  <Text style={styles.storyName}>{profile.name}</Text>
                  <Text style={styles.storyHandle}>{profile.handle}</Text>
                  <View style={styles.storyLocationRow}>
                    <MapPin size={11} color="#38BDF8" />
                    <Text style={styles.storyLocation}>{profile.location}</Text>
                  </View>
                </View>
              </View>

              {/* Mini Illuminated World Map */}
              <View style={styles.storyMapWrapper}>
                <Svg viewBox={worldViewBox} style={styles.storyMapSvg}>
                  <G stroke="rgba(255, 255, 255, 0.25)" strokeWidth={0.5}>
                    {worldMapFeatures.map((f, i) => (
                      <Path
                        key={`${f.id}-${i}`}
                        d={f.d}
                        fill={getFill(f.id)}
                      />
                    ))}
                  </G>
                  {/* Pulse dot at Lisbon */}
                  <Circle cx="395" cy="370" r="5" fill="#38BDF8" opacity={0.6} />
                  <Circle cx="395" cy="370" r="2.5" fill="#FFFFFF" />
                </Svg>

                <View style={styles.mapOverlayPill}>
                  <Plane size={10} color="#38BDF8" style={{ transform: [{ rotate: '45deg' }] }} />
                  <Text style={styles.mapOverlayText}>{earthPercent}% OF EARTH EXPLORED</Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.storyStatsGrid}>
                <View style={styles.storyStatItem}>
                  <Text style={[styles.storyStatNum, { color: '#38BDF8' }]}>
                    {visitedCount < 10 ? `0${visitedCount}` : visitedCount}
                  </Text>
                  <Text style={styles.storyStatLabel}>{t.visited}</Text>
                </View>

                <View style={styles.storyStatDivider} />

                <View style={styles.storyStatItem}>
                  <Text style={[styles.storyStatNum, { color: '#818CF8' }]}>
                    {livedCount < 10 ? `0${livedCount}` : livedCount}
                  </Text>
                  <Text style={styles.storyStatLabel}>{t.livedIn}</Text>
                </View>

                <View style={styles.storyStatDivider} />

                <View style={styles.storyStatItem}>
                  <Text style={[styles.storyStatNum, { color: '#C084FC' }]}>
                    {wantCount < 10 ? `0${wantCount}` : wantCount}
                  </Text>
                  <Text style={styles.storyStatLabel}>{t.wishlist}</Text>
                </View>
              </View>

              {/* Footer MRZ & Branding */}
              <View style={styles.storyFooter}>
                <View>
                  <Text style={styles.tagline}>{t.partlyLocalTag}</Text>
                  <Text style={styles.mrzSample}>
                    PASSPORT ID: {profile.passportNo}
                  </Text>
                </View>
                <View style={styles.qrBox}>
                  <QrCode size={28} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </ScrollView>

          {/* Action CTAs */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleShareStory}
              activeOpacity={0.85}
              style={styles.instagramBtn}
            >
              <LinearGradient
                colors={['#833AB4', '#FD1D1D', '#FCB045']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtnInner}
              >
                <Share2 size={16} color="#FFFFFF" />
                <Text style={styles.instagramBtnText}>{t.instagramStory}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopyLink}
              activeOpacity={0.8}
              style={styles.copyBtn}
            >
              {copied ? (
                <Check size={16} color="#10B981" />
              ) : (
                <Copy size={16} color="#64748B" />
              )}
              <Text style={styles.copyBtnText}>
                {copied ? t.copiedToast : t.copyLink}
              </Text>
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
  modalContent: {
    backgroundColor: '#0B0D13',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardScrollContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  storyCard: {
    width: width * 0.84,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  glowOrb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
  },
  storyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  storyBrand: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  storyDot: {
    fontSize: 24,
    fontWeight: '900',
    color: '#5B4DFF',
  },
  passportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passportBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  storyProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 18,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  storyName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  storyHandle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  storyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  storyLocation: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  storyMapWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  storyMapSvg: {
    width: '100%',
    height: '100%',
  },
  mapOverlayPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mapOverlayText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  storyStatsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  storyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  storyStatNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  storyStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  storyStatDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  mrzSample: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  qrBox: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  instagramBtn: {
    flex: 1.4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  instagramBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  copyBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
