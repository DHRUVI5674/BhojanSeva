import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import SearchBar from '../../components/SearchBar';
import FilterChip from '../../components/FilterChip';
import FoodImageCard from '../../components/FoodImageCard';
import StatusBadge from '../../components/StatusBadge';
import QuantityLabel from '../../components/QuantityLabel';
import BottomNav from '../../components/BottomNav';
import SectionHeading from '../../components/SectionHeading';
import { COLORS, SPACING } from '../../constants/theme';
import { ngoMockData } from '../../mock/ngoData';

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(ngoMockData.foodListings);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    // For simplicity, filters are not implemented – placeholder
    return matchesSearch;
  });

  const canRequest = ngoMockData.ngo.verified;

  const handleRequest = (listing, qty) => {
    if (!canRequest) {
      Alert.alert('Verification Required', 'Your NGO must be verified to request food.');
      return;
    }
    if (qty > listing.quantity) {
      Alert.alert('Quantity Exceeded', `You can request up to ${listing.quantity} ${listing.unit}.`);
      return;
    }
    // Placeholder for real request call
    Alert.alert('Request Sent', `Requested ${qty} ${listing.unit} of ${listing.title}.`);
  };

  if (loading) {
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Discover Food" showNotification showProfile />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search food..." />
        {/* Filter chips placeholder – could be categories */}
        <View style={styles.chipContainer}>
          {['All', 'Fresh', 'Prepared', 'Refrigerated', 'Room Temp'].map(label => (
            <FilterChip
              key={label}
              label={label}
              selected={selectedFilters.includes(label)}
              onPress={() => {
                const exists = selectedFilters.includes(label);
                setSelectedFilters(prev =>
                  exists ? prev.filter(l => l !== label) : [...prev, label]
                );
              }}
            />
          ))}
        </View>
        <SectionHeading title="Available Food" />
        {filteredData.length === 0 ? (
          <Text style={styles.emptyText}>No food matches your criteria.</Text>
        ) : (
          filteredData.map(listing => (
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
            >
              <PrimaryButton
                title="Request Food"
                disabled={!canRequest}
                onPress={() => handleRequest(listing, listing.quantity)}
                style={styles.requestBtn}
              />
            </FoodImageCard>
          ))
        )}
      </ScrollView>
      <BottomNav activeRoute="discover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: SPACING.sm },
  emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', marginVertical: SPACING.sm },
  listingInfo: { marginTop: SPACING.sm },
  smallText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  requestBtn: { marginTop: SPACING.sm },
});
