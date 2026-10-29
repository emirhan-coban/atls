import React, { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Calendar, ChevronRight, Minus, Plus, Share2, Star, Target, X } from 'lucide-react-native';
import Button from './ui/Button';
import Chip from './ui/Chip';
import EmptyState from './EmptyState';
import AchievementBadge from './AchievementBadge';
import TripEditorSheet from './TripEditorSheet';
import CelebrationLayer from './CelebrationLayer';
import StampView from './StampView';
import YearSummarySheet from './YearSummarySheet';
import { photoUri } from '../utils/photos';
import ContinentalProgress from './ContinentalProgress';
import { makeStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';
import { availableCatalog, getLocalizedCountryName } from '../data/travelData';
import { ACHIEVEMENTS } from '../data/achievements';
import { getLevelProgress } from '../data/levels';
import { monthShort } from '../data/months';
import { jt, tripTypeLabel } from '../localization/journey';
import { computeStats, getGoalProgress, sortTripsNewestFirst } from '../utils/stats';
import { Country, Profile, Trip } from '../stores/types';
import { useProgressStore } from '../stores/useProgressStore';

type Tab = 'timeline' | 'stamps' | 'stats' | 'badges';

interface JourneyModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  trips: Trip[];
  profile?: Profile;
  currentLang: 'tr' | 'en';
}

const countryOf = (id: string) => availableCatalog.find((c: any) => c.id.toUpperCase() === id.toUpperCase());

export default function JourneyModal({
  visible,
  onClose,
  countries,
  trips,
  profile,
  currentLang,
}: JourneyModalProps) {
  // The editor lives inside this modal: iOS cannot present a second, separate Modal on top of an open one
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [editor, setEditor] = useState<{ trip?: Trip | null } | null>(null);
  const onAddTrip = () => setEditor({});
  const onEditTrip = (trip: Trip) => setEditor({ trip });
  const { colors } = useTheme();
  const styles = useStyles();
  const [tab, setTab] = useState<Tab>('timeline');
  const yearlyGoal = useProgressStore((s) => s.yearlyGoal);
  const setYearlyGoal = useProgressStore((s) => s.setYearlyGoal);
  const unlocked = useProgressStore((s) => s.unlocked);

  const stats = useMemo(() => computeStats(countries, trips), [countries, trips]);
  const level = useMemo(() => getLevelProgress(stats.visitedCount), [stats.visitedCount]);
  const goal = useMemo(() => getGoalProgress(yearlyGoal, stats), [yearlyGoal, stats]);
  const ordered = useMemo(() => sortTripsNewestFirst(trips), [trips]);
  const thisYear = new Date().getFullYear();

  const byYear = useMemo(() => {
    const groups: { year: string; trips: Trip[] }[] = [];
    for (const trip of ordered) {
      const last = groups[groups.length - 1];
      if (last && last.year === trip.year) last.trips.push(trip);
      else groups.push({ year: trip.year, trips: [trip] });
    }
    return groups;
  }, [ordered]);

  const nameOf = (id: string) => {
    const c = countryOf(id);
    return c ? getLocalizedCountryName(c, currentLang) : id;
  };
  const flagOf = (id: string) => countryOf(id)?.flag ?? '🌍';
  const maxYearCount = Math.max(1, ...stats.tripsByYear.map((y) => y.count));
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.isUnlocked(countries, profile, trips)).length;

  const changeGoal = (delta: number) => {
    Haptics.selectionAsync();
    const current = yearlyGoal && yearlyGoal.year === thisYear ? yearlyGoal.target : 0;
    const next = Math.max(0, Math.min(99, current + delta));
    setYearlyGoal(next === 0 ? null : { year: thisYear, target: next });
  };

  const renderStars = (rating: number) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          color={colors.gold.base}
          fill={n <= rating ? colors.gold.base : 'transparent'}
          strokeWidth={1.8}
        />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{jt('title', currentLang)}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
            <X size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <Chip label={jt('tabTimeline', currentLang)} selected={tab === 'timeline'} onPress={() => setTab('timeline')} />
          <Chip label={jt('tabStamps', currentLang)} selected={tab === 'stamps'} onPress={() => setTab('stamps')} />
          <Chip label={jt('tabStats', currentLang)} selected={tab === 'stats'} onPress={() => setTab('stats')} />
          <Chip label={jt('tabBadges', currentLang)} selected={tab === 'badges'} onPress={() => setTab('badges')} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === 'timeline' && (
            <>
              <Button
                label={jt('addTrip', currentLang)}
                onPress={onAddTrip}
                size="md"
                icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
                style={styles.addBtn}
              />
              {byYear.length === 0 ? (
                <EmptyState
                  type="passport"
                  title={jt('emptyTitle', currentLang)}
                  description={jt('emptyDesc', currentLang)}
                />
              ) : (
                byYear.map((group) => (
                  <View key={group.year} style={styles.yearBlock}>
                    <Text style={styles.yearHeading}>{group.year}</Text>
                    {group.trips.map((trip) => (
                      <TouchableOpacity
                        key={trip.id}
                        onPress={() => onEditTrip(trip)}
                        activeOpacity={0.8}
                        style={styles.tripCard}
                        accessibilityRole="button"
                        accessibilityLabel={`${nameOf(trip.countryId)} ${trip.year}`}
                      >
                        <Text style={styles.tripFlag}>{flagOf(trip.countryId)}</Text>
                        <View style={styles.tripBody}>
                          <Text style={styles.tripCountry}>{nameOf(trip.countryId)}</Text>
                          <Text style={styles.tripMeta}>
                            {[
                              monthShort(trip.month, currentLang) || jt('unknownMonth', currentLang),
                              trip.days ? `${trip.days} ${jt('daysUnit', currentLang)}` : null,
                              tripTypeLabel(trip.type, currentLang),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                          {trip.cities.length > 0 && <Text style={styles.tripCities}>{trip.cities.join(' → ')}</Text>}
                          {trip.photos && trip.photos.length > 0 && (
                            <View style={styles.thumbRow}>
                              {trip.photos.slice(0, 4).map((name) => (
                                <Image key={name} source={{ uri: photoUri(name) }} style={styles.thumb} />
                              ))}
                              {trip.photos.length > 4 && <Text style={styles.thumbMore}>+{trip.photos.length - 4}</Text>}
                            </View>
                          )}
                          {!!trip.notes && (
                            <Text style={styles.tripNotes} numberOfLines={2}>
                              {trip.notes}
                            </Text>
                          )}
                        </View>
                        <View style={styles.tripRight}>
                          {trip.rating ? renderStars(trip.rating) : null}
                          <ChevronRight size={16} color={colors.text.muted} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </>
          )}

          {tab === 'stamps' && (
            ordered.length === 0 ? (
              <EmptyState type="stamps" title={jt('emptyTitle', currentLang)} description={jt('stampsEmpty', currentLang)} />
            ) : (
              <View style={styles.stampGrid}>
                {ordered.map((trip) => {
                  const entry = countryOf(trip.countryId);
                  const status = countries.find((c) => c.id === trip.countryId)?.status;
                  return (
                    <TouchableOpacity key={trip.id} onPress={() => onEditTrip(trip)} activeOpacity={0.85} style={styles.stampCell}>
                      <StampView
                        countryId={trip.countryId}
                        title={entry ? getLocalizedCountryName(entry, currentLang) : trip.countryId}
                        dateText={[monthShort(trip.month, currentLang), trip.year].filter(Boolean).join(' ')}
                        status={status === 'lived' ? 'lived' : 'visited'}
                        salt={trip.id}
                        size={150}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}

          {tab === 'stats' && (
            <>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>
                  {jt('level', currentLang)} {level.current.level}
                </Text>
                <Text style={styles.levelName}>{currentLang === 'tr' ? level.current.nameTr : level.current.nameEn}</Text>
                <View style={styles.track}>
                  <View style={[styles.trackFill, { width: `${Math.round(level.fraction * 100)}%` }]} />
                </View>
                <Text style={styles.cardHint}>
                  {level.next
                    ? jt('levelRemaining', currentLang, { n: level.remaining })
                    : jt('levelMax', currentLang)}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.goalHeader}>
                  <Target size={14} color={colors.gold.base} />
                  <Text style={styles.cardLabel}>
                    {jt('goalTitle', currentLang)} {thisYear}
                  </Text>
                </View>
                {goal ? (
                  <>
                    <Text style={styles.goalText}>
                      {goal.done
                        ? jt('goalDone', currentLang)
                        : jt('goalProgress', currentLang, { a: goal.achieved, t: goal.target })}
                    </Text>
                    <View style={styles.track}>
                      <View style={[styles.trackFill, { width: `${Math.round(goal.fraction * 100)}%` }]} />
                    </View>
                  </>
                ) : (
                  <Text style={styles.cardHint}>{jt('goalHint', currentLang)}</Text>
                )}
                <View style={styles.goalStepper}>
                  <TouchableOpacity onPress={() => changeGoal(-1)} style={styles.stepBtn} accessibilityLabel="Decrease goal">
                    <Minus size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.goalNumber}>{yearlyGoal && yearlyGoal.year === thisYear ? yearlyGoal.target : '—'}</Text>
                  <TouchableOpacity onPress={() => changeGoal(1)} style={styles.stepBtn} accessibilityLabel="Increase goal">
                    <Plus size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {trips.length > 0 && (
                <Button
                  label={jt('shareYear', currentLang)}
                  onPress={() => setSummaryOpen(true)}
                  variant="secondary"
                  size="md"
                  icon={(color) => <Share2 size={15} color={color} />}
                />
              )}

              <View style={styles.tiles}>
                {[
                  { label: jt('countries', currentLang), value: stats.visitedCount },
                  { label: jt('trips', currentLang), value: stats.tripCount },
                  { label: jt('daysAbroad', currentLang), value: stats.totalDays },
                  { label: jt('yearsTraveled', currentLang), value: stats.yearsTraveled },
                ].map((tile) => (
                  <View key={tile.label} style={styles.tile}>
                    <Text style={styles.tileValue}>{tile.value}</Text>
                    <Text style={styles.tileLabel}>{tile.label}</Text>
                  </View>
                ))}
              </View>

              {stats.tripsByYear.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>{jt('tripsPerYear', currentLang)}</Text>
                  <View style={styles.chart}>
                    {stats.tripsByYear.slice(-8).map((y) => (
                      <View key={y.year} style={styles.barCol}>
                        <Text style={styles.barCount}>{y.count}</Text>
                        <View style={[styles.bar, { height: 8 + (y.count / maxYearCount) * 72 }]} />
                        <Text style={styles.barYear}>{y.year.slice(2)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {stats.topCountries.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>{jt('topCountries', currentLang)}</Text>
                  {stats.topCountries.map((row) => (
                    <View key={row.countryId} style={styles.topRow}>
                      <Text style={styles.topFlag}>{flagOf(row.countryId)}</Text>
                      <Text style={styles.topName}>{nameOf(row.countryId)}</Text>
                      <Text style={styles.topCount}>
                        {row.count}× {jt('trips', currentLang)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {(stats.firstTrip || stats.lastTrip || stats.averageRating) && (
                <View style={styles.card}>
                  {stats.firstTrip && (
                    <View style={styles.factRow}>
                      <Calendar size={14} color={colors.gold.base} />
                      <Text style={styles.factText}>
                        {jt('firstTrip', currentLang)}: {nameOf(stats.firstTrip.countryId)}, {stats.firstTrip.year}
                      </Text>
                    </View>
                  )}
                  {stats.lastTrip && (
                    <View style={styles.factRow}>
                      <Calendar size={14} color={colors.gold.base} />
                      <Text style={styles.factText}>
                        {jt('lastTrip', currentLang)}: {nameOf(stats.lastTrip.countryId)}, {stats.lastTrip.year}
                      </Text>
                    </View>
                  )}
                  {stats.averageRating !== null && (
                    <View style={styles.factRow}>
                      <Star size={14} color={colors.gold.base} fill={colors.gold.base} />
                      <Text style={styles.factText}>
                        {jt('avgRating', currentLang)}: {stats.averageRating}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <ContinentalProgress countries={countries} currentLang={currentLang} />
            </>
          )}

          {tab === 'badges' && (
            <>
              <Text style={styles.badgeSummary}>
                {jt('badgesUnlocked', currentLang, { n: unlockedCount, t: ACHIEVEMENTS.length })}
              </Text>
              <View style={styles.badgeGrid}>
                {ACHIEVEMENTS.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    countries={countries}
                    profile={profile}
                    trips={trips}
                    lang={currentLang}
                  />
                ))}
              </View>
              {Object.keys(unlocked).length === 0 && null}
            </>
          )}
        </ScrollView>

        <CelebrationLayer hostId="journey" active={visible} currentLang={currentLang} />

        <YearSummarySheet visible={summaryOpen} onClose={() => setSummaryOpen(false)} trips={trips} currentLang={currentLang} />

        <TripEditorSheet
          visible={editor !== null}
          onClose={() => setEditor(null)}
          currentLang={currentLang}
          trip={editor?.trip}
        />
      </SafeAreaView>
    </Modal>
  );
}

const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.canvas.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 12,
    },
    title: { fontSize: 28, color: colors.text.primary, fontFamily: fonts.display },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass.fillStrong,
    },
    tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
    content: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
    addBtn: { alignSelf: 'flex-start' },
    yearBlock: { gap: 10 },
    yearHeading: { fontSize: 20, color: colors.text.primary, fontFamily: fonts.display, marginTop: 8 },
    tripCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      borderRadius: 20,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    tripFlag: { fontSize: 30 },
    tripBody: { flex: 1, gap: 3 },
    tripCountry: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
    tripMeta: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
    tripCities: { fontSize: 12, fontWeight: '600', color: colors.gold.base },
    tripNotes: { fontSize: 13, color: colors.text.soft, marginTop: 2 },
    stampGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
    stampCell: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 22,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    thumbRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.glass.fillStrong },
    thumbMore: { fontSize: 12, fontWeight: '800', color: colors.text.secondary },
    tripRight: { alignItems: 'flex-end', gap: 8 },
    starsRow: { flexDirection: 'row', gap: 2 },
    card: {
      padding: 18,
      borderRadius: 22,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
      gap: 10,
    },
    cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text.secondary },
    cardHint: { fontSize: 13, color: colors.text.secondary },
    levelName: { fontSize: 26, color: colors.text.primary, fontFamily: fonts.display },
    track: { height: 8, borderRadius: 4, backgroundColor: colors.glass.fillStrong, overflow: 'hidden' },
    trackFill: { height: '100%', borderRadius: 4, backgroundColor: colors.gold.base },
    goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    goalText: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
    goalStepper: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glass.fillStrong,
    },
    goalNumber: { fontSize: 22, fontWeight: '800', color: colors.text.primary, minWidth: 40, textAlign: 'center' },
    tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tile: {
      flexGrow: 1,
      flexBasis: '45%',
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.panel.base,
      borderWidth: 1,
      borderColor: colors.glass.hairline,
    },
    tileValue: { fontSize: 30, color: colors.text.primary, fontFamily: fonts.display },
    tileLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: colors.text.secondary, marginTop: 2 },
    chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, paddingTop: 8 },
    barCol: { alignItems: 'center', gap: 4 },
    bar: { width: 22, borderRadius: 8, backgroundColor: colors.gold.base },
    barCount: { fontSize: 11, fontWeight: '800', color: colors.text.secondary },
    barYear: { fontSize: 11, fontWeight: '700', color: colors.text.muted },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
    topFlag: { fontSize: 22 },
    topName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text.primary },
    topCount: { fontSize: 12, fontWeight: '700', color: colors.text.secondary },
    factRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    factText: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
    badgeSummary: { fontSize: 14, fontWeight: '700', color: colors.text.secondary },
    badgeGrid: { gap: 12 },
  })
);
