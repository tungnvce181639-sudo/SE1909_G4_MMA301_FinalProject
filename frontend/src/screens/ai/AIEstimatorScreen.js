import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const defaultResult = {
  estimatedPrice: '95.000đ',
  condition: 92,
  title: 'Combo Giáo trình Kỹ thuật phần mềm K18 (PRF192 + PRO197) - Đầy đủ note thi A+',
  description:
    'Pass nhanh 2 cuốn sách gối đầu giường kì 1 & kì 2 cho anh em SE/IA K19:\n• Tình trạng: Sách giữ gìn 92%, không quăn góc, note bút chì công thức trọng tâm.\n• Quà tặng đi kèm: Tặng link Google Drive tổng hợp đề thi thử PE các năm & full bài tập Lab đạt 10đ.\n• Nơi nhận: Sảnh KTX Dom A hoặc giao trực tiếp tại Canteen Hola buổi trưa.\n• Giá sinh viên hỗ trợ: 95k/cả combo (Có fix nhẹ tiền trà sữa cho bạn nào chốt nhanh hôm nay).',
};

export default function AIEstimatorScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(defaultResult);
  const [copied, setCopied] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh để AI phân tích sản phẩm.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = (uri) => {
    setImageUri(uri);
    setLoading(true);
    setTimeout(() => {
      setAiResult(defaultResult);
      setLoading(false);
    }, 1200);
  };

  const regenerateTone = () => {
    setLoading(true);
    setTimeout(() => {
      setAiResult((current) => ({
        ...current,
        title: 'Combo Sách Kỹ Thuật Lập Trình FPT K18 (Full Note Tips Qua Môn Cực Dễ)',
        description:
          'Pass gấp để dọn phòng KTX Dom A:\n• 2 cuốn: Giáo trình C/C++ PRF192 + Java PRO197 in bìa bóng, giấy trắng tinh\n• Tặng full file source code 10 assignment lab đạt 10/10 kì trước\n• Bonus mẹo thi PE bao pass 8.5+ gửi qua Google Drive\n• Giao dịch: Nhận đồ trực tiếp sảnh Dom A / Thư viện tầng 2 Hola',
      }));
      setLoading(false);
    }, 700);
  };

  const copyDescription = () => {
    setCopied(true);
    Alert.alert('Đã sao chép', 'Nội dung bài đăng đã được sao chép vào bộ nhớ tạm.');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Gemini AI Thẩm Định</Text>
          <Ionicons name="sparkles" size={20} color={primaryColor} />
        </View>
        <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
          <Ionicons name="person" size={17} color="#ffffff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.introCard, { backgroundColor: theme.card }]}>
          <View style={[styles.poweredBadge, { backgroundColor: theme.border }]}>
            <View style={styles.onlineDot} />
            <Ionicons name="hardware-chip-outline" size={15} color={primaryColor} />
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>POWERED BY GOOGLE GEMINI</Text>
          </View>
          <View style={styles.headingRow}>
            <Text style={[styles.heading, { color: theme.text, fontSize: 24 * fontSizeScale }]}>AI Định Giá & Soạn Bài</Text>
            <Ionicons name="flash" size={22} color={primaryColor} />
          </View>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            Chụp ảnh giáo trình, đồ KTX. AI soi độ mới, tra giá thị trường sinh viên FPT và viết content chuẩn xịn trong 3 giây.
          </Text>
        </View>

        <View style={[styles.scannerCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.scanner, { backgroundColor: theme.border }]}
            onPress={pickImage}
            activeOpacity={0.85}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.scannerImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={[styles.uploadIcon, { backgroundColor: primaryColor }]}>
                  <Ionicons name="cloud-upload-outline" size={30} color="#ffffff" />
                </View>
                <Text style={[styles.uploadTitle, { color: theme.text }]}>Tải ảnh sản phẩm lên</Text>
                <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>AI sẽ nhận diện và định giá tự động</Text>
              </View>
            )}
            <View style={[styles.scanOverlay, { borderColor: primaryColor }]}>
              <View style={[styles.corner, styles.topLeft, { borderColor: primaryColor }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: primaryColor }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: primaryColor }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: primaryColor }]} />
              <View style={[styles.scanLabel, { backgroundColor: '#2f3034dd' }]}>
                <View style={styles.onlineDot} />
                <Text style={styles.scanLabelText}>{loading ? 'ĐANG PHÂN TÍCH ẢNH...' : 'SẴN SÀNG QUÉT SẢN PHẨM'}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.scannerActions}>
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.background }]} onPress={pickImage}>
              <Ionicons name="camera-outline" size={16} color={theme.text} />
              <Text style={[styles.smallButtonText, { color: theme.text }]}>Chụp lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.background }]} onPress={pickImage}>
              <Ionicons name="swap-horizontal-outline" size={16} color={theme.text} />
              <Text style={[styles.smallButtonText, { color: theme.text }]}>Đổi ảnh khác</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quy trình thẩm định Gemini</Text>
            <View style={styles.confidenceBadge}>
              <Ionicons name="speedometer-outline" size={14} color="#008f70" />
              <Text style={styles.confidenceText}>1.2s • Tin cậy 96%</Text>
            </View>
          </View>
          {[
            '1. Nhận diện vật thể: Combo Giáo trình K18',
            '2. Kiểm tra gáy sách, mép giấy, chữ viết tay',
            '3. Đối chiếu 84 giao dịch kỳ Fall 2024 tại Hola',
          ].map((step) => (
            <View key={step} style={[styles.step, { backgroundColor: theme.background }]}>
              <Ionicons name={loading ? 'sync-outline' : 'checkmark-circle'} size={18} color="#008f70" />
              <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              <Text style={styles.doneText}>{loading ? 'Đang xử lý' : 'Hoàn tất'}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.conditionHeader}>
            <Text style={[styles.mutedLabel, { color: theme.textSecondary }]}>Tình trạng thực tế</Text>
            <Text style={[styles.conditionBadge, { color: primaryColor }]}>Độ mới {aiResult.condition}% • Like New</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progress, { width: `${aiResult.condition}%`, backgroundColor: primaryColor }]} />
          </View>
          <View style={styles.scaleRow}>
            <Text style={[styles.scaleText, { color: theme.textSecondary }]}>Khá</Text>
            <Text style={[styles.scaleText, { color: theme.textSecondary }]}>Tốt</Text>
            <Text style={[styles.scaleText, { color: '#008f70', fontWeight: '700' }]}>Rất tốt</Text>
            <Text style={[styles.scaleText, { color: theme.textSecondary }]}>Mới 100%</Text>
          </View>

          <View style={[styles.priceBox, { backgroundColor: theme.background }]}>
            <View style={styles.priceHeader}>
              <View style={styles.inlineRow}>
                <Ionicons name="pricetag-outline" size={18} color={primaryColor} />
                <Text style={[styles.mutedLabel, { color: theme.textSecondary }]}>Định giá tối ưu</Text>
              </View>
              <Text style={styles.optimizeBadge}>Tối ưu 24h pass</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: primaryColor, fontSize: 32 * fontSizeScale }]}>{aiResult.estimatedPrice}</Text>
              <Text style={[styles.oldPrice, { color: theme.textSecondary }]}>295.000đ bìa</Text>
            </View>
            <View style={[styles.savings, { backgroundColor: theme.card }]}>
              <Ionicons name="trending-down" size={18} color="#008f70" />
              <Text style={[styles.savingsText, { color: theme.text }]}>Rẻ hơn sách mới <Text style={{ fontWeight: '700' }}>68%</Text>. Đang có <Text style={{ fontWeight: '700' }}>14 bạn K19</Text> cùng ngành tìm mua kỳ này!</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={[styles.rangeText, { color: theme.textSecondary }]}>Phổ giá SV: 90.000đ - 110.000đ</Text>
              <Text style={[styles.rangeText, { color: theme.textSecondary }]}>Khuyên dùng: 95.000đ</Text>
            </View>
          </View>

          <View style={styles.generatedHeader}>
            <View style={styles.inlineRow}>
              <Ionicons name="sparkles" size={18} color={primaryColor} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Nội dung Gemini đã soạn</Text>
            </View>
            <Text style={styles.tone}>Tone: Sinh viên</Text>
          </View>
          <View style={[styles.copyBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.generatedTitle, { color: theme.text, fontSize: 18 * fontSizeScale }]}>{aiResult.title}</Text>
            <Text style={[styles.generatedDescription, { color: theme.textSecondary }]}>{aiResult.description}</Text>
            <View style={styles.utilityRow}>
              <UtilityButton icon={copied ? 'checkmark' : 'copy-outline'} label="Sao chép" theme={theme} onPress={copyDescription} />
              <UtilityButton icon="refresh-outline" label="Đổi phong cách" theme={theme} onPress={regenerateTone} />
              <UtilityButton icon="create-outline" label="Sửa trực tiếp" theme={theme} onPress={() => Alert.alert('Chỉnh sửa', 'Bạn có thể chỉnh sửa nội dung sau khi áp dụng vào bài đăng.')} />
            </View>
          </View>
        </View>

        <View style={[styles.offlineCard, { backgroundColor: theme.border }]}>
          <View style={[styles.offlineIcon, { backgroundColor: theme.card }]}>
            <Ionicons name="wifi-outline" size={18} color={theme.textSecondary} />
          </View>
          <View style={styles.offlineCopy}>
            <Text style={[styles.offlineTitle, { color: theme.text }]}>Chế độ phân tích FPT Edu Wi-Fi</Text>
            <Text style={[styles.offlineText, { color: theme.textSecondary }]}>Ảnh mờ hoặc lỗi kết nối? Hệ thống tự động lưu bản nháp offline.</Text>
          </View>
          <TouchableOpacity onPress={() => imageUri ? processImage(imageUri) : pickImage()}>
            <Text style={[styles.retry, { color: theme.text }]}>Kiểm tra lại</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: primaryColor, opacity: loading ? 0.6 : 1 }]}
            disabled={loading}
            onPress={() => navigation.navigate('PostItem', { aiData: aiResult })}
          >
            <Text style={styles.applyText}>SỬ DỤNG DỮ LIỆU ĐỂ ĐĂNG BÀI NGAY</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.card }]} onPress={() => Alert.alert('Đã lưu', 'Kết quả thẩm định đã được lưu vào hồ sơ.')}>
            <Ionicons name="bookmark-outline" size={18} color={theme.text} />
            <Text style={[styles.saveText, { color: theme.text }]}>Lưu kết quả thẩm định vào hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function UtilityButton({ icon, label, theme, onPress }) {
  return (
    <TouchableOpacity style={[styles.utilityButton, { backgroundColor: theme.card }]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={theme.text} />
      <Text style={[styles.utilityText, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  headerTitle: { fontWeight: '700' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  introCard: { borderRadius: 14, padding: 16, gap: 10 },
  poweredBadge: { alignSelf: 'flex-start', borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00aa89' },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heading: { fontWeight: '700' },
  introText: { fontSize: 13, lineHeight: 19 },
  scannerCard: { borderRadius: 14, padding: 8 },
  scanner: { height: 260, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  scannerImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  uploadIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  uploadTitle: { fontSize: 15, fontWeight: '700' },
  uploadHint: { fontSize: 11, marginTop: 5 },
  scanOverlay: { ...StyleSheet.absoluteFillObject },
  corner: { position: 'absolute', width: 24, height: 24 },
  topLeft: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLabel: { position: 'absolute', top: 14, alignSelf: 'center', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  scanLabelText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
  scannerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  smallButton: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  smallButtonText: { fontSize: 12, fontWeight: '600' },
  sectionCard: { borderRadius: 14, padding: 16, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  confidenceBadge: { borderRadius: 12, backgroundColor: '#008f7018', paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  confidenceText: { color: '#008f70', fontSize: 9, fontWeight: '700' },
  step: { minHeight: 38, borderRadius: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepText: { flex: 1, fontSize: 11 },
  doneText: { color: '#008f70', fontSize: 9, fontWeight: '700' },
  conditionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  mutedLabel: { fontSize: 12 },
  conditionBadge: { backgroundColor: '#ffdbcc', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 4 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 9 },
  priceBox: { borderRadius: 12, padding: 12, gap: 10 },
  priceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  optimizeBadge: { color: '#002bcf', backgroundColor: '#dee0ff', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, fontSize: 9, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontWeight: '700' },
  oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
  savings: { borderRadius: 8, padding: 8, flexDirection: 'row', gap: 6 },
  savingsText: { flex: 1, fontSize: 11, lineHeight: 16 },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  rangeText: { fontSize: 9 },
  generatedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tone: { color: '#008f70', fontSize: 9 },
  copyBox: { borderRadius: 12, padding: 14, gap: 10 },
  generatedTitle: { fontWeight: '700', lineHeight: 25 },
  generatedDescription: { fontSize: 13, lineHeight: 20 },
  utilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  utilityButton: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  utilityText: { fontSize: 11, fontWeight: '600' },
  offlineCard: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  offlineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  offlineCopy: { flex: 1, gap: 3 },
  offlineTitle: { fontSize: 12, fontWeight: '600' },
  offlineText: { fontSize: 10, lineHeight: 14 },
  retry: { fontSize: 10, fontWeight: '700' },
  footer: { gap: 8, paddingTop: 2 },
  applyButton: { minHeight: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  applyText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  saveButton: { minHeight: 46, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveText: { fontSize: 12, fontWeight: '600' },
});
