import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Utensils,
  Clock,
  MapPin,
  Users,
  Building,
  Phone,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { requestService } from '../../services/requestService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function DonationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request modal state for recipients
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestQty, setRequestQty] = useState('');
  const [peopleToFeed, setPeopleToFeed] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await donationService.getDonationById(id);
      setDonation(res?.donation || null);
      if (res?.donation) {
        setRequestQty(String(res.donation.quantity - (res.donation.claimedQuantity || 0)));
        setPeopleToFeed(String(res.donation.peopleServed || 1));
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not load donation details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleRequestSubmit = async () => {
    if (!requestQty || Number(requestQty) <= 0) {
      Alert.alert('Invalid Quantity', 'Please specify a valid quantity to claim.');
      return;
    }

    try {
      setRequestLoading(true);
      await requestService.createRequest({
        donationId: id,
        requestedQuantity: Number(requestQty),
        peopleToFeed: Number(peopleToFeed) || Number(requestQty) || 1,
        deliveryAddress: deliveryAddress.trim() || donation?.pickupAddress || 'Address on file',
        deliveryInstructions: deliveryNotes.trim(),
      });
      setIsRequestModalOpen(false);
      Alert.alert(
        'Request Sent! 🎉',
        'The donor has received your request and will approve it shortly.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/activity') }]
      );
    } catch (err) {
      Alert.alert('Request Failed', err.message || 'Could not place request');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelDonation = async () => {
    Alert.alert('Cancel Donation', 'Are you sure you want to cancel this food donation?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await donationService.cancelDonation(id, 'Cancelled by donor');
            fetchDetails();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading donation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Donation not found or has been removed.</Text>
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

  const statusInfo = COLORS.status[donation.status] || {
    text: COLORS.textSecondary,
    bg: '#F3F4F6',
    label: donation.status,
  };

  const isOwner = user && donation.donor && user._id === donation.donor._id;
  const canRequest =
    user?.role === 'recipient' && donation.status === 'AVAILABLE' && !donation.isExpired;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Food Image */}
        {donation.images && donation.images.length > 0 ? (
          <Image
            source={{ uri: donation.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.content}>
          {/* Status and Category Header */}
          <View style={styles.topRow}>
            <View style={styles.categoryPill}>
              <Utensils size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.categoryText}>
                {donation.category?.replace('_', ' ')?.toUpperCase()}
              </Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{donation.title}</Text>

          {/* Description */}
          {donation.description ? (
            <Text style={styles.description}>{donation.description}</Text>
          ) : null}

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>TOTAL QUANTITY</Text>
              <Text style={styles.metricValue}>
                {donation.quantity} {donation.unit}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>PEOPLE FED</Text>
              <Text style={styles.metricValue}>~{donation.peopleServed}</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>DIET</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: donation.isVegetarian ? '#16A34A' : '#DC2626' },
                ]}
              >
                {donation.isVegetarian ? 'Vegetarian' : 'Non-Veg'}
              </Text>
            </View>
          </View>

          {/* Expiry Timestamp */}
          <View style={styles.expiryRow}>
            <Clock size={16} color={COLORS.warning} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.sectionHeading}>Expires At</Text>
              <Text style={styles.expiryTimeText}>
                {new Date(donation.expiryTime).toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Pickup Address */}
          <View style={styles.addressBox}>
            <MapPin size={18} color={COLORS.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Pickup Location</Text>
              <Text style={styles.addressText}>{donation.pickupAddress}</Text>
              {donation.pickupInstructions ? (
                <Text style={styles.instructionsText}>
                  Note: {donation.pickupInstructions}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Donor Information */}
          {donation.donor ? (
            <View style={styles.donorBox}>
              <Building size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionHeading}>Donated By</Text>
                <Text style={styles.donorName}>
                  {donation.donor.organizationName || donation.donor.name}
                </Text>
                {donation.donor.phone ? (
                  <Text style={styles.donorPhone}>Phone: {donation.donor.phone}</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Action CTAs */}
          <View style={styles.actionContainer}>
            {canRequest && (
              <Button
                title="Claim / Request Food"
                variant="primary"
                size="lg"
                onPress={() => setIsRequestModalOpen(true)}
              />
            )}

            {isOwner && donation.status === 'AVAILABLE' && (
              <Button
                title="Cancel Food Donation"
                variant="danger"
                size="md"
                onPress={handleCancelDonation}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Recipient Claim Modal */}
      <Modal visible={isRequestModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Food Donation</Text>
            <Text style={styles.modalSubtitle}>
              Specify the required servings and drop-off instructions.
            </Text>

            <Input
              label={`Quantity Needed (Max: ${donation.quantity} ${donation.unit})`}
              placeholder="e.g. 30"
              value={requestQty}
              onChangeText={setRequestQty}
              keyboardType="numeric"
            />

            <Input
              label="People to Feed"
              placeholder="e.g. 30"
              value={peopleToFeed}
              onChangeText={setPeopleToFeed}
              keyboardType="numeric"
            />

            <Input
              label="Drop-off / Delivery Address"
              placeholder="Shelter address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              icon={MapPin}
            />

            <Input
              label="Notes for Donor & Volunteer"
              placeholder="e.g. Deliver to rear dining hall"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1, marginRight: SPACING.sm }}
                onPress={() => setIsRequestModalOpen(false)}
              />
              <Button
                title="Confirm Request"
                variant="primary"
                size="md"
                style={{ flex: 1.5 }}
                loading={requestLoading}
                onPress={handleRequestSubmit}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingBottom: SPACING.xl,
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
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  expiryTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.warning,
    marginTop: 2,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  donorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  donorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  donorPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionContainer: {
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
});
