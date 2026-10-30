import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { CATEGORIES, getProducts } from '../../services/api/productApi';

const FILTERS = ['Tất cả', 'Gần bạn (KTX)', 'Giá < 100k', 'Tặng đồ 0đ'];

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');

  // Products & Pagination States
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // User interactions
  const [favorites, setFavorites] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Fetch products function
  const fetchProducts = useCallback(
    async ({
      reset = false,
      pageNum = 1,
      cat = selectedCategory,
      query = search,
      flt = selectedFilter,
    } = {}) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await getProducts({
          category: cat,
          search: query,
          filter: flt,
          page: pageNum,
          limit: 6,
        });

        if (reset) {
          setProducts(res.products || []);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = (res.products || []).filter((item) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
        }

        setHasMore(Boolean(res.hasMore));
        setPage(pageNum);
      } catch (err) {
        console.warn('[HomeScreen] fetchProducts error:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, search, selectedFilter]
  );

  // Initial load and filter/category trigger with debounce for search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts({ reset: true, pageNum: 1 });
    }, 280);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, selectedCategory, selectedFilter]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts({ reset: true, pageNum: 1 });
  }, [fetchProducts]);

  // Load more on scroll to end
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchProducts({ reset: false, pageNum: page + 1 });
    }
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id]
    );
  };

  // Category selection handler
  const handleCategoryPress = (catId) => {
    setSelectedCategory((prev) => (prev === catId ? 'all' : catId));
  };

  // Render each product card
  const renderProduct = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    const imageUri =
      (Array.isArray(item.images) && item.images[0]) ||
      item.image ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80';
    const priceText =
      item.priceDisplay ||
      (typeof item.price === 'number'
        ? item.price === 0
          ? '0 ₫ (Miễn phí)'
          : `${item.price.toLocaleString('vi-VN')} ₫`
        : item.price);
    const sellerName =
      (typeof item.seller === 'object' ? item.seller?.name : item.seller) || 'Sinh viên FPT';
    const isVerified = Boolean(item.verified || (item.seller && item.seller.verified));

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.productCard, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.productImage} />
          <Text style={[styles.badge, { backgroundColor: primaryColor }]}>{item.badge || item.condition || 'Mới'}</Text>
          <TouchableOpacity
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={[styles.favoriteButton, { backgroundColor: `${theme.background}dd` }]}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={17}
              color={isFavorite ? '#ba1a1a' : theme.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productDetails}>
          <Text numberOfLines={2} style={[styles.productTitle, { color: theme.text, fontSize: 13.5 * fontSizeScale }]}>
            {item.title}
          </Text>
          <Text style={[styles.productPrice, { color: primaryColor, fontSize: 18 * fontSizeScale }]}>
            {priceText}
          </Text>
          <View style={styles.productMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={primaryColor} />
              <Text numberOfLines={1} style={[styles.metaText, { color: theme.textSecondary }]}>
                {item.location || 'FPT Hòa Lạc'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons
                name={isVerified ? 'checkmark-circle' : 'person-circle-outline'}
                size={13}
                color={isVerified ? '#006b55' : theme.textSecondary}
              />
              <Text numberOfLines={1} style={[styles.metaText, { color: theme.textSecondary }]}>
                {sellerName}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Footer loading / end state
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Đang tải thêm sản phẩm...</Text>
        </View>
      );
    }
    if (!hasMore && products.length > 0) {
      return (
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          ✓ Đã hiển thị tất cả tin đăng từ sinh viên FPT
        </Text>
      );
    }
    return null;
  };

  // Empty state when search or filter returns no items
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={primaryColor} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Đang tải dữ liệu sản phẩm...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={54} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Không tìm thấy sản phẩm nào</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Thử gõ từ khóa khác hoặc chọn xem tất cả danh mục.
        </Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            setSearch('');
            setSelectedCategory('all');
            setSelectedFilter('Tất cả');
          }}
        >
          <Text style={styles.resetButtonText}>Xem tất cả sản phẩm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.text, fontSize: 21 * fontSizeScale }]}>
                Student Market
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  accessibilityLabel="Tìm kiếm"
                  style={styles.iconButton}
                  onPress={() => {}}
                >
                  <Ionicons name="search-outline" size={23} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileIcon, { backgroundColor: primaryColor }]}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                >
                  <Ionicons name="person-outline" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.locationRow}>
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  { backgroundColor: isDarkMode ? theme.card : '#e8e8ec' },
                ]}
              >
                <Ionicons name="location-outline" size={19} color={primaryColor} />
                <View style={styles.locationText}>
                  <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>Cơ sở hiện tại</Text>
                  <Text numberOfLines={1} style={[styles.locationValue, { color: theme.text }]}>
                    FPT Hòa Lạc • KTX Khu A & B
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.roundButton, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}
                >
                  <Ionicons name="notifications-outline" size={21} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roundButton, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('AIChatbot')}
                >
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
                  returnKeyType="search"
                />
                {search.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={19} color={theme.textSecondary} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => navigation.navigate('AIEstimator')}>
                    <Ionicons name="sparkles-outline" size={19} color={primaryColor} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: primaryColor }]}
                onPress={() => setSelectedFilter(selectedFilter === 'Tất cả' ? 'Gần bạn (KTX)' : 'Tất cả')}
              >
                <Ionicons name="options-outline" size={21} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={[styles.promoCard, { backgroundColor: primaryColor }]}>
              <View style={styles.promoCopy}>
                <Text style={styles.promoTag}>XUÂN 2025</Text>
                <Text style={[styles.promoTitle, { fontSize: 20 * fontSizeScale }]}>Hội Chợ Sinh Viên FPT</Text>
                <Text style={styles.promoDescription}>Đổi giáo trình cũ - Nhận liền tay e-voucher 50K dịch vụ KTX!</Text>
                <TouchableOpacity
                  style={styles.promoButton}
                  onPress={() => setSelectedCategory('books')}
                >
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
                  <Text numberOfLines={1} style={[styles.trustText, { color: theme.text }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                Danh mục nổi bật
              </Text>
              <TouchableOpacity style={styles.seeAll} onPress={() => setSelectedCategory('all')}>
                <Text style={[styles.seeAllText, { color: primaryColor }]}>
                  {selectedCategory !== 'all' ? 'Đặt lại tất cả' : 'Tất cả'}
                </Text>
                <Ionicons name="chevron-forward" size={15} color={primaryColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => handleCategoryPress(category.id)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: isSelected
                            ? primaryColor
                            : isDarkMode
                            ? theme.card
                            : category.background,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: primaryColor,
                        },
                      ]}
                    >
                      <Ionicons
                        name={category.icon}
                        size={25}
                        color={isSelected ? '#ffffff' : isDarkMode ? primaryColor : category.color}
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.categoryLabel,
                        {
                          color: isSelected ? primaryColor : theme.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.feedHeader}>
              <View style={styles.feedTitleRow}>
                <Ionicons name="flame" size={22} color={primaryColor} />
                <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                  {selectedCategory !== 'all'
                    ? `Danh mục: ${CATEGORIES.find((c) => c.id === selectedCategory)?.label.replace('\n', ' ') || ''}`
                    : 'Gợi ý hôm nay'}
                </Text>
              </View>
              <Text style={[styles.gradeBadge, { color: primaryColor }]}>K16 - K19</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            >
              {FILTERS.map((filter) => {
                const isActive = selectedFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive ? primaryColor : theme.card,
                        borderColor: isActive ? primaryColor : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isActive ? '#ffffff' : theme.text,
                        fontWeight: isActive ? '700' : '500',
                        fontSize: 12,
                      }}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
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
  promoCard: { minHeight: 174, borderRadius: 18, padding: 16, overflow: 'hidden', marginBottom: 12 },
  promoCopy: { width: '72%', zIndex: 1 },
  promoTag: { color: '#ffffff', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 7 },
  promoTitle: { color: '#ffffff', fontWeight: '700', marginBottom: 5 },
  promoDescription: { color: '#ffffffdd', fontSize: 12, lineHeight: 17 },
  promoButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8, marginTop: 12 },
  promoButtonText: { fontSize: 12, fontWeight: '700' },
  promoIcon: { position: 'absolute', right: 12, bottom: 18 },
  trustRow: { borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  trustItem: { flex: 1, alignItems: 'center', gap: 4 },
  trustText: { fontSize: 10, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontWeight: '700' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, fontWeight: '600' },
  categoryList: { gap: 12, paddingBottom: 22 },
  categoryItem: { width: 70, alignItems: 'center', gap: 6 },
  categoryIcon: { width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 10, textAlign: 'center', lineHeight: 13 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feedTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gradeBadge: { backgroundColor: '#ffdbcc', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: '700' },
  filterList: { gap: 8, paddingBottom: 16 },
  filterPill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  productRow: { gap: 12, marginBottom: 12 },
  productCard: { flex: 1, minWidth: 0, borderRadius: 16, overflow: 'hidden', elevation: 1 },
  productImageContainer: { aspectRatio: 1, backgroundColor: '#e8e8ec', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, color: '#ffffff', fontSize: 10, fontWeight: '700' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productDetails: { padding: 10, minHeight: 138 },
  productTitle: { fontWeight: '600', lineHeight: 18, minHeight: 36 },
  productPrice: { fontWeight: '700', marginTop: 4, marginBottom: 8 },
  productMeta: { gap: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { flex: 1, fontSize: 10 },
  footerLoader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 18 },
  footerText: { textAlign: 'center', fontSize: 12, paddingVertical: 18 },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: 'center', marginBottom: 18 },
  resetButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  resetButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
});
