import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  Camera,
  MapPin,
  Clock,
  Utensils,
  Users,
  Check,
  AlertCircle,
  PlusCircle,
} from 'lucide-react-native';
import { donationService } from '../../services/donationService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

const CATEGORIES = [
  { id: 'cooked_meals', label: 'Cooked Meals' },
  { id: 'raw_ingredients', label: 'Raw Staples' },
  { id: 'packaged_food', label: 'Packaged' },
  { id: 'bakery_items', label: 'Bakery' },
  { id: 'fruits_vegetables', label: 'Fruits & Veg' },
  { id: 'beverages', label: 'Beverages' },
];

const UNITS = ['servings', 'kg', 'packets', 'boxes', 'liters', 'items'];
const EXPIRY_OPTIONS = [
  { hours: 4, label: '4 Hours' },
  { hours: 8, label: '8 Hours' },
  { hours: 12, label: '12 Hours' },
  { hours: 24, label: '24 Hours (1 Day)' },
  { hours: 48, label: '48 Hours (2 Days)' },
];

export default function CreateDonationScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cooked_meals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('servings');
  const [peopleServed, setPeopleServed] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [expiryHours, setExpiryHours] = useState(12);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [coordinates, setCoordinates] = useState([72.5714, 23.0225]); // default Ahmedabad

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  // Pick or take image with Expo ImagePicker
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera roll permission is required to upload food photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (e) {
      console.warn('Image picker error:', e.message);
    }
  };

  // Get current device GPS with Expo Location
  const handleGetLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect coordinates.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc?.coords) {
        setCoordinates([loc.coords.longitude, loc.coords.latitude]);
        // Reverse geocode to address
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geocode && geocode[0]) {
          const g = geocode[0];
          const addr = [g.name, g.street, g.city, g.region].filter(Boolean).join(', ');
          if (addr) setPickupAddress(addr);
        }
      }
    } catch (e) {
      Alert.alert('Location Error', 'Could not detect current GPS coordinates.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !quantity.trim() || !pickupAddress.trim()) {
      setError('Please fill in title, quantity, and pickup address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const expiryDate = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

      await donationService.createDonation({
        title: title.trim(),
        description: description.trim(),
        category,
        quantity: Number(quantity),
        unit,
        peopleServed: Number(peopleServed) || Number(quantity) || 1,
        expiryTime: expiryDate,
        isVegetarian,
        pickupAddress: pickupAddress.trim(),
        pickupInstructions: pickupInstructions.trim(),
        coordinates,
        images: imageBase64 ? [imageBase64] : [],
      });

      Alert.alert('Success 🎉', 'Food donation posted successfully! It is now available to local recipients.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/donations'),
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Food Photo Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderBox}>
              <Camera size={32} color={COLORS.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.imagePickerText}>Add Food Photo</Text>
              <Text style={styles.imagePickerSubtext}>Tap to pick from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Input
            label="Food Title *"
            placeholder="e.g. 50 Servings Dal Makhani & Jeera Rice"
            value={title}
            onChangeText={setTitle}
            icon={Utensils}
          />

          <Input
            label="Description & Preparation Details"
            placeholder="e.g. Freshly cooked at 11 AM for corporate lunch. Hygienically packed."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Category Selector */}
          <Text style={styles.label}>FOOD CATEGORY *</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity & Unit Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Input
                label="Quantity *"
                placeholder="e.g. 40"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>UNIT</Text>
              <View style={styles.unitPicker}>
                {UNITS.slice(0, 3).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* People Served */}
          <Input
            label="Estimated People Fed"
            placeholder="e.g. 40"
            value={peopleServed}
            onChangeText={setPeopleServed}
            icon={Users}
            keyboardType="numeric"
          />

          {/* Dietary Type: Veg vs Non-Veg */}
          <Text style={styles.label}>DIETARY CLASSIFICATION</Text>
          <View style={styles.dietaryRow}>
            <TouchableOpacity
              style={[styles.dietaryBtn, isVegetarian && styles.dietaryBtnActive]}
              onPress={() => setIsVegetarian(true)}
            >
              <View style={[styles.dot, { backgroundColor: '#16A34A' }]} />
              <Text style={[styles.dietaryText, isVegetarian && { color: '#16A34A', fontWeight: '700' }]}>
                Vegetarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dietaryBtn, !isVegetarian && styles.dietaryBtnActive]}
              onPress={() => setIsVegetarian(false)}
            >
              <View style={[styles.dot, { backgroundColor: '#DC2626' }]} />
              <Text style={[styles.dietaryText, !isVegetarian && { color: '#DC2626', fontWeight: '700' }]}>
                Non-Vegetarian
              </Text>
            </TouchableOpacity>
          </View>

          {/* Expiry Times */}
          <Text style={styles.label}>ESTIMATED SHELF LIFE / EXPIRY *</Text>
          <View style={styles.chipGrid}>
            {EXPIRY_OPTIONS.map((opt) => {
              const active = expiryHours === opt.hours;
              return (
                <TouchableOpacity
                  key={opt.hours}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setExpiryHours(opt.hours)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Location & Address */}
          <View style={styles.locationHeaderRow}>
            <Text style={styles.label}>PICKUP LOCATION *</Text>
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGetLocation}
              disabled={locating}
            >
              <MapPin size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.gpsText}>{locating ? 'Locating...' : 'Use Current GPS'}</Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Full pickup street address"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            icon={MapPin}
          />

          <Input
            label="Pickup Instructions"
            placeholder="e.g. Call security gate #2 upon arrival"
            value={pickupInstructions}
            onChangeText={setPickupInstructions}
          />

          <Button
            title="Publish Food Donation"
            icon={PlusCircle}
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSubmit}
            style={{ marginTop: SPACING.md }}
          />
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
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  imagePicker: {
    height: 160,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  imagePickerSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPicker: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 4,
    minHeight: 50,
    alignItems: 'center',
  },
  unitChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  unitChipActive: {
    backgroundColor: COLORS.primary,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unitTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  dietaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  dietaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  dietaryBtnActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dietaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  gpsText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
