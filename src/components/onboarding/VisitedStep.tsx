import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Globe2, Compass, ArrowRight, Check, Search, MapPin } from 'lucide-react-native';
import WorldMap from '../WorldMap';
import { CONTINENT_FILTERS } from '../../data/continents';
import Heading from '../ui/Heading';
import { tOnboardingScreen } from '../../localization/screens/OnboardingScreen';
import type { OnboardingCtx } from './useOnboarding';

export function VisitedStep({ ctx }: { ctx: OnboardingCtx }) {
  const { colors, continentFilter, currentLang, exploredPercent, filteredVisitedCatalog, homeCountry, isMapInteracting, mapPreviewCountries, renderTopBar, setContinentFilter, setIsMapInteracting, setStep, setVisitedSearch, styles, t, toggleVisitedCountry, totalCount, visitedIds, visitedSearch } = ctx;
  return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(2, 4)}

        <View style={styles.flex1}>
          <ScrollView
            scrollEnabled={!isMapInteracting}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.visitedStepScrollContent}
          >
            {/* Prominent Step 3 Title & Purpose */}
            <View style={styles.visitedTitleSection}>
              <View style={styles.visitedStepBadge}>
                <Compass size={12} color={colors.gold.light} strokeWidth={2.5} />
                <Text style={styles.visitedStepBadgeText}>
                  {tOnboardingScreen('travel_footprint', currentLang)}
                </Text>
              </View>
              <Heading style={styles.stepTitle}>
                {t?.visitedTitle || (tOnboardingScreen('select_visited_countries', currentLang))}
              </Heading>
              <Text style={styles.stepSub}>
                {t?.visitedSub || (tOnboardingScreen('select_all_the_countries_you_ve_se', currentLang))}
              </Text>
            </View>

            {/* Live Vector Map Card - Fully proportional without clipping */}
            <View style={styles.mapCardWrapper}>
              <WorldMap
                countries={mapPreviewCountries}
                activeFilter="all"
                interactive={true}
                onInteractionChange={setIsMapInteracting}
                t={t}
                currentLang={currentLang}
                showControls={true}
                style={styles.visitedMapCard}
              />
            </View>

            {/* Live Stats Pill */}
            <View style={styles.visitedStatsRow}>
              <View style={styles.statPill}>
                <Globe2 size={13} color={colors.gold.base} />
                <Text style={styles.statPillText}>
                  {totalCount} {tOnboardingScreen('countries_marked', currentLang)}
                </Text>
              </View>
              <View style={[styles.statPill, styles.statPillHighlight]}>
                <Text style={styles.statPillHighlightText}>%{exploredPercent} Dünya</Text>
              </View>
            </View>

            {/* Search & Continent Filters */}
            <View style={styles.filterSection}>
              <View style={styles.searchBoxCompact}>
                <Search size={16} color={colors.text.secondary} />
                <TextInput accessibilityLabel={t?.searchHomePlaceholder || 'Gittiğin ülkeleri filtrele...'}
                  value={visitedSearch}
                  onChangeText={setVisitedSearch}
                  placeholder={t?.searchHomePlaceholder || 'Gittiğin ülkeleri filtrele...'}
                  placeholderTextColor={colors.text.secondary}
                  style={styles.searchInputCompact}
                  autoCorrect={false}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continentChipsRow}>
                {CONTINENT_FILTERS.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setContinentFilter(c.id);
                    }}
                    style={[styles.continentChip, continentFilter === c.id && styles.continentChipActive]}
                  >
                    <Text style={[styles.continentChipText, continentFilter === c.id && styles.continentChipTextActive]}>
                      {c[currentLang]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section Heading & Counter */}
            <View style={styles.gridSectionHeadingRow}>
              <Text style={styles.sectionLabel}>
                {tOnboardingScreen('tap_to_add_to_map', currentLang)}
              </Text>
              <Text style={styles.gridSelectedCountHint}>
                {visitedIds.length > 0
                  ? (tOnboardingScreen('selected', currentLang, { length: visitedIds.length }))
                  : (tOnboardingScreen('none_selected', currentLang))}
              </Text>
            </View>

            {/* Interactive Flag Cards Grid */}
            <View style={styles.flagGrid}>
              {filteredVisitedCatalog.map((item) => {
                const isSelected = visitedIds.includes(item.id);
                const isHome = homeCountry?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (isHome) return;
                      toggleVisitedCountry(item.id);
                    }}
                    style={[
                      styles.flagGridCard,
                      isSelected && styles.flagGridCardActive,
                      isHome && styles.flagGridCardHome,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flagGridEmoji}>{item.flag}</Text>
                    <Text style={[styles.flagGridTitle, isSelected && styles.flagGridTitleActive]} numberOfLines={1}>
                      {currentLang === 'tr' ? item.nameTr : item.name}
                    </Text>
                    <View style={styles.flagGridCheck}>
                      {isHome ? (
                        <MapPin size={14} color={colors.status.lived.color} />
                      ) : isSelected ? (
                        <Check size={14} color={colors.status.visited.color} strokeWidth={3} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={styles.stickyFooterBar}>
            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setStep(4);
              }}
              style={styles.primaryActionButton}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>
                {totalCount > 1
                  ? (t?.seeResultsBtn?.replace('{count}', totalCount) || `Sonuçları Gör (${totalCount} Ülke)`)
                  : (t?.noVisitedYet || 'Sonuçları Gör')}
              </Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
}
