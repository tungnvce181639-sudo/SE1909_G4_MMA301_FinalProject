import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const orders = [
  {
    id: 'ORD-84920',
    role: 'buy',
    status: 'pending',
    person: 'Nguyễn Minh Anh',
    course: 'K17 SE',
    category: 'Đồ công nghệ',
    location: 'Dom A',
    title: 'Laptop Lenovo ThinkPad T480 i5',
    description: 'Máy chạy ổn định, pin còn tốt, kèm sạc zin',
    price: '7.500.000 đ',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    statusLabel: 'Chờ người bán duyệt',
    statusIcon: 'hourglass-outline',
    note: 'Người bán đang đến Sảnh KTX Dom A!',
  },
  {
    id: 'ORD-73105',
    role: 'buy',
    status: 'completed',
    person: 'Trần Hoàng Nam',
    course: 'K16 IA',
    category: 'Đồ công nghệ',
    location: 'Dom B',
    title: 'Màn hình Dell 24 inch IPS FHD kèm dây HDMI',
    description: 'Không điểm chết, còn bảo hành 3 tháng',
    price: '1.250.000 đ',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    statusLabel: 'Hoàn tất',
    statusIcon: 'checkmark-circle',
    note: 'Đã nhận hàng thành công tại Phòng 302 KTX B vào hôm qua',
  },
  {
    id: 'ORD-91204',
    role: 'buy',
    status: 'pending',
    person: 'Lê Thu Thảo',
    course: 'K18 MKT',
    category: 'Đồ gia dụng',
    location: 'Dom C',
    title: 'Nồi cơm điện mini Lock&Lock 0.8L',
    description: 'Hàng mới 95%, phù hợp dùng trong KTX',
    price: '280.000 đ',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
    statusLabel: 'Chờ người bán duyệt',
    statusIcon: 'hourglass-outline',
    note: 'Bạn có thể nhắn người bán để xác nhận thời gian giao hàng.',
  },
  {
    id: 'ORD-66418',
    role: 'sell',
    status: 'cancelled',
    person: 'Phạm Đức Long',
    course: 'K17 GD',
    category: 'Giáo trình',
    location: 'Dom A',
    title: 'Combo Giáo trình Phần Mềm (PRF192 + PRO197)',
    description: 'Kèm note ôn tập PE cực chuẩn, số lượng x1 combo',
    price: '95.000 đ',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    statusLabel: 'Đã hủy',
    statusIcon: 'close-circle',
    note: 'Đơn hàng đã được hủy theo yêu cầu của người mua.',
  },
  {
    id: 'ORD-55312',
    role: 'sell',
    status: 'completed',
    person: 'Vũ Hoàng Yến',
    course: 'K18 SE',
    category: 'Phụ kiện',
    location: 'Thư viện',
    title: 'Bàn phím cơ Keychron K2',
    description: 'Switch đỏ, sử dụng giữ gìn, đầy đủ hộp',
    price: '850.000 đ',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    statusLabel: 'Hoàn tất',
    statusIcon: 'checkmark-circle',
    note: 'Đã giao hàng thành công tại khu Coworking Thư viện.',
  },
];

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const statusColors = {
  pending: { background: '#dee0ff', text: '#002bcf', icon: '#0031e8' },
  completed: { background: '#6dfad233', text: '#006b55', icon: '#008f70' },
  cancelled: { background: '#ffdad6', text: '#ba1a1a', icon: '#ba1a1a' },
};

const notifyStatusUpdate = (order, statusLabel) => {
  Alert.alert(
    `Đơn #${order.id} đã cập nhật`,
    `${statusLabel}: ${order.title}`,
  );
};

export default function OrderHistoryScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [activeRoleTab, setActiveRoleTab] = useState('buy');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [visibleOrders, setVisibleOrders] = useState(orders);

  const filteredOrders = useMemo(
    () =>
      visibleOrders.filter(
        (order) =>
          order.role === activeRoleTab && (activeStatusTab === 'all' || order.status === activeStatusTab),
      ),
    [activeRoleTab, activeStatusTab, visibleOrders],
  );

  const updateOrderStatus = (order, status, statusLabel) => {
    setVisibleOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? { ...currentOrder, status, statusLabel, statusIcon: status === 'completed' ? 'checkmark-circle' : 'close-circle' }
          : currentOrder,
      ),
    );
    notifyStatusUpdate(order, statusLabel);
  };

  const renderOrder = ({ item }) => {
    const status = statusColors[item.status];
    const isPending = item.status === 'pending';
    const isCompleted = item.status === 'completed';

    return (
      <View style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.orderHeader, { borderBottomColor: theme.border, backgroundColor: isDarkMode ? theme.card : '#f3f3f7' }]}>
          <View style={styles.orderIdentity}>
            <Text style={[styles.orderId, { color: theme.text, fontSize: 13 * fontSizeScale }]}>#{item.id}</Text>
            <Text style={[styles.separator, { color: theme.textSecondary }]}>•</Text>
            <Text numberOfLines={1} style={[styles.person, { color: theme.textSecondary }]}>
              {item.person}
            </Text>
            <Text style={[styles.course, { color: theme.textSecondary }]}>({item.course})</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <Ionicons name={item.statusIcon} size={14} color={status.icon} />
            <Text style={[styles.statusText, { color: status.text }]}>{item.statusLabel}</Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <View style={styles.tagRow}>
              <Text style={[styles.tag, { backgroundColor: theme.border, color: theme.textSecondary }]}>{item.category}</Text>
              <Text style={[styles.tag, { backgroundColor: theme.border, color: theme.textSecondary }]}>{item.location}</Text>
            </View>
            <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
              {item.title}
            </Text>
            <Text numberOfLines={2} style={[styles.itemDescription, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                {isCompleted ? 'Đã thanh toán:' : 'Tổng thanh toán:'}
              </Text>
              <Text style={[styles.price, { color: isCompleted ? theme.text : primaryColor }]}>{item.price}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.note, { backgroundColor: item.status === 'completed' ? '#00aa8918' : theme.background }]}>
          <Ionicons
            name={item.status === 'completed' ? 'checkmark-done-outline' : 'navigate-outline'}
            size={17}
            color={item.status === 'completed' ? '#006b55' : primaryColor}
          />
          <Text style={[styles.noteText, { color: item.status === 'completed' ? '#006b55' : theme.textSecondary }]}>{item.note}</Text>
        </View>

        <View style={styles.actionRow}>
          {isPending && (
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: primaryColor }]}
              onPress={() => Alert.alert('Liên hệ người bán', `Mở cuộc trò chuyện về đơn #${item.id}.`)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={17} color="#ffffff" />
              <Text style={styles.primaryActionText}>Liên hệ ngay</Text>
            </TouchableOpacity>
          )}
          {isCompleted && (
            <TouchableOpacity
              style={[styles.secondaryAction, { backgroundColor: theme.border }]}
              onPress={() => Alert.alert('Đánh giá', 'Tính năng đánh giá sẽ được mở sau khi hoàn thiện giao diện.')}
            >
              <Ionicons name="star-outline" size={17} color={primaryColor} />
              <Text style={[styles.secondaryActionText, { color: theme.text }]}>Đánh giá 5★</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: theme.background }]}
            onPress={() => Alert.alert('Chi tiết đơn hàng', `Đơn #${item.id} - ${item.title}`)}
          >
            <Ionicons name="receipt-outline" size={17} color={theme.text} />
            <Text style={[styles.secondaryActionText, { color: theme.text }]}>Chi tiết</Text>
          </TouchableOpacity>
          {isPending ? (
            <TouchableOpacity
              style={[styles.iconAction, { backgroundColor: '#ba1a1a18' }]}
              onPress={() => updateOrderStatus(item, 'cancelled', 'Đã hủy')}
              accessibilityLabel="Hủy đơn"
            >
              <Ionicons name="close-circle-outline" size={19} color="#ba1a1a" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.iconAction, { backgroundColor: theme.background }]}
              onPress={() => notifyStatusUpdate(item, item.statusLabel)}
              accessibilityLabel="Gửi lại thông báo"
            >
              <Ionicons name="notifications-outline" size={19} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Lịch sử đơn hàng</Text>
        <TouchableOpacity style={styles.headerButton} accessibilityLabel="Thông báo">
          <Ionicons name="notifications-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.controls}>
            <View style={[styles.roleTabs, { backgroundColor: isDarkMode ? theme.card : '#eeedf2' }]}>
              {[
                { key: 'buy', label: 'Đơn tôi mua', icon: 'bag-handle-outline' },
                { key: 'sell', label: 'Đơn tôi bán', icon: 'storefront-outline' },
              ].map((tab) => {
                const isActive = activeRoleTab === tab.key;
                const count = visibleOrders.filter((order) => order.role === tab.key).length;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.roleTab, isActive && { backgroundColor: primaryColor }]}
                    onPress={() => {
                      setActiveRoleTab(tab.key);
                      setActiveStatusTab('all');
                    }}
                  >
                    <Ionicons name={tab.icon} size={18} color={isActive ? '#ffffff' : theme.textSecondary} />
                    <Text style={[styles.roleTabText, { color: isActive ? '#ffffff' : theme.textSecondary }]}>{tab.label}</Text>
                    <Text style={[styles.count, { color: isActive ? '#ffffff' : theme.textSecondary }]}>{count}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FlatList
              horizontal
              data={statusTabs}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusTabs}
              renderItem={({ item }) => {
                const isActive = activeStatusTab === item.key;
                return (
                  <TouchableOpacity
                    style={[styles.statusTab, { borderColor: theme.border }, isActive && { backgroundColor: `${primaryColor}18`, borderColor: primaryColor }]}
                    onPress={() => setActiveStatusTab(item.key)}
                  >
                    <Text style={[styles.statusTabText, { color: isActive ? primaryColor : theme.textSecondary }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={54} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có đơn hàng</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Không tìm thấy đơn {activeRoleTab === 'buy' ? 'mua' : 'bán'} phù hợp với bộ lọc hiện tại.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 30, gap: 14 },
  controls: { gap: 12, marginBottom: 2 },
  roleTabs: { borderRadius: 12, padding: 4, flexDirection: 'row' },
  roleTab: { flex: 1, minHeight: 44, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  roleTabText: { fontSize: 13, fontWeight: '700' },
  count: { fontSize: 11, fontWeight: '700' },
  statusTabs: { gap: 8, paddingVertical: 1 },
  statusTab: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8 },
  statusTabText: { fontSize: 11, fontWeight: '700' },
  orderCard: { borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 13, overflow: 'hidden' },
  orderHeader: { marginHorizontal: -14, marginTop: -14, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  orderId: { fontWeight: '700' },
  separator: { fontSize: 12 },
  person: { fontSize: 11, flexShrink: 1 },
  course: { fontSize: 10 },
  statusBadge: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '700' },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemImage: { width: 82, height: 82, borderRadius: 11, backgroundColor: '#e2e2e6' },
  itemDetails: { flex: 1, justifyContent: 'space-between', minWidth: 0, gap: 5 },
  tagRow: { flexDirection: 'row', gap: 5 },
  tag: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, fontSize: 9 },
  itemTitle: { fontWeight: '700', lineHeight: 20 },
  itemDescription: { fontSize: 11, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 5 },
  priceLabel: { fontSize: 10 },
  price: { fontSize: 16, fontWeight: '700' },
  note: { borderRadius: 10, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 15 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  primaryAction: { flex: 1, minHeight: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  primaryActionText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  secondaryAction: { flex: 1, minHeight: 40, borderRadius: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secondaryActionText: { fontSize: 11, fontWeight: '600' },
  iconAction: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 64, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
