import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api/apiClient';

function getPrice(listing) {
  return listing.priceDisplay || `${Number(listing.price || 0).toLocaleString('vi-VN')} ₫`;
}

export default function AdminApprovalsScreen() {
  const { theme, primaryColor } = useTheme();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.get('/admin/listings/pending');
      setListings(result.listings || []);
    } catch (error) {
      console.error('[AdminApprovals] Failed to load:', {
        statusCode: error?.statusCode || null,
        message: error?.message || 'Unknown error',
      });
      Alert.alert('Không tải được tin chờ duyệt', error.message || 'Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadPending();
  }, [loadPending]));

  const approve = useCallback(async (listing) => {
    setApprovingId(listing.id);
    try {
      await apiClient.patch(`/admin/listings/${encodeURIComponent(listing.id)}/approve`);
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setSelectedListing(null);
      Alert.alert('Đã duyệt tin', 'Tin đăng đã được chuyển sang trạng thái đang hiển thị.');
    } catch (error) {
      console.error('[AdminApprovals] Approval failed:', {
        statusCode: error?.statusCode || null,
        message: error?.message || 'Unknown error',
      });
      Alert.alert('Không duyệt được tin', error.message || 'Vui lòng thử lại.');
    } finally {
      setApprovingId(null);
    }
  }, []);

  const reject = useCallback(async (listing) => {
    setApprovingId(listing.id);
    try {
      await apiClient.patch(`/admin/listings/${encodeURIComponent(listing.id)}/reject`, {
        reason: rejectionReason.trim(),
      });
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setSelectedListing(null);
      setRejectionReason('');
      Alert.alert('Đã từ chối tin', 'Người đăng sẽ thấy tin trong mục Bị từ chối.');
    } catch (error) {
      console.error('[AdminApprovals] Rejection failed:', {
        statusCode: error?.statusCode || null,
        message: error?.message || 'Unknown error',
      });
      Alert.alert('Không từ chối được tin', error.message || 'Vui lòng thử lại.');
    } finally {
      setApprovingId(null);
    }
  }, [rejectionReason]);

  const renderListing = ({ item }) => {
    const image = item.images?.[0] || item.image;
    const sellerName = item.seller?.name || item.seller?.fullName || 'Không rõ người bán';

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.listing}>
          {image
            ? <Image source={{ uri: image }} style={styles.image} />
            : <View style={[styles.image, styles.noImage, { backgroundColor: theme.background }]}>
              <Ionicons name="image-outline" size={28} color={theme.textSecondary} />
            </View>}
          <View style={styles.details}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title || 'Tin không có tiêu đề'}</Text>
            <Text style={[styles.price, { color: primaryColor }]}>{getPrice(item)}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{sellerName}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.location || 'Chưa có điểm hẹn'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            setSelectedListing(item);
            setRejectionReason('');
          }}
          style={[styles.approveButton, { backgroundColor: primaryColor }]}
        >
          <Ionicons name="reader-outline" size={18} color="#ffffff" />
          <Text style={styles.approveText}>Xem chi tiết để duyệt</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const detailImages = selectedListing?.images?.length
    ? selectedListing.images
    : selectedListing?.image ? [selectedListing.image] : [];
  const description = selectedListing?.description;
  const descriptionText = typeof description === 'string'
    ? description
    : [
      description?.conditionDetail && `Tình trạng: ${description.conditionDetail}`,
      description?.gift && `Quà tặng: ${description.gift}`,
      description?.reason && `Lý do bán: ${description.reason}`,
      description?.pickupSchedule && `Thời gian hẹn: ${description.pickupSchedule}`,
    ].filter(Boolean).join('\n\n');

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Tài khoản này không có quyền quản trị.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={22} color={primaryColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Duyệt tin đăng</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {listings.length} tin đang chờ duyệt
          </Text>
        </View>
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPending();
            }}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        )}
        ListEmptyComponent={loading
          ? <ActivityIndicator style={styles.empty} size="large" color={primaryColor} />
          : <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Ionicons name="checkmark-done-outline" size={38} color={primaryColor} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Không có tin chờ duyệt</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>Kéo xuống để tải lại danh sách.</Text>
          </View>}
      />
      <Modal
        visible={Boolean(selectedListing)}
        animationType="slide"
        onRequestClose={() => setSelectedListing(null)}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: theme.card }]}>
            <TouchableOpacity onPress={() => setSelectedListing(null)} accessibilityLabel="Đóng chi tiết">
              <Ionicons name="close" size={25} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Chi tiết tin đăng</Text>
            <View style={styles.headerIcon} />
          </View>
          <ScrollView contentContainerStyle={styles.detailContent}>
            {detailImages.length > 0 && (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {detailImages.map((uri, index) => (
                  <Image key={`${selectedListing.id}-image-${index}`} source={{ uri }} style={styles.detailImage} />
                ))}
              </ScrollView>
            )}
            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.title, { color: theme.text }]}>{selectedListing?.title}</Text>
              <Text style={[styles.detailPrice, { color: primaryColor }]}>{getPrice(selectedListing || {})}</Text>
              <DetailRow label="Người bán" value={selectedListing?.seller?.name || selectedListing?.seller?.fullName || 'Không rõ'} theme={theme} />
              <DetailRow label="Danh mục" value={selectedListing?.category || 'Chưa chọn'} theme={theme} />
              <DetailRow label="Tình trạng" value={selectedListing?.condition || 'Chưa cung cấp'} theme={theme} />
              <DetailRow label="Điểm hẹn" value={selectedListing?.location || 'Chưa cung cấp'} theme={theme} />
              <DetailRow label="Thương lượng" value={selectedListing?.negotiable ? 'Có' : 'Không'} theme={theme} />
              {descriptionText ? (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Mô tả</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{descriptionText}</Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Lý do từ chối (không bắt buộc)</Text>
              <TextInput
                multiline
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Nhập góp ý để người đăng biết cần chỉnh sửa gì"
                placeholderTextColor={theme.textSecondary}
                style={[styles.reasonInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                maxLength={500}
              />
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  disabled={approvingId === selectedListing?.id}
                  onPress={() => reject(selectedListing)}
                  style={[styles.reviewButton, styles.rejectButton, { borderColor: '#ba1a1a' }]}
                >
                  {approvingId === selectedListing?.id
                    ? <ActivityIndicator color="#ba1a1a" />
                    : <Ionicons name="close-circle-outline" size={18} color="#ba1a1a" />}
                  <Text style={[styles.reviewButtonText, { color: '#ba1a1a' }]}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={approvingId === selectedListing?.id}
                  onPress={() => approve(selectedListing)}
                  style={[styles.reviewButton, { backgroundColor: primaryColor }]}
                >
                  {approvingId === selectedListing?.id
                    ? <ActivityIndicator color="#ffffff" />
                    : <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />}
                  <Text style={[styles.reviewButtonText, { color: '#ffffff' }]}>Duyệt tin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  headerIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerText: { marginLeft: 10 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 3 },
  detailHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  content: { padding: 14, flexGrow: 1 },
  card: { borderRadius: 14, padding: 12, marginBottom: 12 },
  listing: { flexDirection: 'row', gap: 11 },
  image: { width: 92, height: 92, borderRadius: 9 },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1, gap: 5 },
  title: { fontSize: 14, fontWeight: '700' },
  price: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 11 },
  description: { marginTop: 10, fontSize: 12, lineHeight: 18 },
  approveButton: { marginTop: 12, minHeight: 42, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  approveText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  detailContent: { padding: 14, paddingBottom: 28 },
  detailImage: { width: 340, height: 245, borderRadius: 12, marginRight: 10, resizeMode: 'cover' },
  detailCard: { borderRadius: 13, padding: 14, marginTop: 12, gap: 12 },
  detailPrice: { fontSize: 20, fontWeight: '700' },
  detailRow: { gap: 3 },
  detailLabel: { fontSize: 11, fontWeight: '600' },
  detailValue: { fontSize: 13, lineHeight: 19 },
  detailSection: { gap: 6 },
  reasonInput: { minHeight: 86, borderWidth: 1, borderRadius: 9, padding: 10, textAlignVertical: 'top', fontSize: 13 },
  reviewActions: { flexDirection: 'row', gap: 10 },
  reviewButton: { flex: 1, minHeight: 44, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectButton: { borderWidth: 1, backgroundColor: 'transparent' },
  reviewButtonText: { fontSize: 13, fontWeight: '700' },
  empty: { marginTop: 40 },
  emptyCard: { alignItems: 'center', padding: 28, borderRadius: 14, marginTop: 10, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
});
