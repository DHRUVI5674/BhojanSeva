import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

/**
 * SearchBar – a reusable search input with a leading icon.
 * Props:
 *   value (string) – current text.
 *   onChangeText (function) – called when text changes.
 *   placeholder (string) – placeholder text.
 *   onSubmit (function) – optional, called on submit/enter.
 */
export default function SearchBar({ value, onChangeText, onChange, placeholder = 'Search…', onSubmit }) {
  const handleChange = (text) => {
    onChange?.(text);
    onChangeText?.(text);
  };
  return (
    <View style={styles.container} accessible accessibilityRole="search">
      <Search size={18} color={COLORS.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.sm,
    marginVertical: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
