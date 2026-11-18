import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Utensils, ClipboardList, Bell, User, BarChart2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const getDonationsTitle = () => {
    if (user?.role === 'donor') return 'My Food';
    if (user?.role === 'volunteer') return 'Tasks';
    return 'Browse';
  };

  const getActivityTitle = () => {
    if (user?.role === 'donor') return 'Requests';
    if (user?.role === 'volunteer') return 'Deliveries';
    if (user?.role === 'admin') return 'Overview';
    return 'My Requests';
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="donations"
        options={{
          title: getDonationsTitle(),
          tabBarIcon: ({ color, size }) => <Utensils size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: getActivityTitle(),
          tabBarIcon: ({ color, size }) => <ClipboardList size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen name="donor-impact" options={{ href: null }} />
      <Tabs.Screen name="ngo-impact" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="collections" options={{ href: null }} />
      <Tabs.Screen name="donor-dashboard" options={{ href: null }} />
      <Tabs.Screen name="ngo-dashboard" options={{ href: null }} />
    </Tabs>
  );
}
