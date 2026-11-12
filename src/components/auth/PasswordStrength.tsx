import { View, Text } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import type { AuthCtx } from './useAuthScreen';

export function PasswordStrength({ ctx }: { ctx: AuthCtx }) {
  const { colors, hasMinLength, hasNumber, hasUppercase, strength, styles, t } = ctx;
  return (
    <View style={styles.strengthCard}>
                <View style={styles.strengthHeaderRow}>
                  <Text style={styles.strengthTitle}>
                    {t?.passwordStrength || 'Şifre Gücü'}:{' '}
                    <Text style={{ color: strength.color, fontWeight: '800' }}>
                      {strength.label}
                    </Text>
                  </Text>
                </View>

                {/* 3 Step Colored Progress Bar */}
                <View style={styles.strengthBarRow}>
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 1 ? strength.color : colors.glass.hairline },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 2 ? strength.color : colors.glass.hairline },
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBarSegment,
                      { backgroundColor: strength.score >= 3 ? strength.color : colors.glass.hairline },
                    ]}
                  />
                </View>

                {/* Requirements Checklist */}
                <View style={styles.criteriaList}>
                  <View style={styles.criteriaRow}>
                    {hasMinLength ? (
                      <CheckCircle2 size={13} color={colors.status.lived.color} />
                    ) : (
                      <Circle size={13} color={colors.text.muted} />
                    )}
                    <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>
                      {t?.reqMinChars || 'En az 8 karakter'}
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    {hasUppercase ? (
                      <CheckCircle2 size={13} color={colors.status.lived.color} />
                    ) : (
                      <Circle size={13} color={colors.text.muted} />
                    )}
                    <Text style={[styles.criteriaText, hasUppercase && styles.criteriaTextMet]}>
                      {t?.reqUppercase || 'En az 1 büyük harf'}
                    </Text>
                  </View>

                  <View style={styles.criteriaRow}>
                    {hasNumber ? (
                      <CheckCircle2 size={13} color={colors.status.lived.color} />
                    ) : (
                      <Circle size={13} color={colors.text.muted} />
                    )}
                    <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>
                      {t?.reqNumber || 'En az 1 rakam'}
                    </Text>
                  </View>
                </View>
              </View>
  );
}
