import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LISTING_TABS = [
  { key: 'active', label: 'Đang hiện', icon: 'eye-outline' },
  { key: 'hidden', label: 'Đang ẩn', icon: 'eye-off-outline' },
  { key: 'pending', label: 'Chờ duyệt', icon: 'time-outline' },
  { key: 'rejected', label: 'Bị từ chối', icon: 'close-circle-outline' },
  { key: 'sold', label: 'Đã bán', icon: 'checkmark-circle-outline' },
];

// Keeps the state filter and per-state counts in one reusable tab bar.
export default function ListingTabs({ activeTab, counts, theme, primaryColor, onSelect }) {
  return (
    <View style={[styles.bar, { backgroundColor: theme.card }]}>
      {LISTING_TABS.map((tab) => {
        const selected = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={[styles.tab, selected && { backgroundColor: primaryColor }]}
            accessibilityLabel={tab.label}
          >
            <Ionicons name={tab.icon} size={13} color={selected ? '#fff' : theme.textSecondary} />
            <Text numberOfLines={1} style={[styles.label, { color: selected ? '#fff' : theme.textSecondary }]}>
              {tab.label}
            </Text>
            <Text style={[styles.count, { color: selected ? '#fff' : theme.textSecondary }]}>
              {counts[tab.key] || 0}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderRadius: 10, padding: 4, gap: 3, marginBottom: 12 },
  tab: { flex: 1, minHeight: 38, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 3 },
  label: { fontSize: 9, fontWeight: '600', flexShrink: 1 },
  count: { fontSize: 9, fontWeight: '700' },
});
