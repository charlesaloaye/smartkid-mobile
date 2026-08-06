import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { colors, radii, shadow, type } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../utils/useAsync';
import { fetchDashboard } from '../../api/endpoints';

import { EmptyState } from '../../components/EmptyState';

const AVATAR_GRADIENTS: [string, string][] = [
  [colors.teal, colors.tealDark],
  ['#E76F51', '#D97706'],
  ['#2A9D8F', '#1A5F7A'],
  ['#8E44AD', '#3498DB'],
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { data, loading, refreshing, refresh } = useAsync(fetchDashboard, []);

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const maxActivity = Math.max(1, ...(data?.weekly_activity ?? [1]));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerGreeting}>{greeting()},</Text>
            <Text style={styles.headerName}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            {!!data && data.learning_streak > 0 && (
              <View style={styles.streakPill}>
                <Icon name="flame" size={14} color={colors.amberDark} />
                <Text style={styles.streakText}>{data.learning_streak} Day Streak</Text>
              </View>
            )}
          </View>
        </View>

        {/* Loading Spinner during initial fetch to prevent screen flash */}
        {loading && !data && (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={{ fontFamily: type.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 12 }}>
              Loading your dashboard…
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && data && data.total_children === 0 && (
          <EmptyState
            icon="sparkle"
            title="Add your first learner"
            description="Register your child's WhatsApp number so Ada can start teaching them today."
            actionLabel="Add a child"
            onAction={() => navigation.navigate('AddChild')}
          />
        )}

        {/* Active Stats Dashboard */}
        {!!data && data.total_children > 0 && (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <View style={styles.statIconBg}>
                  <Icon name="chat" size={14} color={colors.teal} />
                </View>
                <Text style={styles.statNum}>{data.total_questions}</Text>
                <Text style={styles.statLabel}>Questions asked</Text>
              </Card>

              <Card style={styles.statCard}>
                <View style={styles.statIconBg}>
                  <Icon name="user" size={14} color={colors.teal} />
                </View>
                <Text style={styles.statNum}>{data.total_children}</Text>
                <Text style={styles.statLabel}>
                  {data.total_children === 1 ? 'Child' : 'Children'}
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <View
                  style={[
                    styles.statIconBg,
                    {
                      backgroundColor:
                        data.weekly_growth >= 0
                          ? 'rgba(107, 142, 127, 0.12)'
                          : 'rgba(231, 111, 81, 0.12)',
                    },
                  ]}
                >
                  <Icon
                    name="chart"
                    size={14}
                    color={data.weekly_growth >= 0 ? colors.sage : colors.coral}
                  />
                </View>
                <Text
                  style={[
                    styles.statNum,
                    { color: data.weekly_growth >= 0 ? colors.sage : colors.coral },
                  ]}
                >
                  {data.weekly_growth >= 0 ? '+' : ''}
                  {data.weekly_growth}%
                </Text>
                <Text style={styles.statLabel}>vs last week</Text>
              </Card>
            </View>

            {/* Weekly Activity Card */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.cardTitle}>THIS WEEK'S ACTIVITY</Text>
                  <Text style={styles.chartSub}>Daily question volume</Text>
                </View>
                <View style={styles.chartBadge}>
                  <Icon name="sparkle" size={12} color={colors.amberDark} />
                  <Text style={styles.chartBadgeText}>Active</Text>
                </View>
              </View>

              <View style={styles.barRow}>
                {data.weekly_activity.map((v, i) => {
                  const heightPercent = Math.max(8, (v / maxActivity) * 100);
                  const isHigh = v > 0 && v === maxActivity;

                  return (
                    <View key={i} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <LinearGradient
                          colors={
                            isHigh
                              ? [colors.amber, colors.coral]
                              : [colors.teal, colors.tealDark]
                          }
                          style={[
                            styles.barFill,
                            { height: `${heightPercent}%` },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          isHigh && { color: colors.charcoal, fontFamily: type.bodyBold },
                        ]}
                      >
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i] ?? ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Section: Your Children */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>YOUR CHILDREN</Text>
              <Pressable
                style={styles.sectionAddBtn}
                onPress={() => navigation.navigate('AddChild')}
              >
                <Icon name="plus" size={15} color={colors.teal} />
                <Text style={styles.sectionAddText}>Add Learner</Text>
              </Pressable>
            </View>

            {data.children.map((child, index) => {
              const gradientColors = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
              const validSubjects = (child.subjects ?? []).filter((s) => s !== 'None yet');
              const subjectsList =
                validSubjects.length > 0
                  ? validSubjects.slice(0, 2).join(' · ')
                  : 'No sessions yet';

              return (
                <Card key={child.id} style={styles.childCard}>
                  <View style={styles.childRow}>
                    <View style={styles.avatarWrapper}>
                      <LinearGradient
                        colors={gradientColors}
                        style={styles.avatarGradient}
                      >
                        <Text style={styles.avatarText}>
                          {child.name.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>
                      <View style={styles.onlineBadge} />
                    </View>

                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childMeta}>{subjectsList}</Text>
                    </View>

                    <Pressable
                      style={styles.chatButton}
                      onPress={() =>
                        navigation.navigate('Tutor', { childId: child.id })
                      }
                    >
                      <Icon name="whatsapp" size={20} color={colors.white} />
                    </Pressable>
                  </View>

                  <View style={styles.childFooter}>
                    <View style={styles.footerItem}>
                      <Icon name="chat" size={12} color={colors.mutedLight} />
                      <Text style={styles.childFooterText}>
                        {child.questions_count ?? 0} {child.questions_count === 1 ? 'question' : 'questions'} this week
                      </Text>
                    </View>
                    <Text style={styles.childFooterDot}>·</Text>
                    <View style={styles.footerItem}>
                      <Icon name="calendar" size={12} color={colors.mutedLight} />
                      <Text style={styles.childFooterText}>
                        Last session {child.last_session ?? 'never'}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.mutedLight,
  },
  headerName: {
    fontFamily: type.display,
    fontSize: 18,
    color: colors.charcoal,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217,119,6,0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.2)',
  },
  streakText: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.amberDark,
  },
  heroCard: {
    borderRadius: radii.xl,
    padding: 22,
    marginBottom: 16,
    ...shadow.soft,
  },
  heroTitle: {
    fontFamily: type.display,
    fontSize: 20,
    color: colors.white,
    marginTop: 12,
    marginBottom: 6,
  },
  heroBody: {
    fontFamily: type.body,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 16,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCtaText: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    ...shadow.soft,
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 95, 122, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNum: {
    fontFamily: type.display,
    fontSize: 20,
    color: colors.charcoal,
  },
  statLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 10.5,
    color: colors.mutedLight,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: radii.lg,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    marginBottom: 20,
    ...shadow.soft,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.mutedLight,
  },
  chartSub: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.charcoal,
    marginTop: 2,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  chartBadgeText: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    color: colors.amberDark,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 12,
    height: '80%',
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 11,
    color: colors.mutedLight,
    marginTop: 8,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.mutedLight,
  },
  sectionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionAddText: {
    fontFamily: type.displaySemi,
    fontSize: 12.5,
    color: colors.teal,
  },
  childCard: {
    marginBottom: 14,
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    ...shadow.soft,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  avatarText: {
    fontFamily: type.displayBlack,
    fontSize: 18,
    color: colors.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: colors.white,
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontFamily: type.displaySemi,
    fontSize: 16,
    color: colors.charcoal,
  },
  childMeta: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.mutedLight,
    marginTop: 2,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  childFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childFooterText: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.mutedLight,
  },
  childFooterDot: {
    color: colors.mutedLight,
  },
});
