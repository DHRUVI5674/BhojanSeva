import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  UserPlus,
  ArrowLeft,
  Utensils,
  HeartHandshake,
  Truck,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState('donor'); // 'donor', 'recipient', 'volunteer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill out all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        organizationName: organizationName.trim(),
        address: address.trim(),
      });
      router.replace('/(tabs)');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Join BhojanSeva</Text>
          <Text style={styles.subtitle}>Together, let us reduce hunger and eliminate food waste</Text>
        </View>

        {/* Role Selector Tabs */}
        <Text style={styles.sectionLabel}>CHOOSE YOUR ACCOUNT TYPE</Text>
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'donor' && styles.roleTabActive]}
            onPress={() => setRole('donor')}
          >
            <Utensils
              size={18}
              color={role === 'donor' ? COLORS.primary : COLORS.textSecondary}
              style={{ marginBottom: 4 }}
            />
            <Text style={[styles.roleTabText, role === 'donor' && styles.roleTabTextActive]}>
              Donor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'recipient' && styles.roleTabActive]}
            onPress={() => setRole('recipient')}
          >
            <HeartHandshake
              size={18}
              color={role === 'recipient' ? COLORS.primary : COLORS.textSecondary}
              style={{ marginBottom: 4 }}
            />
            <Text style={[styles.roleTabText, role === 'recipient' && styles.roleTabTextActive]}>
              Recipient NGO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'volunteer' && styles.roleTabActive]}
            onPress={() => setRole('volunteer')}
          >
            <Truck
              size={18}
              color={role === 'volunteer' ? COLORS.primary : COLORS.textSecondary}
              style={{ marginBottom: 4 }}
            />
            <Text style={[styles.roleTabText, role === 'volunteer' && styles.roleTabTextActive]}>
              Volunteer
            </Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Registration Form */}
        <View style={styles.form}>
          <Input
            label="Full Name *"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            icon={User}
          />

          <Input
            label="Email Address *"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            icon={Mail}
            keyboardType="email-address"
          />

          <Input
            label="Phone Number *"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            icon={Phone}
            keyboardType="phone-pad"
          />

          {(role === 'donor' || role === 'recipient') && (
            <Input
              label={role === 'donor' ? 'Restaurant / Business Name' : 'NGO / Shelter Name'}
              placeholder="e.g. Anand Food Relief Foundation"
              value={organizationName}
              onChangeText={setOrganizationName}
              icon={Building}
            />
          )}

          <Input
            label="Address / Area"
            placeholder="Street address, city"
            value={address}
            onChangeText={setAddress}
            icon={MapPin}
          />

          <Input
            label="Password *"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
            icon={Lock}
            secureTextEntry
          />

          <Input
            label="Confirm Password *"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon={Lock}
            secureTextEntry
          />

          <Button
            title="Create Account"
            icon={UserPlus}
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleRegister}
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  roleTabs: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  roleTabActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
