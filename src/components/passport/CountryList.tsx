import EmptyState from '../EmptyState';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Edit3, Trash2, Sparkles, Plus } from 'lucide-react-native';
import { getLocalizedCountryName, formatCountryDate } from '../../data/travelData';
import { tPassportScreen } from '../../localization/screens/PassportScreen';
import type { PassportCtx } from './usePassportScreen';

export function CountryList({ ctx }: { ctx: PassportCtx }) {
  const { activeTab, colors, countries, currentLang, getFilteredList, isEditing, livedCountries, onOpenAddModal, onRemoveCountry, onSelectCountry, setIsEditing, setSelectedCountryToEdit, styles, t, visitedCountries, wantCountries } = ctx;
  return (
    <View style={styles.countryListCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {activeTab === 'all' && (t.allCountries ? t.allCountries.replace('{count}', countries.length) : `TÜM ÜLKELER (${countries.length})`)}
            {activeTab === 'visited' && t.visitedCountries.replace('{count}', visitedCountries.length)}
            {activeTab === 'lived' && t.livedCountries.replace('{count}', livedCountries.length)}
            {activeTab === 'want' && t.dreamDestinations.replace('{count}', wantCountries.length)}
          </Text>
          <View style={styles.listActionGroup}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsEditing((prev) => !prev);
              }}
              style={[styles.editPillButton, isEditing && styles.editPillButtonActive]}
              activeOpacity={0.7}
            >
              <Edit3 size={11} color={isEditing ? colors.gold.base : colors.text.muted} strokeWidth={2.2} />
              <Text style={[styles.editPillText, isEditing && styles.editPillTextActive]}>
                {isEditing ? (t.done || 'Bitti') : (t.edit || 'Düzenle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenAddModal();
              }}
              style={styles.addPillButton}
              activeOpacity={0.7}
            >
              <Plus size={11} color={colors.gold.base} strokeWidth={2.5} />
              <Text style={styles.addPillText}>{t.add || '+ Ekle'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {getFilteredList().length === 0 ? (
          <EmptyState
            type={activeTab === 'want' ? 'wishlist' : 'passport'}
            title={t.emptyPassportTitle}
            description={t.emptyPassportDesc}
            actionLabel={t.emptyPassportBtn}
            onAction={onOpenAddModal}
          />
        ) : (
          getFilteredList().map((c) => {
            const countryName = getLocalizedCountryName(c, currentLang);
            const countryDate = c.status === 'want' ? '' : (formatCountryDate(c, currentLang) || c.year || '');
            const countryNotes = currentLang === 'tr' ? (c.notesTr || c.notes) : c.notes;

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (onSelectCountry) {
                    onSelectCountry(c.id);
                  } else {
                    setSelectedCountryToEdit(c);
                  }
                }}
                activeOpacity={0.7}
                style={styles.countryRow}
              >
                <View style={styles.countryLeft}>
                  <Text style={styles.countryFlag}>{c.flag}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.countryNameRow}>
                      <Text
                        style={styles.countryName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {countryName}
                      </Text>
                      {Boolean(countryDate) && (
                        <View style={styles.yearBadge}>
                          <Text style={styles.countryYear}>{countryDate}</Text>
                        </View>
                      )}
                      {activeTab === 'all' && (
                        <View
                          style={[
                            styles.statusTagPill,
                            c.status === 'lived' && styles.statusTagPillLived,
                            c.status === 'want' && styles.statusTagPillWant,
                            c.status === 'visited' && styles.statusTagPillVisited,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              c.status === 'lived' && styles.statusTagTextLived,
                              c.status === 'want' && styles.statusTagTextWant,
                              c.status === 'visited' && styles.statusTagTextVisited,
                            ]}
                          >
                            {c.status === 'lived'
                              ? (t.livedIn || 'Yaşanan')
                              : c.status === 'want'
                                ? (t.wishlist || 'Hedef')
                                : (t.visited || 'Gezilen')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.countryNotes} numberOfLines={1}>
                      {countryNotes || (c.status === 'want' ? (tPassportScreen('in_your_wishlist', currentLang)) : '')}
                    </Text>
                  </View>
                </View>

                <View style={styles.countryRightActions}>
                  {c.status === 'want' && !isEditing && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCountryToEdit(c);
                      }}
                      activeOpacity={0.7}
                      style={styles.stampNowBtn}
                    >
                      <Sparkles size={11} color={colors.gold.base} />
                      <Text style={styles.stampNowText}>
                        {t.stampNow || (tPassportScreen('visited', currentLang))}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isEditing && (
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={tPassportScreen('remove_country', currentLang)}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert(
                          t.removeConfirmTitle,
                          t.removeConfirmMsg.replace('{country}', countryName),
                          [
                            { text: t.cancel, style: 'cancel' },
                            {
                              text: t.remove,
                              style: 'destructive',
                              onPress: () => onRemoveCountry(c.id),
                            },
                          ]
                        );
                      }}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={15} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
  );
}
