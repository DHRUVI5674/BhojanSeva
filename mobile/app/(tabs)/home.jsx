import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import FoodImageCard from '../../components/FoodImageCard';
import StatusBadge from '../../components/StatusBadge';
import QuantityLabel from '../../components/QuantityLabel';
import SectionHeading from '../../components/SectionHeading';
import BottomNav from '../../components/BottomNav';
import { COLORS, SPACING } from '../../constants/theme';
import { ngoMockData } from '../../mock/ngoData';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mock async fetch
    const timer = setTimeout(() => {
      setData(ngoMockData);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { ngo, nearbySummary, pendingRequests, approvedCollections, activePickups, volunteerAvailability, impact, distributionHistory } = data;

  return (
    <View style={styles.container}>
      <Header title={ngo.name} showNotification showProfile />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification */}
        <View style={styles.verificationBox}>
          <Text style={styles.verificationText}>
            {ngo.verified ? '✅ Verified NGO' : '⚠️ Verification pending – cannot request food'}
          </Text>
        </View>
        {/* Nearby summary */}
        <SectionHeading title="Nearby Donations" />
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>Total donations: {nearbySummary.totalDonations}</Text>
          <Text style={styles.summaryText}>Total quantity: {nearbySummary.totalQuantity} servings</Text>
          <Text style={styles.summaryText}>Available foods: {nearbySummary.availableFoodCount}</Text>
        </Card>
        {/* Pending requests */}
        <SectionHeading title="Pending Requests" actionLabel="View" onAction={() => router.push('/collections')} />
        {pendingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending requests.</Text>
        ) : (
          pendingRequests.map(req => (
            <Card key={req.id} style={styles.requestCard}>
              <View style={styles.rowSpace}>
                <Text style={styles.reqText}>{req.foodTitle}</Text>
                <QuantityLabel quantity={req.quantity} unit={req.unit} />
              </View>
              <StatusBadge status={req.status} />
            </Card>
          ))
        )}
        {/* Approved collections */}
        <SectionHeading title="Approved Collections" actionLabel="View" onAction={() => router.push('/collections')} />
        {approvedCollections.map(col => (
          <Card key={col.id} style={styles.requestCard}>
            <View style={styles.rowSpace}>
              <Text style={styles.reqText}>{col.foodTitle}</Text>
              <QuantityLabel quantity={col.quantity} unit={col.unit} />
            </View>
            <StatusBadge status={col.status} />
          </Card>
        ))}
        {/* Active pickups */}
        <SectionHeading title="Active Pickups" />
        {activePickups.map(p => (
          <Card key={p.id} style={styles.pickupCard}>
            <Text style={styles.pickupText}>📍 {p.address}</Text>
            <Text style={styles.pickupSub}>ETA: {p.eta}</Text>
            <StatusBadge status={p.status} />
          </Card>
        ))}
        {/* Volunteer availability */}
        <SectionHeading title="Volunteer Availability" />
        <Card style={styles.volunteerCard}>
          <Text style={styles.volunteerText}>Total volunteers: {volunteerAvailability.totalVolunteers}</Text>
          <Text style={styles.volunteerText}>Available now: {volunteerAvailability.availableNow}</Text>
        </Card>
        {/* Impact */}
        <SectionHeading title="Impact" />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{impact.totalFoodCollected}</Text>
            <Text style={styles.statLabel}>Food Collected</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{impact.totalMealsDistributed}</Text>
            <Text style={styles.statLabel}>Meals Distributed</Text>
          </View>
        </View>
        {/* Recent distribution */}
        <SectionHeading title="Recent Distribution" />
        {distributionHistory.map(item => (
          <FoodImageCard
            key={item.id}
            image={item.image}
            title={item.foodTitle}
            badge={<StatusBadge status="DELIVERED" />}
            subtitle={item.deliveredAt}
          />
        ))}
      </ScrollView>
      <BottomNav activeRoute="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verificationBox: { marginBottom: SPACING.md },
  verificationText: { color: COLORS.success, fontWeight: '600' },
  summaryCard: { marginVertical: SPACING.md },
  summaryText: { color: COLORS.textPrimary, marginBottom: SPACING.xs },
  emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', marginVertical: SPACING.sm },
  requestCard: { marginVertical: SPACING.sm },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqText: { fontWeight: '600' },
  pickupCard: { marginVertical: SPACING.sm },
  pickupText: { fontWeight: '600' },
  pickupSub: { color: COLORS.textSecondary },
  volunteerCard: { marginVertical: SPACING.sm, padding: SPACING.md },
  volunteerText: { fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: SPACING.lg },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { color: COLORS.textSecondary },
});
