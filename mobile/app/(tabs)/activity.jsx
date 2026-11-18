import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { volunteerService } from '../../services/volunteerService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import Header from '../../components/Header';
import RequestCard from '../../components/RequestCard';
import TaskCard from '../../components/TaskCard';
import EmptyState from '../../components/EmptyState';

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [filter, setFilter] = useState('ALL');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      if (user?.role === 'donor') {
        const res = await requestService.getIncomingRequests();
        setItems(res?.requests || []);
      } else if (user?.role === 'recipient') {
        const res = await requestService.getMyRequests();
        setItems(res?.requests || []);
      } else if (user?.role === 'volunteer') {
        const res = await volunteerService.getMyTasks();
        setItems(res?.tasks || []);
      } else if (user?.role === 'admin') {
        const res = await requestService.getMyRequests();
        setItems(res?.requests || []);
      }
    } catch (err) {
      console.warn('[ActivityScreen] Error fetching activity:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  // Donor handles incoming request
  const handleAcceptRequest = async (requestId) => {
    try {
      await requestService.updateRequestStatus(requestId, 'ACCEPTED', 'Approved for immediate pickup');
      fetchActivity();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await requestService.updateRequestStatus(requestId, 'REJECTED', 'Food was claimed or unavailable');
      fetchActivity();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not reject request');
    }
  };

  // Recipient cancels request
  const handleCancelRequest = async (requestId) => {
    try {
      await requestService.cancelRequest(requestId);
      fetchActivity();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not cancel request');
    }
  };

  // Volunteer confirms pickup or delivery
  const handleVolunteerPickup = async (taskId) => {
    try {
      await volunteerService.confirmPickup(taskId);
      fetchActivity();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not confirm pickup');
    }
  };

  const handleVolunteerDeliver = async (taskId) => {
    try {
      await volunteerService.confirmDelivery(taskId);
      fetchActivity();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not confirm delivery');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return item.status === 'PENDING' || item.status === 'ASSIGNED';
    if (filter === 'IN_PROGRESS')
      return ['ACCEPTED', 'ASSIGNED', 'PICKED_UP'].includes(item.status);
    if (filter === 'COMPLETED') return item.status === 'DELIVERED';
    return item.status === filter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={
          user?.role === 'donor'
            ? 'Incoming Food Requests'
            : user?.role === 'volunteer'
            ? 'My Delivery Assignments'
            : 'My Food Requests'
        }
        subtitle={
          user?.role === 'donor'
            ? 'Review and approve requests from NGOs'
            : user?.role === 'volunteer'
            ? 'Track pickup and delivery progress'
            : 'Track the status of your claimed meals'
        }
      />

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, filter === 'ALL' && styles.tabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>

        {user?.role === 'donor' && (
          <TouchableOpacity
            style={[styles.tab, filter === 'PENDING' && styles.tabActive]}
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.tabText, filter === 'PENDING' && styles.tabTextActive]}>
              Pending Approval
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tab, filter === 'IN_PROGRESS' && styles.tabActive]}
          onPress={() => setFilter('IN_PROGRESS')}
        >
          <Text style={[styles.tabText, filter === 'IN_PROGRESS' && styles.tabTextActive]}>
            In Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'COMPLETED' && styles.tabActive]}
          onPress={() => setFilter('COMPLETED')}
        >
          <Text style={[styles.tabText, filter === 'COMPLETED' && styles.tabTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading activity history...</Text>
        </View>
      ) : user?.role === 'volunteer' ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No tasks in this category"
              description="Claim open deliveries from the 'Tasks' tab to get started."
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPickup={handleVolunteerPickup}
              onDeliver={handleVolunteerDeliver}
            />
          )}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title={user?.role === 'donor' ? 'No incoming requests' : 'No food requests found'}
              description={
                user?.role === 'donor'
                  ? 'When local NGOs request your food, they will appear here.'
                  : 'Explore available food donations and submit a request to feed your community.'
              }
              actionTitle={user?.role === 'recipient' ? 'Browse Food' : undefined}
              onAction={user?.role === 'recipient' ? () => router.push('/(tabs)/donations') : undefined}
            />
          }
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              isDonor={user?.role === 'donor'}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
              onCancel={handleCancelRequest}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  listContent: {
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
});
