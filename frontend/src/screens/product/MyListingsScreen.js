import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

// ─── Static mock (fallback khi chưa có data Firestore) ───────────────────────
const MOCK_LISTINGS = {
  active: [
    {
      id: 'programming-books',
      title: 'Combo Giáo trình C Programming & OOP Java K18',
      price: '95.000',
      oldPrice: '180.000 ₫',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6XAuDw0BkAaum18GRvuid71VEoGUfoTG1eCpBU-bHZVCJM995M2GTzcgEPBmbDeIxNf8QjppNBoujYNKMVUFvOCKhNxU4pUbc8WzeDubDYpoHOXYu0KaMQZd11h1pQ19sMxn1adAYCdYyy6jgNLDwFx1Sgr78U56dmOsVljuiRqI9K7ZYyAiNbOYm2A3DYqv_gNbbLFrzYMRXjMGm6tlidt-a6pVyc0yhsgwE_uXpHmL1-wShyomQ0ucRXw',
      imageCount: 3,
      age: '2 ngày',
      location: 'KTX Dom A • FPTU Hola',
      views: 142,
      messages: 8,
      saves: 14,
    },
    {
      id: 'dell-monitor',
      title: 'Màn hình máy tính Dell 24 inch IPS FHD',
      price: '1.250.000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6XAuC0wmEfpuIQEhIZkR6WeUus_DJ9qiOoc74UEPwwCNde57VEk41j-C2nXvm7mp97eRrOOYY_NaZub1aYYiRybAa68ZD3wrUa639eT5D_3LOGROsuqtBoyyh9s-uy0Vf6iq-Vg82UgMuxklflDzfVDT_4T3Vdc1F8NjBVAvX59vWXZEppveD-Mxu_u_IfiG4Lssr3g3vJIQLlXk5STkwyQqnNk8WVFwL68XgpGluhRaAZF4jeiNsc7tX8mQ',
      imageCount: 5,
      age: '5 ngày',
      location: 'KTX Dom B P.304 • Trực tiếp test máy',
      views: 380,
      messages: 15,
      saves: 22,
    },
  ],
  pending: [
    {
      id: 'pending-chair',
      title: 'Ghế công thái học cho góc học tập',
      price: '450.000',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      imageCount: 4,
      age: 'Đang kiểm duyệt',
      location: 'KTX Dom C • Hòa Lạc',
      views: 0,
      messages: 0,
      saves: 0,
    },
  ],
  sold: [
    {
      id: 'sold-keyboard',
      title: 'Bàn phím cơ Keychron K2 Bluetooth',
      price: '850.000',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
      imageCount: 3,
      age: 'Đã bán 3 ngày trước',
      location: 'KTX Dom A • Đã giao dịch',
      views: 214,
      messages: 12,
      saves: 19,
    },
  ],
};

// ─── Helper: map Firestore doc → card item ────────────────────────────────────
function mapDocToItem(docSnap) {
  const d = docSnap.data();
  const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : null;
  let age = 'Vừa đăng';
  if (createdAt) {
    const diffMs = Date.now() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) age = `${diffMins} phút trước`;
    else if (diffHours < 24) age = `${diffHours} giờ trước`;
    else age = `${diffDays} ngày trước`;
  }

  return {
    id: docSnap.id,
    title: d.title || 'Sản phẩm không tên',
    price: d.price ? Number(d.price).toLocaleString('vi-VN') : '0',
    priceDisplay: d.priceDisplay || `${Number(d.price || 0).toLocaleString('vi-VN')} ₫`,
    image: (d.images && d.images[0]) || d.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
    imageCount: Array.isArray(d.images) ? d.images.length : 1,
    age,
    location: d.location || 'FPT Hòa Lạc',
    views: d.views || 0,
    messages: d.messages || 0,
    saves: d.saves || 0,
    status: d.status || 'pending',
    _raw: d,
  };
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'active', label: 'Đang hiện', icon: 'eye-outline' },
  { key: 'pending', label: 'Chờ duyệt', icon: 'time-outline' },
  { key: 'sold', label: 'Đã bán', icon: 'checkmark-circle-outline' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyListingsScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const auth = useAuth();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState('active');
  const [listings, setListings] = useState(null); // null = loading, {} = loaded
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Load từ Firestore ──────────────────────────────────────────────────────
  const loadListings = useCallback(async () => {
    const uid = auth?.user?.uid;
    if (!uid) {
      // Chưa đăng nhập → dùng mock
      setListings(MOCK_LISTINGS);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'products'),
        where('seller.uid', '==', uid),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(mapDocToItem);

      setListings({
        active: all.filter((p) => p.status === 'active' || p.status === 'showing'),
        pending: all.filter((p) => p.status === 'pending'),
        sold: all.filter((p) => p.status === 'sold'),
      });
    } catch (err) {
      console.warn('[MyListingsScreen] Firestore load error, using mock:', err.message);
      setListings(MOCK_LISTINGS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [auth]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadListings();
  }, [loadListings]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const visibleItems = useMemo(() => (listings ? listings[activeTab] || [] : []), [activeTab, listings]);
  const totalListings = useMemo(() => {
    if (!listings) return 0;
    return Object.values(listings).reduce((total, list) => total + list.length, 0);
  }, [listings]);
  const tabCounts = useMemo(() => {
    if (!listings) return { active: 0, pending: 0, sold: 0 };
    return { active: listings.active?.length || 0, pending: listings.pending?.length || 0, sold: listings.sold?.length || 0 };
  }, [listings]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const hideListing = useCallback((item) => {
    Alert.alert('Ẩn tin đăng', `Bạn muốn ẩn tin "${item.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ẩn tin',
        style: 'destructive',
        onPress: async () => {
          try {
            const uid = auth?.user?.uid;
            if (uid) {
              await updateDoc(doc(db, 'products', item.id), {
                status: 'hidden',
                updatedAt: serverTimestamp(),
              });
            }
            setListings((cur) => ({
              ...cur,
              [activeTab]: (cur[activeTab] || []).filter((e) => e.id !== item.id),
            }));
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể ẩn tin. Vui lòng thử lại.');
          }
        },
      },
    ]);
  }, [activeTab, auth]);

  const deleteListing = useCallback((item) => {
    Alert.alert('Xóa tin đăng', `Bạn chắc chắn muốn xóa vĩnh viễn tin "${item.title}"? Không thể hoàn tác.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const uid = auth?.user?.uid;
            if (uid) {
              await deleteDoc(doc(db, 'products', item.id));
            }
            setListings((cur) => ({
              ...cur,
              [activeTab]: (cur[activeTab] || []).filter((e) => e.id !== item.id),
            }));
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa tin. Vui lòng thử lại.');
          }
        },
      },
    ]);
  }, [activeTab, auth]);

  const markAsSold = useCallback((item) => {
    Alert.alert('Đánh dấu đã bán', `Xác nhận "${item.title}" đã được bán thành công?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đã bán ✓',
        onPress: async () => {
          try {
            const uid = auth?.user?.uid;
            if (uid) {
              await updateDoc(doc(db, 'products', item.id), {
                status: 'sold',
                soldAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            const soldItem = { ...item, age: 'Vừa bán xong', status: 'sold' };
            setListings((cur) => ({
              ...cur,
              active: (cur.active || []).filter((e) => e.id !== item.id),
              sold: [soldItem, ...(cur.sold || [])],
            }));
            setActiveTab('sold');
            Alert.alert('🎉 Chúc mừng!', 'Giao dịch thành công! Hãy để lại đánh giá cho người mua nhé.');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
          }
        },
      },
    ]);
  }, [auth]);

  const boostListing = useCallback((item) => {
    Alert.alert(
      '🚀 Đẩy tin',
      'Tính năng đẩy tin sẽ sớm ra mắt! Bạn sẽ nhận được thông báo khi có thể dùng.',
      [{ text: 'OK' }],
    );
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải tin đăng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          accessibilityLabel="Quay lại"
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
          Tin Đăng Của Tôi
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Làm mới danh sách"
            style={styles.headerButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
              <Ionicons name="person" size={16} color="#ffffff" />
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            status={activeTab}
            theme={theme}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
            onEdit={() => navigation.navigate('PostItem', { listingId: item.id })}
            onSold={() => markAsSold(item)}
            onHide={() => hideListing(item)}
            onDelete={() => deleteListing(item)}
            onBoost={() => boostListing(item)}
          />
        )}
        ListHeaderComponent={(
          <View>
            {/* Summary Card */}
            <SummaryCard
              totalListings={totalListings}
              activeCount={tabCounts.active}
              pendingCount={tabCounts.pending}
              soldCount={tabCounts.sold}
              theme={theme}
              primaryColor={primaryColor}
              fontSizeScale={fontSizeScale}
            />

            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && { backgroundColor: primaryColor }]}
                    onPress={() => setActiveTab(tab.key)}
                    accessibilityLabel={tab.label}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={14}
                      color={isActive ? '#ffffff' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        { color: isActive ? '#ffffff' : theme.textSecondary, fontSize: 11 * fontSizeScale },
                      ]}
                    >
                      {tab.label}
                    </Text>
                    <View
                      style={[
                        styles.tabBadge,
                        { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : theme.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          { color: isActive ? '#ffffff' : theme.textSecondary },
                        ]}
                      >
                        {tabCounts[tab.key]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16 * fontSizeScale }]}>
              {activeTab === 'active' && 'Tin đang hiển thị'}
              {activeTab === 'pending' && 'Chờ admin duyệt'}
              {activeTab === 'sold' && 'Lịch sử đã bán'}
            </Text>
          </View>
        )}
        ListEmptyComponent={(
          <EmptyState
            tab={activeTab}
            theme={theme}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
            onCreate={() => navigation.navigate('PostItem')}
          />
        )}
        ListFooterComponent={(
          visibleItems.length > 0 ? (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: primaryColor }]}
              onPress={() => navigation.navigate('PostItem')}
              accessibilityLabel="Đăng tin mới"
            >
              <Ionicons name="add-circle-outline" size={22} color="#ffffff" />
              <Text style={styles.createButtonText}>Đăng thêm tin thanh lý</Text>
            </TouchableOpacity>
          ) : null
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ totalListings, activeCount, pendingCount, soldCount, theme, primaryColor, fontSizeScale }) {
  const stats = [
    { label: 'Tổng tin', value: totalListings, suffix: 'tin', icon: 'cube-outline', color: theme.textSecondary },
    { label: 'Đang hiện', value: activeCount, suffix: 'tin', icon: 'eye-outline', color: '#008f70' },
    { label: 'Chờ duyệt', value: pendingCount, suffix: 'tin', icon: 'time-outline', color: '#d97706' },
    { label: 'Đã bán', value: soldCount, suffix: 'tin', icon: 'trending-up-outline', color: primaryColor },
  ];

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <View style={styles.summaryHeading}>
        <View style={styles.summaryTitleRow}>
          <Ionicons name="analytics" size={20} color={primaryColor} />
          <Text style={[styles.summaryTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
            Tổng quan tin đăng
          </Text>
        </View>
        <Text style={[styles.termBadge, { color: primaryColor, backgroundColor: isDarkModeColor(theme.background) ? '#4a2b1b' : '#ffdbcc' }]}>
          Fall 2024
        </Text>
      </View>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCell, { backgroundColor: theme.background }]}>
            <View style={styles.statLabelRow}>
              <Ionicons name={stat.icon} size={15} color={stat.color} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: theme.text, fontSize: 24 * fontSizeScale }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statSuffix, { color: stat.color }]}>{stat.suffix}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function isDarkModeColor(bg) {
  return bg === '#17181c' || bg === '#000000';
}

// ─── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ item, status, theme, isDarkMode, primaryColor, fontSizeScale, onEdit, onSold, onHide, onDelete, onBoost }) {
  const isPending = status === 'pending';
  const isSold = status === 'sold';

  const statusMeta = isPending
    ? { color: '#d97706', label: 'Chờ duyệt', bg: '#d9780618' }
    : isSold
    ? { color: '#008f70', label: 'Đã bán', bg: '#008f7018' }
    : { color: '#008f70', label: 'Đang hiện', bg: '#008f7018' };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardTop}>
        {/* Thumbnail */}
        <View style={[styles.thumbnailWrap, { backgroundColor: theme.background }]}>
          <Image
            source={{ uri: item.image }}
            style={styles.thumbnail}
          />
          <Text style={[styles.imageCount, { backgroundColor: isDarkMode ? '#24252a' : '#ffffffcc', color: theme.text }]}>
            {item.imageCount} ảnh
          </Text>
          {isSold && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldOverlayText}>ĐÃ BÁN</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.itemInfo}>
          <View style={styles.itemMeta}>
            <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
              <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
            </View>
            <View style={styles.ageRow}>
              <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.ageText, { color: theme.textSecondary }]}>{item.age}</Text>
            </View>
          </View>
          <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: primaryColor, fontSize: 18 * fontSizeScale }]}>
              {item.price}
            </Text>
            <Text style={[styles.priceCurrency, { color: primaryColor }]}>đ</Text>
            {item.oldPrice && (
              <Text style={[styles.oldPrice, { color: theme.textSecondary }]}>{item.oldPrice}</Text>
            )}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
            <Text numberOfLines={1} style={[styles.locationText, { color: theme.textSecondary }]}>
              {item.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics */}
      <View style={[styles.metrics, { backgroundColor: theme.background }]}>
        <MetricItem icon="eye-outline" value={`${item.views} lượt xem`} color={theme.textSecondary} />
        <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
        <MetricItem icon="chatbubble-outline" value={`${item.messages} tin nhắn`} color="#3351ff" />
        <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
        <MetricItem icon="heart-outline" value={`${item.saves} lưu`} color="#ba1a1a" />
      </View>

      {/* Action Buttons */}
      {!isPending && (
        <View style={styles.actionsRow}>
          <ActionButton icon="create-outline" label="Sửa" theme={theme} onPress={onEdit} />
          {!isSold && (
            <ActionButton
              icon="rocket-outline"
              label="Đẩy tin"
              theme={theme}
              primaryColor={primaryColor}
              onPress={onBoost}
            />
          )}
          {!isSold && (
            <ActionButton
              icon="checkmark-circle-outline"
              label="Đã bán"
              theme={theme}
              color="#008f70"
              onPress={onSold}
            />
          )}
          <ActionButton
            icon="eye-off-outline"
            label="Ẩn"
            theme={theme}
            color={theme.textSecondary}
            onPress={onHide}
          />
          <ActionButton
            icon="trash-outline"
            label="Xóa"
            theme={theme}
            color="#ba1a1a"
            onPress={onDelete}
          />
        </View>
      )}
      {isPending && (
        <View style={[styles.pendingNotice, { backgroundColor: isDarkMode ? '#3a2b00' : '#fff9e6' }]}>
          <Ionicons name="time-outline" size={14} color="#d97706" />
          <Text style={styles.pendingNoticeText}>
            Tin đang chờ Admin kiểm duyệt (5-15 phút). Bạn sẽ nhận thông báo khi được duyệt.
          </Text>
        </View>
      )}
    </View>
  );
}

function MetricItem({ icon, value, color }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.metricText, { color }]}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, theme, primaryColor, color, onPress }) {
  const bgColor = primaryColor ? '#ffdbcc' : theme.background;
  const iconColor = primaryColor || color || theme.text;
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: bgColor }]} onPress={onPress}>
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text style={[styles.actionText, { color: color || theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ tab, theme, primaryColor, fontSizeScale, onCreate }) {
  const messages = {
    active: {
      icon: 'file-tray-outline',
      title: 'Chưa có tin đang hiển thị',
      desc: 'Dọn phòng KTX và pass lại giáo trình, đồ điện gia dụng cho các bạn sinh viên FPT ngay hôm nay!',
    },
    pending: {
      icon: 'time-outline',
      title: 'Không có tin chờ duyệt',
      desc: 'Tin bạn mới đăng sẽ xuất hiện ở đây trong khi chờ Admin kiểm duyệt.',
    },
    sold: {
      icon: 'trophy-outline',
      title: 'Chưa có giao dịch nào',
      desc: 'Sau khi bán được đồ, bấm "Đã bán" để chuyển tin vào đây và theo dõi lịch sử.',
    },
  };
  const msg = messages[tab] || messages.active;

  return (
    <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
      <View style={[styles.emptyIcon, { backgroundColor: '#ffdbcc' }]}>
        <Ionicons name={msg.icon} size={38} color={primaryColor} />
        <View style={styles.emptySparkle}>
          <Ionicons name="sparkles" size={12} color="#ffffff" />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
        {msg.title}
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
        {msg.desc}
      </Text>
      {tab !== 'sold' && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: primaryColor }]}
          onPress={onCreate}
          accessibilityLabel="Đăng tin mới"
        >
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.emptyButtonText}>ĐĂNG TIN MỚI NGAY</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Summary
  summaryCard: { borderRadius: 14, padding: 16, marginTop: 12, marginBottom: 12 },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  summaryTitle: { fontWeight: '700' },
  termBadge: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: { width: '48.3%', minHeight: 74, borderRadius: 10, padding: 10, justifyContent: 'space-between' },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { fontSize: 11, flexShrink: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  statValue: { fontWeight: '700' },
  statSuffix: { fontSize: 10, fontWeight: '700' },

  // Tabs
  tabBar: { borderRadius: 12, padding: 4, flexDirection: 'row', gap: 3, marginBottom: 14 },
  tab: { flex: 1, minHeight: 40, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 2 },
  tabText: { fontWeight: '600' },
  tabBadge: { borderRadius: 8, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontSize: 10, fontWeight: '700' },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },

  // Card
  card: { borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumbnailWrap: { width: 94, height: 94, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  imageCount: { position: 'absolute', bottom: 4, left: 4, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, fontSize: 9 },
  soldOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOverlayText: { color: '#ffffff', fontWeight: '700', fontSize: 11 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 5 },
  statusPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ageText: { fontSize: 9 },
  itemTitle: { fontWeight: '700', lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 },
  price: { fontWeight: '700' },
  priceCurrency: { fontSize: 11, fontWeight: '700' },
  oldPrice: { fontSize: 10, textDecorationLine: 'line-through', marginLeft: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locationText: { flex: 1, fontSize: 10 },

  // Metrics
  metrics: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metricText: { fontSize: 9 },
  metricDivider: { width: 1, height: 14 },

  // Actions
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 12 },
  actionButton: { flex: 1, minWidth: 50, minHeight: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 4 },
  actionText: { fontSize: 9, fontWeight: '600' },

  // Pending notice
  pendingNotice: { borderRadius: 8, padding: 10, flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 10 },
  pendingNoticeText: { flex: 1, fontSize: 11, lineHeight: 15, color: '#d97706' },

  // Empty
  emptyState: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 },
  emptyIcon: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative' },
  emptySparkle: { position: 'absolute', right: -2, top: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#00aa89', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyDescription: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280, marginBottom: 18 },
  emptyButton: { minHeight: 44, borderRadius: 9, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  // Create button
  createButton: { minHeight: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  createButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
