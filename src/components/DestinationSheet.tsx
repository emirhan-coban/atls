import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CalendarClock, Check, ExternalLink, Heart, Navigation, Utensils, X, MapPin } from 'lucide-react-native';
import Button from './ui/Button';
import Heading from './ui/Heading';
import PlanEditorSheet from './PlanEditorSheet';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { CuratedDestination, MapPoint } from '../data/curatedDestinations';
import { ROUTE_PHOTOS } from '../data/routePhotos';
import { COUNTRY_CLIMATE } from '../data/countryClimate';
import { getCountryFacts, visaGroup, visaLabel } from '../data/countryProfile';
import { MONTHS } from '../data/months';
import { rt } from '../localization/routes';
import { hoursFromTurkey, formatUtc } from '../utils/climate';
import { formatMonthList, goodMonthsFor } from '../utils/discover';
import { openAppleMaps, openGoogleMaps } from '../utils/mapHelper';
import { CountryStatus } from '../stores/types';

interface DestinationSheetProps {
  dest: CuratedDestination | null;
  visible: boolean;
  onClose: () => void;
  currentLang: 'tr' | 'en';
  /** The user's status for this country, if any. */
  status?: CountryStatus;
  onAddToWishlist: (country: any) => void;
  onOpenCountry?: (countryId: string) => void;
}

/** Full-screen page for one route: photo, quick facts, places and food with map links, and the actions that matter. */
export default function DestinationSheet({ dest, visible, onClose, currentLang, status, onAddToWishlist, onOpenCountry }: DestinationSheetProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [planOpen, setPlanOpen] = useState(false);
  if (!dest) return null;

  const photo = dest.heroImage ? { url: dest.heroImage, credit: '' } : ROUTE_PHOTOS[dest.id] ?? null;
  const facts = getCountryFacts(dest.id);
  const climate = COUNTRY_CLIMATE[dest.id];
  const months = goodMonthsFor(dest.id);
  const monthNames = MONTHS.map((m) => (currentLang === 'tr' ? m.shortTr : m.shortEn));
  const group = facts ? visaGroup(facts.visa.status) : null;
  const visaColor = group === 'free' ? colors.status.visited.color : group === 'easy' ? colors.gold.base : group === 'required' ? colors.danger : colors.text.muted;
  const diff = climate ? hoursFromTurkey(climate.utc) : 0;
  const diffText = diff === 0 ? rt('sameTime', currentLang) : rt(diff > 0 ? 'hoursAhead' : 'hoursBehind', currentLang, { n: Math.abs(diff) });
  const onWishlist = status === 'want';
  const been = status === 'visited' || status === 'lived';

  const addWish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAddToWishlist({
      id: dest.id,
      name: dest.name,
      nameTr: dest.nameTr,
      flag: dest.flag,
      continent: dest.continent,
      continentTr: dest.continentTr,
      status: 'want',
      year: new Date().getFullYear().toString(),
    });
  };

  const point = (p: MapPoint, food: boolean) => (
    <View key={p.title} style={styles.point}>
      <View style={styles.pointHead}>
        <View style={styles.pointIcon}>
          {food ? <Utensils size={15} color={colors.gold.base} /> : <MapPin size={15} color={colors.status.visited.color} />}
        </View>
        <View style={styles.pointTitles}>
          <Text style={styles.pointTitle}>{p.title}</Text>
          <Text style={styles.pointSub}>{p.city} · {p.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.pointDesc}>{p.desc[currentLang]}</Text>
      <View style={styles.mapRow}>
        <TouchableOpacity style={styles.mapBtn} onPress={() => { Haptics.selectionAsync(); openAppleMaps(p.mapQuery); }} accessibilityRole="button">
          <Navigation size={13} color={colors.text.primary} />
          <Text style={styles.mapBtnText}>Apple Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn} onPress={() => { Haptics.selectionAsync(); openGoogleMaps(p.mapQuery); }} accessibilityRole="button">
          <ExternalLink size={13} color={colors.text.primary} />
          <Text style={styles.mapBtnText}>Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const fact = (label: string, value: string, color?: string) => (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, color ? { color } : null]} numberOfLines={2}>{value}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            {photo ? (
              <Image source={{ uri: photo.url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <LinearGradient colors={FALLBACK_GRADIENT} style={[StyleSheet.absoluteFill, styles.heroFallback]}>
                <Text style={styles.heroFlag}>{dest.flag}</Text>
              </LinearGradient>
            )}
            <LinearGradient colors={['rgba(0,0,0,0.25)', 'transparent', 'rgba(9,11,14,0.88)']} style={StyleSheet.absoluteFill} />
            <SafeAreaView edges={[]} style={styles.heroTop}>
              <View style={styles.tag}><Text style={styles.tagText}>{dest.tag[currentLang]}</Text></View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={styles.heroBottom}>
              <Text style={styles.heroName}>{dest.flag}  {currentLang === 'tr' ? dest.nameTr : dest.name}</Text>
              <Text style={styles.heroHeadline}>{dest.headline[currentLang]}</Text>
              {photo?.credit ? <Text style={styles.credit}>{rt('photoBy', currentLang)}: {photo.credit} · Wikimedia Commons</Text> : null}
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.facts}>
              {facts && facts.visa.status !== 'unknown' && fact(rt('entry', currentLang), visaLabel(facts.visa.status, currentLang), visaColor)}
              {months.length > 0 && fact(rt('bestTime', currentLang), formatMonthList(months, monthNames))}
              {climate && fact(rt('clock', currentLang), `${formatUtc(climate.utc)} · ${diffText}`)}
              {facts?.currency && fact(rt('money', currentLang), `${facts.currency.code} ${facts.currency.symbol}`)}
            </View>

            <Heading style={styles.sectionTitle}>{rt('places', currentLang)}</Heading>
            {dest.seePlaces.map((p) => point(p, false))}

            <Heading style={styles.sectionTitle}>{rt('food', currentLang)}</Heading>
            {dest.foodPlaces.map((p) => point(p, true))}

            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>{rt('tip', currentLang).toUpperCase()}</Text>
              <Text style={styles.tipText}>{dest.insiderTip[currentLang]}</Text>
            </View>
            <Text style={styles.note}>{rt('verify', currentLang)}</Text>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.actions}>
          <Button
            label={rt('planTrip', currentLang)}
            onPress={() => setPlanOpen(true)}
            icon={(color) => <CalendarClock size={17} color={color} />}
            style={styles.actionMain}
          />
          {been ? (
            <View style={[styles.statusPill]}><Check size={15} color={colors.status.visited.color} /><Text style={styles.statusText}>{rt('visited', currentLang)}</Text></View>
          ) : (
            <Button
              variant="secondary"
              label={onWishlist ? rt('inWish', currentLang) : rt('addWish', currentLang)}
              onPress={onWishlist ? () => {} : addWish}
              icon={(color) => <Heart size={16} color={color} fill={onWishlist ? color : 'none'} />}
              style={styles.actionSide}
            />
          )}
          {onOpenCountry && (
            <TouchableOpacity onPress={() => { onClose(); onOpenCountry(dest.id); }} style={styles.link} accessibilityRole="button">
              <Text style={styles.linkText}>{rt('countryPage', currentLang)}</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>

        <PlanEditorSheet visible={planOpen} onClose={() => setPlanOpen(false)} currentLang={currentLang} countryId={dest.id} />
      </View>
    </Modal>
  );
}

/** Fixed dark tones: white text on top must read in the light theme too. */
const FALLBACK_GRADIENT = ['#3B4456', '#161A22'] as const;

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    content: { paddingBottom: 24 },
    hero: { height: 340, justifyContent: 'space-between', overflow: 'hidden', backgroundColor: colors.canvas.surface },
    heroFallback: { alignItems: 'center', justifyContent: 'center' },
    heroFlag: { fontSize: 120, opacity: 0.4 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    tag: { backgroundColor: 'rgba(9,11,14,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
    tagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(9,11,14,0.55)' },
    heroBottom: { padding: 20, gap: 6 },
    heroName: { color: '#FFFFFF', fontSize: 44, lineHeight: 48, fontFamily: fonts.display },
    heroHeadline: { color: 'rgba(255,255,255,0.92)', fontSize: 22, lineHeight: 26, fontFamily: fonts.displayItalic },
    credit: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },
    body: { padding: 20, gap: 14 },
    facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    fact: { flexGrow: 1, flexBasis: '45%', padding: 14, borderRadius: 16, gap: 4, backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline },
    factLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.text.muted },
    factValue: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
    sectionTitle: { fontSize: 34, lineHeight: 38, color: colors.text.primary, fontFamily: fonts.display, marginTop: 10 },
    point: { padding: 16, borderRadius: 18, gap: 10, backgroundColor: colors.panel.base, borderWidth: 1, borderColor: colors.glass.hairline },
    pointHead: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    pointIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass.fillStrong },
    pointTitles: { flex: 1, gap: 1 },
    pointTitle: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
    pointSub: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    pointDesc: { fontSize: 14, lineHeight: 20, color: colors.text.soft },
    mapRow: { flexDirection: 'row', gap: 8 },
    mapBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.glass.fillStrong },
    mapBtnText: { fontSize: 13, fontWeight: '700', color: colors.text.primary },
    tipBox: { padding: 16, borderRadius: 18, gap: 6, backgroundColor: colors.gold.tint, borderWidth: 1, borderColor: colors.gold.border },
    tipLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.gold.light },
    tipText: { fontSize: 20, lineHeight: 25, color: colors.text.primary, fontFamily: fonts.displayItalic },
    note: { fontSize: 11, lineHeight: 16, color: colors.text.muted },
    actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.glass.border, backgroundColor: colors.canvas.raised },
    actionMain: { flexGrow: 1, flexBasis: '45%' },
    actionSide: { flexGrow: 1, flexBasis: '45%' },
    statusPill: { flexGrow: 1, flexBasis: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    statusText: { fontSize: 15, fontWeight: '800', color: colors.status.visited.color },
    link: { width: '100%', alignItems: 'center', paddingVertical: 6 },
    linkText: { fontSize: 13, fontWeight: '700', color: colors.gold.light },
  })
);
