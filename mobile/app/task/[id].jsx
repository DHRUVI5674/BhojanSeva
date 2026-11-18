import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react-native';
import { volunteerService } from '../../services/volunteerService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Button from '../../components/Button';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      // Find task in my-tasks or available-tasks
      const [myRes, availRes] = await Promise.all([
        volunteerService.getMyTasks(),
        volunteerService.getAvailableTasks(),
      ]);
      const all = [...(myRes?.tasks || []), ...(availRes?.tasks || [])];
      const match = all.find((t) => t._id === id);
      setTask(match || null);
    } catch (err) {
      console.warn('Error fetching task:', err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handlePickup = async () => {
    try {
      setActionLoading(true);
      await volunteerService.confirmPickup(id);
      Alert.alert('Pickup Confirmed! 🚚', 'Food is now marked in-transit.');
      fetchTask();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async () => {
    try {
      setActionLoading(true);
      await volunteerService.confirmDelivery(id);
      Alert.alert('Delivery Complete! 🍽️', 'Thank you for serving your community.');
      fetchTask();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Task not found or has been completed.</Text>
          <Button
            title="Go Back"
            variant="primary"
            size="md"
            style={{ marginTop: SPACING.md }}
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isDelivered = task.status === 'DELIVERED';
  const isPickedUp = task.status === 'PICKED_UP';
  const isAccepted = task.status === 'ACCEPTED';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Header Banner */}
        <View style={[styles.statusBanner, isDelivered && { backgroundColor: COLORS.successBg }]}>
          <Truck
            size={24}
            color={isDelivered ? COLORS.success : COLORS.primary}
            style={{ marginRight: SPACING.sm }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.statusBannerTitle,
                isDelivered && { color: COLORS.success },
              ]}
            >
              STATUS: {task.status}
            </Text>
            <Text style={styles.statusBannerSubtitle}>
              {isDelivered
                ? 'Delivery successfully completed!'
                : isPickedUp
                ? 'Food is picked up and in transit to recipient'
                : 'Task claimed. Proceed to pickup location.'}
            </Text>
          </View>
        </View>

        {/* Food Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Food Information</Text>
          <Text style={styles.foodTitle}>{task.donation?.title}</Text>
          <Text style={styles.foodMeta}>
            Quantity: {task.donation?.quantity} {task.donation?.unit} (Feeds ~{task.donation?.peopleServed})
          </Text>
        </View>

        {/* Route Steps */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Route</Text>

          {/* Pickup Step */}
          <View style={styles.stepBox}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>PICKUP LOCATION</Text>
              <Text style={styles.addressText}>{task.pickupAddress}</Text>
              {task.donorContact?.phone ? (
                <View style={styles.contactRow}>
                  <Phone size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.contactText}>
                    {task.donorContact.name}: {task.donorContact.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Drop-off Step */}
          <View style={[styles.stepBox, { marginTop: SPACING.md }]}>
            <View style={[styles.stepNumber, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>DROP-OFF LOCATION</Text>
              <Text style={styles.addressText}>{task.deliveryAddress}</Text>
              {task.recipientContact?.phone ? (
                <View style={styles.contactRow}>
                  <Phone size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.contactText}>
                    {task.recipientContact.name}: {task.recipientContact.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {isAccepted && (
            <Button
              title="Confirm Pickup from Donor"
              icon={Truck}
              variant="primary"
              size="lg"
              loading={actionLoading}
              onPress={handlePickup}
            />
          )}

          {isPickedUp && (
            <Button
              title="Confirm Delivery to Recipient"
              icon={CheckCircle}
              variant="primary"
              size="lg"
              style={{ backgroundColor: COLORS.success }}
              loading={actionLoading}
              onPress={handleDeliver}
            />
          )}

          {isDelivered && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color={COLORS.success} style={{ marginRight: 6 }} />
              <Text style={styles.completedText}>Delivered Successfully</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.danger,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  foodTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  foodMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  stepBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  stepHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: SPACING.md,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successBg,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  completedText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.success,
  },
});
