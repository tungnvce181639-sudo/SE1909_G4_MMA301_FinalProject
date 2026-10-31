import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getProductById, getSuggestedProducts } from '../../services/api/productApi';
import { createOrder } from '../../services/api/orderApi';
import { notifyOrderEvent } from '../../services/api/notificationApi';
import { sendOrderNotification } from '../../services/notificationService';

export default function ProductDetailScreen({ navigation, route }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [isLiked, setIsLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const initialProduct = route?.params?.product || null;
  const productId = route?.params?.productId || initialProduct?.id || 'prf192-pro197';

  const [product, setProduct] = useState(initialProduct);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(!initialProduct);

  // Load fresh details and suggested products
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const fullData = await getProductById(productId);
        if (isMounted && fullData) {
          setProduct(fullData);
          const sug = getSuggestedProducts(productId, fullData.category);
          setSuggested(sug);
        }
      } catch (err) {
        console.warn('[ProductDetailScreen] loadData error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Safe normalized fields to completely eliminate runtime crashes
  const images =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : [
          product?.image ||
            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80',
        ];

  const seller =
    typeof product?.seller === 'object' && product?.seller !== null
      ? {
          name: product.seller.name || 'Sinh viên FPT',
          tag: product.seller.tag || 'Sinh viên',
          avatar:
            product.seller.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
          rating: product.seller.rating || '5.0',
          reviews: product.seller.reviews || '20 đánh giá',
          responseRate: product.seller.responseRate || '98%',
          responseTime: product.seller.responseTime || '~5 phút',
          verified: Boolean(product.seller.verified ?? product.verified),
        }
      : {
          name: product?.seller || 'Sinh viên FPT',
          tag: 'K17 SE',
          avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
          rating: '4.9',
          reviews: '38 đánh giá',
          responseRate: '98%',
          responseTime: '~5 phút',
          verified: Boolean(product?.verified),
        };

  const description =
    typeof product?.description === 'object' && product?.description !== null
      ? product.description
      : {
          conditionDetail:
            typeof product?.description === 'string'
              ? product.description
              : 'Sản phẩm chính chủ sinh viên FPT pass lại, tình trạng đúng như mô tả thực tế.',
          gift: 'Tặng kèm phụ kiện / tài liệu hỗ trợ môn học qua kỳ tại Hola.',
          reason: 'Đã hoàn thành môn học hoặc dư dùng pass lại cho tân sinh viên K18/K19.',
          pickupSchedule: 'Hẹn gặp trực tiếp tại sảnh KTX hoặc căn tin trường FPT.',
        };

  const title = product?.title || 'Chi tiết sản phẩm';
  const priceDisplay =
    product?.priceDisplay ||
    (typeof product?.price === 'number'
      ? product.price === 0
        ? '0 ₫ (Miễn phí)'
        : `${product.price.toLocaleString('vi-VN')} ₫`
      : product?.price || '95.000 ₫');
  const originalPrice = product?.originalPrice || '';
  const discount = product?.discount || '';
  const condition = product?.condition || product?.badge || 'Mới 95%';
  const category = product?.category || 'Giáo trình K18';
  const campus = product?.campus || 'FPT Hòa Lạc';
  const location = product?.location || 'KTX Dom A • Sảnh chính';

  // Share action
  const handleShare = async () => {
    try {
      await Share.share({
        title: title,
        message: `Xem món đồ "${title}" giá ${priceDisplay} trên SmartCampus Market (FPT Hòa Lạc)!`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  // Order appointment action
  const handleOrderAppointment = () => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đặt hẹn nhận đồ.');
      return;
    }

    const userId = user.uid || user.firebaseUid || user._id;
    if (product?.seller?.uid && product.seller.uid === userId) {
      Alert.alert('Không thể đặt mua', 'Bạn không thể đặt mua tin đăng của chính mình.');
      return;
    }

    Alert.alert(
      'Đặt hẹn nhận đồ',
      `Bạn có chắc chắn muốn đặt hẹn nhận "${title}" tại ${location}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận hẹn',
          onPress: async () => {
            try {
              const order = await createOrder({
                product: { ...product, id: product?.id || productId },
                buyer: user,
                sellerId: product?.seller?.uid,
              });
              let pushMessage = '';
              try {
                const pushResult = await notifyOrderEvent(order.id, 'created');
                if (!pushResult?.sent) {
                  pushMessage = ' Người bán chưa đăng ký Push nên có thể chưa nhận được thông báo.';
                }
              } catch (notificationError) {
                console.warn('[ProductDetailScreen] Could not send seller push notification:', notificationError);
                pushMessage = ' Chưa gửi được Push cho người bán; bạn vẫn có thể theo dõi trạng thái trong ứng dụng.';
              }
              try {
                await sendOrderNotification('Đã gửi yêu cầu đặt hẹn', `${title} - Người bán sẽ sớm phản hồi.`);
              } catch (notificationError) {
                console.warn('[ProductDetailScreen] Could not show order notification:', notificationError);
              }
              Alert.alert(
                'Đã gửi yêu cầu',
                `Yêu cầu đặt hẹn đã được lưu.${pushMessage} Bạn có thể theo dõi trạng thái trong Lịch sử đơn hàng.`,
                [
                  {
                    text: 'Xem đơn hàng',
                    onPress: () => navigation.navigate('MainTabs', { screen: 'Orders' }),
                  },
                  { text: 'Ở lại', style: 'cancel' },
                ],
              );
              return order;
            } catch (error) {
              console.error('[ProductDetailScreen] Could not create order:', error);
              Alert.alert('Không thể đặt hẹn', error.message || 'Vui lòng kiểm tra kết nối rồi thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.screen}>
        {/* Floating Custom Header over Hero image */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Quay lại"
            style={[styles.headerButton, { backgroundColor: `${theme.card}f0` }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={21} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: `${theme.card}f0` }]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerAvatar, { backgroundColor: primaryColor }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
            >
              <Ionicons name="person" size={17} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Product Image Slider */}
          <View style={[styles.imageSection, { backgroundColor: theme.border }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                );
                setActiveImage(index);
              }}
            >
              {images.map((imgUri, index) => (
                <Image key={`${imgUri}-${index}`} source={{ uri: imgUri }} style={[styles.productImage, { width }]} />
              ))}
            </ScrollView>
            <View style={styles.imageIndicator}>
              <Text style={styles.imageCount}>
                {activeImage + 1}/{images.length}
              </Text>
            </View>
            <View style={styles.dots}>
              {images.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[styles.dot, index === activeImage ? styles.activeDot : styles.inactiveDot]}
                />
              ))}
            </View>
          </View>

          {/* Product Intro */}
          <View style={styles.productIntro}>
            <View style={styles.tagRow}>
              <Tag text={category} background="#ffdbcc" color="#531e00" />
              <Tag text="Đã thẩm định AI" background="#c7f8ea" color="#002018" icon="shield-checkmark" />
              <Tag text={condition} background={theme.border} color={theme.textSecondary} />
            </View>
            <Text style={[styles.title, { color: theme.text, fontSize: 22 * fontSizeScale }]}>{title}</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: primaryColor, fontSize: 28 * fontSizeScale }]}>{priceDisplay}</Text>
              {Boolean(originalPrice) && (
                <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>{originalPrice}</Text>
              )}
              {Boolean(discount) && <Text style={styles.discount}>{discount}</Text>}
            </View>
            <View style={[styles.trustCard, { backgroundColor: theme.card }]}>
              <View style={[styles.trustIcon, { backgroundColor: '#dee0ff' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#0031e8" />
              </View>
              <View style={styles.flexText}>
                <Text style={[styles.trustTitle, { color: theme.text, fontSize: 13.5 * fontSizeScale }]}>
                  Bảo chứng giao dịch Campus P2P
                </Text>
                <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                  KTX 0đ Ship • Đồng kiểm trực tiếp trước khi nhận đồ
                </Text>
              </View>
            </View>
          </View>

          <SectionDivider theme={theme} />

          {/* Seller Card */}
          <View style={styles.section}>
            <View style={[styles.sellerCard, { backgroundColor: theme.card }]}>
              <View style={styles.sellerTop}>
                <View style={styles.sellerInfo}>
                  <View>
                    <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
                    {seller.verified && (
                      <View style={styles.sellerVerified}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <View style={styles.flexText}>
                    <View style={styles.sellerNameRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.sellerName, { color: theme.text, fontSize: 14 * fontSizeScale }]}
                      >
                        {seller.name}
                      </Text>
                      <Text style={styles.sellerTag}>{seller.tag}</Text>
                    </View>
                    <View style={styles.sellerMeta}>
                      <Ionicons name="school-outline" size={14} color={primaryColor} />
                      <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                        Đã xác minh FPT-ID (@fpt.edu.vn)
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.shopButton, { backgroundColor: theme.background }]}
                  onPress={() => Alert.alert('Thông tin người bán', `Đã tham gia Chợ Sinh Viên FPT\nLiên hệ: ${seller.name}`)}
                >
                  <Text style={[styles.shopButtonText, { color: theme.text }]}>Xem Shop</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.sellerStats, { borderTopColor: theme.border }]}>
                <RatingStat value={seller.rating} label={seller.reviews} primaryColor={primaryColor} theme={theme} />
                <RatingStat value={seller.responseRate} label="Tỷ lệ phản hồi" theme={theme} />
                <RatingStat value={seller.responseTime} label="Phản hồi nhanh" valueColor="#006b55" theme={theme} />
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
              Mô tả chi tiết sản phẩm
            </Text>
            <View style={[styles.descriptionCard, { backgroundColor: theme.card }]}>
              <DescriptionRow
                icon="book-outline"
                color="#006b55"
                title="Tình trạng thực tế:"
                text={description.conditionDetail || 'Sản phẩm nguyên vẹn, sử dụng rất tốt.'}
                theme={theme}
                fontSizeScale={fontSizeScale}
              />
              <DescriptionRow
                icon="folder-open-outline"
                color={primaryColor}
                title="Quà tặng / Ưu đãi kèm theo:"
                text={description.gift || 'Hỗ trợ giao dịch trực tiếp trong ngày.'}
                theme={theme}
                fontSizeScale={fontSizeScale}
              />
              <DescriptionRow
                icon="shield-checkmark-outline"
                color="#0031e8"
                title="Lý do nhượng lại:"
                text={description.reason || 'Dư dùng pass lại cho các bạn sinh viên cần.'}
                theme={theme}
                fontSizeScale={fontSizeScale}
              />
              <DescriptionRow
                icon="time-outline"
                color={theme.textSecondary}
                title="Thời gian rảnh nhận đồ:"
                text={description.pickupSchedule || 'Sau giờ học các ngày trong tuần hoặc cuối tuần.'}
                theme={theme}
                fontSizeScale={fontSizeScale}
              />
            </View>
          </View>

          {/* Location / Campus Section */}
          <View style={styles.section}>
            <View style={styles.locationHeading}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                Điểm hẹn nhận hàng trên Campus
              </Text>
              <Text style={[styles.campusName, { color: primaryColor }]}>{campus}</Text>
            </View>
            <View style={[styles.locationCard, { backgroundColor: theme.card }]}>
              <View style={[styles.mapPlaceholder, { backgroundColor: isDarkMode ? '#303238' : '#dfe8dc' }]}>
                <Ionicons name="map-outline" size={54} color={isDarkMode ? '#777a84' : '#93ad8d'} />
                <View style={[styles.locationPin, { backgroundColor: primaryColor }]}>
                  <Ionicons name="location" size={15} color="#ffffff" />
                  <Text style={styles.locationPinText}>{location}</Text>
                </View>
                <Text style={styles.mapLabel}>Bản đồ FPT Hola Campus</Text>
              </View>
              <View style={styles.locationDetails}>
                <Ionicons name="location-outline" size={20} color={primaryColor} />
                <Text style={[styles.locationText, { color: theme.text }]}>
                  FPT University Hòa Lạc, Thạch Thất, Hà Nội
                </Text>
              </View>
            </View>
          </View>

          {/* Suggested Products (Có thể bạn cũng thích) */}
          <View style={styles.section}>
            <View style={styles.recommendationHeading}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                Có thể bạn cũng thích
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
                <Text style={[styles.seeAll, { color: primaryColor }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
              {suggested.map((item) => {
                const sugImg =
                  (Array.isArray(item.images) && item.images[0]) ||
                  item.image ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80';
                const sugPrice =
                  item.priceDisplay ||
                  (typeof item.price === 'number'
                    ? item.price === 0
                      ? '0 ₫'
                      : `${item.price.toLocaleString('vi-VN')} ₫`
                    : item.price);

                return (
                  <TouchableOpacity
                    key={item.id || item.title}
                    activeOpacity={0.85}
                    style={[styles.suggestedCard, { backgroundColor: theme.card }]}
                    onPress={() => navigation.push('ProductDetail', { productId: item.id, product: item })}
                  >
                    <View>
                      <Image source={{ uri: sugImg }} style={styles.suggestedImage} />
                      <Text style={[styles.suggestedBadge, { backgroundColor: theme.card, color: theme.text }]}>
                        {item.badge || item.condition || 'Mới'}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={[styles.suggestedTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.suggestedPrice, { color: primaryColor }]}>{sugPrice}</Text>
                    <View style={styles.suggestedLocation}>
                      <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
                      <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                        {item.location || 'Campus'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            accessibilityLabel="Yêu thích"
            style={[styles.saveButton, { backgroundColor: theme.background }]}
            onPress={() => setIsLiked((value) => !value)}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#ba1a1a' : theme.text} />
            <Text style={[styles.bottomLabel, { color: isLiked ? '#ba1a1a' : theme.text }]}>
              {isLiked ? 'Đã lưu' : 'Lưu'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('AIChatbot', { productTitle: title })}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0031e8" />
            <Text style={styles.chatText}>Chat AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: primaryColor }]}
            onPress={handleOrderAppointment}
            activeOpacity={0.9}
          >
            <View>
              <Text style={styles.orderCaption}>Hẹn nhận tại {location.split('•')[0].trim() || 'Campus'}</Text>
              <Text style={styles.orderPrice}>{priceDisplay}</Text>
            </View>
            <View style={styles.orderAction}>
              <Text style={styles.orderActionText}>ĐẶT HẸN</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Tag({ text, background, color, icon }) {
  if (!text) return null;
  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      {icon ? <Ionicons name={icon} size={13} color={color} /> : null}
      <Text style={[styles.tagText, { color }]}>{text}</Text>
    </View>
  );
}

function RatingStat({ value, label, primaryColor, valueColor, theme }) {
  return (
    <View style={styles.ratingStat}>
      <View style={styles.ratingValueRow}>
        <Text style={[styles.ratingValue, { color: valueColor || primaryColor || theme.text }]}>{value}</Text>
        {primaryColor ? <Ionicons name="star" size={15} color={primaryColor} /> : null}
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
        <Text style={[styles.descriptionTitle, { color: theme.text, fontSize: 13.5 * fontSizeScale }]}>{title}</Text>
        <Text style={[styles.descriptionText, { color: theme.textSecondary, fontSize: 13 * fontSizeScale }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

function SectionDivider({ theme }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 110 },
  imageSection: { height: 300, position: 'relative' },
  productImage: { height: 300, resizeMode: 'cover' },
  imageIndicator: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  imageCount: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
  activeDot: { width: 18, backgroundColor: '#ffffff' },
  inactiveDot: { width: 6, backgroundColor: 'rgba(255,255,255,0.55)' },
  productIntro: { padding: 16, gap: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 10, fontWeight: '700' },
  title: { fontWeight: '700', lineHeight: 28 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  price: { fontWeight: '700' },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  discount: { color: '#93000a', backgroundColor: '#ffdad6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  trustCard: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  trustIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flexText: { flex: 1 },
  trustTitle: { fontWeight: '600' },
  secondaryText: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginHorizontal: 16 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sellerCard: { padding: 16, borderRadius: 14, elevation: 1 },
  sellerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sellerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24 },
  sellerVerified: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3351ff',
  },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sellerName: { fontWeight: '600', flexShrink: 1 },
  sellerTag: { color: '#002bcf', backgroundColor: '#dee0ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, fontSize: 10, fontWeight: '700' },
  sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopButton: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  shopButtonText: { fontSize: 12, fontWeight: '600' },
  sellerStats: { flexDirection: 'row', borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  ratingStat: { flex: 1, alignItems: 'center' },
  ratingValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingValue: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },
  descriptionCard: { padding: 16, borderRadius: 14, gap: 14, elevation: 1 },
  descriptionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  descriptionTitle: { fontWeight: '700', marginBottom: 2 },
  descriptionText: { lineHeight: 19 },
  locationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  campusName: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  locationCard: { borderRadius: 14, overflow: 'hidden', elevation: 1 },
  mapPlaceholder: { height: 168, alignItems: 'center', justifyContent: 'center' },
  locationPin: {
    position: 'absolute',
    top: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  locationPinText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  mapLabel: {
    position: 'absolute',
    left: 9,
    bottom: 8,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 10,
  },
  locationDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  locationText: { fontSize: 13, fontWeight: '600' },
  recommendationHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  seeAll: { fontSize: 12, fontWeight: '700' },
  recommendations: { gap: 12 },
  suggestedCard: { width: 170, borderRadius: 14, overflow: 'hidden', paddingBottom: 10, elevation: 1 },
  suggestedImage: { width: 170, height: 120, resizeMode: 'cover' },
  suggestedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '700',
  },
  suggestedTitle: { fontSize: 12, fontWeight: '600', marginHorizontal: 10, marginTop: 8 },
  suggestedPrice: { fontSize: 14, fontWeight: '700', marginHorizontal: 10, marginTop: 4 },
  suggestedLocation: { flexDirection: 'row', alignItems: 'center', gap: 2, marginHorizontal: 10, marginTop: 3 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 10,
  },
  saveButton: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottomLabel: { fontSize: 9, marginTop: 2 },
  chatButton: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: '#dee0ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chatText: { color: '#002bcf', fontSize: 13, fontWeight: '700' },
  orderButton: {
    flex: 1,
    minWidth: 0,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderCaption: { color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  orderPrice: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 1 },
  orderAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderActionText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
