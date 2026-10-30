import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LOCATIONS } from './listingConstants';

// Combines campus meeting points with an optional device GPS pin.
export default function LocationPicker({
  theme, primaryColor, selectedLocation, locationCoords, error, onPickGps, onSelect,
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: theme.text }]}>Điểm hẹn giao dịch *</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.top}>
          <Ionicons name="location" size={20} color={primaryColor} />
          <View style={styles.location}>
            <Text style={[styles.selected, { color: theme.text }]}>{selectedLocation}</Text>
            <Text style={[styles.coords, { color: theme.textSecondary }]}>
              {locationCoords
                ? `GPS ${locationCoords.latitude.toFixed(5)}, ${locationCoords.longitude.toFixed(5)}`
                : 'FPT University – Khu Công nghệ cao Hòa Lạc'}
            </Text>
          </View>
          <TouchableOpacity onPress={onPickGps} accessibilityLabel="Lấy vị trí GPS">
            <Text style={[styles.gps, { color: primaryColor }]}>GPS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tags}>
          {LOCATIONS.map((location) => {
            const active = selectedLocation === location;
            return (
              <TouchableOpacity
                key={location}
                onPress={() => onSelect(location)}
                style={[styles.tag, { backgroundColor: active ? primaryColor : theme.background }]}
              >
                <Text style={{ color: active ? '#fff' : theme.text, fontSize: 11 }}>
                  {active ? '✓ ' : ''}{location}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  card: { borderRadius: 12, padding: 13, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  location: { flex: 1, gap: 3 },
  selected: { fontWeight: '600', fontSize: 14 },
  coords: { fontSize: 11 },
  gps: { fontSize: 12, fontWeight: '700', padding: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  error: { color: '#ba1a1a', fontSize: 12, marginTop: 4 },
});
