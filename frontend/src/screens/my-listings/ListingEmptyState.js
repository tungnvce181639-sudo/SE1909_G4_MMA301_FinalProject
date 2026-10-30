import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Explains why a status tab is empty and offers a route to create a listing.
export default function ListingEmptyState({ tab, theme, primaryColor, onCreate }) {
  const message = {
    active: ['Chưa có tin đang hiện', 'Tin được duyệt sẽ xuất hiện ở đây.'],
    hidden: ['Không có tin đang ẩn', 'Các tin bạn ẩn sẽ được lưu tại đây.'],
    pending: ['Chưa có tin chờ duyệt', 'Tin mới đăng sẽ xuất hiện tại đây trong lúc chờ duyệt.'],
    rejected: ['Không có tin bị từ chối', 'Tin bị từ chối sẽ hiển thị tại đây kèm lý do từ quản trị viên.'],
    sold: ['Chưa có giao dịch hoàn tất', 'Đánh dấu tin là đã bán để xem lại tại đây.'],
  }[tab];
  return (
    <View style={[styles.wrap, { backgroundColor: theme.card }]}>
      <Ionicons name="cube-outline" size={42} color={primaryColor} />
      <Text style={[styles.title, { color: theme.text }]}>{message[0]}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{message[1]}</Text>
      {tab === 'active' && (
        <TouchableOpacity onPress={onCreate} style={[styles.button, { backgroundColor: primaryColor }]}>
          <Text style={styles.buttonText}>Đăng tin đầu tiên</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, alignItems: 'center', padding: 24, marginTop: 10 },
  title: { fontWeight: '700', fontSize: 15, marginTop: 12 },
  description: { fontSize: 12, textAlign: 'center', marginTop: 5 },
  button: { minHeight: 40, paddingHorizontal: 18, borderRadius: 8, justifyContent: 'center', marginTop: 15 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
