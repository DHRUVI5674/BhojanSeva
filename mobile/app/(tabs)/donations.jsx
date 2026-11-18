import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Plus, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { donationService } from '../../services/donationService';
import { volunteerService } from '../../services/volunteerService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Header from '../../components/Header';
import DonationCard from '../../components/DonationCard';
import TaskCard from '../../components/TaskCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'cooked_meals', label: 'Cooked Meals' },
  { id: 'raw_ingredients', label: 'Raw Staples' },
  { id: 'packaged_food', label: 'Packaged' },
  { id: 'bakery_items', label: 'Bakery' },
  { id: 'fruits_vegetables', label: 'Fruits & Veg' },
];

export default function DonationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);

  const [donations, setDonations] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      if (user?.role === 'volunteer') {
        const res = await volunteerService.getAvailableTasks();
        setVolunteerTasks(res?.tasks || []);
      } else if (user?.role === 'donor') {
        const res = await donationService.getMyDonations();
        let list = res?.donations || [];
        if (selectedCategory) {
          list = list.filter((d) => d.category === selectedCategory);
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          list = list.filter((d) => d.title.toLowerCase().includes(q));
        }
        setDonations(list);
      } else {
        // Recipient / Admin / Public: browse available food
        const params = {
          status: 'AVAILABLE',
        };
        if (selectedCategory) params.category = selectedCategory;
        if (isVegOnly) params.isVegetarian = true;
        if (search.trim()) params.search = search.trim();

        const res = await donationService.getDonations(params);
        setDonations(res?.donations || []);
      }
    } catch (err) {
      console.warn('[DonationsScreen] Fetch failed:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedCategory, isVegOnly, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleVolunteerAccept = async (taskId) => {
    try {
      await volunteerService.acceptTask(taskId);
      router.push(`/task/${taskId}`);
    } catch (err) {
      alert(err.message || 'Could not accept task');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={
          user?.role === 'donor'
            ? 'My Food Donations'
            : user?.role === 'volunteer'
            ? 'Open Delivery Tasks'
            : 'Available Food'
        }
        subtitle={
          user?.role === 'donor'
            ? 'Track, edit and post food donations'
            : user?.role === 'volunteer'
            ? 'Pick up donations and transport to shelters'
            : 'Claim fresh meals and surplus items'
        }
        rightAction={
          user?.role === 'donor' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/donation/create')}
            >
              <Plus size={20} color={COLORS.surface} />
            </TouchableOpacity>
          )
        }
      />

      {/* Search and Filters Header (for Donors and Recipients) */}
      {user?.role !== 'volunteer' && (
        <View style={styles.filterSection}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Search size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food by title or location..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={fetchItems}
            />
          </View>

          {/* Category Chips Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id || 'all'}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Veg Only Toggle (for browse) */}
          {user?.role !== 'donor' && (
            <View style={styles.vegToggleRow}>
              <TouchableOpacity
                style={[styles.vegToggle, isVegOnly && styles.vegToggleActive]}
                onPress={() => setIsVegOnly(!isVegOnly)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isVegOnly && { backgroundColor: COLORS.success, borderColor: COLORS.success },
                  ]}
                >
                  {isVegOnly && <Check size={12} color={COLORS.surface} />}
                </View>
                <Text style={styles.vegToggleText}>Pure Veg Only (Green Dot)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Main Content List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching donations...</Text>
        </View>
      ) : user?.role === 'volunteer' ? (
        <FlatList
          data={volunteerTasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="No open tasks waiting"
              description="All approved donation batches currently have assigned volunteers."
            />
          }
          renderItem={({ item }) => (
            <TaskCard task={item} onAccept={handleVolunteerAccept} />
          )}
        />
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title={user?.role === 'donor' ? 'No donations found' : 'No available food matches your criteria'}
              description={
                user?.role === 'donor'
                  ? 'Post your extra catered food or groceries to prevent waste.'
                  : 'Try selecting a different category or clearing filters.'
              }
              actionTitle={user?.role === 'donor' ? 'Post Food' : undefined}
              onAction={user?.role === 'donor' ? () => router.push('/donation/create') : undefined}
            />
          }
          renderItem={({ item }) => <DonationCard donation={item} />}
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
  addButton: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: 8,
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
  vegToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  vegToggleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
