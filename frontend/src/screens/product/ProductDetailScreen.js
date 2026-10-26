import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getProductById, getSuggestedProducts, MOCK_PRODUCTS } from '../../services/api/productApi';

// Fallback hardcoded product for instant load / offline fallback
const FALLBACK_PRODUCT = {
  id: 'prf192-pro197',
  title: 'Combo Giáo trình Kỹ thuật phần mềm K18 (PRF192 + PRO197) - Kèm Source Code Lab & Note A+',
  price: 95000,
  priceDisplay: '95.000 ₫',
  originalPrice: '320.000 ₫',
  discount: '-70%',
  category: 'Giáo trình K18',
  condition: 'Mới 95%',
  seller: {
    name: 'Nguyễn Minh Quân',
    tag: 'K17 SE • FPTU Hola',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80',
    rating: '4.9',
    reviews: '38 đánh giá',
    responseRate: '98%',
    responseTime: '~5 phút',
    verified: true,
    email: 'quan.nm.k17@fpt.edu.vn',
    phone: '0912 345 678',
  },
  location: 'KTX Dom A • Sảnh chính',
  campus: 'FPT Hòa Lạc Campus',
  images: [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1000&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80',
  ],
  description: {
    conditionDetail:
      'Bộ sách gồm 2 cuốn PRF192 và PRO197 được bọc plastic cẩn thận, không quăn góc, không gạch xóa bẩn. Highlight các tips thi PE/FE quan trọng chuẩn kỳ.',
    gift:
      'Tặng kèm QR drive riêng truy cập full source code 10 bài Lab Java OOP, các mini-project mẫu C Programming và bộ đề ôn tập thực hành thi qua môn 100%.',
    reason:
      'Đã pass môn A+ kỳ Spring 2024, hiện chuẩn bị làm thủ tục đi OJT thực tập doanh nghiệp nên pass lại rẻ cho các em tân sinh viên K18/K19.',
    pickupSchedule: 'Sau 17h30 các ngày trong tuần hoặc cả ngày Thứ 7 & Chủ nhật.',
  },
};

const TIME_SLOTS = [
  'Trưa: 11h30 - 12h30 (Sau ca học sáng)',
  'Chiều: 17h30 - 18h30 (Tan ca học chiều)',
  'Tối: 19h30 - 21h00 (Tại sảnh KTX)',
];

export default function ProductDetailScreen({ navigation, route }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { width } = useWindowDimensions();
  const auth = useAuth();
  const { profile } = useProfile();

  const productId = route?.params?.productId || 'prf192-pro197';
  const initialProduct = route?.params?.product;

  // Instant render without blocking UI
  const [product, setProduct] = useState(() => {
    if (initialProduct) return initialProduct;
    const found = MOCK_PRODUCTS.find((p) => p.id === productId);
    return found || FALLBACK_PRODUCT;
  });
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [suggested, setSuggested] = useState(() => getSuggestedProducts(productId, initialProduct?.category));

  // Modals
  const [isAppointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [appointmentNote, setAppointmentNote] = useState('');
  const [submittingAppointment, setSubmittingAppointment] = useState(false);

  // Fetch product data from API / Firestore in background with 2s timeout
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        const fetchPromise = getProductById(productId);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (isMounted && data) {
          setProduct((prev) => ({ ...prev, ...data }));
          const related = getSuggestedProducts(productId, data.category);
          setSuggested(related);
        }
      } catch (err) {
        console.log('[ProductDetailScreen] loadProduct error:', err.message);
      }
    }
    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Handle Share Product
  const handleShare = async () => {
    try {
      await Share.share({
        title: product.title,
        message: `🛒 ${product.title}\n💰 Giá: ${product.priceDisplay || `${product.price} ₫`}\n📍 Điểm hẹn: ${product.location || 'FPT Campus'}\nXem chi tiết trên SmartCampus Market!`,
      });
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  // Toggle favorite
  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    Alert.alert(
      !isLiked ? 'Đã lưu vào Yêu thích' : 'Đã bỏ lưu',
      !isLiked ? 'Bạn có thể xem lại sản phẩm này trong danh sách quan tâm.' : 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
      [{ text: 'Đóng' }],
      { cancelable: true },
    );
  };

  // Submit Appointment (Đặt hẹn nhận hàng)
  const handleConfirmAppointment = () => {
    setSubmittingAppointment(true);
    setTimeout(() => {
      setSubmittingAppointment(false);
      setAppointmentModalVisible(false);
      Alert.alert(
        '🎉 Đặt hẹn thành công!',
        `Hẹn nhận hàng tại "${product.location || 'Sảnh KTX'}" vào khung giờ: ${selectedSlot}.\n\nNgười bán "${sellerName}" đã nhận được thông báo của bạn.`,
        [
          { text: 'Tiếp tục xem đồ' },
          {
            text: 'Xem Đơn hàng',
            onPress: () => navigation.navigate('Orders'),
            style: 'default',
          },
        ],
      );
    }, 700);
  };

  // Open Chat / Message
  const handleOpenChat = () => {
    Alert.alert(
      '💬 Nhắn tin với người bán',
      `Bạn muốn nhắn tin hỏi người bán "${sellerName}" về sản phẩm này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Trợ lý AI hỗ trợ',
          onPress: () => navigation.navigate('AIChatbot'),
        },
        {
          text: 'Xem thông tin liên hệ',
          onPress: () => setContactModalVisible(true),
        },
      ],
    );
  };

  const imageScrollRef = React.useRef(null);

  const scrollToImage = (index) => {
    if (index >= 0 && index < productImages.length) {
      setActiveImage(index);
      imageScrollRef.current?.scrollTo({ x: index * width, animated: true });
    }
  };

  // Helpers to safely extract seller info
  const seller = product.seller || {};
  const sellerName = typeof seller === 'string' ? seller : seller.name || 'Sinh viên FPT';
  const sellerAvatar =
    seller.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&q=80';
  const sellerTag = seller.tag || 'Sinh viên FPTU';
  const sellerRating = seller.rating || '5.0';
  const sellerReviews = seller.reviews || 'Đánh giá tốt';
  const sellerResponseRate = seller.responseRate || '99%';
  const sellerResponseTime = seller.responseTime || '~5 phút';
  const isSellerVerified = seller.verified !== false;

  // Images array with multi-angle fallback guarantee
  const mock = MOCK_PRODUCTS.find((p) => p.id === productId) || FALLBACK_PRODUCT;
  const productImages =
    Array.isArray(product.images) && product.images.length > 1
      ? product.images
      : (mock.images && mock.images.length > 1)
      ? mock.images
      : [product.image || mock.images?.[0] || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80'];

  // Price display
  const displayPrice =
    product.priceDisplay ||
    (typeof product.price === 'number'
      ? `${product.price.toLocaleString('vi-VN')} ₫`
      : `${product.price || '0'} ₫`);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.screen}>
        {/* Floating Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Quay lại"
            style={[styles.headerButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              accessibilityLabel="Chia sẻ"
              style={[styles.headerButton, { backgroundColor: theme.card }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.card }]}
              onPress={handleToggleLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? '#ba1a1a' : theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* ─── 1. Image Slider ────────────────────────────────────────── */}
          <View style={[styles.imageSection, { backgroundColor: theme.border }]}>
            <ScrollView
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const pageIndex = Math.round(
                  event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
                );
                setActiveImage(pageIndex);
              }}
            >
              {productImages.map((imgUri, index) => (
                <Image
                  key={`img-${index}`}
                  source={{ uri: imgUri }}
                  style={[styles.productImage, { width }]}
                />
              ))}
            </ScrollView>

            {/* Left / Right Arrow Buttons to navigate angles easily */}
            {productImages.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.sliderArrow, styles.sliderArrowLeft]}
                  onPress={() => scrollToImage(activeImage > 0 ? activeImage - 1 : productImages.length - 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sliderArrow, styles.sliderArrowRight]}
                  onPress={() => scrollToImage(activeImage < productImages.length - 1 ? activeImage + 1 : 0)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                </TouchableOpacity>
              </>
            )}

            {/* Badge Indicator (e.g. 1/4) */}
            <View style={styles.imageIndicator}>
              <Ionicons name="images-outline" size={13} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.imageCount}>
                {activeImage + 1}/{productImages.length}
              </Text>
            </View>

            {/* Pagination Dots */}
            {productImages.length > 1 && (
              <View style={styles.dots}>
                {productImages.map((_, index) => (
                  <TouchableOpacity
                    key={`dot-${index}`}
                    onPress={() => scrollToImage(index)}
                    style={[
                      styles.dot,
                      index === activeImage ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* ─── 1.1 Multi-angle Thumbnail Strip ───────────────────────── */}
          {productImages.length > 1 && (
            <View style={[styles.thumbnailSection, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <View style={styles.thumbnailHeader}>
                <Ionicons name="camera-outline" size={14} color={primaryColor} />
                <Text style={[styles.thumbnailLabel, { color: theme.textSecondary }]}>
                  Các góc chụp ({productImages.length} ảnh • Chạm để đổi góc):
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
                {productImages.map((imgUri, index) => {
                  const isCurrent = index === activeImage;
                  const angleNames = ['Góc chính', 'Mặt sau', 'Chi tiết', 'Phụ kiện', 'Góc cạnh'];
                  const label = angleNames[index] || `Góc ${index + 1}`;
                  return (
                    <TouchableOpacity
                      key={`thumb-${index}`}
                      activeOpacity={0.8}
                      style={[
                        styles.thumbnailCard,
                        {
                          borderColor: isCurrent ? primaryColor : theme.border,
                          borderWidth: isCurrent ? 2 : 1,
                          backgroundColor: theme.background,
                        },
                      ]}
                      onPress={() => scrollToImage(index)}
                    >
                      <Image source={{ uri: imgUri }} style={styles.thumbnailImage} />
                      <View
                        style={[
                          styles.thumbnailBadge,
                          { backgroundColor: isCurrent ? primaryColor : 'rgba(0,0,0,0.6)' },
                        ]}
                      >
                        <Text style={styles.thumbnailBadgeText}>{label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ─── 2. Product Intro ────────────────────────────────────────── */}
          <View style={styles.productIntro}>
            {/* Tag row */}
            <View style={styles.tagRow}>
              {product.category && (
                <Tag text={product.category} background="#ffdbcc" color="#531e00" />
              )}
              <Tag
                text="Đã thẩm định AI"
                background="#c7f8ea"
                color="#002018"
                icon="shield-checkmark"
              />
              {product.condition && (
                <Tag
                  text={product.condition}
                  background={theme.border}
                  color={theme.textSecondary}
                />
              )}
              {product.negotiable && (
                <Tag text="Có thương lượng" background="#dee0ff" color="#002bcf" />
              )}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text, fontSize: 22 * fontSizeScale }]}>
              {product.title}
            </Text>

            {/* Price & Discount */}
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: primaryColor, fontSize: 28 * fontSizeScale }]}>
                {displayPrice}
              </Text>
              {product.originalPrice && (
                <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                  {product.originalPrice}
                </Text>
              )}
              {product.discount && <Text style={styles.discount}>{product.discount}</Text>}
            </View>

            {/* P2P Campus Guarantee Card */}
            <View style={[styles.trustCard, { backgroundColor: isDarkMode ? '#22242a' : '#f0f3fa' }]}>
              <View style={[styles.trustIcon, { backgroundColor: '#dee0ff' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#0031e8" />
              </View>
              <View style={styles.flexText}>
                <Text style={[styles.trustTitle, { color: theme.text, fontSize: 13 * fontSizeScale }]}>
                  Bảo chứng giao dịch Campus P2P
                </Text>
                <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                  Giao dịch an toàn trực tiếp trong trường • Đồng kiểm đồ trước khi nhận
                </Text>
              </View>
            </View>
          </View>

          <SectionDivider theme={theme} />

          {/* ─── 3. FPT Verified Seller Info ────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
              Thông tin người bán FPT
            </Text>
            <View style={[styles.sellerCard, { backgroundColor: theme.card }]}>
              <View style={styles.sellerTop}>
                <View style={styles.sellerInfo}>
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: sellerAvatar }} style={styles.sellerAvatar} />
                    {isSellerVerified && (
                      <View style={styles.sellerVerifiedBadge}>
                        <Ionicons name="checkmark" size={11} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.flexText}>
                    <View style={styles.sellerNameRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.sellerName, { color: theme.text, fontSize: 15 * fontSizeScale }]}
                      >
                        {sellerName}
                      </Text>
                      {sellerTag ? <Text style={styles.sellerTag}>{sellerTag}</Text> : null}
                    </View>
                    <View style={styles.sellerMeta}>
                      <Ionicons name="school" size={13} color={primaryColor} />
                      <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                        {isSellerVerified
                          ? 'Đã xác minh FPT-ID (@fpt.edu.vn)'
                          : 'Tài khoản sinh viên FPT'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: isDarkMode ? '#2c2d33' : '#eef1f8' }]}
                  onPress={() => setContactModalVisible(true)}
                >
                  <Ionicons name="call-outline" size={14} color={primaryColor} />
                  <Text style={[styles.contactButtonText, { color: primaryColor }]}>Liên hệ</Text>
                </TouchableOpacity>
              </View>

              {/* Seller Trust Stats */}
              <View style={[styles.sellerStats, { borderTopColor: theme.border }]}>
                <RatingStat
                  value={sellerRating}
                  label={sellerReviews}
                  primaryColor={primaryColor}
                  theme={theme}
                />
                <RatingStat value={sellerResponseRate} label="Tỷ lệ phản hồi" theme={theme} />
                <RatingStat
                  value={sellerResponseTime}
                  label="Phản hồi nhanh"
                  valueColor="#006b55"
                  theme={theme}
                />
              </View>
            </View>
          </View>

          {/* ─── 4. Detailed Description ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
              Mô tả chi tiết sản phẩm
            </Text>
            <View style={[styles.descriptionCard, { backgroundColor: theme.card }]}>
              {typeof product.description === 'object' && product.description !== null ? (
                <>
                  {product.description.conditionDetail && (
                    <DescriptionRow
                      icon="book-outline"
                      color="#006b55"
                      title="Tình trạng thực tế:"
                      text={product.description.conditionDetail}
                      theme={theme}
                      fontSizeScale={fontSizeScale}
                    />
                  )}
                  {product.description.gift && (
                    <DescriptionRow
                      icon="gift-outline"
                      color={primaryColor}
                      title="Quà tặng / Phụ kiện kèm:"
                      text={product.description.gift}
                      theme={theme}
                      fontSizeScale={fontSizeScale}
                    />
                  )}
                  {product.description.reason && (
                    <DescriptionRow
                      icon="shield-checkmark-outline"
                      color="#0031e8"
                      title="Lý do pass lại:"
                      text={product.description.reason}
                      theme={theme}
                      fontSizeScale={fontSizeScale}
                    />
                  )}
                  {product.description.pickupSchedule && (
                    <DescriptionRow
                      icon="time-outline"
                      color={theme.textSecondary}
                      title="Thời gian hẹn lấy đồ:"
                      text={product.description.pickupSchedule}
                      theme={theme}
                      fontSizeScale={fontSizeScale}
                    />
                  )}
                </>
              ) : (
                <Text style={[styles.rawDescriptionText, { color: theme.text }]}>
                  {product.description || 'Người bán chưa cung cấp thêm mô tả chi tiết.'}
                </Text>
              )}
            </View>
          </View>

          {/* ─── 5. Campus Pickup Location & Map Preview ──────────────────── */}
          <View style={styles.section}>
            <View style={styles.locationHeading}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                Điểm hẹn giao dịch Campus
              </Text>
              <Text style={[styles.campusName, { color: primaryColor }]}>
                {product.campus || 'FPT University'}
              </Text>
            </View>
            <View style={[styles.locationCard, { backgroundColor: theme.card }]}>
              <View
                style={[
                  styles.mapPlaceholder,
                  { backgroundColor: isDarkMode ? '#2a2b30' : '#e6edf5' },
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={52}
                  color={isDarkMode ? '#6c6f7b' : '#9bb0cb'}
                />
                <View style={[styles.locationPin, { backgroundColor: primaryColor }]}>
                  <Ionicons name="location" size={15} color="#ffffff" />
                  <Text style={styles.locationPinText}>
                    {product.location || 'Sảnh KTX Dom A'}
                  </Text>
                </View>
                <Text style={styles.mapLabel}>Khuôn viên FPT Campus</Text>
              </View>
              <View style={styles.locationDetails}>
                <Ionicons name="navigate-circle" size={22} color={primaryColor} />
                <View style={styles.flexText}>
                  <Text style={[styles.locationText, { color: theme.text }]}>
                    {product.location || 'Ký túc xá / Thư viện FPT'}
                  </Text>
                  <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                    Điểm hẹn công cộng thuận tiện, camera an ninh KTX
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── 6. Suggested Products ───────────────────────────────────── */}
          {suggested.length > 0 && (
            <View style={styles.section}>
              <View style={styles.recommendationHeading}>
                <Text
                  style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}
                >
                  Có thể bạn cũng thích
                </Text>
                <Text style={[styles.seeAll, { color: primaryColor }]}>
                  {suggested.length} sản phẩm
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendations}
              >
                {suggested.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.suggestedCard, { backgroundColor: theme.card }]}
                    onPress={() =>
                      navigation.push('ProductDetail', { productId: item.id, product: item })
                    }
                  >
                    <Image
                      source={{
                        uri:
                          Array.isArray(item.images) && item.images.length > 0
                            ? item.images[0]
                            : item.image ||
                              'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80',
                      }}
                      style={styles.suggestedImage}
                    />
                    <Text
                      numberOfLines={2}
                      style={[styles.suggestedTitle, { color: theme.text }]}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.suggestedPrice, { color: primaryColor }]}>
                      {item.priceDisplay || `${item.price?.toLocaleString('vi-VN')} ₫`}
                    </Text>
                    <View style={styles.suggestedLocation}>
                      <Ionicons name="location-outline" size={11} color={theme.textSecondary} />
                      <Text
                        numberOfLines={1}
                        style={[styles.secondaryText, { color: theme.textSecondary }]}
                      >
                        {item.location || 'Campus'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* ─── 7. Sticky Bottom Action Bar ──────────────────────────────── */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: theme.card, borderTopColor: theme.border },
          ]}
        >
          {/* Nút Yêu thích / Lưu */}
          <TouchableOpacity
            accessibilityLabel="Yêu thích"
            style={[styles.saveButton, { backgroundColor: theme.background }]}
            onPress={handleToggleLike}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#ba1a1a' : theme.text}
            />
            <Text style={[styles.bottomLabel, { color: isLiked ? '#ba1a1a' : theme.text }]}>
              {isLiked ? 'Đã lưu' : 'Lưu'}
            </Text>
          </TouchableOpacity>

          {/* Nút Chat */}
          <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={19} color="#0031e8" />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>

          {/* Nút ĐẶT HẸN */}
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: primaryColor }]}
            onPress={() => setAppointmentModalVisible(true)}
          >
            <View style={styles.orderLeft}>
              <Text style={styles.orderCaption}>Hẹn nhận tại {product.location || 'KTX'}</Text>
              <Text style={styles.orderPrice}>{displayPrice}</Text>
            </View>
            <View style={styles.orderAction}>
              <Text style={styles.orderActionText}>ĐẶT HẸN</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── MODAL 1: Đặt lịch hẹn nhận hàng ──────────────────────────── */}
        <Modal
          visible={isAppointmentModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAppointmentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="calendar" size={20} color={primaryColor} />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Đặt lịch hẹn nhận đồ Campus
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setAppointmentModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                Địa điểm: <Text style={{ fontWeight: '700', color: theme.text }}>{product.location || 'KTX Dom A'}</Text>
              </Text>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Chọn khung giờ bạn rảnh:</Text>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotOption,
                      {
                        borderColor: isSelected ? primaryColor : theme.border,
                        backgroundColor: isSelected
                          ? `${primaryColor}14`
                          : theme.background,
                      },
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? primaryColor : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.slotText,
                        { color: isSelected ? primaryColor : theme.text, fontWeight: isSelected ? '700' : '400' },
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[styles.inputLabel, { color: theme.text, marginTop: 12 }]}>
                Lời nhắn cho người bán (tùy chọn):
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="VD: Mình ở phòng 304, lúc nào đến thì ới mình nhé..."
                placeholderTextColor={theme.textSecondary}
                value={appointmentNote}
                onChangeText={setAppointmentNote}
                multiline
                numberOfLines={2}
              />

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: primaryColor }]}
                onPress={handleConfirmAppointment}
                disabled={submittingAppointment}
              >
                {submittingAppointment ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Xác nhận Đặt hẹn</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ─── MODAL 2: Thông tin liên hệ người bán ──────────────────────── */}
        <Modal
          visible={isContactModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setContactModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Ionicons name="call" size={20} color={primaryColor} />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Liên hệ người bán
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.contactProfile}>
                <Image source={{ uri: sellerAvatar }} style={styles.contactAvatar} />
                <Text style={[styles.contactName, { color: theme.text }]}>{sellerName}</Text>
                <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                  {sellerTag}
                </Text>
              </View>

              <View style={[styles.contactItem, { backgroundColor: theme.background }]}>
                <Ionicons name="call-outline" size={18} color={primaryColor} />
                <View style={styles.flexText}>
                  <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Điện thoại / Zalo</Text>
                  <Text style={[styles.contactValue, { color: theme.text }]}>
                    {seller.phone || '0912 345 678'}
                  </Text>
                </View>
              </View>

              <View style={[styles.contactItem, { backgroundColor: theme.background }]}>
                <Ionicons name="mail-outline" size={18} color="#0031e8" />
                <View style={styles.flexText}>
                  <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Email FPTU</Text>
                  <Text style={[styles.contactValue, { color: theme.text }]}>
                    {seller.email || 'quan.nm.k17@fpt.edu.vn'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: primaryColor, marginTop: 14 }]}
                onPress={() => setContactModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Tag({ text, background, color, icon }) {
  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      {icon ? <Ionicons name={icon} size={12} color={color} /> : null}
      <Text style={[styles.tagText, { color }]}>{text}</Text>
    </View>
  );
}

function RatingStat({ value, label, primaryColor, valueColor, theme }) {
  return (
    <View style={styles.ratingStat}>
      <View style={styles.ratingValueRow}>
        <Text style={[styles.ratingValue, { color: valueColor || primaryColor || theme.text }]}>
          {value}
        </Text>
        {primaryColor ? <Ionicons name="star" size={14} color={primaryColor} /> : null}
      </View>
      <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function DescriptionRow({ icon, color, title, text, theme, fontSizeScale }) {
  return (
    <View style={styles.descriptionRow}>
      <Ionicons name={icon} size={20} color={color} style={{ marginTop: 2 }} />
      <View style={styles.flexText}>
        <Text
          style={[styles.descriptionTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.descriptionText,
            { color: theme.textSecondary, fontSize: 13 * fontSizeScale },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

function SectionDivider({ theme }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageSection: {
    height: 320,
    position: 'relative',
  },
  productImage: {
    height: 320,
    resizeMode: 'cover',
  },
  imageIndicator: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  imageCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  activeDot: {
    width: 18,
    backgroundColor: '#ffffff',
  },
  inactiveDot: {
    width: 7,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  sliderArrow: {
    position: 'absolute',
    top: 140,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  sliderArrowLeft: {
    left: 12,
  },
  sliderArrowRight: {
    right: 12,
  },
  thumbnailSection: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  thumbnailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  thumbnailLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  thumbnailList: {
    gap: 10,
    paddingRight: 16,
  },
  thumbnailCard: {
    width: 76,
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  thumbnailBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  productIntro: {
    padding: 16,
    gap: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  price: {
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discount: {
    color: '#93000a',
    backgroundColor: '#ffdad6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  trustCard: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexText: {
    flex: 1,
  },
  trustTitle: {
    fontWeight: '700',
  },
  secondaryText: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  sellerCard: {
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sellerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sellerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerVerifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3351ff',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sellerName: {
    fontWeight: '700',
  },
  sellerTag: {
    color: '#002bcf',
    backgroundColor: '#dee0ff',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '700',
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sellerStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  ratingStat: {
    flex: 1,
    alignItems: 'center',
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  descriptionCard: {
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  descriptionTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  descriptionText: {
    lineHeight: 19,
  },
  rawDescriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  locationHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  campusName: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  locationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mapPlaceholder: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locationPin: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  locationPinText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  mapLabel: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recommendationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700',
  },
  recommendations: {
    gap: 12,
    paddingRight: 16,
  },
  suggestedCard: {
    width: 160,
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestedImage: {
    width: 160,
    height: 110,
    resizeMode: 'cover',
  },
  suggestedTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 8,
    marginTop: 6,
    lineHeight: 16,
  },
  suggestedPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 8,
    marginTop: 4,
  },
  suggestedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginHorizontal: 8,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 12,
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  chatButton: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#dee0ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chatText: {
    color: '#002bcf',
    fontSize: 13,
    fontWeight: '700',
  },
  orderButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderLeft: {
    flex: 1,
    marginRight: 6,
  },
  orderCaption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderPrice: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  orderAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  slotText: {
    fontSize: 13,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 50,
    marginBottom: 14,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  contactProfile: {
    alignItems: 'center',
    marginVertical: 12,
  },
  contactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
});
