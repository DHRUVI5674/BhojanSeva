import React from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import SectionHeading from '../../components/SectionHeading';
import Card from '../../components/Card';
import FoodImageCard from '../../components/FoodImageCard';
import StatusBadge from '../../components/StatusBadge';
import QuantityLabel from '../../components/QuantityLabel';
import { ngoMockData } from '../../mock/ngoData';

export default function CollectionsScreen() {
  const router = useRouter();

  const renderPending = ({ item }) => (
    <Card style={styles.card}>
      <FoodImageCard
        title={item.foodTitle}
        image={ngoMockData.foodListings.find(f => f.title === item.foodTitle)?.image}
        quantity={item.quantity}
        unit={item.unit}
      />
      <StatusBadge status="PENDING" />
    </Card>
  );

  const renderApproved = ({ item }) => (
    <Card style={styles.card}>
      <FoodImageCard
        title={item.foodTitle}
        image={ngoMockData.foodListings.find(f => f.title === item.foodTitle)?.image}
        quantity={item.quantity}
        unit={item.unit}
      />
      <StatusBadge status="APPROVED" />
    </Card>
  );

  const renderActivePickup = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.pickupInfo}>
        <StatusBadge status={item.status} />
        <QuantityLabel label="Address" value={item.address} />
        <QuantityLabel label="ETA" value={item.eta} />
      </View>
    </Card>
  );

  const renderCompleted = ({ item }) => (
    <Card style={styles.card}>
      <FoodImageCard title={item.foodTitle} image={item.image} />
      <StatusBadge status="COMPLETED" />
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <SectionHeading title="Pending Requests" />
            <FlatList
              data={ngoMockData.pendingRequests}
              renderItem={renderPending}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />

            <SectionHeading title="Approved Collections" />
            <FlatList
              data={ngoMockData.approvedCollections}
              renderItem={renderApproved}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />

            <SectionHeading title="Active Pickups" />
            <FlatList
              data={ngoMockData.activePickups}
              renderItem={renderActivePickup}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />

            <SectionHeading title="Completed Collections" />
            <FlatList
              data={ngoMockData.distributionHistory}
              renderItem={renderCompleted}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}
        data={[]}
        renderItem={null}
      />
      <BottomNav activeRoute="collections" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 },
  card: { marginHorizontal: 10, marginVertical: 5 },
  pickupInfo: { padding: 10 },
});