import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Utensils,
  HeartHandshake,
  Users,
  CheckCircle2,
  Truck,
  Calendar,
  AlertTriangle,
  Leaf,
  Inbox,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';

import SectionHeading from '../../components/SectionHeading';
import StatCard from '../../components/StatCard';
import DistributionCard from '../../components/DistributionCard';
import NewsCard from '../../components/NewsCard';
import EventCard from '../../components/EventCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import api from '../../services/api';
import { useImpactData } from '../../src/hooks/useImpactData';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function ImpactScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { stats, distributions, news, events, loading, error, refresh } = useImpactData(token);

  // Carbon offset estimate: ~2.5 kg CO2 avoided per kg of food saved from landfills
  const co2AvoidedKg = Math.round((stats?.totalFoodKg || 0) * 2.5);

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>Loading Impact Metrics</Text>
          <Text style={styles.loadingSubtitle}>Fetching real-time distribution and hunger relief data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'left', 'right']}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconCircle}>
            <AlertTriangle size={32} color={COLORS.danger} />
          </View>
          <Text style={styles.errorTitle}>Unable to Load Impact Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title="Try Again"
            onPress={refresh}
            variant="primary"
            size="md"
            style={{ marginTop: SPACING.md, width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.brandRow}>
            <Sparkles size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.brandText}>BHOJANSEVA TRANSPARENCY</Text>
          </View>
          <Text style={styles.screenTitle}>Community Impact</Text>
          <Text style={styles.screenSubtitle}>
            Live metrics on surplus food recovered and meals distributed
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={refresh}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <RefreshCw size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Hero Eco & Social Impact Card */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTagRow}>
            <View style={styles.heroBadge}>
              <Leaf size={13} color="#15803D" style={{ marginRight: 5 }} />
              <Text style={styles.heroBadgeText}>ZERO FOOD WASTE MISSION</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Together We Save Food & Nourish Lives</Text>
          <Text style={styles.heroDescription}>
            Every surplus donation connected through BhojanSeva prevents edible food from rotting in
            landfills and feeds families in need across our cities.
          </Text>

          <View style={styles.ecoStatsRow}>
            <View style={styles.ecoStatItem}>
              <Text style={styles.ecoStatValue}>{stats?.totalFoodKg || 0} kg</Text>
              <Text style={styles.ecoStatLabel}>Food Rescued</Text>
            </View>
            <View style={styles.ecoStatDivider} />
            <View style={styles.ecoStatItem}>
              <Text style={styles.ecoStatValue}>{co2AvoidedKg} kg</Text>
              <Text style={styles.ecoStatLabel}>CO₂e Avoided</Text>
            </View>
            <View style={styles.ecoStatDivider} />
            <View style={styles.ecoStatItem}>
              <Text style={styles.ecoStatValue}>{stats?.mealsDistributed || 0}</Text>
              <Text style={styles.ecoStatLabel}>Plates Served</Text>
            </View>
          </View>
        </View>

        {/* Impact Highlights Grid */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionMainTitle}>Key Milestones</Text>
          <Text style={styles.sectionMainSubtitle}>Aggregated totals across all completed operations</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Food Saved"
              value={`${stats?.totalFoodKg ?? 0} kg`}
              subtitle="Diverted from waste"
              icon={Utensils}
              color="#166534"
              bgColor="#DCFCE7"
            />
            <View style={{ width: SPACING.sm }} />
            <StatCard
              title="Meals Distributed"
              value={(stats?.mealsDistributed ?? 0).toLocaleString()}
              subtitle="Wholesome plates"
              icon={HeartHandshake}
              color="#2563EB"
              bgColor="#DBEAFE"
            />
          </View>

          <View style={[styles.statsRow, { marginTop: SPACING.sm }]}>
            <StatCard
              title="People Fed"
              value={(stats?.peopleServed ?? 0).toLocaleString()}
              subtitle="Lives touched"
              icon={Users}
              color="#D97706"
              bgColor="#FEF3C7"
            />
            <View style={{ width: SPACING.sm }} />
            <StatCard
              title="Drives Completed"
              value={(stats?.completedDistributions ?? 0).toLocaleString()}
              subtitle="Verified drops"
              icon={CheckCircle2}
              color="#7C3AED"
              bgColor="#EDE9FE"
            />
          </View>
        </View>

        {/* Distribution History Section */}
        <View style={styles.section}>
          <SectionHeading
            title="Distribution History"
            subtitle="Recent food relief handovers to partner shelters & community centers"
          />
          {distributions && distributions.length > 0 ? (
            <FlatList
              data={distributions}
              renderItem={({ item }) => <DistributionCard item={item} />}
              keyExtractor={(item) => (item._id || item.id || Math.random()).toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={Truck}
                title="No distribution records yet"
                description="Completed distribution handovers will be automatically recorded here with verified recipient details."
              />
            </View>
          )}
        </View>

        {/* Latest Distribution News Section */}
        <View style={styles.section}>
          <SectionHeading
            title="Community Stories & News"
            subtitle="Updates, volunteer spotlights, and community relief achievements"
          />
          <View style={styles.paddedSection}>
            {news && news.length > 0 ? (
              news.map((item) => (
                <NewsCard key={(item._id || item.id || Math.random()).toString()} item={item} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon={Inbox}
                  title="No news updates at this time"
                  description="Stories of community impact, donor highlights, and field photos will be published here."
                />
              </View>
            )}
          </View>
        </View>

        {/* Upcoming Community Events Section */}
        <View style={styles.section}>
          <SectionHeading
            title="Upcoming Community Drives"
            subtitle="Volunteer opportunities, food packaging drives, and local relief missions"
          />
          <View style={styles.paddedSection}>
            {events?.upcoming && events.upcoming.length > 0 ? (
              events.upcoming.map((e) => (
                <EventCard
                  key={(e._id || e.id || Math.random()).toString()}
                  event={e}
                  alreadyRegistered={false}
                  onRegister={async () => {
                    try {
                      await api.post(`/ngo/impact/events/${e._id}/register`);
                      refresh();
                    } catch (err) {
                      console.warn('Registration failed:', err?.message || err);
                    }
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState
                  icon={Calendar}
                  title="No upcoming events scheduled"
                  description="Check back soon for new food rescue drives, packaging camps, and awareness events."
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    marginTop: 4,
  },
  content: {
    paddingTop: SPACING.md,
  },
  heroBanner: {
    backgroundColor: '#0F3E22',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  heroTagRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 24,
  },
  heroDescription: {
    fontSize: 13,
    color: '#D1E7DD',
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  ecoStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ecoStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  ecoStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ecoStatLabel: {
    fontSize: 11,
    color: '#A3D9B8',
    marginTop: 2,
  },
  ecoStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeaderWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionMainSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    marginBottom: SPACING.xs,
  },
  statsGrid: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  paddedSection: {
    paddingHorizontal: SPACING.lg,
  },
  horizontalListContent: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    width: '100%',
    maxWidth: 320,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    width: '100%',
    maxWidth: 340,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
