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

const listingData = {
  showing: [
    {
      id: 'programming-books',
      title: 'Combo Giáo trình C Programming & OOP Java K18',
      price: '95.000',
      oldPrice: '180.000 đ',
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
    {
      id: 'rice-cooker',
      title: 'Nồi cơm điện mini Lock&Lock 0.8L KTX',
      price: '180.000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6XAuBuiKiH2lZ8dgzPCxxuYGkJzNg1IjLmznlSxulCoDRFAxfiuYBBrNNUR36GjP4JjrSRFdQWOoUXyYFOafzlSpOO--8f8S2PJYEaGlkqhV1GnI9o7qpBaLvuBZYNrCAbjWYNrF1bKasc0n8OAW9jUE0s83wMZTle3I4FM7yhgOe-eQBcKH9i_25RNTN-o9g2yiv7Ft0nd_56PPf2GtxZJ1fmE1I3BxM_O3b6W977Bu0yagPYCoK8_7thyA',
      imageCount: 2,
      age: '1 tuần',
      location: 'Dom E • Tặng kèm muôi xới cơm',
      views: 95,
      messages: 4,
      saves: 7,
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

const tabs = [
  { key: 'showing', label: 'Đang hiển thị', icon: 'eye-outline' },
  { key: 'pending', label: 'Chờ duyệt', icon: 'time-outline' },
  { key: 'sold', label: 'Đã bán', icon: 'checkmark-circle-outline' },
];

export default function MyListingsScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [activeTab, setActiveTab] = useState('showing');
  const [items, setItems] = useState(listingData);

  const visibleItems = useMemo(() => items[activeTab], [activeTab, items]);
  const totalListings = Object.values(items).reduce((total, list) => total + list.length, 0);

  const removeListing = (item) => {
    Alert.alert('Ẩn tin đăng', `Bạn muốn ẩn "${item.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Ẩn tin',
        style: 'destructive',
        onPress: () => setItems((current) => ({
          ...current,
          [activeTab]: current[activeTab].filter((entry) => entry.id !== item.id),
        })),
      },
    ]);
  };

  const markSold = (item) => {
    Alert.alert('Đánh dấu đã bán', `Xác nhận "${item.title}" đã được bán?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: () => {
          setItems((current) => ({
            ...current,
            showing: current.showing.filter((entry) => entry.id !== item.id),
            sold: [...current.sold, { ...item, age: 'Vừa bán xong' }],
          }));
          setActiveTab('sold');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          accessibilityLabel="Quay lại"
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
          Quản Lý Tin Đăng
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity accessibilityLabel="Tìm kiếm và lọc tin đăng" style={styles.headerButton}>
            <Ionicons name="options-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <Ionicons name="person" size={17} color="#ffffff" />
          </View>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            status={activeTab}
            theme={theme}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
            onEdit={() => navigation.navigate('PostItem', { listingId: item.id })}
            onSold={() => markSold(item)}
            onHide={() => removeListing(item)}
          />
        )}
        ListHeaderComponent={(
          <View>
            <SummaryCard
              totalListings={totalListings}
              theme={theme}
              primaryColor={primaryColor}
              fontSizeScale={fontSizeScale}
            />
            <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && { backgroundColor: primaryColor }]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Ionicons name={tab.icon} size={16} color={isActive ? '#ffffff' : theme.textSecondary} />
                    <Text style={[styles.tabText, { color: isActive ? '#ffffff' : theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
                      {tab.label}
                    </Text>
                    <Text style={[styles.tabCount, { color: isActive ? '#ffffff' : theme.textSecondary }]}>
                      {items[tab.key].length}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 16 * fontSizeScale }]}>
              Tin đăng của bạn
            </Text>
          </View>
        )}
        ListEmptyComponent={(
          <EmptyState
            theme={theme}
            primaryColor={primaryColor}
            fontSizeScale={fontSizeScale}
            onCreate={() => navigation.navigate('PostItem')}
          />
        )}
        ListFooterComponent={(
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: primaryColor }]}
            onPress={() => navigation.navigate('PostItem')}
          >
            <Ionicons name="add" size={22} color="#ffffff" />
            <Text style={styles.createButtonText}>Đăng tin thanh lý mới</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SummaryCard({ totalListings, theme, primaryColor, fontSizeScale }) {
  const stats = [
    { label: 'Tổng tin đăng', value: totalListings, suffix: 'mục', icon: 'cube-outline', color: theme.textSecondary },
    { label: 'Lượt xem tin', value: '1.240', suffix: '+18%', icon: 'eye-outline', color: '#008f70' },
    { label: 'Lượt hỏi mua', value: '28', suffix: 'hội thoại', icon: 'chatbubble-ellipses-outline', color: '#3351ff' },
    { label: 'Đã bán', value: '8', suffix: 'giao dịch', icon: 'trending-up-outline', color: primaryColor },
  ];

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
      <View style={styles.summaryHeading}>
        <View style={styles.summaryTitleRow}>
          <Ionicons name="analytics" size={20} color={primaryColor} />
          <Text style={[styles.summaryTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>Tổng quan tin đăng</Text>
        </View>
        <Text style={[styles.termBadge, { color: primaryColor }]}>Kỳ Fall 2024</Text>
      </View>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCell, { backgroundColor: theme.background }]}>
            <View style={styles.statLabelRow}>
              <Ionicons name={stat.icon} size={16} color={stat.color} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: theme.text, fontSize: 24 * fontSizeScale }]}>{stat.value}</Text>
              <Text style={[styles.statSuffix, { color: stat.color }]}>{stat.suffix}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ListingCard({ item, status, theme, isDarkMode, primaryColor, fontSizeScale, onEdit, onSold, onHide }) {
  const isPending = status === 'pending';
  const isSold = status === 'sold';
  const statusColor = isPending ? '#d97706' : isSold ? '#008f70' : '#008f70';
  const statusLabel = isPending ? 'Chờ duyệt' : isSold ? 'Đã bán' : 'Đang hiển thị';

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardTop}>
        <View style={[styles.thumbnailWrap, { backgroundColor: theme.background }]}>
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
          <Text style={[styles.imageCount, { backgroundColor: isDarkMode ? '#24252a' : '#ffffff', color: theme.text }]}>
            {item.imageCount} ảnh
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemMeta}>
            <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <View style={styles.ageRow}>
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.ageText, { color: theme.textSecondary }]}>{item.age}</Text>
            </View>
          </View>
          <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: primaryColor, fontSize: 20 * fontSizeScale }]}>{item.price}</Text>
            <Text style={[styles.currency, { color: primaryColor }]}>đ</Text>
            {item.oldPrice && <Text style={[styles.oldPrice, { color: theme.textSecondary }]}>{item.oldPrice}</Text>}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text numberOfLines={1} style={[styles.locationText, { color: theme.textSecondary }]}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.metrics, { backgroundColor: theme.background }]}>
        <Metric icon="eye-outline" value={`${item.views} lượt xem`} color={theme.textSecondary} />
        <View style={[styles.metricDot, { backgroundColor: theme.border }]} />
        <Metric icon="chatbubble-outline" value={`${item.messages} tin nhắn`} color="#3351ff" />
        <View style={[styles.metricDot, { backgroundColor: theme.border }]} />
        <Metric icon="heart-outline" value={`${item.saves} lưu`} color="#ba1a1a" />
      </View>

      {!isPending && (
        <View style={styles.actionsRow}>
          <ActionButton icon="create-outline" label="Sửa" theme={theme} onPress={onEdit} />
          {!isSold && <ActionButton icon="rocket-outline" label="Đẩy tin" theme={theme} primaryColor={primaryColor} />}
          {!isSold && <ActionButton icon="checkmark-circle-outline" label="Đã bán" theme={theme} color="#008f70" onPress={onSold} />}
          <ActionButton icon="eye-off-outline" label="Ẩn tin" theme={theme} color={theme.textSecondary} onPress={onHide} />
        </View>
      )}
    </View>
  );
}

function Metric({ icon, value, color }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.metricText, { color }]}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, theme, primaryColor, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.actionButton, { backgroundColor: primaryColor ? '#ffdbcc' : theme.background }]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={primaryColor || color || theme.text} />
      <Text style={[styles.actionText, { color: color || theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ theme, primaryColor, fontSizeScale, onCreate }) {
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
      <View style={[styles.emptyIcon, { backgroundColor: '#ffdbcc' }]}>
        <Ionicons name="file-tray-outline" size={40} color={primaryColor} />
        <View style={styles.sparkle}>
          <Ionicons name="sparkles" size={13} color="#ffffff" />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
        Chưa có tin đăng nào ở mục này
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
        Dọn phòng KTX và pass lại giáo trình, đồ điện gia dụng cho các bạn sinh viên FPT ngay hôm nay!
      </Text>
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: primaryColor }]} onPress={onCreate}>
        <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
        <Text style={styles.emptyButtonText}>ĐĂNG TIN MỚI NGAY (+)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 28 },
  summaryCard: { borderRadius: 14, padding: 16, marginTop: 12, marginBottom: 12 },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  summaryTitle: { fontWeight: '700' },
  termBadge: { backgroundColor: '#ffdbcc', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: { width: '48.5%', minHeight: 78, borderRadius: 10, padding: 10, justifyContent: 'space-between' },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { fontSize: 11, flexShrink: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  statValue: { fontWeight: '700' },
  statSuffix: { fontSize: 10, fontWeight: '700' },
  tabBar: { borderRadius: 12, padding: 4, flexDirection: 'row', gap: 3, marginBottom: 18 },
  tab: { flex: 1, minHeight: 42, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 3 },
  tabText: { fontWeight: '600' },
  tabCount: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },
  card: { borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumbnailWrap: { width: 96, height: 96, borderRadius: 9, overflow: 'hidden', position: 'relative' },
  thumbnail: { width: '100%', height: '100%' },
  imageCount: { position: 'absolute', bottom: 4, left: 4, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, fontSize: 9 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 4 },
  statusPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ageText: { fontSize: 9 },
  itemTitle: { fontWeight: '700', lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 4 },
  price: { fontWeight: '700' },
  currency: { fontSize: 11, fontWeight: '700' },
  oldPrice: { fontSize: 10, textDecorationLine: 'line-through', marginLeft: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locationText: { flex: 1, fontSize: 10 },
  metrics: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metricText: { fontSize: 9 },
  metricDot: { width: 3, height: 3, borderRadius: 2 },
  actionsRow: { flexDirection: 'row', gap: 5, marginTop: 12 },
  actionButton: { flex: 1, minHeight: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 2 },
  actionText: { fontSize: 9, fontWeight: '600' },
  emptyState: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  sparkle: { position: 'absolute', right: -2, top: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#00aa89', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyDescription: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280, marginBottom: 16 },
  emptyButton: { minHeight: 44, borderRadius: 9, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  createButton: { minHeight: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8 },
  createButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
