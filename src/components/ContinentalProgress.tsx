import { makeStyles } from '../theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { availableCatalog } from '../data/travelData';
import { Country } from '../stores/types';
import { theme } from '../theme';

interface ContinentalProgressProps {
  countries: Country[];
  currentLang: 'tr' | 'en';
}

interface ContinentSummary {
  nameEn: string;
  nameTr: string;
  color: string;
  visitedCount: number;
  totalCount: number;
  percentage: number;
}

export default function ContinentalProgress({ countries, currentLang }: ContinentalProgressProps) {
  const styles = useStyles();
  const visited = countries.filter((c) => c.status === 'visited' || c.status === 'lived');

  const continentConfigs = [
    {
      key: 'Europe',
      nameEn: 'Europe',
      nameTr: 'Avrupa',
      color: theme.colors.continents.europe.primary,
    },
    {
      key: 'Asia',
      nameEn: 'Asia',
      nameTr: 'Asya',
      color: theme.colors.continents.asia.primary,
    },
    {
      key: 'Americas',
      nameEn: 'Americas',
      nameTr: 'Amerika',
      color: theme.colors.continents.americas.primary,
    },
    {
      key: 'Africa',
      nameEn: 'Africa',
      nameTr: 'Afrika',
      color: theme.colors.continents.africa.primary,
    },
    {
      key: 'Oceania',
      nameEn: 'Oceania',
      nameTr: 'Okyanusya',
      color: theme.colors.continents.oceania.primary,
    },
  ];

  const summaries: ContinentSummary[] = continentConfigs.map((cfg) => {
    // Total in catalog
    const totalCount = availableCatalog.filter((c) => {
      const matchEn = c.continent?.toLowerCase().includes(cfg.key.toLowerCase());
      const matchTr = c.continentTr?.toLowerCase().includes(cfg.nameTr.toLowerCase());
      // Handle North/South America grouping
      if (cfg.key === 'Americas') {
        return (
          c.continent?.includes('America') ||
          c.continentTr?.includes('Amerika')
        );
      }
      return matchEn || matchTr;
    }).length;

    // Visited in this continent
    const visitedCount = visited.filter((c) => {
      const matchEn = c.continent?.toLowerCase().includes(cfg.key.toLowerCase());
      const matchTr = c.continentTr?.toLowerCase().includes(cfg.nameTr.toLowerCase());
      if (cfg.key === 'Americas') {
        return (
          c.continent?.includes('America') ||
          c.continentTr?.includes('Amerika')
        );
      }
      return matchEn || matchTr;
    }).length;

    const percentage = totalCount > 0 ? Math.min(Math.round((visitedCount / totalCount) * 100), 100) : 0;

    return {
      nameEn: cfg.nameEn,
      nameTr: cfg.nameTr,
      color: cfg.color,
      visitedCount,
      totalCount,
      percentage,
    };
  });

  return (
    <View style={styles.container}>
      {summaries.map((item) => {
        const displayName = currentLang === 'tr' ? item.nameTr : item.nameEn;

        return (
          <View key={item.nameEn} style={styles.itemRow}>
            <View style={styles.headerRow}>
              <View style={styles.nameWithDot}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.nameText}>{displayName}</Text>
              </View>

              <Text style={styles.countText}>
                {`${item.visitedCount}/${item.totalCount} `}
                <Text style={[styles.percentageText, { color: item.color }]}>
                  ({item.percentage}%)
                </Text>
              </Text>
            </View>

            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(item.percentage, item.visitedCount > 0 ? 3 : 0)}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.panel.base,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 3,
    gap: theme.spacing.md,
  },
  itemRow: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: colors.text.primary,
  },
  countText: {
    fontSize: theme.typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  percentageText: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.glass.fillStrong,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
}));
