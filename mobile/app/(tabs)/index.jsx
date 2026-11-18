import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  PlusCircle,
  Utensils,
  Heart,
  Users,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { requestService } from '../../services/requestService';
import { volunteerService } from '../../services/volunteerService';
import { adminService } from '../../services/adminService';
import { notificationService } from '../../services/notificationService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Header from '../../components/Header';
import StatCard from '../../components/StatCard';
import DonationCard from '../../components/DonationCard';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Data states
  const [donorData, setDonorData] = useState({ donations: [], pendingRequestsCount: 0 });
  const [recipientData, setRecipientData] = useState({ availableDonations: [], activeRequestsCount: 0 });
  const [volunteerData, setVolunteerData] = useState({ availableTasks: [], myTasks: [], stats: {} });
  const [adminData, setAdminData] = useState({ stats: {}, recentDonations: [] });

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch notification unread count
      try {
        const notifRes = await notificationService.getMyNotifications();
        if (notifRes?.unreadCount !== undefined) {
          setUnreadCount(notifRes.unreadCount);
        }
      } catch (e) {}

      if (user.role === 'donor') {
        const [donationsRes, requestsRes] = await Promise.all([
          donationService.getMyDonations(),
          requestService.getIncomingRequests(),
        ]);
        const donations = donationsRes?.donations || [];
        const incoming = requestsRes?.requests || [];
        const pendingCount = incoming.filter((r) => r.status === 'PENDING').length;
        setDonorData({ donations, pendingRequestsCount: pendingCount });
      } else if (user.role === 'recipient') {
        const [availableRes, requestsRes] = await Promise.all([
          donationService.getDonations({ limit: 5 }),
          requestService.getMyRequests(),
        ]);
        const available = availableRes?.donations || [];
        const myRequests = requestsRes?.requests || [];
        const activeCount = myRequests.filter((r) =>
          ['PENDING', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(r.status)
        ).length;
        setRecipientData({ availableDonations: available, activeRequestsCount: activeCount });
      } else if (user.role === 'volunteer') {
        const [availTasksRes, myTasksRes, statsRes] = await Promise.all([
          volunteerService.getAvailableTasks(),
          volunteerService.getMyTasks(),
          volunteerService.getVolunteerStats(),
        ]);
        setVolunteerData({
          availableTasks: availTasksRes?.tasks || [],
          myTasks: myTasksRes?.tasks || [],
          stats: statsRes?.stats || {},
        });
      } else if (user.role === 'admin') {
        const statsRes = await adminService.getStats();
        setAdminData({
          stats: statsRes?.stats || {},
          recentDonations: statsRes?.recentDonations || [],
        });
      }
    } catch (err) {
      console.warn('[HomeScreen] Error loading dashboard:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header unreadCount={unreadCount} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* ============================================================== */}
        {/* DONOR DASHBOARD */}
        {/* ============================================================== */}
        {user?.role === 'donor' && (
          <View>
            {/* CTA Banner */}
            <View style={styles.ctaBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Got Surplus Edible Food?</Text>
                <Text style={styles.ctaSubtitle}>
                  Post your fresh meals and help feed someone in need today.
                </Text>
              </View>
              <Button
                title="Donate"
                icon={PlusCircle}
                variant="primary"
                size="sm"
                onPress={() => router.push('/donation/create')}
              />
            </View>

            {/* Donor Metrics */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Donated"
                value={donorData.donations.length}
                subtitle="Food items"
                icon={Utensils}
                color={COLORS.primary}
                bgColor={COLORS.primarySoft}
              />
              <StatCard
                title="Active Posts"
                value={donorData.donations.filter((d) => d.status === 'AVAILABLE').length}
                subtitle="Available now"
                icon={Clock}
                color={COLORS.info}
                bgColor={COLORS.infoBg}
              />
              <StatCard
                title="Pending Requests"
                value={donorData.pendingRequestsCount}
                subtitle="Needs approval"
                icon={AlertCircle}
                color={COLORS.warning}
                bgColor={COLORS.warningBg}
              />
              <StatCard
                title="People Fed"
                value={donorData.donations
                  .filter((d) => d.status === 'DELIVERED')
                  .reduce((acc, curr) => acc + (curr.peopleServed || 0), 0)}
                subtitle="Estimated smiles"
                icon={Users}
                color={COLORS.success}
                bgColor={COLORS.successBg}
              />
            </View>

            {/* Recent Donations Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Recent Donations</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/donations')}>
                <Text style={styles.seeAllText}>Manage All</Text>
              </TouchableOpacity>
            </View>

            {donorData.donations.length === 0 ? (
              <EmptyState
                title="No donations posted yet"
                description="Share surplus prepared food or pantry staples with local shelters."
                actionTitle="Create First Donation"
                onAction={() => router.push('/donation/create')}
              />
            ) : (
              donorData.donations.slice(0, 4).map((item) => (
                <DonationCard key={item._id} donation={item} />
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* RECIPIENT DASHBOARD */}
        {/* ============================================================== */}
        {user?.role === 'recipient' && (
          <View>
            {/* Quick Hero Banner */}
            <View style={styles.recipientHero}>
              <Text style={styles.heroGreeting}>Food Redistribution Hub</Text>
              <Text style={styles.heroSub}>
                Browse hot meals, raw ingredients, and packaged items available for immediate pickup.
              </Text>
              <Button
                title="Browse All Food Listings"
                variant="primary"
                size="md"
                style={{ marginTop: SPACING.sm }}
                onPress={() => router.push('/(tabs)/donations')}
              />
            </View>

            {/* Recipient Metrics */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Available Food"
                value={recipientData.availableDonations.length}
                subtitle="Ready for claim"
                icon={Utensils}
                color={COLORS.primary}
                bgColor={COLORS.primarySoft}
              />
              <StatCard
                title="Active Requests"
                value={recipientData.activeRequestsCount}
                subtitle="In workflow"
                icon={Clock}
                color={COLORS.warning}
                bgColor={COLORS.warningBg}
              />
            </View>

            {/* Fresh Available Donations */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fresh Available Donations</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/donations')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {recipientData.availableDonations.length === 0 ? (
              <EmptyState
                title="No food listings available right now"
                description="Please check back shortly as food donors list surplus batches throughout the day."
              />
            ) : (
              recipientData.availableDonations.map((item) => (
                <DonationCard key={item._id} donation={item} />
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* VOLUNTEER DASHBOARD */}
        {/* ============================================================== */}
        {user?.role === 'volunteer' && (
          <View>
            {/* Volunteer Metrics */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Open Tasks"
                value={volunteerData.availableTasks.length}
                subtitle="Needs volunteer"
                icon={Truck}
                color={COLORS.purple}
                bgColor={COLORS.purpleBg}
              />
              <StatCard
                title="In Progress"
                value={volunteerData.myTasks.filter((t) => ['ACCEPTED', 'PICKED_UP'].includes(t.status)).length}
                subtitle="Active routes"
                icon={Clock}
                color={COLORS.info}
                bgColor={COLORS.infoBg}
              />
              <StatCard
                title="Completed"
                value={volunteerData.stats?.totalCompleted || 0}
                subtitle="Successful drops"
                icon={CheckCircle2}
                color={COLORS.success}
                bgColor={COLORS.successBg}
              />
            </View>

            {/* Open Pickups Ready for Claim */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Deliveries Ready for Pickup</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/donations')}>
                <Text style={styles.seeAllText}>View All Tasks</Text>
              </TouchableOpacity>
            </View>

            {volunteerData.availableTasks.length === 0 ? (
              <EmptyState
                title="No open deliveries waiting"
                description="Great job! All current donations have assigned couriers. Pull down to refresh."
              />
            ) : (
              volunteerData.availableTasks.slice(0, 3).map((task) => (
                <TouchableOpacity
                  key={task._id}
                  style={styles.taskCardPreview}
                  onPress={() => router.push(`/task/${task._id}`)}
                >
                  <View style={styles.taskPreviewHeader}>
                    <Text style={styles.taskFoodTitle}>{task.donation?.title}</Text>
                    <View style={styles.taskStatusPill}>
                      <Text style={styles.taskStatusText}>READY</Text>
                    </View>
                  </View>
                  <Text style={styles.taskAddressText} numberOfLines={1}>
                    📍 {task.pickupAddress}
                  </Text>
                  <Text style={styles.taskSubtext}>
                    Quantity: {task.donation?.quantity} {task.donation?.unit} • Serves {task.donation?.peopleServed}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* ADMIN DASHBOARD */}
        {/* ============================================================== */}
        {user?.role === 'admin' && (
          <View>
            <View style={styles.adminBanner}>
              <ShieldCheck size={28} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.adminBannerTitle}>Administrator Command Center</Text>
                <Text style={styles.adminBannerSubtitle}>
                  Real-time MongoDB platform metrics and user governance.
                </Text>
              </View>
            </View>

            {/* Admin Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Users"
                value={adminData.stats.totalUsers || 0}
                subtitle="All roles"
                icon={Users}
                color={COLORS.primary}
                bgColor={COLORS.primarySoft}
              />
              <StatCard
                title="Donors"
                value={adminData.stats.totalDonors || 0}
                subtitle="Registered"
                icon={Utensils}
                color={COLORS.info}
                bgColor={COLORS.infoBg}
              />
              <StatCard
                title="Recipients"
                value={adminData.stats.totalRecipients || 0}
                subtitle="NGO shelters"
                icon={Heart}
                color={COLORS.danger}
                bgColor={COLORS.dangerBg}
              />
              <StatCard
                title="Volunteers"
                value={adminData.stats.totalVolunteers || 0}
                subtitle="Delivery network"
                icon={Truck}
                color={COLORS.purple}
                bgColor={COLORS.purpleBg}
              />
              <StatCard
                title="Total Donations"
                value={adminData.stats.totalDonations || 0}
                subtitle="Platform total"
                icon={Utensils}
                color={COLORS.primary}
                bgColor={COLORS.primarySoft}
              />
              <StatCard
                title="People Fed"
                value={adminData.stats.totalPeopleFed || 0}
                subtitle="Meals delivered"
                icon={CheckCircle2}
                color={COLORS.success}
                bgColor={COLORS.successBg}
              />
            </View>

            {/* Quick Admin Actions */}
            <View style={styles.adminActionRow}>
              <Button
                title="Manage Users"
                variant="outline"
                size="sm"
                style={{ flex: 1, marginRight: SPACING.xs }}
                onPress={() => router.push('/admin/users')}
              />
              <Button
                title="All Donations"
                variant="outline"
                size="sm"
                style={{ flex: 1, marginLeft: SPACING.xs }}
                onPress={() => router.push('/admin/donations')}
              />
            </View>

            {/* Recent Platform Donations */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Platform Donations</Text>
              <TouchableOpacity onPress={() => router.push('/admin/donations')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {adminData.recentDonations?.map((item) => (
              <DonationCard key={item._id} donation={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderGreen,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  recipientHero: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  heroGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  adminBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  adminBannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  taskCardPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  taskPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskFoodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  taskStatusPill: {
    backgroundColor: COLORS.purpleBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  taskStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.purple,
  },
  taskAddressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  taskSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
