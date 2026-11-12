import Button from '../ui/Button';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Plus, ChevronRight, ChevronLeft, Compass, Calendar, Sparkles } from 'lucide-react-native';
import { getLocalizedCountryName, formatCountryDate } from '../../data/travelData';
import { getCountryTrivia } from '../../data/countryTrivia';
import { tHomeScreen } from '../../localization/screens/HomeScreen';
import type { HomeCtx } from './useHomeScreen';

export function HeroCard({ ctx }: { ctx: HomeCtx }) {
  const { colors, countryCardIndex, currentLang, currentMarkedCountry, handleNextCountry, handlePrevCountry, markedCountries, onOpenAddModal, onSelectCountry, styles } = ctx;
  return (
    <>{!currentMarkedCountry ? (
          /* EMPTY STATE: Call to action when no country has been added yet */
          <View style={styles.emptyHeroCard}>
            <View style={styles.emptyBadgeRow}>
              <View style={styles.emptyIconBadge}>
                <Compass size={22} color={colors.gold.base} />
              </View>
              <View style={styles.emptyPill}>
                <Sparkles size={11} color={colors.gold.base} />
                <Text style={styles.emptyPillText}>
                  {tHomeScreen('start_passport', currentLang)}
                </Text>
              </View>
            </View>

            <View style={styles.emptyTextContent}>
              <Text style={styles.emptyHeroTitle}>
                {tHomeScreen('add_your_first_country', currentLang)}
              </Text>
              <Text style={styles.emptyHeroDesc}>
                {tHomeScreen('select_countries_you_have_visited', currentLang)}
              </Text>
            </View>

            <Button
              onPress={onOpenAddModal}
              label={tHomeScreen('add_country', currentLang)}
              icon={(color) => <Plus size={16} color={color} strokeWidth={2.5} />}
            />
          </View>
        ) : (
          /* POPULATED STATE: the user's countries with curated trivia */
          <View style={styles.countryHeroCard}>
            {/* Top Row: Tag, Flag & Year */}
            <View style={styles.countryHeroTopRow}>
              <View style={styles.countryHeroBadges}>
                <View style={styles.countryStatusPill}>
                  <Text style={styles.countryStatusPillText}>
                    {currentMarkedCountry.status === 'lived'
                      ? (tHomeScreen('lived_2', currentLang))
                      : (tHomeScreen('visited_2', currentLang))}
                  </Text>
                </View>

                <View style={styles.countryYearPill}>
                  <Calendar size={11} color={colors.gold.base} />
                  <Text style={styles.countryYearPillText}>
                    {formatCountryDate(currentMarkedCountry, currentLang) || currentMarkedCountry.year || currentMarkedCountry.visitedYear || new Date().getFullYear()}
                  </Text>
                </View>
              </View>

              <Text style={styles.countryHeroFlag}>{currentMarkedCountry.flag || '🌍'}</Text>
            </View>

            {/* Country Name & Trivia */}
            <TouchableOpacity
              style={styles.countryHeroTextContent}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (onSelectCountry && currentMarkedCountry) {
                  onSelectCountry(currentMarkedCountry.id);
                }
              }}
            >
              <Text
                style={styles.countryHeroTitle}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.75}
              >
                {getLocalizedCountryName(currentMarkedCountry, currentLang)}
              </Text>
              <Text style={styles.countryHeroDesc} numberOfLines={3}>
                {getCountryTrivia(
                  currentMarkedCountry.id,
                  getLocalizedCountryName(currentMarkedCountry, currentLang),
                  currentLang
                )}
              </Text>
            </TouchableOpacity>

            {/* Footer: Counter & Carousel Navigation */}
            <View style={styles.countryHeroFooter}>
              <Text style={styles.countryCounterText}>
                {`${(countryCardIndex % markedCountries.length) + 1} / ${markedCountries.length} ${tHomeScreen('countries', currentLang)}`}
              </Text>

              {markedCountries.length > 1 && (
                <View style={styles.carouselControls}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={tHomeScreen('previous_country', currentLang)} onPress={handlePrevCountry} style={styles.arrowButton}>
                    <ChevronLeft size={15} color={colors.text.primary} />
                  </TouchableOpacity>
                  <View style={styles.dotsRow}>
                    {markedCountries.slice(0, 6).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          i === (countryCardIndex % markedCountries.length)
                            ? styles.dotActive
                            : styles.dotInactive,
                        ]}
                      />
                    ))}
                  </View>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={tHomeScreen('next_country', currentLang)} onPress={handleNextCountry} style={styles.arrowButton}>
                    <ChevronRight size={15} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}</>
  );
}
