import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type } from '../../theme';
import { Icon, IconName } from '../../components/Icon';

type PlaceholderProps = {
  icon: IconName;
  title: string;
  description: string;
};

export function ComingSoonPlaceholder({ icon, title, description }: PlaceholderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={32} color={colors.teal} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Phase 2 · Coming Later</Text>
      </View>
    </View>
  );
}

// Phase 2 screen stubs
export function LearningScreen() {
  return (
    <ComingSoonPlaceholder
      icon="book-open"
      title="Learning Platform"
      description={"Full NERDC curriculum engine (Primary 1 – SSS 3)\nSmart Learn · Revision · Practice\nNotes · Videos · Flashcards · Past Questions"}
    />
  );
}

// ─── Gamification Preview ────────────────────────────────────────────────────

type FeatureCardProps = {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  value: string;
  valueColor: string;
};

function FeatureCard({ icon, iconBg, iconColor, title, subtitle, value, valueColor }: FeatureCardProps) {
  return (
    <View style={gamStyles.card}>
      <View style={[gamStyles.cardIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={gamStyles.cardText}>
        <Text style={gamStyles.cardTitle}>{title}</Text>
        <Text style={gamStyles.cardSub}>{subtitle}</Text>
      </View>
      <Text style={[gamStyles.cardValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function RewardsScreen() {
  return (
    <SafeAreaView style={gamStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={gamStyles.header}>
          <View style={gamStyles.headerIconWrap}>
            <Icon name="trophy" size={28} color={colors.amber} />
          </View>
          <Text style={gamStyles.headerTitle}>Gamification</Text>
          <Text style={gamStyles.headerSub}>Earn, grow, and celebrate every win</Text>
          <View style={gamStyles.comingBadge}>
            <View style={gamStyles.comingDot} />
            <Text style={gamStyles.comingText}>Coming Later</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={gamStyles.section}>
          <Text style={gamStyles.sectionLabel}>What's coming</Text>

          {/* Coins & Rewards — commented out for now
          <FeatureCard
            icon="star"
            iconBg="rgba(217,119,6,0.12)"
            iconColor={colors.amber}
            title="Coins & Rewards"
            subtitle="Earn coins for every session"
            value="🪙 500"
            valueColor={colors.amber}
          />
          */}
          <FeatureCard
            icon="trending-up"
            iconBg="rgba(26,95,122,0.12)"
            iconColor={colors.teal}
            title="XP & Levels"
            subtitle="Level up as your child learns"
            value="⚡ Lv. 12"
            valueColor={colors.teal}
          />
          <FeatureCard
            icon="shield"
            iconBg="rgba(107,142,127,0.12)"
            iconColor={colors.sage}
            title="Badges"
            subtitle="Unlock achievements & streaks"
            value="🏅 8/24"
            valueColor={colors.sage}
          />
          <FeatureCard
            icon="chart"
            iconBg="rgba(231,111,81,0.12)"
            iconColor={colors.coral}
            title="Leaderboards"
            subtitle="Compete with other learners"
            value="🥇 #3"
            valueColor={colors.coral}
          />
        </View>

        {/* Bottom Banner */}
        <View style={gamStyles.banner}>
          <Icon name="sparkle" size={14} color={colors.amberDark} />
          <Text style={gamStyles.bannerText}>
            We're building something special — stay tuned!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: type.display,
    fontSize: 22,
    color: colors.charcoal,
    textAlign: 'center',
  },
  description: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  badge: {
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  badgeText: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

const gamStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header
  header: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(217,119,6,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.2)',
  },
  headerTitle: {
    fontFamily: type.display,
    fontSize: 24,
    color: colors.charcoal,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.mutedLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  comingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  comingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amberDark,
  },
  comingText: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    color: colors.amberDark,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  // Section
  section: {
    padding: 20,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    color: colors.mutedLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.75,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: type.displaySemi,
    fontSize: 14,
    color: colors.charcoal,
  },
  cardSub: {
    fontFamily: type.body,
    fontSize: 11.5,
    color: colors.mutedLight,
  },
  cardValue: {
    fontFamily: type.displaySemi,
    fontSize: 13,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 4,
    backgroundColor: 'rgba(217,119,6,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.15)',
  },
  bannerText: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.amberDark,
    lineHeight: 18,
  },
});
