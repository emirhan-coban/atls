import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { darkColors as colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { availableCatalog } from '../data/travelData';
import { COUNTRY_FACTS, type VisaStatus } from '../data/countryFacts';
import { getCountryTrivia } from '../data/countryTrivia';
import type { Country } from '../stores/types';
import { indexNames } from './countryIndex';
import { shortenName } from './countryNames';
import { getHighlights } from './highlights';

type Lang = 'tr' | 'en';

const VISA: Record<VisaStatus, { en: string; tr: string }> = {
  free: { en: 'Visa-free', tr: 'Vizesiz' },
  conditional: { en: 'Visa-free (conditions)', tr: 'Vizesiz (koşullu)' },
  on_arrival: { en: 'Visa on arrival', tr: 'Varışta vize' },
  evisa: { en: 'e-Visa', tr: 'e-Vize' },
  eta: { en: 'ETA required', tr: 'ETA gerekli' },
  required: { en: 'Visa required', tr: 'Vize gerekli' },
  refused: { en: 'Entry refused', tr: 'Giriş yasak' },
  unknown: { en: 'Visa unknown', tr: 'Vize bilinmiyor' },
};

const STATUS_TEXT = {
  visited: { en: 'Visited', tr: 'Gittin' },
  lived: { en: 'Lived here', tr: 'Yaşadın' },
  want: { en: 'On your wishlist', tr: 'İstek listende' },
  none: { en: 'Not marked yet', tr: 'Henüz işaretlenmedi' },
};

export interface CountryInfo {
  id: string;
  name: string;
  nameTr: string;
  flag: string;
  continent: string;
  continentTr: string;
}

export function resolveCountry(iso: string): CountryInfo | null {
  const c = availableCatalog.find((x) => x.id === iso);
  if (c) return c;
  const n = indexNames.find((x) => x.iso2 === iso);
  return n ? { id: iso, name: n.name, nameTr: n.nameTr, flag: '', continent: '', continentTr: '' } : null;
}

/** Plays a lift-and-fade out. */
function Leaving({ children }: { children: React.ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - t.value, transform: [{ translateY: -16 * t.value }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.leaving, style]}>
      {children}
    </Animated.View>
  );
}

/** Rises in after `delay`. */
function Entering({ children, delay }: { children: React.ReactNode; delay: number }) {
  const t = useSharedValue(delay ? 0 : 1);
  useEffect(() => {
    if (delay) t.value = withDelay(delay, withTiming(1, { duration: 580, easing: Easing.out(Easing.cubic) }));
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ translateY: 18 * (1 - t.value) }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

interface Props {
  iso: string;
  countries: Country[];
  lang: Lang;
  onClose: () => void;
  /** Opens CountryStatusModal for this country. */
  onEditStatus: (country: Country) => void;
  onMoreDetails: (iso: string) => void;
}

export default function CountryPanel({ iso, countries, lang, onClose, onEditStatus, onMoreDetails }: Props) {
  const [shown, setShown] = useState(iso);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const shownRef = useRef(iso);

  // Depends only on the selection: depending on `shown` too would re-run the effect, and its cleanup would kill the drop timer
  useEffect(() => {
    if (iso === shownRef.current) return;
    const old = shownRef.current;
    shownRef.current = iso;
    setOutgoing(old);
    setShown(iso);
    const h = setTimeout(() => setOutgoing(null), 560);
    return () => clearTimeout(h);
  }, [iso]);

  const swapping = outgoing !== null;

  return (
    <View>
      <TouchableOpacity style={styles.close} onPress={() => { Haptics.selectionAsync(); onClose(); }} accessibilityRole="button" accessibilityLabel={lang === 'tr' ? 'Kapat' : 'Close'} hitSlop={10}>
        <X size={18} color={colors.text.primary} />
      </TouchableOpacity>
      <View>
        {outgoing ? (
          <Leaving key={`out-${outgoing}`}>
            <Details iso={outgoing} countries={countries} lang={lang} onEditStatus={onEditStatus} onMoreDetails={onMoreDetails} />
          </Leaving>
        ) : null}
        <Entering key={`in-${shown}`} delay={swapping ? 240 : 0}>
          <Details iso={shown} countries={countries} lang={lang} onEditStatus={onEditStatus} onMoreDetails={onMoreDetails} />
        </Entering>
      </View>
    </View>
  );
}

function Details({ iso, countries, lang, onEditStatus, onMoreDetails }: Omit<Props, 'onClose'>) {
  const info = resolveCountry(iso);
  const mine = countries.find((c) => c.id === iso);
  const facts = COUNTRY_FACTS[iso];
  const name = info ? (lang === 'tr' ? info.nameTr : info.name) : iso;
  const status = mine?.status ?? 'none';
  const trivia = info ? getCountryTrivia(iso, name, lang) : '';

  const edit = () => {
    if (!info) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditStatus(
      mine ?? { id: iso, name: info.name, nameTr: info.nameTr, flag: info.flag, continent: info.continent, continentTr: info.continentTr, status: 'want' }
    );
  };

  const chips: { k: string; v: string }[] = [];
  if (facts) {
    chips.push({ k: lang === 'tr' ? 'Başkent' : 'Capital', v: facts.capital[lang] });
    if (facts.currency) chips.push({ k: lang === 'tr' ? 'Para birimi' : 'Currency', v: `${facts.currency[lang === 'tr' ? 'nameTr' : 'nameEn']} (${facts.currency.symbol || facts.currency.code})` });
    if (facts.languages[lang].length) chips.push({ k: lang === 'tr' ? 'Dil' : 'Language', v: facts.languages[lang].slice(0, 2).join(', ') });
    chips.push({ k: lang === 'tr' ? 'TR pasaportu' : 'TR passport', v: VISA[facts.visa.status][lang] });
    chips.push({ k: lang === 'tr' ? 'Trafik' : 'Driving', v: facts.drivesOn === 'left' ? (lang === 'tr' ? 'Sol' : 'Left') : lang === 'tr' ? 'Sağ' : 'Right' });
    chips.push({ k: lang === 'tr' ? 'Alan' : 'Area', v: `${Math.round(facts.areaKm2).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} km²` });
  }

  return (
    <View style={styles.details}>
      {info?.continent ? <Text style={styles.continent}>{(lang === 'tr' ? info.continentTr : info.continent).toUpperCase()}</Text> : null}
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
        {shortenName(name).toUpperCase()}
      </Text>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: status === 'lived' ? colors.status.lived.color : status === 'visited' ? colors.status.visited.color : status === 'want' ? colors.gold.base : colors.text.faint }]} />
        <Text style={styles.statusText}>{STATUS_TEXT[status][lang]}</Text>
        <TouchableOpacity style={styles.cta} onPress={edit} activeOpacity={0.8}>
          <Text style={styles.ctaText}>{status === 'none' ? (lang === 'tr' ? 'İşaretle' : 'Mark') : lang === 'tr' ? 'Düzenle' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {chips.length ? (
        <View style={styles.chips}>
          {chips.map((c) => (
            <View key={c.k} style={styles.chip}>
              <Text style={styles.chipK}>{c.k}</Text>
              <Text style={styles.chipV} numberOfLines={1}>{c.v}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <HighlightsBlock iso={iso} name={name} lang={lang} />

      {trivia ? <Text style={styles.trivia}>{trivia}</Text> : null}

      <TouchableOpacity onPress={() => onMoreDetails(iso)} style={styles.more}>
        <Text style={styles.moreText}>{lang === 'tr' ? 'Tüm ülke detayları' : 'Full country details'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const W = Dimensions.get('window').width;
const CARD_W = W - 40;

function HighlightsBlock({ iso, name, lang }: { iso: string; name: string; lang: Lang }) {
  const h = getHighlights(iso, lang);
  const [page, setPage] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);

  if (!h.photos.length) {
    return <Text style={styles.empty}>{lang === 'tr' ? `${name} için öne çıkanlar yolda.` : `Highlights for ${name} are on the way.`}</Text>;
  }
  return (
    <View style={styles.hl}>
      <FlatList
        data={h.photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => p.url}
        snapToInterval={CARD_W}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / CARD_W))}
        renderItem={({ item }) => (
          <Pressable onPress={() => setViewer(page)} style={styles.card}>
            <Image source={{ uri: item.url }} style={styles.cardImg} resizeMode="cover" />
          </Pressable>
        )}
      />
      {h.photos.length > 1 ? (
        <View style={styles.dots}>
          {h.photos.map((p, i) => (
            <View key={p.url} style={[styles.pageDot, i === page && styles.pageDotOn]} />
          ))}
        </View>
      ) : null}
      {h.places.map((p, i) => (
        <HighlightRow key={p.title} index={i} active={i === Math.min(page, h.places.length - 1)} title={p.title} city={p.city} />
      ))}
      <Viewer
        visible={viewer !== null}
        photo={h.photos[viewer ?? 0]}
        place={h.places[Math.min(viewer ?? 0, Math.max(h.places.length - 1, 0))]}
        country={name}
        onClose={() => setViewer(null)}
      />
    </View>
  );
}

function HighlightRow({ index, active, title, city }: { index: number; active: boolean; title: string; city: string }) {
  const o = useSharedValue(active ? 1 : 0.5);
  useEffect(() => {
    o.value = withTiming(active ? 1 : 0.5, { duration: 850, easing: Easing.out(Easing.cubic) });
  }, [active, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.rowNum}>{String(index + 1).padStart(2, '0')}</Text>
      <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.rowCity} numberOfLines={1}>{city}</Text>
    </Animated.View>
  );
}

function Viewer({ visible, photo, place, country, onClose }: { visible: boolean; photo?: { url: string; credit?: string }; place?: { title: string; city: string; blurb: string }; country: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const zoom = useSharedValue(1.15);
  const fade = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      zoom.value = 1.15;
      fade.value = 0;
      zoom.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
      fade.value = withTiming(1, { duration: 300 });
    }
  }, [visible, zoom, fade]);
  const img = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }], opacity: fade.value }));
  const close = () => {
    fade.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
    setTimeout(onClose, 240);
  };
  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={close}>
      <View style={styles.viewer}>
        {photo ? <Animated.Image source={{ uri: photo.url }} style={[StyleSheet.absoluteFill, img]} resizeMode="cover" /> : null}
        <View style={[StyleSheet.absoluteFill, styles.viewerShade]} />
        <TouchableOpacity style={[styles.viewerClose, { top: insets.top + 12 }]} onPress={close} hitSlop={12}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.viewerText, { paddingBottom: insets.bottom + 36 }]}>
          <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.eyebrow}>
            {[country, place?.city].filter(Boolean).join(' · ').toUpperCase()}
          </Animated.Text>
          {place ? (
            <>
              <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.viewerTitle}>{place.title}</Animated.Text>
              <Animated.Text entering={FadeInDown.delay(520).duration(500)} style={styles.viewerBlurb}>{place.blurb}</Animated.Text>
            </>
          ) : null}
          {photo?.credit ? <Text style={styles.credit}>{photo.credit}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  close: { position: 'absolute', right: 0, top: 0, zIndex: 5, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.glass.fillStrong, alignItems: 'center', justifyContent: 'center' },
  leaving: { position: 'absolute', top: 0, left: 0, right: 0 },
  details: { gap: 14 },
  continent: { color: colors.text.secondary, fontSize: 11, letterSpacing: 2.4, fontWeight: '700' },
  title: { color: colors.text.primary, fontFamily: fonts.display, fontSize: 44, lineHeight: 48, paddingRight: 40, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: colors.text.soft, fontSize: 14, flex: 1 },
  cta: { backgroundColor: colors.gold.base, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  ctaText: { color: colors.gold.onGold, fontWeight: '800', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.glass.fill, borderWidth: 1, borderColor: colors.glass.hairline, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, maxWidth: '100%' },
  chipK: { color: colors.text.muted, fontSize: 10, letterSpacing: 0.8, fontWeight: '700', textTransform: 'uppercase' },
  chipV: { color: colors.text.primary, fontSize: 13, marginTop: 2 },
  hl: { gap: 10 },
  card: { width: CARD_W, aspectRatio: 16 / 10, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.canvas.surface },
  cardImg: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  pageDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  pageDotOn: { backgroundColor: colors.gold.base },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingVertical: 4 },
  rowNum: { color: colors.gold.base, fontSize: 12, fontWeight: '700', width: 22 },
  rowTitle: { color: colors.text.primary, fontSize: 15, flexShrink: 1 },
  rowCity: { color: colors.text.muted, fontSize: 12, flex: 1, textAlign: 'right' },
  empty: { color: colors.text.muted, fontFamily: fonts.displayItalic, fontSize: 17 },
  trivia: { color: colors.text.secondary, fontSize: 13, lineHeight: 20 },
  more: { alignSelf: 'flex-start', paddingVertical: 6 },
  moreText: { color: colors.gold.light, fontSize: 13, fontWeight: '700' },
  viewer: { flex: 1, backgroundColor: '#000' },
  viewerShade: { backgroundColor: 'rgba(0,0,0,0.35)' },
  viewerClose: { position: 'absolute', right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  viewerText: { position: 'absolute', left: 24, right: 24, bottom: 0, gap: 8 },
  eyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 2.4, fontWeight: '700' },
  viewerTitle: { color: '#fff', fontFamily: fonts.display, fontSize: 38, lineHeight: 42 },
  viewerBlurb: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22 },
  credit: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 6 },
});
