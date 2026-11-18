import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import Card from '../../components/Card';
import FoodImageCard from '../../components/FoodImageCard';
import StatusBadge from '../../components/StatusBadge';
import QuantityLabel from '../../components/QuantityLabel';
import SectionHeading from '../../components/SectionHeading';
import BottomNav from '../../components/BottomNav';
import { COLORS, SPACING } from '../../constants/theme';

// Mock preview data – isolated from production services
const mockData = {
  ngo: {
    name: 'Sneha Child Care NGO',
    verified: true,
    address: 'Paldi, Ahmedabad',
  },
  nearbySummary: {
    totalDonations: 12,
    totalQuantity: 150, // in servings
  },
  foodListings: [
    {
      id: 'f1',
      title: 'Fresh Vegetable Pack',
      image: 'https://picsum.photos/400/300?food=4',
      quantity: 30,
      unit: 'servings',
      distanceKm: 2.1,
      deadline: 'Today 6:00 PM',
      prepTime: '12:00 PM',
      storage: 'Refrigerated',
    },
    {
      id: 'f2',
      title: 'Baked Samosas (50 pcs)',
      image: 'https://picsum.photos/400/300?food=5',
      quantity: 50,
      unit: 'pieces',
      distanceKm: 3.5,
      deadline: 'Tomorrow 10:00 AM',
      prepTime: 'Today 3:00 PM',
      storage: 'Room Temp',
    },
  ],
  pendingRequests: [
    { id: 'pr1', foodTitle: 'Fresh Vegetable Pack', quantity: 10, unit: 'servings', status: 'PENDING' },
  ],
  approvedCollections: [
    { id: 'ac1', foodTitle: 'Baked Samosas', quantity: 20, unit: 'pieces', status: 'APPROVED' },
  ],
  activePickups: [
    { id: 'up1', address: 'Radhe Caterers, SG Highway', eta: '15 mins', status: 'EN ROUTE' },
  ],
  volunteerAvailability: {
    totalVolunteers: 8,
    availableNow: 5,
  },
  distributionHistory: [
    { id: 'dh1', foodTitle: 'Fruit Mix', deliveredAt: '3 days ago' },
  ],
  impact: { peopleFed: 96, mealsSaved: 40 },
};

export default function NgoDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth(); // user.role should be 'recipient' or similar for NGO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Simulate async fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
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

  if (error) {
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.errorText}>Failed to load dashboard.</Text>
        <PrimaryButton title="Retry" onPress={() => { setLoading(true); setError(null); }} />
      </View>
    );
  }

  const { ngo, nearbySummary, foodListings, pendingRequests, approvedCollections, activePickups, volunteerAvailability, distributionHistory, impact } = data;

  const canRequest = ngo.verified; // Unverified NGOs cannot request food

  const handleRequestFood = (listing, qty) => {
    // Placeholder – in real app would call API with qty <= listing.quantity
    console.log('Requesting', qty, listing.unit, 'of', listing.title);
  };

  return (
    <View style={styles.container}>
      <Header title={ngo.name} showNotification showProfile />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification status */}
        <View style={styles.verificationBox}>
          <Text style={styles.verificationText}>
            {ngo.verified ? '✅ Verified NGO' : '⚠️ Verification pending – cannot request food'}
          </Text>
        </View>

        {/* Nearby donation summary */}
        <SectionHeading title="Nearby Donations" />
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryText}>Donations available: {nearbySummary.totalDonations}</Text>
          <Text style={styles.summaryText}>Total quantity: {nearbySummary.totalQuantity} servings</Text>
        </Card>

        {/* Food Listings */}
        <SectionHeading title="Available Food" actionLabel={canRequest ? 'Refresh' : null} onAction={() => { /* could reload mock data */ }} />
        {foodListings.map(listing => (
          <FoodImageCard
            key={listing.id}
            image={listing.image}
            title={listing.title}
            badge={<StatusBadge status="AVAILABLE" />}
            rightAccessory={
              <View style={styles.listingInfo}>
                <QuantityLabel quantity={listing.quantity} unit={listing.unit} />
                <Text style={styles.smallText}>{listing.distanceKm} km away</Text>
                <Text style={styles.smallText}>Pickup by {listing.deadline}</Text>
                <Text style={styles.smallText}>Prep: {listing.prepTime}</Text>
                <Text style={styles.smallText}>Storage: {listing.storage}</Text>
              </View>
            }
            onPress={() => router.push(`/donation/${listing.id}`)}
          >
            <PrimaryButton
              title="Request Food"
              disabled={!canRequest}
              onPress={() => handleRequestFood(listing, listing.quantity)}
              style={styles.requestBtn}
            />
          </FoodImageCard>
        ))}

        {/* Pending Collection Requests */}
        <SectionHeading title="Pending Requests" actionLabel="Manage" onAction={() => router.push('/collections/pending')} />
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

        {/* Approved Collections */}
        <SectionHeading title="Approved Collections" actionLabel="View" onAction={() => router.push('/collections/approved')} />
        {approvedCollections.map(col => (
          <Card key={col.id} style={styles.requestCard}>
            <View style={styles.rowSpace}>
              <Text style={styles.reqText}>{col.foodTitle}</Text>
              <QuantityLabel quantity={col.quantity} unit={col.unit} />
            </View>
            <StatusBadge status={col.status} />
          </Card>
        ))}

        {/* Active Pickup Tracking */}
        <SectionHeading title="Active Pickups" />
        {activePickups.map(pick => (
          <Card key={pick.id} style={styles.pickupCard}>
            <Text style={styles.pickupText}>📍 {pick.address}</Text>
            <Text style={styles.pickupSub}>ETA: {pick.eta}</Text>
            <StatusBadge status={pick.status} />
          </Card>
        ))}

        {/* Volunteer Availability */}
        <SectionHeading title="Volunteer Availability" />
        <Card style={styles.volunteerCard}>
          <Text style={styles.volunteerText}>Total volunteers: {volunteerAvailability.totalVolunteers}</Text>
          <Text style={styles.volunteerText}>Available now: {volunteerAvailability.availableNow}</Text>
        </Card>

        {/* Distribution History */}
        <SectionHeading title="Distribution History" />
        {distributionHistory.map(hist => (
          <FoodImageCard
            key={hist.id}
            image={'https://picsum.photos/400/300?food=6'}
            title={hist.foodTitle}
            badge={<StatusBadge status="DELIVERED" />}
            subtitle={hist.deliveredAt}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.danger, marginBottom: SPACING.md },
  verificationBox: { marginBottom: SPACING.md },
  verificationText: { color: COLORS.success, fontWeight: '600' },
  summaryCard: { marginVertical: SPACING.md },
  summaryText: { color: COLORS.textPrimary, marginBottom: SPACING.xs },
  listingInfo: { marginTop: SPACING.sm },
  smallText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  requestBtn: { marginTop: SPACING.sm },
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
