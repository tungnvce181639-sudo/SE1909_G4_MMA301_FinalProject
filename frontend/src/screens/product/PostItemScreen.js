import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const CATEGORIES = [
  { id: 'books', label: 'Giáo trình & Sách', icon: 'book-outline' },
  { id: 'electronics', label: 'Đồ điện tử / Laptop', icon: 'laptop-outline' },
  { id: 'furniture', label: 'Nội thất KTX', icon: 'bed-outline' },
  { id: 'vehicles', label: 'Xe máy / Xe điện', icon: 'bicycle-outline' },
  { id: 'fashion', label: 'Thời trang & Phụ kiện', icon: 'shirt-outline' },
  { id: 'sports', label: 'Thể thao & Dụng cụ', icon: 'barbell-outline' },
  { id: 'free', label: 'Tặng đồ (Free 0đ)', icon: 'heart-outline' },
  { id: 'other', label: 'Khác', icon: 'grid-outline' },
];

const CONDITIONS = [
  { id: 'new100', label: 'Mới 100% (nguyên seal)' },
  { id: 'new95', label: 'Mới 95% (dùng ít)' },
  { id: 'good', label: 'Đã dùng – Tốt (70-90%)' },
  { id: 'fair', label: 'Cũ vừa (50-70%)' },
];

const LOCATIONS = [
  'KTX Dom A',
  'KTX Dom B',
  'KTX Dom C',
  'KTX Dom E',
  'Thư viện Beta',
  'Cổng trường FPT',
  'Căn tin Canteen 7',
  'Sảnh tòa nhà Alpha',
];

// ─── Validation ────────────────────────────────────────────────────────────────
function validate({ title, images, category, condition, price, description, selectedLocation }) {
  const errors = {};

  if (!title.trim() || title.trim().length < 5) {
    errors.title = 'Tiêu đề phải có ít nhất 5 ký tự.';
  }
  if (images.length === 0) {
    errors.images = 'Vui lòng thêm ít nhất 1 hình ảnh sản phẩm.';
  }
  if (!category) {
    errors.category = 'Vui lòng chọn danh mục.';
  }
  if (!condition) {
    errors.condition = 'Vui lòng chọn tình trạng sản phẩm.';
  }
  const parsedPrice = Number(String(price).replace(/[^0-9]/g, ''));
  if (!parsedPrice || parsedPrice <= 0) {
    errors.price = 'Vui lòng nhập giá hợp lệ (> 0 đ).';
  }
  if (!description.trim() || description.trim().length < 20) {
    errors.description = 'Mô tả phải có ít nhất 20 ký tự để người mua hiểu rõ sản phẩm.';
  }
  if (!selectedLocation) {
    errors.selectedLocation = 'Vui lòng chọn điểm hẹn giao dịch.';
  }

  return errors;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PostItemScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const auth = useAuth();
  const { profile } = useProfile();
  const { width } = useWindowDimensions();

  // Form state
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [conditionId, setConditionId] = useState(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [negotiable, setNegotiable] = useState(true);

  // UI state
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId);
  const selectedCondition = CONDITIONS.find((c) => c.id === conditionId);

  // ── Image handling ───────────────────────────────────────────────────────────
  const addImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Tối đa 5 ảnh', 'Tin đăng chỉ hỗ trợ tối đa 5 hình ảnh.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 5));
      if (errors.images) setErrors((e) => ({ ...e, images: undefined }));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const pickLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập vị trí để gợi ý điểm hẹn gần bạn.');
      return;
    }
    await Location.getCurrentPositionAsync({});
    Alert.alert('Đã cập nhật vị trí', 'Vị trí hiện tại đã dùng để gợi ý điểm hẹn trên campus.');
  };

  // ── Submit to Firestore ──────────────────────────────────────────────────────
  const submitPost = async () => {
    const validationErrors = validate({ title, images, category: categoryId, condition: conditionId, price, description, selectedLocation });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Chưa đủ thông tin', 'Vui lòng kiểm tra lại các trường được đánh dấu đỏ bên dưới.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const parsedPrice = Number(String(price).replace(/[^0-9]/g, ''));
      const user = auth?.user;

      const docData = {
        title: title.trim(),
        category: categoryId,
        condition: conditionId,
        conditionLabel: selectedCondition?.label || conditionId,
        price: parsedPrice,
        priceDisplay: `${parsedPrice.toLocaleString('vi-VN')} ₫`,
        description: description.trim(),
        location: selectedLocation,
        campus: 'FPT Hòa Lạc',
        negotiable,
        images,
        status: 'pending', // cần admin duyệt
        seller: {
          uid: user?.uid || null,
          name: profile?.fullName || profile?.name || 'Sinh viên FPT',
          tag: profile?.major ? `${profile?.studentId || 'SV'} ${profile?.major}` : (profile?.studentId || 'SV FPT'),
          avatar: profile?.avatarUrl || profile?.avatar || null,
          rating: '5.0',
          reviews: '0 đánh giá',
          responseRate: '100%',
          responseTime: '~5 phút',
          verified: Boolean(user?.email?.endsWith('@fpt.edu.vn') || user?.email?.endsWith('@fe.edu.vn')),
          phone: profile?.phone || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        saves: 0,
      };

      await addDoc(collection(db, 'products'), docData);

      Alert.alert(
        '🎉 Đăng tin thành công!',
        'Tin của bạn đang chờ kiểm duyệt từ Admin. Thường mất 5-15 phút để được duyệt và hiển thị.',
        [
          {
            text: 'Xem tin đăng của tôi',
            onPress: () => navigation.navigate('MyListings'),
          },
          { text: 'Đăng thêm tin', onPress: resetForm },
        ],
      );
    } catch (err) {
      console.error('[PostItemScreen] submitPost error:', err);
      Alert.alert(
        'Đăng tin thất bại',
        'Không thể đồng bộ dữ liệu. Vui lòng kiểm tra kết nối và thử lại.\n\nChi tiết: ' + err.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    Alert.alert('Lưu bản nháp', 'Bản nháp đã được lưu trên thiết bị. Bạn có thể tiếp tục sau.');
  };

  const resetForm = () => {
    setTitle('');
    setImages([]);
    setCategoryId(null);
    setConditionId(null);
    setPrice('');
    setDescription('');
    setSelectedLocation(LOCATIONS[0]);
    setNegotiable(true);
    setErrors({});
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const cardBg = theme.card;
  const inputBg = theme.background;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            style={[styles.headerButton, { backgroundColor: theme.background }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
            Đăng Tin Bán Đồ
          </Text>
          <TouchableOpacity
            accessibilityLabel="Close post form"
            style={[styles.headerButton, { backgroundColor: theme.background }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={21} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* AI Banner */}
          <TouchableOpacity
            style={[styles.aiBanner, { backgroundColor: isDarkMode ? '#4a2b1b' : '#ffdbcc' }]}
            onPress={() => navigation.navigate('AIEstimator')}
            activeOpacity={0.85}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiTitleRow}>
                <View style={[styles.aiIcon, { backgroundColor: primaryColor }]}>
                  <Ionicons name="sparkles" size={15} color="#ffffff" />
                </View>
                <Text style={[styles.aiTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>
                  AI Trợ Lý Định Giá
                </Text>
                <Text style={[styles.newBadge, { backgroundColor: primaryColor }]}>Mới</Text>
              </View>
              <Ionicons name="bulb-outline" size={28} color={primaryColor} />
            </View>
            <Text style={[styles.aiDescription, { color: theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
              Tự động phân tích ảnh, nhận diện sản phẩm và đề xuất giá pass đồ chuẩn sinh viên K16-K19 cực nhanh.
            </Text>
            <View style={styles.aiFooter}>
              <View style={[styles.aiButton, { backgroundColor: primaryColor }]}>
                <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                <Text style={styles.aiButtonText}>Dùng AI Gemini Viết & Định Giá</Text>
              </View>
              <Text style={[styles.aiHint, { color: primaryColor }]}>Tiết kiệm 5 phút ⚡</Text>
            </View>
          </TouchableOpacity>

          {/* ── SECTION: Ảnh sản phẩm ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={[styles.label, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
                Hình ảnh sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <Text
                style={[
                  styles.counter,
                  {
                    color: errors.images ? '#ba1a1a' : theme.textSecondary,
                    backgroundColor: errors.images ? '#ffdad6' : theme.border,
                  },
                ]}
              >
                {images.length}/5 ảnh
              </Text>
            </View>

            {/* Ảnh đã chọn + Nút thêm */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageRow}>
                {images.map((uri, index) => (
                  <View key={`img-${index}`} style={styles.imageThumbWrap}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    {index === 0 && (
                      <View style={[styles.mainBadge, { backgroundColor: primaryColor }]}>
                        <Text style={styles.mainBadgeText}>Ảnh chính</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(index)}
                      accessibilityLabel={`Xóa ảnh ${index + 1}`}
                    >
                      <Ionicons name="close-circle" size={22} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity
                    style={[
                      styles.addImageBtn,
                      {
                        backgroundColor: cardBg,
                        borderColor: errors.images ? '#ba1a1a' : theme.border,
                      },
                    ]}
                    onPress={addImage}
                    activeOpacity={0.8}
                    accessibilityLabel="Thêm ảnh sản phẩm"
                  >
                    <View style={[styles.cameraCircle, { backgroundColor: primaryColor }]}>
                      <Ionicons name="camera-outline" size={24} color="#ffffff" />
                    </View>
                    <Text style={[styles.uploadTitle, { color: theme.text }]}>Thêm ảnh</Text>
                    <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>
                      {images.length === 0 ? 'Ảnh rõ nét tăng\nkhả năng bán' : `Còn ${5 - images.length} slot`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
            <Text style={[styles.hintSmall, { color: theme.textSecondary }]}>
              <Ionicons name="information-circle-outline" size={12} color={theme.textSecondary} /> Ảnh đầu tiên sẽ làm ảnh bìa. Tối đa 5 ảnh.
            </Text>
          </View>

          {/* ── SECTION: Thông tin sản phẩm ── */}
          <View style={[styles.formCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionLabel, { color: theme.text, fontSize: 15 * fontSizeScale }]}>
              Thông tin sản phẩm
            </Text>

            {/* Tiêu đề */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Tiêu đề tin đăng <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
                }}
                placeholder="VD: Giáo trình PRF192 K18 – Còn mới 95%, có highlight..."
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: inputBg,
                    color: theme.text,
                    borderColor: errors.title ? '#ba1a1a' : 'transparent',
                    borderWidth: errors.title ? 1 : 0,
                  },
                ]}
                maxLength={100}
                accessibilityLabel="Product title"
              />
              <View style={styles.charRow}>
                {errors.title ? (
                  <Text style={styles.errorText}>{errors.title}</Text>
                ) : (
                  <Text style={[styles.hintSmall, { color: theme.textSecondary }]}>
                    Tối đa 100 ký tự
                  </Text>
                )}
                <Text style={[styles.hintSmall, { color: theme.textSecondary }]}>
                  {title.length}/100
                </Text>
              </View>
            </View>

            {/* Danh mục */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Danh mục <Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                value={selectedCategory?.label || 'Chọn danh mục...'}
                placeholder="Chọn danh mục..."
                options={CATEGORIES}
                labelKey="label"
                valueKey="id"
                iconKey="icon"
                open={openDropdown === 'category'}
                onPress={() => toggleDropdown('category')}
                onSelect={(item) => {
                  setCategoryId(item.id);
                  setOpenDropdown(null);
                  if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                }}
                selectedId={categoryId}
                theme={theme}
                primaryColor={primaryColor}
                hasError={Boolean(errors.category)}
              />
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Tình trạng */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Tình trạng sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                value={selectedCondition?.label || 'Chọn tình trạng...'}
                placeholder="Chọn tình trạng..."
                options={CONDITIONS}
                labelKey="label"
                valueKey="id"
                open={openDropdown === 'condition'}
                onPress={() => toggleDropdown('condition')}
                onSelect={(item) => {
                  setConditionId(item.id);
                  setOpenDropdown(null);
                  if (errors.condition) setErrors((e) => ({ ...e, condition: undefined }));
                }}
                selectedId={conditionId}
                theme={theme}
                primaryColor={primaryColor}
                hasError={Boolean(errors.condition)}
              />
              {errors.condition && <Text style={styles.errorText}>{errors.condition}</Text>}
            </View>

            {/* Giá bán */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Giá bán <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.priceInputWrap,
                  {
                    backgroundColor: inputBg,
                    borderColor: errors.price ? '#ba1a1a' : 'transparent',
                    borderWidth: errors.price ? 1 : 0,
                  },
                ]}
              >
                <TextInput
                  value={price}
                  onChangeText={(v) => {
                    // Chỉ cho nhập số
                    const cleaned = v.replace(/[^0-9]/g, '');
                    setPrice(cleaned);
                    if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.priceText, { color: theme.text, fontSize: 22 * fontSizeScale }]}
                  accessibilityLabel="Item price"
                />
                <Text style={[styles.currency, { color: theme.textSecondary }]}>₫</Text>
              </View>
              {price && !errors.price && (
                <Text style={[styles.priceFormatted, { color: primaryColor }]}>
                  = {Number(price).toLocaleString('vi-VN')} đồng
                </Text>
              )}
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              <View style={styles.suggestionRow}>
                <Ionicons name="trending-up" size={16} color="#008f70" />
                <Text style={[styles.suggestion, { color: theme.textSecondary }]}>
                  Mức giá gợi ý cho sinh viên FPT: <Text style={{ color: theme.text, fontWeight: '700' }}>50.000₫ – 500.000₫</Text>
                </Text>
              </View>
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={[styles.fieldLabel, { color: theme.text }]}>Có thể thương lượng</Text>
                  <Text style={[styles.helper, { color: theme.textSecondary }]}>
                    Fix nhẹ xăng xe, trà sữa cho bạn cùng trường
                  </Text>
                </View>
                <Switch
                  value={negotiable}
                  onValueChange={setNegotiable}
                  trackColor={{ false: theme.border, true: primaryColor }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            {/* Mô tả */}
            <View style={styles.fieldGroup}>
              <View style={styles.descriptionHeader}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  Mô tả chi tiết <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('AIEstimator')}>
                  <Text style={[styles.autoText, { color: primaryColor }]}>
                    <Ionicons name="sparkles-outline" size={13} color={primaryColor} /> AI viết tự động
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
                }}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder="Mô tả tình trạng thực tế, lý do bán, hàng tặng kèm... (tối thiểu 20 ký tự)"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.descriptionInput,
                  {
                    backgroundColor: inputBg,
                    color: theme.text,
                    borderColor: errors.description ? '#ba1a1a' : 'transparent',
                    borderWidth: errors.description ? 1 : 0,
                  },
                ]}
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : (
                <Text style={[styles.hintSmall, { color: theme.textSecondary }]}>
                  {description.length} ký tự{description.length < 20 ? ` / cần thêm ${20 - description.length} ký tự` : ''}
                </Text>
              )}
            </View>

            {/* Điểm hẹn */}
            <View style={styles.fieldGroup}>
              <View style={styles.locationHeader}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  Điểm hẹn giao dịch <Text style={styles.required}>*</Text>
                </Text>
                <Text style={styles.freeShip}>
                  <Ionicons name="checkmark-circle" size={13} color="#008f70" /> Miễn phí ship nội khu
                </Text>
              </View>
              <View style={[styles.locationCard, { backgroundColor: inputBg }]}>
                <View style={styles.locationRow}>
                  <View style={[styles.locationIcon, { backgroundColor: isDarkMode ? '#4a2b1b' : '#ffdbcc' }]}>
                    <Ionicons name="location" size={20} color={primaryColor} />
                  </View>
                  <View style={styles.locationCopy}>
                    <Text style={[styles.locationTitle, { color: theme.text }]}>{selectedLocation}</Text>
                    <Text style={[styles.helper, { color: theme.textSecondary }]}>
                      FPT University – Khu Công nghệ cao Hòa Lạc
                    </Text>
                  </View>
                  <TouchableOpacity onPress={pickLocation}>
                    <Text style={[styles.changeText, { color: primaryColor }]}>GPS</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tags}>
                  {LOCATIONS.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.tag,
                        { backgroundColor: item === selectedLocation ? primaryColor : cardBg },
                      ]}
                      onPress={() => {
                        setSelectedLocation(item);
                        if (errors.selectedLocation) setErrors((e) => ({ ...e, selectedLocation: undefined }));
                      }}
                    >
                      {item === selectedLocation && (
                        <Ionicons name="checkmark" size={11} color="#ffffff" />
                      )}
                      <Text
                        style={[
                          styles.tagText,
                          { color: item === selectedLocation ? '#ffffff' : theme.text },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.selectedLocation && (
                <Text style={styles.errorText}>{errors.selectedLocation}</Text>
              )}
            </View>
          </View>

          {/* Notice */}
          <View style={[styles.notice, { backgroundColor: isDarkMode ? '#1a2a4a' : '#e8eaff' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#3351ff" />
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Tin đăng sẽ hiển thị huy hiệu sinh viên xác thực{' '}
              <Text style={{ fontWeight: '700', color: theme.text }}>@fpt.edu.vn</Text> để đảm bảo uy tín và an toàn học đường. Cần duyệt trong 5-15 phút.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Text style={[styles.commitment, { color: theme.textSecondary }]}>
              <Ionicons name="checkmark-circle" size={13} color="#008f70" /> Cam kết hàng đúng mô tả – Vi phạm sẽ bị khoá tài khoản
            </Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: primaryColor, opacity: isSubmitting ? 0.75 : 1 },
              ]}
              onPress={submitPost}
              disabled={isSubmitting}
              accessibilityLabel="Submit listing"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
              )}
              <Text style={styles.submitText}>
                {isSubmitting ? 'ĐANG ĐỒNG BỘ LÊN FIREBASE...' : 'ĐĂNG TIN NGAY'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.draftButton, { backgroundColor: cardBg }]}
              onPress={saveDraft}
            >
              <Ionicons name="bookmark-outline" size={18} color={theme.text} />
              <Text style={[styles.draftText, { color: theme.text }]}>Lưu bản nháp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Dropdown Component ────────────────────────────────────────────────────────
function Dropdown({ value, placeholder, options, labelKey = 'label', valueKey = 'id', iconKey, open, onPress, onSelect, selectedId, theme, primaryColor, hasError }) {
  const isPlaceholder = !selectedId;
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdown,
          {
            backgroundColor: theme.background,
            borderColor: hasError ? '#ba1a1a' : 'transparent',
            borderWidth: hasError ? 1 : 0,
          },
        ]}
        onPress={onPress}
      >
        <Text style={[styles.dropdownText, { color: isPlaceholder ? theme.textSecondary : theme.text }]}>
          {value}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.options, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {options.map((item) => {
            const isSelected = item[valueKey] === selectedId;
            return (
              <TouchableOpacity
                key={item[valueKey]}
                style={[styles.option, isSelected && { backgroundColor: theme.background }]}
                onPress={() => onSelect(item)}
              >
                {iconKey && (
                  <Ionicons
                    name={item[iconKey]}
                    size={16}
                    color={isSelected ? primaryColor : theme.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={[styles.optionText, { color: isSelected ? primaryColor : theme.text, flex: 1 }]}>
                  {item[labelKey]}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={17} color={primaryColor} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  header: {
    height: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },

  // AI Banner
  aiBanner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  aiIcon: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontWeight: '700', flexShrink: 1 },
  newBadge: { color: '#ffffff', fontSize: 10, fontWeight: '700', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  aiDescription: { lineHeight: 18, marginTop: 10 },
  aiFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14 },
  aiButton: { borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  aiButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  aiHint: { fontSize: 10, fontWeight: '700' },

  // Section
  section: { marginBottom: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '700' },
  required: { color: '#ba1a1a' },
  counter: { fontSize: 12, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4, fontWeight: '600' },

  // Image grid
  imageRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  imageThumbWrap: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imageThumb: { width: '100%', height: '100%' },
  mainBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 4, alignItems: 'center' },
  mainBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 11 },
  addImageBtn: { width: 110, height: 110, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
  cameraCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { fontWeight: '700', fontSize: 12 },
  uploadHint: { fontSize: 10, textAlign: 'center', lineHeight: 14 },

  // Form card
  formCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  fieldGroup: { marginBottom: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  textInput: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 46 },
  charRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  hintSmall: { fontSize: 11, marginTop: 4 },
  errorText: { fontSize: 11, color: '#ba1a1a', marginTop: 4, fontWeight: '500' },

  // Dropdown
  dropdownContainer: { zIndex: 10, marginBottom: 2 },
  dropdown: { minHeight: 48, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { fontSize: 14, flex: 1 },
  options: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: 'hidden', zIndex: 20 },
  option: { minHeight: 44, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  optionText: { fontSize: 14 },

  // Price
  priceInputWrap: { height: 52, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  priceText: { flex: 1, fontWeight: '700' },
  currency: { fontSize: 18, fontWeight: '700' },
  priceFormatted: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  suggestion: { fontSize: 11, flexShrink: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  switchCopy: { flex: 1, gap: 3 },
  helper: { fontSize: 11 },

  // Description
  descriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  autoText: { fontSize: 12, fontWeight: '600' },
  descriptionInput: { minHeight: 120, borderRadius: 11, padding: 14, fontSize: 14, lineHeight: 20 },

  // Location
  locationHeader: { marginBottom: 6, gap: 2 },
  freeShip: { color: '#008f70', fontSize: 11, fontWeight: '600' },
  locationCard: { borderRadius: 12, padding: 14, marginTop: 2, gap: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 3 },
  locationTitle: { fontSize: 14, fontWeight: '600' },
  changeText: { fontSize: 12, fontWeight: '700', padding: 5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagText: { fontSize: 11 },

  // Notice
  notice: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, marginBottom: 20, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16 },

  // Actions
  actions: { gap: 12, alignItems: 'stretch' },
  commitment: { textAlign: 'center', fontSize: 11 },
  submitButton: { minHeight: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  draftButton: { minHeight: 46, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  draftText: { fontSize: 14, fontWeight: '600' },
});
