import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const categories = [
  { id: 'books', label: 'Giáo trình\n& Sách', icon: 'book-outline', color: '#a04100', background: '#ffdbcc' },
  { id: 'electronics', label: 'Đồ điện tử\nLaptop', icon: 'laptop-outline', color: '#0031e8', background: '#dee0ff' },
  { id: 'home', label: 'Gia dụng\nKTX', icon: 'bed-outline', color: '#006b55', background: '#6dfad2' },
  { id: 'vehicles', label: 'Xe máy\nXe điện', icon: 'bicycle-outline', color: '#f26f21', background: '#e8e8ec' },
  { id: 'fashion', label: 'Thời trang\nPhụ kiện', icon: 'shirt-outline', color: '#a04100', background: '#ffb693' },
  { id: 'sports', label: 'Thể thao\nDụng cụ', icon: 'barbell-outline', color: '#1a1c1f', background: '#e8e8ec' },
  { id: 'free', label: 'Tặng đồ\nFree 0đ', icon: 'heart-outline', color: '#ba1a1a', background: '#ffdad6' },
];

const products = [
  {
    id: 'prf192-pro197',
    title: 'Combo Giáo trình Kỹ thuật phần mềm K18 (PRF192 + PRO197)',
    price: '95.000đ',
    location: 'KTX Dom A • 10p trước',
    seller: 'Minh Quân K17',
    badge: 'Mới 95%',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2zQw7lE7lC1XQG9xT4G0b5Q0w2kLr9d4z5Xg',
    icon: 'business-outline',
    verified: true,
  },
  {
    id: 'lock-lock-rice-cooker',
    title: 'Nồi cơm điện mini Lock&Lock 0.8L (Dùng tốt phòng trọ)',
    price: '180.000đ',
    location: 'Làng ĐH / Dom E • 25p',
    seller: 'Bảo Ngọc K18',
    badge: 'Likenew',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp4I_Jzyy3psxvayq0jXwjVhbvQvySd8bQ_Ya9xQSP1e2w2fhSNzyU6y-AIhdZwGkrFJNb6vk_0WzWy7dXbVa2M_rlghYUj45UXLYwBfYmGjHXIXQXZMPGJ__HeouqHpx_dWjCT14So_ClN3iUuzZqS9lhCrAxYaZWk-KQ0VGJ5qtb10BmMq1g7O_g-7NCBBJtain6Y9_KgngaBPFnOtOWt_3Je6CTAeCxzuYy_zecXNvsVx56v6QHsQ',
    icon: 'business-outline',
    verified: false,
  },
  {
    id: 'dell-monitor',
    title: 'Màn hình Dell 24 inch IPS FHD (Kèm cáp HDMI zin)',
    price: '1.250.000đ',
    location: 'KTX Dom B - P.304',
    seller: 'Huy Hoàng IT',
    badge: '98% FHD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW2_7vC-eDfCZ_ZMGZg62QPfM8Jj3uyrlDjuPVh8hq7rtDj4387lZmXw9eOtE0wcM6Cnj7pDCcUT8df04znHuaMtzFZCikJg1B3ppq1BLmm8S6aDE6-RVZVXcS6hFkJ3a7zdPlHG-S5QZ6B0bgTARGYWjruTPqNrhsM2Ar93Ls6fpP8lFbkn1_nAiU856QyywGkloF6QFHLa5PwY9nGj2Yl0XkDAtFpTKasXBA2aNCv-8t5oScvhPNaA',
    icon: 'business-outline',
    verified: true,
  },
  {
    id: 'nijia-electric-bike',
    title: 'Xe đạp điện Nijia chính chủ, ắc quy mới thay 2 tháng',
    price: '2.800.000đ',
    location: 'Bãi xe KTX • 2h',
    seller: 'Đức Thắng K16',
    badge: 'Chính chủ',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHIWiWyDGtJ7AAB5bB6ZEQRi7sz3-LuvBPxAPPqdHwbgpxdF_xKEvqOh5F-Pi9tsC6hrINTOLR3zlSR-iXJPT3SW_L12jSMFdB5gUXqk84IW7yryPFgQweeuzlJAlAhaW8zOIQCxtgQP6jLIy45SOHuJBbTWnPq-5gVL86SwoThL9bIKEc_rHnwaLHrSjIcrbvu2wDYoF02v-0uMCI4jw6GWH3VAP2zhPsHqMN0mrrwkNjw76-1jKeRA',
    icon: 'car-outline',
    verified: false,
  },
  {
    id: 'foldable-desk-fan',
    title: 'Bàn học gấp gọn kèm quạt mini cho phòng trọ',
    price: '320.000đ',
    location: 'KTX Dom C • 3h',
    seller: 'Lan Anh K19',
    badge: 'Tiện dụng',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3H8pQ4tF7rL9mN2sV6xY1zK5qW8eR0tU3iO6pA9sD4fG7hJ2kL5mN8bQ1wE4rT7yU0iO3pA6sD9fG2hJ5kL8mN1bQ4wE7rT0',
    icon: 'business-outline',
    verified: false,
  },
  {
    id: 'sony-wh-ch520',
    title: 'Tai nghe chống ồn Sony WH-CH520 màu kem chính hãng',
    price: '650.000đ',
    location: 'KTX Dom A • 5h',
    seller: 'Thanh Tùng Graphic',
    badge: 'Fullbox 99%',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb7WusnAyatiRwXKhcrw4S_UZu0vG8_v3I8uQOnG9t6B17UfxM5C_p38bm1lOEfeR-jzISFA6yT1H5GEGMjOAe5t30O-Rtl9wmQbuhh1wgK07D2g5jTZWomSbVDiusj7DxQ4BKNYCtlyJywnz685lIQ6TlFpp3Qc5gegJj7vNt4sgKhuBT0D21bwItof2fHvMf6VZsr4LHIqjtxh0x_RRmiF_93VyK4mo91qqpu5tXsDDYyHlG1Pj2Hg',
    icon: 'business-outline',
    verified: true,
  },
];

const filters = ['Tất cả', 'Gần bạn (KTX)', 'Giá < 100k'];

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [favorites, setFavorites] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((current) => (
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    ));
  };

  const renderProduct = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <Text style={[styles.badge, { backgroundColor: primaryColor }]}>{item.badge}</Text>
          <TouchableOpacity
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={[styles.favoriteButton, { backgroundColor: `${theme.background}dd` }]}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={17} color={isFavorite ? '#ba1a1a' : theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.productDetails}>
          <Text numberOfLines={2} style={[styles.productTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
            {item.title}
          </Text>
          <Text style={[styles.productPrice, { color: primaryColor, fontSize: 20 * fontSizeScale }]}>{item.price}</Text>
          <View style={styles.productMeta}>
            <View style={styles.metaRow}>
              <Ionicons name={item.icon} size={13} color={primaryColor} />
              <Text numberOfLines={1} style={[styles.metaText, { color: theme.textSecondary }]}>{item.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name={item.verified ? 'checkmark-circle' : 'person-circle-outline'} size={13} color={item.verified ? '#006b55' : theme.textSecondary} />
              <Text numberOfLines={1} style={[styles.metaText, { color: theme.textSecondary }]}>{item.seller}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        ListHeaderComponent={(
          <>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Student Market</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity accessibilityLabel="Search market" style={styles.iconButton}>
                  <Ionicons name="search-outline" size={23} color={theme.text} />
                </TouchableOpacity>
                <View style={[styles.profileIcon, { backgroundColor: primaryColor }]}>
                  <Ionicons name="person-outline" size={18} color="#ffffff" />
                </View>
              </View>
            </View>

            <View style={styles.locationRow}>
              <TouchableOpacity style={[styles.locationButton, { backgroundColor: isDarkMode ? theme.card : '#e8e8ec' }]}>
                <Ionicons name="location-outline" size={19} color={primaryColor} />
                <View style={styles.locationText}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>Cơ sở hiện tại</Text>
                  <Text numberOfLines={1} style={[styles.locationValue, { color: theme.text }]}>FPT Hòa Lạc • KTX Khu A & B</Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={styles.quickActions}>
                <TouchableOpacity style={[styles.roundButton, { backgroundColor: theme.card }]}>
                  <Ionicons name="notifications-outline" size={21} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roundButton, { backgroundColor: theme.card }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={21} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm giáo trình, laptop, xe điện..."
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.searchInput, { color: theme.text, fontSize: 14 * fontSizeScale }]}
                />
                <Ionicons name="camera-outline" size={19} color={theme.textSecondary} />
              </View>
              <TouchableOpacity style={[styles.filterButton, { backgroundColor: primaryColor }]}>
                <Ionicons name="options-outline" size={21} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={[styles.promoCard, { backgroundColor: primaryColor }]}>
              <View style={styles.promoCopy}>
                <Text style={styles.promoTag}>XUÂN 2025</Text>
                <Text style={[styles.promoTitle, { fontSize: 20 * fontSizeScale }]}>Hội Chợ Sinh Viên FPT</Text>
                <Text style={styles.promoDescription}>Đổi giáo trình cũ - Nhận liền tay e-voucher 50K dịch vụ KTX!</Text>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={[styles.promoButtonText, { color: primaryColor }]}>Khám phá ngay</Text>
                  <Ionicons name="arrow-forward" size={16} color={primaryColor} />
                </TouchableOpacity>
              </View>
              <Ionicons name="school-outline" size={92} color="#ffffff55" style={styles.promoIcon} />
            </View>

            <View style={[styles.trustRow, { backgroundColor: theme.card }]}>
              {[
                ['shield-checkmark-outline', 'SV FPT 100%'],
                ['bicycle-outline', 'KTX 0đ Ship'],
                ['shield-outline', 'FPT Edu Bảo hộ'],
              ].map(([icon, label]) => (
                <View key={label} style={styles.trustItem}>
                  <Ionicons name={icon} size={18} color={primaryColor} />
                  <Text numberOfLines={1} style={[styles.trustText, { color: theme.text }]}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Danh mục nổi bật</Text>
              <TouchableOpacity style={styles.seeAll}>
                <Text style={[styles.seeAllText, { color: primaryColor }]}>Tất cả</Text>
                <Ionicons name="chevron-forward" size={16} color={primaryColor} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity key={category.id} style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: isDarkMode ? theme.card : category.background }]}>
                    <Ionicons name={category.icon} size={26} color={isDarkMode ? primaryColor : category.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: theme.text }]}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.feedHeader}>
              <View style={styles.feedTitleRow}>
                <Ionicons name="flame" size={22} color={primaryColor} />
                <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Gợi ý hôm nay</Text>
              </View>
              <Text style={[styles.gradeBadge, { color: primaryColor }]}>K16 - K19</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[styles.filterPill, { backgroundColor: selectedFilter === filter ? theme.text : theme.card }]}
                >
                  <Text style={{ color: selectedFilter === filter ? theme.background : theme.text }}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        ListFooterComponent={<Text style={[styles.footerText, { color: theme.textSecondary }]}>Đang tải thêm tin đăng từ sinh viên FPT...</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontWeight: '700', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  locationButton: { flex: 1, minHeight: 48, borderRadius: 24, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  locationText: { flex: 1 },
  locationLabel: { fontSize: 10, marginBottom: 2 },
  locationValue: { fontSize: 12, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 6 },
  roundButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  searchBox: { flex: 1, height: 48, borderRadius: 13, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, paddingVertical: 0 },
  filterButton: { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  promoCard: { minHeight: 184, borderRadius: 18, padding: 16, overflow: 'hidden', marginBottom: 12 },
  promoCopy: { width: '72%', zIndex: 1 },
  promoTag: { color: '#ffffff', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 7 },
  promoTitle: { color: '#ffffff', fontWeight: '700', marginBottom: 5 },
  promoDescription: { color: '#ffffffdd', fontSize: 12, lineHeight: 17 },
  promoButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8, marginTop: 12 },
  promoButtonText: { fontSize: 12, fontWeight: '700' },
  promoIcon: { position: 'absolute', right: 12, bottom: 18 },
  trustRow: { borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  trustItem: { flex: 1, alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontWeight: '700' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, fontWeight: '600' },
  categoryList: { gap: 12, paddingBottom: 24 },
  categoryItem: { width: 70, alignItems: 'center', gap: 7 },
  categoryIcon: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeBadge: { backgroundColor: '#ffdbcc', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  filterList: { gap: 8, paddingBottom: 16 },
  filterPill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  productRow: { gap: 12, marginBottom: 12 },
  productCard: { flex: 1, minWidth: 0, borderRadius: 16, overflow: 'hidden', elevation: 1 },
  productImageContainer: { aspectRatio: 1, backgroundColor: '#e8e8ec', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, color: '#ffffff', fontSize: 10, fontWeight: '700' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productDetails: { padding: 10, minHeight: 142 },
  productTitle: { fontWeight: '600', lineHeight: 19, minHeight: 38 },
  productPrice: { fontWeight: '700', marginTop: 4, marginBottom: 8 },
  productMeta: { gap: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { flex: 1, fontSize: 10 },
  footerText: { textAlign: 'center', fontSize: 12, paddingVertical: 18 },
});
