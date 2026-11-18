import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  LogOut,
  Edit3,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { APP_INFO } from '../../constants/config';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editOrg, setEditOrg] = useState(user?.organizationName || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editLoading, setEditLoading] = useState(false);

  // Change password state
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');

  const handleUpdateProfile = async () => {
    try {
      setEditLoading(true);
      await authService.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        organizationName: editOrg.trim(),
        address: editAddress.trim(),
      });
      await refreshUser();
      setIsEditModalOpen(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) {
      setPassError('Please fill in both fields');
      return;
    }
    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    try {
      setPassLoading(true);
      setPassError('');
      await authService.changePassword({
        currentPassword: currentPass,
        newPassword: newPass,
      });
      setIsPassModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (err) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of BhojanSeva?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Account" subtitle="Manage profile, security and preferences" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'U'}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRoleBadge}>{user?.role?.toUpperCase()} ACCOUNT</Text>

          {user?.organizationName ? (
            <Text style={styles.userOrg}>{user.organizationName}</Text>
          ) : null}

          <Button
            title="Edit Profile"
            icon={Edit3}
            variant="outline"
            size="sm"
            style={{ marginTop: SPACING.md }}
            onPress={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setEditOrg(user?.organizationName || '');
              setEditAddress(user?.address || '');
              setIsEditModalOpen(true);
            }}
          />
        </View>

        {/* Contact Info List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT DETAILS</Text>

          <View style={styles.infoRow}>
            <Mail size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={18} color={COLORS.primary} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Security & Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SECURITY & PREFERENCES</Text>

          <TouchableOpacity style={styles.menuRow} onPress={() => setIsPassModalOpen(true)}>
            <View style={styles.menuLeft}>
              <Lock size={18} color={COLORS.textSecondary} style={{ marginRight: SPACING.md }} />
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {user?.role === 'admin' && (
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/admin/users')}>
              <View style={styles.menuLeft}>
                <Shield size={18} color={COLORS.textSecondary} style={{ marginRight: SPACING.md }} />
                <Text style={styles.menuTitle}>Admin Panel — Users</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* About App */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT</Text>

          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Info size={18} color={COLORS.textSecondary} style={{ marginRight: SPACING.md }} />
              <Text style={styles.menuTitle}>App Version</Text>
            </View>
            <Text style={styles.versionText}>{APP_INFO.version}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out"
          icon={LogOut}
          variant="danger"
          size="lg"
          style={styles.logoutBtn}
          onPress={handleLogout}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Input label="Full Name" value={editName} onChangeText={setEditName} icon={User} />
            <Input
              label="Phone Number"
              value={editPhone}
              onChangeText={setEditPhone}
              icon={Phone}
              keyboardType="phone-pad"
            />
            <Input
              label="Organization / Business"
              value={editOrg}
              onChangeText={setEditOrg}
              icon={Building}
            />
            <Input label="Address" value={editAddress} onChangeText={setEditAddress} icon={MapPin} />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1, marginRight: SPACING.sm }}
                onPress={() => setIsEditModalOpen(false)}
              />
              <Button
                title="Save Changes"
                variant="primary"
                size="md"
                style={{ flex: 1.5 }}
                loading={editLoading}
                onPress={handleUpdateProfile}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isPassModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            {passError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{passError}</Text>
              </View>
            ) : null}

            <Input
              label="Current Password"
              placeholder="Enter existing password"
              value={currentPass}
              onChangeText={setCurrentPass}
              icon={Lock}
              secureTextEntry
            />

            <Input
              label="New Password"
              placeholder="At least 6 characters"
              value={newPass}
              onChangeText={setNewPass}
              icon={Lock}
              secureTextEntry
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                style={{ flex: 1, marginRight: SPACING.sm }}
                onPress={() => setIsPassModalOpen(false)}
              />
              <Button
                title="Update Password"
                variant="primary"
                size="md"
                style={{ flex: 1.5 }}
                loading={passLoading}
                onPress={handleChangePassword}
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
    padding: SPACING.md,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.surface,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userRoleBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  userOrg: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    marginVertical: SPACING.md,
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
    marginBottom: SPACING.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
  },
});
