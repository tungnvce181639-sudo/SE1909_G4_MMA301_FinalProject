import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import ProductImagesSection from './ProductImagesSection';
import ProductInfoForm from './ProductInfoForm';
import LocationPicker from './LocationPicker';
import usePostItemForm from './usePostItemForm';

// Coordinates image, details, location and submit sections for create/edit listing flows.
export default function PostItemScreen({ navigation, route }) {
  const { theme, isDarkMode, primaryColor } = useTheme();
  const auth = useAuth();
  const { profile } = useProfile();
  const closeScreen = () => {
    navigation.setParams({ listingId: undefined });
    navigation.navigate('MyListings');
  };
  const form = usePostItemForm({
    navigation,
    listingId: route?.params?.listingId,
    user: auth?.user,
    profile,
  });
  const { values, errors } = form;

  if (form.isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Đang tải tin đăng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={closeScreen} style={styles.headerButton} accessibilityLabel="Quay lại">
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {form.isEditing ? 'Chỉnh sửa tin đăng' : 'Đăng tin bán đồ'}
          </Text>
          <TouchableOpacity onPress={closeScreen} style={styles.headerButton} accessibilityLabel="Đóng">
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('AIEstimator')}
            style={[styles.aiBanner, { backgroundColor: isDarkMode ? '#4a2b1b' : '#ffdbcc' }]}
          >
            <Ionicons name="sparkles" size={20} color={primaryColor} />
            <View style={styles.aiCopy}>
              <Text style={[styles.aiTitle, { color: theme.text }]}>AI trợ lý định giá</Text>
              <Text style={[styles.aiDescription, { color: theme.textSecondary }]}>
                Phân tích sản phẩm và gợi ý nội dung đăng bán.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={primaryColor} />
          </TouchableOpacity>

          <ProductImagesSection
            images={values.images}
            error={errors.images}
            theme={theme}
            primaryColor={primaryColor}
            onAddImage={form.addImages}
            onRemoveImage={form.removeImage}
          />
          <ProductInfoForm
            values={values}
            errors={errors}
            theme={theme}
            primaryColor={primaryColor}
            onChange={form.change}
            onSelectCategory={(category) => form.change('category', category)}
            onSelectCondition={(condition) => form.change('condition', condition)}
          />
          <LocationPicker
            theme={theme}
            primaryColor={primaryColor}
            selectedLocation={values.location}
            locationCoords={values.locationCoords}
            error={errors.location}
            onPickGps={form.pickLocation}
            onSelect={(location) => {
              form.change('location', location);
              form.change('locationCoords', null);
            }}
          />

          <View style={[styles.notice, { backgroundColor: isDarkMode ? '#1a2a4a' : '#e8eaff' }]}>
            <Ionicons name="shield-checkmark-outline" size={19} color="#3351ff" />
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Tin mới sẽ ở trạng thái chờ duyệt. Hãy cung cấp mô tả và hình ảnh trung thực.
            </Text>
          </View>

          <TouchableOpacity
            onPress={form.submit}
            disabled={form.isSubmitting}
            style={[styles.submit, { backgroundColor: primaryColor, opacity: form.isSubmitting ? 0.7 : 1 }]}
          >
            {form.isSubmitting
              ? <ActivityIndicator color="#fff" />
              : <Ionicons name="cloud-upload-outline" size={20} color="#fff" />}
            <Text style={styles.submitText}>
              {form.isSubmitting ? 'ĐANG ĐĂNG...' : form.isEditing ? 'LƯU THAY ĐỔI' : 'ĐĂNG TIN'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Bản nháp', 'Chức năng lưu bản nháp chưa được bật.')}>
            <Text style={[styles.draft, { color: theme.textSecondary }]}>Lưu bản nháp</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { minHeight: 60, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 18 },
  content: { padding: 16, paddingBottom: 36 },
  aiBanner: { borderRadius: 12, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  aiCopy: { flex: 1, gap: 3 },
  aiTitle: { fontWeight: '700', fontSize: 14 },
  aiDescription: { fontSize: 11 },
  notice: { borderRadius: 10, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 14 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16 },
  submit: { minHeight: 50, borderRadius: 11, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  draft: { textAlign: 'center', padding: 14, fontSize: 13 },
});
