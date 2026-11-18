import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Layers, BarChart2, User } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function BottomNav({ activeRoute }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentPath = usePathname();

  const tabs = [
    { name: 'home', label: 'Home', icon: Home },
    { name: 'discover', label: 'Discover', icon: Search },
    { name: 'collections', label: 'Collections', icon: Layers },
    { name: 'impact', label: 'Impact', icon: BarChart2 },
    { name: 'profile', label: 'Profile', icon: User },
  ];

  const handlePress = (name) => {
    router.replace(`/${name}`);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.sm }]} accessible>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeRoute === tab.name || currentPath.includes(`/${tab.name}`);
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handlePress(tab.name)}
            style={styles.tabButton}
            accessibilityLabel={tab.label}
          >
            <Icon size={24} color={isActive ? COLORS.primary : COLORS.textSecondary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    minWidth: 48,
    minHeight: 48,
  },
});
