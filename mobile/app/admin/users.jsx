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
import { User, Shield, Phone, Mail, CheckCircle, Ban, Trash2 } from 'lucide-react-native';
import { adminService } from '../../services/adminService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import EmptyState from '../../components/EmptyState';

const ROLES = ['all', 'donor', 'recipient', 'volunteer', 'admin'];

export default function AdminUsersScreen() {
  const router = useRouter();

  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      const res = await adminService.getAllUsers(params);
      setUsers(res?.users || []);
    } catch (err) {
      console.warn('Failed to load users:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.updateUserStatus(user._id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert('Delete User', 'Are you sure you want to permanently delete this user account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteUser(userId);
            fetchUsers();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Role Filter Tabs */}
      <View style={styles.filterRow}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, roleFilter === r && styles.filterChipActive]}
            onPress={() => setRoleFilter(r)}
          >
            <Text style={[styles.filterChipText, roleFilter === r && styles.filterChipTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading registered users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={<EmptyState title="No users found" description="No registered accounts in this role." />}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.cardHeader}>
                <View style={styles.nameSection}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: COLORS.primarySoft }]}>
                  <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
                </View>
              </View>

              {item.organizationName ? (
                <Text style={styles.orgText}>Organization: {item.organizationName}</Text>
              ) : null}

              <View style={styles.metaRow}>
                <Phone size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{item.phone || 'No phone'}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    item.isActive ? styles.btnDeactivate : styles.btnActivate,
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  {item.isActive ? (
                    <>
                      <Ban size={14} color={COLORS.danger} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>
                        Deactivate
                      </Text>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} color={COLORS.success} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: COLORS.success }]}>
                        Activate
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteUser(item._id)}
                >
                  <Trash2 size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
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
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.surface,
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
  userCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameSection: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orgText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs + 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  btnDeactivate: {
    backgroundColor: COLORS.dangerBg,
  },
  btnActivate: {
    backgroundColor: COLORS.successBg,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
});
