import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

import { MOCK_PRODUCTS } from '../../services/api/productApi';

const products = MOCK_PRODUCTS.map((p) => ({
  ...p,
  price: p.priceDisplay || `${p.price?.toLocaleString('vi-VN')} ₫`,
  image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image,
  seller: typeof p.seller === 'object' ? p.seller.name : p.seller,
  verified: typeof p.seller === 'object' ? p.seller.verified : true,
  icon: p.category === 'books' ? 'book-outline' : p.category === 'vehicles' ? 'bicycle-outline' : 'business-outline',
}));

const filters = ['Tất cả', 'Gần bạn (KTX)', 'Giá < 100k'];

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const handleProductPress = (item) => {
    try {
      const parent = navigation.getParent();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate('ProductDetail', { productId: item.id, product: item });
      } else {
        navigation.navigate('ProductDetail', { productId: item.id, product: item });
      }
    } catch (err) {
      navigation.navigate('ProductDetail', { productId: item.id, product: item });
    }
  };

  const displayedProducts = products.filter((p) => {
    const matchSearch = search ? p.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchFilter =
      selectedFilter === 'Giá < 100k'
        ? Number(String(p.price).replace(/[^0-9]/g, '')) <= 100000
        : selectedFilter === 'Gần bạn (KTX)'
        ? (p.location || '').includes('KTX') || (p.location || '').includes('Dom')
        : true;
    const matchCategory = selectedCategory
      ? p.category === selectedCategory ||
        (selectedCategory === 'home' && (p.category === 'furniture' || p.category === 'home')) ||
        (selectedCategory === 'furniture' && (p.category === 'furniture' || p.category === 'home'))
      : true;
    return matchSearch && matchFilter && matchCategory;
  });

  const renderProduct = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => handleProductPress(item)}
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
        data={displayedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={54} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Không tìm thấy sản phẩm nào</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {selectedCategory
                ? 'Chưa có sản phẩm phù hợp trong danh mục này.'
                : 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyResetBtn, { backgroundColor: primaryColor }]}
              onPress={() => {
                setSelectedCategory(null);
                setSelectedFilter(filters[0]);
                setSearch('');
              }}
            >
              <Text style={styles.emptyResetBtnText}>Xem tất cả sản phẩm</Text>
            </TouchableOpacity>
          </View>
        }
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
              <TouchableOpacity
                style={styles.seeAll}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.seeAllText, { color: primaryColor }]}>
                  {selectedCategory ? 'Bỏ chọn' : 'Tất cả'}
                </Text>
                <Ionicons name={selectedCategory ? 'close-circle-outline' : 'chevron-forward'} size={16} color={primaryColor} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    activeOpacity={0.7}
                    style={styles.categoryItem}
                    onPress={() => setSelectedCategory((prev) => (prev === category.id ? null : category.id))}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: isDarkMode ? theme.card : category.background,
                          borderColor: isSelected ? primaryColor : 'transparent',
                          borderWidth: isSelected ? 2.5 : 0,
                          transform: [{ scale: isSelected ? 1.08 : 1 }],
                        },
                      ]}
                    >
                      <Ionicons
                        name={category.icon}
                        size={26}
                        color={isSelected ? primaryColor : isDarkMode ? primaryColor : category.color}
                      />
                      {isSelected && (
                        <View style={[styles.selectedCategoryBadge, { backgroundColor: primaryColor }]}>
                          <Ionicons name="checkmark" size={10} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        {
                          color: isSelected ? primaryColor : theme.text,
                          fontWeight: isSelected ? '700' : '400',
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedCategory && (
              <View style={[styles.activeCategoryBar, { backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}35` }]}>
                <Ionicons name="funnel" size={15} color={primaryColor} />
                <Text style={[styles.activeCategoryText, { color: theme.text }]}>
                  Đang lọc: <Text style={{ fontWeight: '700', color: primaryColor }}>{categories.find((c) => c.id === selectedCategory)?.label.replace('\n', ' ')}</Text> ({displayedProducts.length} sản phẩm)
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.clearCategoryBtn}>
                  <Ionicons name="close-circle" size={18} color={primaryColor} />
                </TouchableOpacity>
              </View>
            )}

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
  selectedCategoryBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  activeCategoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  activeCategoryText: {
    flex: 1,
    fontSize: 13,
  },
  clearCategoryBtn: {
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyResetBtn: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyResetBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
