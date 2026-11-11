import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Shows selected product photos and enforces the five-image form limit.
export default function ProductImagesSection({
  images, error, theme, primaryColor, onAddImage, onRemoveImage,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={[styles.label, { color: theme.text }]}>Ảnh sản phẩm *</Text>
        <Text style={[styles.counter, { color: error ? '#ba1a1a' : theme.textSecondary }]}>
          {images.length}/5
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {images.map((uri, index) => (
            <View key={`image-${index}`} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              {index === 0 && (
                <View style={[styles.cover, { backgroundColor: primaryColor }]}>
                  <Text style={styles.coverText}>Ảnh bìa</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => onRemoveImage(index)}
                style={styles.remove}
                accessibilityLabel={`Xóa ảnh ${index + 1}`}
              >
                <Ionicons name="close-circle" size={23} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={onAddImage}
              style={[styles.add, { backgroundColor: theme.card, borderColor: error ? '#ba1a1a' : theme.border }]}
              accessibilityLabel="Chọn ảnh từ thư viện"
            >
              <Ionicons name="images-outline" size={27} color={primaryColor} />
              <Text style={[styles.addText, { color: theme.text }]}>Chọn ảnh</Text>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>Từ thư viện</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={[styles.hint, { color: theme.textSecondary }]}>Chọn tối đa 5 ảnh. Ảnh đầu tiên làm ảnh bìa.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  label: { fontWeight: '700', fontSize: 14 },
  counter: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  thumbWrap: { width: 104, height: 104, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  cover: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 4, alignItems: 'center' },
  coverText: { color: '#ffffff', fontWeight: '700', fontSize: 10 },
  remove: { position: 'absolute', right: 3, top: 3, backgroundColor: '#0008', borderRadius: 12 },
  add: { width: 104, height: 104, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 5 },
  addText: { fontWeight: '700', fontSize: 12 },
  hint: { fontSize: 11, marginTop: 6 },
  error: { color: '#ba1a1a', fontSize: 12, marginTop: 4 },
});
