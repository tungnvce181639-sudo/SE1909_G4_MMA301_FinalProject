import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STATUS_LABELS = {
  active: 'Đang hiện',
  showing: 'Đang hiện',
  hidden: 'Đang ẩn',
  pending: 'Chờ duyệt',
  rejected: 'Bị từ chối',
  sold: 'Đã bán',
};

// Renders one listing and only the actions appropriate to its current status.
export default function ListingCard({
  item, theme, primaryColor, fontSizeScale, onEdit, onHide, onShow, onSold, onDelete,
}) {
  const image = item.images?.[0] || item.image;
  const canEdit = item.status !== 'sold';
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.main}>
        {image
          ? <Image source={{ uri: image }} style={styles.image} />
          : <View style={[styles.image, styles.noImage, { backgroundColor: theme.background }]}><Ionicons name="image-outline" size={28} color={theme.textSecondary} /></View>}
        <View style={styles.info}>
          <View style={styles.top}>
            <Text style={[styles.status, { color: primaryColor }]}>{STATUS_LABELS[item.status] || 'Chờ duyệt'}</Text>
            <Text style={[styles.age, { color: theme.textSecondary }]}>{item.age}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.title, { color: theme.text, fontSize: 13 * fontSizeScale }]}>{item.title}</Text>
          <Text style={[styles.price, { color: primaryColor }]}>{item.priceDisplay}</Text>
          <Text numberOfLines={1} style={[styles.location, { color: theme.textSecondary }]}>
            <Ionicons name="location-outline" size={12} /> {item.location}
          </Text>
        </View>
      </View>
      <View style={[styles.metrics, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{item.imageCount} ảnh</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{item.views} lượt xem</Text>
      </View>
      {item.status === 'rejected' && item.rejectionReason ? (
        <Text style={[styles.rejectionReason, { color: theme.textSecondary }]}>Lý do: {item.rejectionReason}</Text>
      ) : null}
      <View style={styles.actions}>
        {canEdit && (
          <Action label="Sửa" icon="create-outline" color={theme.text} onPress={onEdit} />
        )}
        {item.status === 'active' || item.status === 'showing'
          ? <Action label="Ẩn" icon="eye-off-outline" color={theme.text} onPress={onHide} />
          : null}
        {item.status === 'hidden'
          ? <Action label="Hiện" icon="eye-outline" color={primaryColor} onPress={onShow} />
          : null}
        {(item.status === 'active' || item.status === 'showing')
          ? <Action label="Đã bán" icon="checkmark-circle-outline" color="#008f70" onPress={onSold} />
          : null}
        <Action label="Xóa" icon="trash-outline" color="#ba1a1a" onPress={onDelete} />
      </View>
    </View>
  );
}

function Action({ label, icon, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.action} accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 13, padding: 12, marginBottom: 11 },
  main: { flexDirection: 'row', gap: 11 },
  image: { width: 88, height: 88, borderRadius: 9 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  status: { fontWeight: '700', fontSize: 10 },
  age: { fontSize: 10 },
  title: { fontWeight: '700', lineHeight: 18 },
  price: { fontSize: 14, fontWeight: '700' },
  location: { fontSize: 10 },
  metrics: { marginTop: 10, borderRadius: 7, padding: 7, flexDirection: 'row', justifyContent: 'space-between' },
  rejectionReason: { fontSize: 11, marginTop: 8, lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 7, marginTop: 9, flexWrap: 'wrap' },
  action: { flexGrow: 1, minHeight: 34, borderRadius: 7, backgroundColor: '#80808014', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8 },
  actionText: { fontSize: 11, fontWeight: '600' },
});
