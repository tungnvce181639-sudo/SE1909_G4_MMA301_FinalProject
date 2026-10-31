import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Summarizes the counts used by listing status tabs.
export default function ListingSummary({ counts, total, theme, primaryColor }) {
  const stats = [
    ['Tổng tin', total],
    ['Đang hiện', counts.active],
    ['Chờ duyệt', counts.pending],
    ['Bị từ chối', counts.rejected],
    ['Đã bán', counts.sold],
  ];
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Tổng quan tin đăng</Text>
      <View style={styles.grid}>
        {stats.map(([label, count], index) => (
          <View key={label} style={[styles.cell, { backgroundColor: theme.background }]}>
            <Text style={[styles.count, { color: index === 1 ? '#008f70' : primaryColor }]}>{count || 0}</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 13, padding: 13, marginTop: 12, marginBottom: 12 },
  heading: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  cell: { flexBasis: '18%', flexGrow: 1, alignItems: 'center', borderRadius: 8, paddingVertical: 9 },
  count: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 9, marginTop: 3, textAlign: 'center' },
});
