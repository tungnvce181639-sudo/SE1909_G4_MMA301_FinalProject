import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const products = {
  'prf192-pro197': {
    title: 'Combo Giáo trình Kỹ thuật phần mềm K18 (PRF192 + PRO197) - Kèm Source Code Lab & Note A+',
    price: '95.000 ₫',
    originalPrice: '320.000 ₫',
    discount: '-70%',
    category: 'Giáo trình K18',
    condition: 'Mới 95%',
    seller: 'Nguyễn Minh Quân',
    sellerTag: 'K17 SE',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80',
    rating: '4.9',
    reviews: '38 đánh giá',
    responseRate: '98%',
    responseTime: '~5 phút',
    location: 'Dom A sảnh chính',
    campus: 'Hòa Lạc',
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1000&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80',
    ],
  },
};

const suggestedProducts = [
  { title: 'Sách Toán Rời Rạc MAD101', price: '45.000 ₫', badge: 'Mới 90%', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80' },
  { title: 'Chuột Logitech M331 Silent', price: '120.000 ₫', badge: 'Like New', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80' },
  { title: 'Quạt sạc mini KTX tích điện', price: '50.000 ₫', badge: 'Dùng tốt', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&q=80' },
];

export default function ProductDetailScreen({ navigation, route }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { width } = useWindowDimensions();
  const [isLiked, setIsLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const productId = route?.params?.productId || 'prf192-pro197';
  const product = products[productId] || products['prf192-pro197'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            style={[styles.headerButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.card }]}>
              <Ionicons name="share-social-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.headerAvatar, { backgroundColor: primaryColor }]}>
              <Ionicons name="person" size={17} color="#ffffff" />
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.imageSection, { backgroundColor: theme.border }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                setActiveImage(index);
              }}
            >
              {product.images.map((image) => (
                <Image key={image} source={{ uri: image }} style={[styles.productImage, { width }]} />
              ))}
            </ScrollView>
            <View style={styles.imageIndicator}>
              <Text style={styles.imageCount}>{activeImage + 1}/{product.images.length}</Text>
            </View>
            <View style={styles.dots}>
              {product.images.map((image, index) => (
                <View key={image} style={[styles.dot, index === activeImage ? styles.activeDot : styles.inactiveDot]} />
              ))}
            </View>
          </View>

          <View style={styles.productIntro}>
            <View style={styles.tagRow}>
              <Tag text={product.category} background="#ffdbcc" color="#531e00" />
              <Tag text="Đã thẩm định AI" background="#c7f8ea" color="#002018" icon="shield-checkmark" />
              <Tag text={product.condition} background={theme.border} color={theme.textSecondary} />
            </View>
            <Text style={[styles.title, { color: theme.text, fontSize: 24 * fontSizeScale }]}>
              {product.title}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: primaryColor, fontSize: 30 * fontSizeScale }]}>{product.price}</Text>
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>{product.originalPrice}</Text>
              <Text style={styles.discount}>{product.discount}</Text>
            </View>
            <View style={[styles.trustCard, { backgroundColor: theme.background }]}>
              <View style={[styles.trustIcon, { backgroundColor: '#dee0ff' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#0031e8" />
              </View>
              <View style={styles.flexText}>
                <Text style={[styles.trustTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>Bảo chứng giao dịch Campus P2P</Text>
                <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>KTX 0đ Ship • Đồng kiểm trực tiếp trước khi nhận sách</Text>
              </View>
            </View>
          </View>

          <SectionDivider theme={theme} />

          <View style={styles.section}>
            <View style={[styles.sellerCard, { backgroundColor: theme.card }]}>
              <View style={styles.sellerTop}>
                <View style={styles.sellerInfo}>
                  <View>
                    <Image source={{ uri: product.sellerAvatar }} style={styles.sellerAvatar} />
                    <View style={styles.sellerVerified}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                  </View>
                  <View style={styles.flexText}>
                    <View style={styles.sellerNameRow}>
                      <Text numberOfLines={1} style={[styles.sellerName, { color: theme.text, fontSize: 14 * fontSizeScale }]}>{product.seller}</Text>
                      <Text style={styles.sellerTag}>{product.sellerTag}</Text>
                    </View>
                    <View style={styles.sellerMeta}>
                      <Ionicons name="school-outline" size={14} color={primaryColor} />
                      <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Đã xác minh FPT-ID (@fpt.edu.vn)</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={[styles.shopButton, { backgroundColor: theme.background }]}>
                  <Text style={[styles.shopButtonText, { color: theme.text }]}>Xem Shop</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.sellerStats, { borderTopColor: theme.border }]}>
                <RatingStat value={product.rating} label={product.reviews} primaryColor={primaryColor} theme={theme} />
                <RatingStat value={product.responseRate} label="Tỷ lệ phản hồi" theme={theme} />
                <RatingStat value={product.responseTime} label="Phản hồi nhanh" valueColor="#006b55" theme={theme} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Mô tả chi tiết sản phẩm</Text>
            <View style={[styles.descriptionCard, { backgroundColor: theme.card }]}>
              <DescriptionRow icon="book-outline" color="#006b55" title="Tình trạng sách thực tế:" text="Bộ sách gồm 2 cuốn PRF192 và PRO197 được bọc plastic cẩn thận, không quăn góc, không gạch xóa bẩn. Highlight các tips thi PE/FE quan trọng chuẩn kỳ." theme={theme} fontSizeScale={fontSizeScale} />
              <DescriptionRow icon="folder-open-outline" color={primaryColor} title="Quà tặng kèm theo combo:" text="Tặng kèm QR drive riêng truy cập full source code 10 bài Lab Java OOP, các mini-project mẫu C Programming và bộ đề ôn tập thực hành thi qua môn 100%." theme={theme} fontSizeScale={fontSizeScale} />
              <DescriptionRow icon="shield-checkmark-outline" color="#0031e8" title="Lý do nhượng lại:" text="Đã pass môn A+ kỳ Spring 2024, hiện chuẩn bị làm thủ tục đi OJT thực tập doanh nghiệp nên pass lại rẻ cho các em tân sinh viên K18/K19." theme={theme} fontSizeScale={fontSizeScale} />
              <DescriptionRow icon="time-outline" color={theme.textSecondary} title="Thời gian rảnh nhận sách:" text="Sau 17h30 các ngày trong tuần hoặc cả ngày Thứ 7 & Chủ nhật." theme={theme} fontSizeScale={fontSizeScale} />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.locationHeading}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Điểm hẹn nhận hàng trên Campus</Text>
              <Text style={[styles.campusName, { color: primaryColor }]}>{product.campus}</Text>
            </View>
            <View style={[styles.locationCard, { backgroundColor: theme.card }]}>
              <View style={[styles.mapPlaceholder, { backgroundColor: isDarkMode ? '#303238' : '#dfe8dc' }]}>
                <Ionicons name="map-outline" size={58} color={isDarkMode ? '#777a84' : '#93ad8d'} />
                <View style={[styles.locationPin, { backgroundColor: primaryColor }]}>
                  <Ionicons name="location" size={16} color="#ffffff" />
                  <Text style={styles.locationPinText}>{product.location}</Text>
                </View>
                <Text style={styles.mapLabel}>Bản đồ FPT Hola Campus</Text>
              </View>
              <View style={styles.locationDetails}>
                <Ionicons name="location-outline" size={20} color={primaryColor} />
                <Text style={[styles.locationText, { color: theme.text }]}>FPT University Hòa Lạc, Hà Nội</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.recommendationHeading}>
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Có thể bạn cũng thích</Text>
              <TouchableOpacity><Text style={[styles.seeAll, { color: primaryColor }]}>Xem tất cả (5)</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
              {suggestedProducts.map((item) => (
                <TouchableOpacity key={item.title} style={[styles.suggestedCard, { backgroundColor: theme.card }]}>
                  <View>
                    <Image source={{ uri: item.image }} style={styles.suggestedImage} />
                    <Text style={[styles.suggestedBadge, { backgroundColor: theme.card, color: theme.text }]}>{item.badge}</Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.suggestedTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.suggestedPrice, { color: primaryColor }]}>{item.price}</Text>
                  <View style={styles.suggestedLocation}><Ionicons name="location-outline" size={12} color={theme.textSecondary} /><Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Dom A</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            accessibilityLabel="Yêu thích"
            style={[styles.saveButton, { backgroundColor: theme.background }]}
            onPress={() => setIsLiked((value) => !value)}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#ba1a1a' : theme.text} />
            <Text style={[styles.bottomLabel, { color: isLiked ? '#ba1a1a' : theme.text }]}>Lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('AIChatbot')}>
            <Ionicons name="chatbubble-outline" size={20} color="#0031e8" />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.orderButton, { backgroundColor: primaryColor }]} onPress={() => navigation.navigate('OrderHistory')}>
            <View>
              <Text style={styles.orderCaption}>Hẹn nhận tại Dom A</Text>
              <Text style={styles.orderPrice}>{product.price}</Text>
            </View>
            <View style={styles.orderAction}><Text style={styles.orderActionText}>ĐẶT HẸN</Text><Ionicons name="arrow-forward" size={18} color="#ffffff" /></View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Tag({ text, background, color, icon }) {
  return <View style={[styles.tag, { backgroundColor: background }]}>{icon ? <Ionicons name={icon} size={13} color={color} /> : null}<Text style={[styles.tagText, { color }]}>{text}</Text></View>;
}

function RatingStat({ value, label, primaryColor, valueColor, theme }) {
  return <View style={styles.ratingStat}><View style={styles.ratingValueRow}><Text style={[styles.ratingValue, { color: valueColor || primaryColor || theme.text }]}>{value}</Text>{primaryColor ? <Ionicons name="star" size={15} color={primaryColor} /> : null}</View><Text style={[styles.secondaryText, { color: theme.textSecondary }]}>{label}</Text></View>;
}

function DescriptionRow({ icon, color, title, text, theme, fontSizeScale }) {
  return <View style={styles.descriptionRow}><Ionicons name={icon} size={21} color={color} /><View style={styles.flexText}><Text style={[styles.descriptionTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>{title}</Text><Text style={[styles.descriptionText, { color: theme.textSecondary, fontSize: 14 * fontSizeScale }]}>{text}</Text></View></View>;
}

function SectionDivider({ theme }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  header: { position: 'absolute', top: 8, left: 16, right: 16, zIndex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 100 },
  imageSection: { height: 300, position: 'relative' },
  productImage: { height: 300, resizeMode: 'cover' },
  imageIndicator: { position: 'absolute', right: 14, bottom: 14, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)' },
  imageCount: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { height: 7, borderRadius: 4 },
  activeDot: { width: 18, backgroundColor: '#ffffff' },
  inactiveDot: { width: 7, backgroundColor: 'rgba(255,255,255,0.55)' },
  productIntro: { padding: 16, gap: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { borderRadius: 14, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 10, fontWeight: '700' },
  title: { fontWeight: '700', lineHeight: 31 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  price: { fontWeight: '700' },
  originalPrice: { fontSize: 14, textDecorationLine: 'line-through' },
  discount: { color: '#93000a', backgroundColor: '#ffdad6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, fontSize: 11, fontWeight: '700' },
  trustCard: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  flexText: { flex: 1 },
  trustTitle: { fontWeight: '600' },
  secondaryText: { fontSize: 12, lineHeight: 18 },
  divider: { height: 1, marginHorizontal: 16 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sellerCard: { padding: 16, borderRadius: 12, elevation: 1 },
  sellerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sellerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24 },
  sellerVerified: { position: 'absolute', right: -2, bottom: -2, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3351ff' },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sellerName: { fontWeight: '600', flexShrink: 1 },
  sellerTag: { color: '#002bcf', backgroundColor: '#dee0ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, fontSize: 10, fontWeight: '700' },
  sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopButton: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  shopButtonText: { fontSize: 12, fontWeight: '600' },
  sellerStats: { flexDirection: 'row', borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  ratingStat: { flex: 1, alignItems: 'center' },
  ratingValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingValue: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontWeight: '600', marginBottom: 10 },
  descriptionCard: { padding: 16, borderRadius: 12, gap: 16, elevation: 1 },
  descriptionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  descriptionTitle: { fontWeight: '700', marginBottom: 3 },
  descriptionText: { lineHeight: 21 },
  locationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  campusName: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  locationCard: { borderRadius: 12, overflow: 'hidden', elevation: 1 },
  mapPlaceholder: { height: 176, alignItems: 'center', justifyContent: 'center' },
  locationPin: { position: 'absolute', top: 62, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  locationPinText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  mapLabel: { position: 'absolute', left: 9, bottom: 8, color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, fontSize: 10 },
  locationDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  locationText: { fontSize: 13, fontWeight: '600' },
  recommendationHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontSize: 12, fontWeight: '700' },
  recommendations: { gap: 12 },
  suggestedCard: { width: 176, borderRadius: 12, overflow: 'hidden', paddingBottom: 10, elevation: 1 },
  suggestedImage: { width: 176, height: 128, resizeMode: 'cover' },
  suggestedBadge: { position: 'absolute', top: 8, left: 8, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, fontSize: 10, fontWeight: '700' },
  suggestedTitle: { fontSize: 12, fontWeight: '600', marginHorizontal: 10, marginTop: 9 },
  suggestedPrice: { fontSize: 14, fontWeight: '700', marginHorizontal: 10, marginTop: 4 },
  suggestedLocation: { flexDirection: 'row', alignItems: 'center', gap: 2, marginHorizontal: 10, marginTop: 3 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 10 },
  saveButton: { width: 52, height: 52, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bottomLabel: { fontSize: 10, marginTop: 2 },
  chatButton: { height: 52, borderRadius: 11, paddingHorizontal: 13, backgroundColor: '#dee0ff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  chatText: { color: '#002bcf', fontSize: 13, fontWeight: '600' },
  orderButton: { flex: 1, minWidth: 0, height: 52, borderRadius: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderCaption: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  orderPrice: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  orderAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderActionText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
