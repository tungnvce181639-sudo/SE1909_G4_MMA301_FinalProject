import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getOrdersForUser, updateOrderStatus } from '../../services/api/orderApi';
import { notifyOrderEvent } from '../../services/api/notificationApi';
import { sendOrderNotification } from '../../services/notificationService';

const statusInfo = {
  pending: { label: 'Chờ duyệt', icon: 'hourglass-outline', background: '#dee0ff', text: '#002bcf' },
  approved: { label: 'Đã duyệt', icon: 'checkmark-circle-outline', background: '#fff0d6', text: '#8a4b00' },
  completed: { label: 'Hoàn thành', icon: 'checkmark-circle', background: '#d8f6ec', text: '#006b55' },
  cancelled: { label: 'Đã hủy', icon: 'close-circle', background: '#ffdad6', text: '#ba1a1a' },
};

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const getUserId = (user) => user?.uid || user?.firebaseUid || user?._id;

export default function OrderHistoryScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { user } = useAuth();
  const userId = getUserId(user);
  const [activeRoleTab, setActiveRoleTab] = useState('buy');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!userId) {
      setOrders([]);
      setError('Không tìm thấy tài khoản đăng nhập. Vui lòng đăng nhập lại.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      setOrders(await getOrdersForUser(userId));
    } catch (loadError) {
      console.error('[OrderHistoryScreen] Could not load orders:', loadError);
      setError('Không thể tải đơn hàng. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const roleOrders = useMemo(
    () => orders.filter((order) => (
      activeRoleTab === 'buy' ? order.buyerId === userId : order.sellerId === userId
    )),
    [activeRoleTab, orders, userId],
  );
  const filteredOrders = useMemo(
    () => roleOrders.filter((order) => activeStatusTab === 'all' || order.status === activeStatusTab),
    [activeStatusTab, roleOrders],
  );

  const applyStatus = async (order, nextStatus) => {
    const next = statusInfo[nextStatus];
    setUpdatingOrderId(order.id);
    try {
      await updateOrderStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (
        item.id === order.id ? { ...item, status: nextStatus } : item
      )));
      let pushMessage = '';
      try {
        const pushResult = await notifyOrderEvent(order.id, nextStatus);
        if (!pushResult?.sent) {
          pushMessage = ' Người tham gia còn lại chưa đăng ký Push.';
        }
      } catch (notificationError) {
        console.warn('[OrderHistoryScreen] Could not notify the other participant:', notificationError);
        pushMessage = ' Chưa gửi được Push cho người tham gia còn lại.';
      }
      try {
        await sendOrderNotification(
          `Đơn hàng ${next.label.toLowerCase()}`,
          `${order.productTitle || 'Sản phẩm'} - #${order.id.slice(0, 7)}`,
        );
      } catch (notificationError) {
        console.warn('[OrderHistoryScreen] Could not show local notification:', notificationError);
      }
      if (pushMessage) {
        Alert.alert('Đơn đã cập nhật', `Trạng thái đã được lưu.${pushMessage}`);
      }
    } catch (updateError) {
      console.error('[OrderHistoryScreen] Could not update order:', updateError);
      Alert.alert('Không thể cập nhật đơn', 'Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const requestStatusUpdate = (order, nextStatus, message) => {
    Alert.alert('Xác nhận đơn hàng', message, [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => applyStatus(order, nextStatus) },
    ]);
  };

  const renderOrder = ({ item }) => {
    const state = statusInfo[item.status] || statusInfo.pending;
    const isBuyer = item.buyerId === userId;
    const isPending = item.status === 'pending';
    const isApproved = item.status === 'approved';
    const isUpdating = updatingOrderId === item.id;
    const price = `${(Number(item.productPrice) || 0).toLocaleString('vi-VN')} đ`;
    const counterpart = isBuyer ? item.sellerName : item.buyerName;

    return (
      <View style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.orderHeader, { borderBottomColor: theme.border, backgroundColor: isDarkMode ? theme.card : '#f3f3f7' }]}>
          <View style={styles.orderIdentity}>
            <Text style={[styles.orderId, { color: theme.text }]} numberOfLines={1}>
              #{item.id.slice(0, 8)}
            </Text>
            <Text style={[styles.person, { color: theme.textSecondary }]} numberOfLines={1}>
              {counterpart || 'Sinh viên'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: state.background }]}>
            <Ionicons name={state.icon} size={14} color={state.text} />
            <Text style={[styles.statusText, { color: state.text }]}>{state.label}</Text>
          </View>
        </View>

        <View style={styles.itemRow}>
          {item.productImage ? (
            <Image source={{ uri: item.productImage }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.imagePlaceholder, { backgroundColor: theme.background }]}>
              <Ionicons name="image-outline" size={28} color={theme.textSecondary} />
            </View>
          )}
          <View style={styles.itemDetails}>
            <View style={styles.tagRow}>
              <Text style={[styles.tag, { backgroundColor: theme.border, color: theme.textSecondary }]}>{item.productCategory || 'Sản phẩm'}</Text>
              {!!item.productLocation && (
                <Text numberOfLines={1} style={[styles.tag, { backgroundColor: theme.border, color: theme.textSecondary }]}>{item.productLocation}</Text>
              )}
            </View>
            <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
              {item.productTitle || 'Sản phẩm'}
            </Text>
            {!!item.productDescription && (
              <Text numberOfLines={2} style={[styles.itemDescription, { color: theme.textSecondary }]}>
                {item.productDescription}
              </Text>
            )}
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Giá sản phẩm:</Text>
              <Text style={[styles.price, { color: primaryColor }]}>{price}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.note, { backgroundColor: theme.background }]}>
          <Ionicons name="information-circle-outline" size={17} color={primaryColor} />
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            {isBuyer ? 'Vai trò: Người mua' : 'Vai trò: Người bán'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {isPending && !isBuyer && (
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: primaryColor }]}
              disabled={isUpdating}
              onPress={() => requestStatusUpdate(item, 'approved', 'Bạn xác nhận đồng ý giao dịch này?')}
            >
              {isUpdating ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="checkmark-circle-outline" size={17} color="#ffffff" />}
              <Text style={styles.primaryActionText}>Duyệt đơn</Text>
            </TouchableOpacity>
          )}
          {isApproved && (
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: primaryColor }]}
              disabled={isUpdating}
              onPress={() => requestStatusUpdate(item, 'completed', isBuyer ? 'Bạn xác nhận đã nhận món hàng?' : 'Bạn xác nhận đã bàn giao món hàng?')}
            >
              {isUpdating ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="checkmark-done-outline" size={17} color="#ffffff" />}
              <Text style={styles.primaryActionText}>{isBuyer ? 'Đã nhận hàng' : 'Hoàn tất đơn'}</Text>
            </TouchableOpacity>
          )}
          {isPending && isBuyer && (
            <TouchableOpacity
              style={[styles.secondaryAction, { backgroundColor: theme.background }]}
              disabled={isUpdating}
              onPress={() => requestStatusUpdate(item, 'cancelled', 'Bạn có chắc muốn hủy yêu cầu đặt mua này?')}
            >
              <Ionicons name="close-circle-outline" size={17} color="#ba1a1a" />
              <Text style={[styles.secondaryActionText, { color: '#ba1a1a' }]}>Hủy đơn</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: theme.background }]}
            onPress={() => Alert.alert('Chi tiết đơn hàng', `${item.productTitle || 'Sản phẩm'}\nMã đơn: ${item.id}\nTrạng thái: ${state.label}`)}
          >
            <Ionicons name="receipt-outline" size={17} color={theme.text} />
            <Text style={[styles.secondaryActionText, { color: theme.text }]}>Chi tiết</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.headerButton} onPress={() => loadOrders(true)} accessibilityLabel="Tải lại đơn hàng">
          <Ionicons name="refresh-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} tintColor={primaryColor} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.controls}>
            <View style={[styles.roleTabs, { backgroundColor: isDarkMode ? theme.card : '#eeedf2' }]}>
              {[
                { key: 'buy', label: 'Đơn tôi mua', icon: 'bag-handle-outline' },
                { key: 'sell', label: 'Đơn tôi bán', icon: 'storefront-outline' },
              ].map((tab) => {
                const isActive = activeRoleTab === tab.key;
                const count = orders.filter((order) => (
                  tab.key === 'buy' ? order.buyerId === userId : order.sellerId === userId
                )).length;
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
            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} />
            ) : (
              <>
                <Ionicons name={error ? 'cloud-offline-outline' : 'file-tray-outline'} size={54} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>{error ? 'Không tải được đơn hàng' : 'Chưa có đơn hàng'}</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {error || `Không tìm thấy đơn ${activeRoleTab === 'buy' ? 'mua' : 'bán'} phù hợp với bộ lọc hiện tại.`}
                </Text>
                {!!error && (
                  <TouchableOpacity style={[styles.retryButton, { backgroundColor: primaryColor }]} onPress={() => loadOrders()}>
                    <Text style={styles.primaryActionText}>Thử lại</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
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
  listContent: { padding: 16, paddingBottom: 30, gap: 14, flexGrow: 1 },
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
  orderIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  orderId: { fontSize: 12, fontWeight: '700' },
  person: { flex: 1, fontSize: 11 },
  statusBadge: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemImage: { width: 82, height: 82, borderRadius: 11, backgroundColor: '#e2e2e6' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  itemDetails: { flex: 1, justifyContent: 'space-between', minWidth: 0, gap: 5 },
  tagRow: { flexDirection: 'row', gap: 5 },
  tag: { maxWidth: '60%', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, fontSize: 9 },
  itemTitle: { fontWeight: '700', lineHeight: 20 },
  itemDescription: { fontSize: 11, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  priceLabel: { fontSize: 10 },
  price: { fontSize: 13, fontWeight: '800' },
  note: { borderRadius: 9, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  primaryAction: { minHeight: 38, borderRadius: 9, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryActionText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  secondaryAction: { minHeight: 38, borderRadius: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secondaryActionText: { fontSize: 11, fontWeight: '700' },
  emptyState: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retryButton: { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
});
