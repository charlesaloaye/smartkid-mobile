import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { Icon, IconName } from '../../components/Icon';
import { Card } from '../../components/Card';
import { colors, radii, type } from '../../theme';
import { useAsync } from '../../utils/useAsync';
import { fetchChildDetail } from '../../api/endpoints';

function masteryLabel(score: number) {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Developing';
  return 'Needs practice';
}

function masteryColor(score: number) {
  if (score >= 70) return colors.sage;
  if (score >= 40) return colors.amber;
  return colors.coral;
}

export default function ChildProgressScreen({ route, navigation }: any) {
  const childId = route.params.childId as number;
  const { data, loading } = useAsync(() => fetchChildDetail(childId), [childId]);

  const confidence = data?.confidence_score ? parseInt(data.confidence_score, 10) : null;
  const badges: { icon: IconName; label: string }[] = [];
  if (confidence !== null && confidence >= 70) badges.push({ icon: 'star', label: 'Fast learner' });
  if (data && parseFloat(data.learning_time) >= 2) badges.push({ icon: 'flame', label: 'On a roll' });
  const topSubject = data?.mastery.filter((m) => m.score >= 60).sort((a, b) => b.score - a.score)[0];
  if (topSubject) badges.push({ icon: 'sparkle', label: `${topSubject.name} star` });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={10}>
          <Icon name="chevron-left" size={16} color={colors.charcoal} />
        </Pressable>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.teal} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.child.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{data.child.name}</Text>
              <Text style={styles.meta}>
                {[data.child.grade, data.child.age ? `Age ${data.child.age}` : null].filter(Boolean).join(' · ') || 'No class set yet'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{data.learning_time}</Text>
              <Text style={styles.statLabel}>Learning time</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{data.confidence_score ?? '—'}</Text>
              <Text style={styles.statLabel}>Confidence</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{data.child.questions_count ?? 0}</Text>
              <Text style={styles.statLabel}>Questions this week</Text>
            </Card>
          </View>

          {!!data.insight && (
            <Card style={styles.insightCard}>
              <Icon name="sparkle" size={14} color={colors.amberDark} />
              <Text style={styles.insightText}>{data.insight}</Text>
            </Card>
          )}

          <Text style={styles.sectionLabel}>Strengths & focus areas</Text>
          <Card>
            {data.mastery.map((m) => (
              <View key={m.name} style={styles.barRow}>
                <View style={styles.barHead}>
                  <Text style={styles.barName}>{m.name}</Text>
                  <Text style={[styles.barTag, { color: masteryColor(m.score) }]}>{masteryLabel(m.score)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(4, m.score)}%`, backgroundColor: masteryColor(m.score) }]} />
                </View>
              </View>
            ))}
          </Card>

          {badges.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Badges</Text>
              <View style={styles.badgeRow}>
                {badges.map((b) => (
                  <View key={b.label} style={styles.badge}>
                    <View style={styles.badgeIcon}>
                      <Icon name={b.icon} size={17} color={colors.amberDark} />
                    </View>
                    <Text style={styles.badgeLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  back: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(31,41,55,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: type.displaySemi, fontSize: 16, color: colors.charcoal },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: type.display, fontSize: 19, color: colors.white },
  name: { fontFamily: type.display, fontSize: 19, color: colors.charcoal },
  meta: { fontFamily: type.bodyMedium, fontSize: 12, color: colors.mutedLight, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: { fontFamily: type.display, fontSize: 16, color: colors.charcoal },
  statLabel: { fontFamily: type.bodySemi, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.3, color: colors.mutedLight, marginTop: 4, textAlign: 'center' },
  insightCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: 'rgba(217,119,6,0.08)', marginBottom: 4 },
  insightText: { flex: 1, fontFamily: type.bodyMedium, fontSize: 12.5, lineHeight: 18, color: colors.amberDark },
  sectionLabel: { fontFamily: type.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.mutedLight, marginTop: 22, marginBottom: 10 },
  barRow: { marginBottom: 14 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barName: { fontFamily: type.bodySemi, fontSize: 12.5, color: colors.charcoal },
  barTag: { fontFamily: type.bodyBold, fontSize: 11 },
  barTrack: { height: 6, borderRadius: 4, backgroundColor: 'rgba(31,41,55,0.08)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  badgeRow: { flexDirection: 'row', gap: 10 },
  badge: { flex: 1, alignItems: 'center', gap: 6 },
  badgeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(217,119,6,0.12)', alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { fontFamily: type.bodySemi, fontSize: 10, color: colors.mutedLight, textAlign: 'center' },
});
