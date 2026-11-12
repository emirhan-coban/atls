import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowRight, CheckCircle2, Circle, Search, MapPin } from 'lucide-react-native';
import WorldMap from '../WorldMap';
import { availableCatalog } from '../../data/travelData';
import Heading from '../ui/Heading';
import type { OnboardingCtx } from './useOnboarding';
import { POPULAR_HOME_IDS } from './shared';

export function HomeCountryStep({ ctx }: { ctx: OnboardingCtx }) {
  const { colors, currentLang, filteredHomeCatalog, homeCountry, homeSearch, isMapInteracting, mapPreviewCountries, renderTopBar, setHomeCountry, setHomeSearch, setIsMapInteracting, setStep, styles, t } = ctx;
  return (
      <SafeAreaView style={styles.container}>
        {renderTopBar(1, 4)}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
        >
          <ScrollView
            scrollEnabled={!isMapInteracting}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stepScrollContent}
          >
            {/* Header */}
            <View style={styles.stepHeader}>
              <Heading style={styles.stepTitle}>{t?.homeTitle || 'Nerede Yaşıyorsun?'}</Heading>
              <Text style={styles.stepSub}>
                {t?.homeSub || 'Kişisel pasaportun doğduğun veya ikamet ettiğin evden başlar.'}
              </Text>
            </View>

            {/* Live Map Preview highlighting home */}
            <View style={styles.mapCardWrapper}>
              <WorldMap
                countries={mapPreviewCountries}
                activeFilter="all"
                interactive={true}
                onInteractionChange={setIsMapInteracting}
                t={t}
                currentLang={currentLang}
                showControls={false}
                style={styles.homeMapCard}
              />
              {homeCountry && (
                <View style={styles.selectedHomePill}>
                  <MapPin size={12} color={colors.status.lived.color} />
                  <Text style={styles.selectedHomePillText}>
                    {homeCountry.flag} {currentLang === 'tr' ? homeCountry.nameTr : homeCountry.name} (Ev)
                  </Text>
                </View>
              )}
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
              <Search size={18} color={colors.text.secondary} />
              <TextInput accessibilityLabel={t?.searchHomePlaceholder || 'Ülke ara (örn. Türkiye, Almanya)...'}
                value={homeSearch}
                onChangeText={setHomeSearch}
                placeholder={t?.searchHomePlaceholder || 'Ülke ara (örn. Türkiye, Almanya)...'}
                placeholderTextColor={colors.text.secondary}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>

            {/* Popular Pills */}
            {!homeSearch && (
              <View style={styles.popularSection}>
                <Text style={styles.sectionLabel}>{t?.popularHomes || 'SIK SEÇİLENLER'}</Text>
                <View style={styles.chipsWrap}>
                  {POPULAR_HOME_IDS.map((id) => {
                    const country = availableCatalog.find((c) => c.id === id);
                    if (!country) return null;
                    const isSelected = homeCountry?.id === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setHomeCountry(country);
                        }}
                        style={[styles.countryChip, isSelected && styles.countryChipActive]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chipFlag}>{country.flag}</Text>
                        <Text style={[styles.chipName, isSelected && styles.chipNameActive]}>
                          {currentLang === 'tr' ? country.nameTr : country.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Full Country List */}
            <View style={styles.countryListCol}>
              {filteredHomeCatalog.slice(0, 30).map((c) => {
                const isSelected = homeCountry?.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setHomeCountry(c);
                    }}
                    style={[styles.countryListItem, isSelected && styles.countryListItemActive]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.countryListLeft}>
                      <Text style={styles.countryFlagLarge}>{c.flag}</Text>
                      <View>
                        <Text style={[styles.countryListName, isSelected && styles.countryListNameActive]}>
                          {currentLang === 'tr' ? c.nameTr : c.name}
                        </Text>
                        <Text style={styles.countryListContinent}>{currentLang === 'tr' ? c.continentTr : c.continent}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={20} color={colors.status.lived.color} />
                    ) : (
                      <Circle size={20} color={colors.text.soft} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Continue Button */}
          <View style={styles.stickyFooterBar}>
            <TouchableOpacity
              onPress={() => {
                if (!homeCountry) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  Alert.alert('Lütfen Ülke Seçin', 'Lütfen yaşadığınız memleketinizi seçiniz.');
                  return;
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep(3);
              }}
              disabled={!homeCountry}
              style={[styles.primaryActionButton, !homeCountry && { opacity: 0.5 }]}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionButtonText}>{t?.continueBtn || 'Devam Et'}</Text>
              <ArrowRight size={19} color={colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
