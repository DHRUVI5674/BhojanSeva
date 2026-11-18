import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Mock preview data – isolated from production services
const mockData = {
  greeting: 'Welcome back, Radha!',
  verified: true,
  activeDonations: [
    {
      id: '1',
      title: '5 Servings of Dal Makhani',
      image: 'https://picsum.photos/400/300?food=1',
      status: 'AVAILABLE',
      quantity: 5,
      unit: 'servings',
    },
    {
      id: '2',
      title: 'Fresh Breads (10 pcs)',
      image: 'https://picsum.photos/400/300?food=2',
      status: 'AVAILABLE',
      quantity: 10,
      unit: 'pcs',
    },
  ],
  pendingRequests: [
    { id: 'r1', ngo: 'Sneha NGO', quantity: 3, unit: 'servings', status: 'PENDING' },
  ],
  upcomingPickups: [
    { id: 'p1', address: 'SG Highway, Ahmedabad', time: 'Today 4:00 PM' },
  ],
  recentDonations: [
    { id: 'd1', title: 'Fruit Salad', image: 'https://picsum.photos/400/300?food=3', deliveredAt: '2 days ago' },
  ],
  impact: { peopleFed: 124, mealsSaved: 58 },
};

export default function DonorDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Simulate data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} accessibilityRole="alert">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered} accessibilityRole="alert">
        <Text style={styles.errorText}>Failed to load dashboard.</Text>
        <PrimaryButton title="Retry" onPress={() => { setLoading(true); setError(null); }} />
      </SafeAreaView>
    );
  }

  const { greeting, verified, activeDonations, pendingRequests, upcomingPickups, recentDonations, impact } = data;

  return (
    <SafeAreaView style={styles.container}>
      <Header title={greeting} showNotification showProfile />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification status */}
        <View style={styles.verificationBox}>
          <Text style={styles.verificationText}>
            {verified ? '✅ Verified Donor' : '⚠️ Pending Verification'}
          </Text>
        </View>

        {/* Primary action */}
        <PrimaryButton
          title="Donate Food"
          onPress={() => router.push('/donation/create')}
          style={styles.donateBtn}
          icon={null}
        />

        {/* Active Donations */}
        <SectionHeading title="Active Donations" actionLabel="View All" onAction={() => router.push('/my-donations')} />
        {activeDonations.length === 0 ? (
          <Text style={styles.emptyText}>No active donations.</Text>
        ) : (
          activeDonations.map(d => (
            <FoodImageCard
              key={d.id}
              image={d.image}
              title={d.title}
              badge={<StatusBadge status={d.status} />}
              rightAccessory={<QuantityLabel quantity={d.quantity} unit={d.unit} />}
              onPress={() => router.push(`/donation/${d.id}`)}
            />
          ))
        )}

        {/* Pending NGO Requests */}
        <SectionHeading title="Pending Requests" actionLabel="Manage" onAction={() => router.push('/requests')} />
        {pendingRequests.length === 0 ? (
          <Text style={styles.emptyText}>No pending requests.</Text>
        ) : (
          pendingRequests.map(r => (
            <Card key={r.id} style={styles.requestCard}>
              <View style={styles.row}>
                <Text style={styles.reqText}>{r.ngo}</Text>
                <QuantityLabel quantity={r.quantity} unit={r.unit} />
              </View>
              <StatusBadge status={r.status} />
            </Card>
          ))
        )}

        {/* Upcoming Pickups */}
        <SectionHeading title="Upcoming Pickups" />
        {upcomingPickups.map(p => (
          <Card key={p.id} style={styles.pickupCard}>
            <Text style={styles.pickupText}>📍 {p.address}</Text>
            <Text style={styles.pickupTime}>{p.time}</Text>
          </Card>
        ))}

        {/* Recent Donations */}
        <SectionHeading title="Recently Completed" />
        {recentDonations.map(r => (
          <FoodImageCard
            key={r.id}
            image={r.image}
            title={r.title}
            badge={<StatusBadge status="DELIVERED" />}
            subtitle={r.deliveredAt}
          />
        ))}

        {/* Impact Statistics */}
        <SectionHeading title="Your Impact" />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{impact.peopleFed}</Text>
            <Text style={styles.statLabel}>People Fed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{impact.mealsSaved}</Text>
            <Text style={styles.statLabel}>Meals Saved</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, marginBottom: SPACING.md },
  verificationBox: { marginBottom: SPACING.md },
  verificationText: { color: COLORS.success, fontWeight: '600' },
  donateBtn: { marginVertical: SPACING.lg },
  emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', marginVertical: SPACING.sm },
  requestCard: { marginVertical: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqText: { fontWeight: '600' },
  pickupCard: { marginVertical: SPACING.sm },
  pickupText: { fontWeight: '600' },
  pickupTime: { color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: SPACING.lg },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { color: COLORS.textSecondary },
});