import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function EditDonationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cooked_meals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('servings');
  const [peopleServed, setPeopleServed] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [coordinates, setCoordinates] = useState([72.5714, 23.0225]);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const loadDonation = useCallback(async () => {
    if (!id) {
      setError('Donation ID missing');
      setInitialLoading(false);
      return;
    }
    try {
      setInitialLoading(true);
      const res = await donationService.getDonationById(id);
      const d = res?.donation;
      if (d) {
        setTitle(d.title || '');
        setDescription(d.description || '');
        setCategory(d.category || 'cooked_meals');
        setQuantity(String(d.quantity || ''));
        setUnit(d.unit || 'servings');
        setPeopleServed(String(d.peopleServed || ''));
        setIsVegetarian(Boolean(d.isVegetarian));
        setPickupAddress(d.pickupAddress || '');
        setPickupInstructions(d.pickupInstructions || '');
        if (d.location?.coordinates) {
          setCoordinates(d.location.coordinates);
        }
        if (d.images && d.images.length > 0) {
          setImageUri(d.images[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load donation details');
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDonation();
  }, [loadDonation]);

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

  const handleUpdate = async () => {
    if (!title.trim() || !quantity.trim() || !pickupAddress.trim()) {
      setError('Please fill in title, quantity, and pickup address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        category,
        quantity: Number(quantity),
        unit,
        peopleServed: Number(peopleServed) || Number(quantity) || 1,
        isVegetarian,
        pickupAddress: pickupAddress.trim(),
        pickupInstructions: pickupInstructions.trim(),
        coordinates,
      };

      if (imageBase64) {
        updateData.images = [imageBase64];
      }

      await donationService.updateDonation(id, updateData);

      Alert.alert('Updated 🎉', 'Food donation updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to update donation');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading donation...</Text>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.imagePickerText}>Change Food Photo</Text>
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

          {/* People Fed */}
          <Input
            label="Est. People Feedable"
            placeholder="How many persons can eat this?"
            value={peopleServed}
            onChangeText={setPeopleServed}
            keyboardType="numeric"
            icon={Users}
          />

          {/* Dietary Indicator */}
          <Text style={styles.label}>DIET SPECIFICATION</Text>
          <View style={styles.dietRow}>
            <TouchableOpacity
              style={[styles.dietBtn, isVegetarian && styles.dietBtnActive]}
              onPress={() => setIsVegetarian(true)}
            >
              <View style={[styles.dietDot, { borderColor: '#16A34A' }]}>
                {isVegetarian ? <View style={[styles.dietDotInner, { backgroundColor: '#16A34A' }]} /> : null}
              </View>
              <Text style={[styles.dietText, isVegetarian && styles.dietTextActive]}>
                Vegetarian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dietBtn, !isVegetarian && styles.dietBtnActive]}
              onPress={() => setIsVegetarian(false)}
            >
              <View style={[styles.dietDot, { borderColor: '#DC2626' }]}>
                {!isVegetarian ? <View style={[styles.dietDotInner, { backgroundColor: '#DC2626' }]} /> : null}
              </View>
              <Text style={[styles.dietText, !isVegetarian && styles.dietTextActive]}>
                Non-Vegetarian
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location & Pickup Address */}
          <View style={styles.locationHeaderRow}>
            <Text style={styles.label}>PICKUP ADDRESS *</Text>
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={handleGetLocation}
              disabled={locating}
            >
              <MapPin size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.gpsBtnText}>{locating ? 'Detecting...' : 'Use Current GPS'}</Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Building, street, landmark, city"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Pickup Instructions for Volunteer"
            placeholder="e.g. Ring bell at back gate, ask for Chef Ramesh"
            value={pickupInstructions}
            onChangeText={setPickupInstructions}
          />

          <Button
            title="Save Changes"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleUpdate}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  imagePicker: {
    height: 160,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unitPicker: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  unitChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#FFF',
  },
  dietRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.sm,
  },
  dietBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dietBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  dietDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dietDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dietText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dietTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
