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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const categories = ['Giáo trình', 'Đồ điện tử', 'Đồ dùng cá nhân', 'Thời trang', 'Khác'];
const conditions = ['Mới 100%', 'Mới 95%', 'Đã sử dụng tốt', 'Cũ vừa'];
const locations = ['Dom A', 'Dom B', 'Thư viện Beta', 'Cổng trường FPT', 'Căn tin Canteen 7'];

export default function PostItemScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[1]);
  const [price, setPrice] = useState('95.000');
  const [description, setDescription] = useState(
    'Sách chuẩn của Bộ môn SE kì Fall, có highlight vài trang đầu thuật toán DSA. Tặng kèm tệp đề thi thử và slide tổng hợp môn PRO192.',
  );
  const [selectedLocation, setSelectedLocation] = useState('Dom A');
  const [negotiable, setNegotiable] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh để tải ảnh sản phẩm.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập vị trí để chọn điểm hẹn gần bạn.');
      return;
    }

    await Location.getCurrentPositionAsync({});
    Alert.alert('Đã cập nhật vị trí', 'Vị trí hiện tại đã được dùng để gợi ý điểm hẹn trên campus.');
  };

  const submitPost = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Đăng tin thành công', 'Tin đăng của bạn đã được đồng bộ lên hệ thống.');
    }, 900);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            accessibilityLabel="Close"
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
              Tự động phân tích ảnh nhận diện sản phẩm và đề xuất giá pass đồ chuẩn sinh viên K16-K19 cực nhanh.
            </Text>
            <View style={styles.aiFooter}>
              <View style={[styles.aiButton, { backgroundColor: primaryColor }]}>
                <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
                <Text style={styles.aiButtonText}>Dùng AI Gemini Viết & Định Giá</Text>
              </View>
              <Text style={[styles.aiHint, { color: primaryColor }]}>Tiết kiệm 5 phút ⚡</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={[styles.label, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
                Hình ảnh sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <Text style={[styles.counter, { color: theme.textSecondary, backgroundColor: theme.border }]}>
                {imageUri ? '1' : '0'}/5 ảnh
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadBox, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={chooseImage}
              activeOpacity={0.8}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <>
                  <View style={[styles.cameraCircle, { backgroundColor: primaryColor }]}>
                    <Ionicons name="camera-outline" size={28} color="#ffffff" />
                  </View>
                  <Text style={[styles.uploadTitle, { color: theme.text }]}>Thêm ảnh sản phẩm</Text>
                  <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>
                    Ảnh rõ nét giúp AI định giá chính xác hơn
                  </Text>
                </>
              )}
              <View style={[styles.uploadBadge, { backgroundColor: primaryColor }]}>
                <Ionicons name="add" size={18} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.label, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
              Thông tin sản phẩm
            </Text>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Danh mục <Text style={styles.required}>*</Text>
            </Text>
            <Dropdown
              value={category}
              options={categories}
              open={openDropdown === 'category'}
              onPress={() => toggleDropdown('category')}
              onSelect={(value) => {
                setCategory(value);
                setOpenDropdown(null);
              }}
              theme={theme}
              primaryColor={primaryColor}
            />

            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Tình trạng món đồ <Text style={styles.required}>*</Text>
            </Text>
            <Dropdown
              value={condition}
              options={conditions}
              open={openDropdown === 'condition'}
              onPress={() => toggleDropdown('condition')}
              onSelect={(value) => {
                setCondition(value);
                setOpenDropdown(null);
              }}
              theme={theme}
              primaryColor={primaryColor}
            />

            <View style={styles.priceCard}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Giá bán mong muốn <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.priceInput, { backgroundColor: theme.background }]}>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  style={[styles.priceText, { color: theme.text, fontSize: 22 * fontSizeScale }]}
                  accessibilityLabel="Item price"
                />
                <Text style={[styles.currency, { color: theme.textSecondary }]}>₫</Text>
              </View>
              <View style={styles.suggestionRow}>
                <Ionicons name="trending-up" size={18} color="#008f70" />
                <Text style={[styles.suggestion, { color: theme.textSecondary }]}>
                  Mức giá đề xuất K18: <Text style={{ color: theme.text, fontWeight: '700' }}>85.000₫ – 105.000₫</Text>
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

            <View style={styles.descriptionHeader}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Mô tả chi tiết <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity>
                <Text style={[styles.autoText, { color: primaryColor }]}>
                  <Ionicons name="sparkles-outline" size={14} color={primaryColor} /> Viết tự động
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Chia sẻ thêm về tình trạng sản phẩm..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.descriptionInput, { backgroundColor: theme.background, color: theme.text }]}
            />

            <View style={styles.locationHeader}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Điểm hẹn giao dịch trên Campus <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.freeShip}><Ionicons name="checkmark-circle" size={14} color="#008f70" /> Miễn phí ship</Text>
            </View>
            <View style={[styles.locationCard, { backgroundColor: theme.background }]}>
              <View style={styles.locationRow}>
                <View style={[styles.locationIcon, { backgroundColor: isDarkMode ? '#4a2b1b' : '#ffdbcc' }]}>
                  <Ionicons name="location" size={20} color={primaryColor} />
                </View>
                <View style={styles.locationCopy}>
                  <Text style={[styles.locationTitle, { color: theme.text }]}>{selectedLocation} - Sảnh chính</Text>
                  <Text style={[styles.helper, { color: theme.textSecondary }]}>Sảnh tầng 1 gần cây ATM Tiên Phong</Text>
                </View>
                <TouchableOpacity onPress={pickLocation}>
                  <Text style={[styles.changeText, { color: primaryColor }]}>Đổi</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tags}>
                {locations.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.tag, { backgroundColor: item === selectedLocation ? primaryColor : theme.card }]}
                    onPress={() => setSelectedLocation(item)}
                  >
                    {item === selectedLocation && <Ionicons name="checkmark" size={13} color="#ffffff" />}
                    <Text style={[styles.tagText, { color: item === selectedLocation ? '#ffffff' : theme.text }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.notice, { backgroundColor: theme.border }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#3351ff" />
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Tin đăng hiển thị huy hiệu sinh viên xác thực <Text style={{ fontWeight: '700' }}>@fpt.edu.vn</Text> để đảm bảo uy tín và an toàn học đường.
            </Text>
          </View>

          <View style={styles.actions}>
            <Text style={[styles.commitment, { color: theme.textSecondary }]}>
              <Ionicons name="checkmark-circle" size={14} color="#008f70" /> Kiểm tra kỹ thông tin và cam kết hàng đúng mô tả
            </Text>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.75 : 1 }]}
              onPress={submitPost}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>{isSubmitting ? 'ĐANG ĐỒNG BỘ...' : 'ĐĂNG TIN NGAY'}</Text>
              <Ionicons name={isSubmitting ? 'sync' : 'arrow-forward'} size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.draftButton, { backgroundColor: theme.card }]} onPress={() => Alert.alert('Đã lưu', 'Bản nháp đã được lưu trên thiết bị.')}>
              <Ionicons name="bookmark-outline" size={18} color={theme.text} />
              <Text style={[styles.draftText, { color: theme.text }]}>Lưu bản nháp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Dropdown({ value, options, open, onPress, onSelect, theme, primaryColor }) {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={[styles.dropdown, { backgroundColor: theme.background }]} onPress={onPress}>
        <Text style={[styles.dropdownText, { color: theme.text }]}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.options, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {options.map((option) => (
            <TouchableOpacity key={option} style={styles.option} onPress={() => onSelect(option)}>
              <Text style={[styles.optionText, { color: option === value ? primaryColor : theme.text }]}>{option}</Text>
              {option === value && <Ionicons name="checkmark" size={17} color={primaryColor} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  header: { height: 64, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontWeight: '700' },
  content: { padding: 16, paddingBottom: 32 },
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
  section: { marginBottom: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontWeight: '700' },
  required: { color: '#ba1a1a' },
  counter: { fontSize: 12, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  uploadBox: { height: 180, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  cameraCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  uploadTitle: { fontWeight: '700', fontSize: 14 },
  uploadHint: { fontSize: 11, marginTop: 5 },
  uploadBadge: { position: 'absolute', right: 12, bottom: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  formCard: { borderRadius: 16, padding: 16, gap: 10 },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  dropdownContainer: { zIndex: 2 },
  dropdown: { minHeight: 48, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { fontSize: 14 },
  options: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  option: { minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 14 },
  priceCard: { borderRadius: 12, padding: 12, marginTop: 4, gap: 8 },
  priceInput: { height: 52, borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  priceText: { flex: 1, fontWeight: '700' },
  currency: { fontSize: 18, fontWeight: '700' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestion: { fontSize: 11, flexShrink: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  switchCopy: { flex: 1, gap: 4 },
  helper: { fontSize: 11 },
  descriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  autoText: { fontSize: 12, fontWeight: '600' },
  descriptionInput: { minHeight: 120, borderRadius: 11, padding: 14, fontSize: 14, lineHeight: 20 },
  locationHeader: { gap: 4, marginTop: 4 },
  freeShip: { color: '#008f70', fontSize: 11, fontWeight: '600' },
  locationCard: { borderRadius: 12, padding: 14, marginTop: 2, gap: 14 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, gap: 4 },
  locationTitle: { fontSize: 14, fontWeight: '600' },
  changeText: { fontSize: 12, fontWeight: '700', padding: 5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 15, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagText: { fontSize: 11 },
  notice: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, marginBottom: 20 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16 },
  actions: { gap: 12, alignItems: 'stretch' },
  commitment: { textAlign: 'center', fontSize: 10 },
  submitButton: { minHeight: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  draftButton: { minHeight: 46, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  draftText: { fontSize: 14, fontWeight: '600' },
});
