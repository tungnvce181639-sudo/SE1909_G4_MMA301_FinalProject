import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CONDITIONS } from './listingConstants';
import { generateDescription } from '../../services/api/aiApi';

// Keeps listing inputs and their validation feedback separate from screen layout.
export default function ProductInfoForm({
  values, errors, theme, primaryColor, onChange, onSelectCategory, onSelectCondition,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!values.title && !values.category && !values.price) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ít nhất tiêu đề, danh mục hoặc giá bán để AI có thể viết mô tả.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDescription({
        title: values.title,
        category: CATEGORIES.find(c => c.id === values.category)?.label || values.category,
        condition: CONDITIONS.find(c => c.id === values.condition)?.label || values.condition,
        price: values.price,
        images: values.images,
      });

      onChange('title', result.title);
      onChange('description', result.description);
      Alert.alert('Đã tạo mô tả', 'AI đã viết nội dung mô tả cho sản phẩm của bạn. Bạn có thể chỉnh sửa trước khi đăng.');
    } catch (error) {
      console.error('[ProductInfoForm] Error generating description:', error);
      Alert.alert(
        'Lỗi tạo mô tả',
        error.message || 'Không thể tạo mô tả. Vui lòng kiểm tra kết nối và thử lại.',
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setIsGenerating(false);
    }
  };
  const field = (label, key, placeholder, options, required = true) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>
        {label} {required ? '*' : <Text style={{ color: theme.textSecondary, fontWeight: 'normal', fontSize: 11 }}>(tùy chọn)</Text>}
      </Text>
      {options ? (
        <View style={styles.options}>
          {options.map((option) => {
            const active = values[key] === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => (key === 'category' ? onSelectCategory(option.id) : onSelectCondition(option.id))}
                style={[
                  styles.option,
                  { backgroundColor: active ? primaryColor : theme.background, borderColor: errors[key] ? '#ba1a1a' : theme.border },
                ]}
              >
                <Text style={{ color: active ? '#fff' : theme.text, fontSize: 12 }}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <TextInput
          value={values[key]}
          onChangeText={(text) => onChange(key, text)}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.background, borderColor: errors[key] ? '#ba1a1a' : 'transparent' },
            key === 'description' && styles.description,
          ]}
          keyboardType={key === 'price' ? 'number-pad' : 'default'}
          multiline={key === 'description'}
          maxLength={key === 'title' ? 100 : key === 'description' ? 1000 : 255}
          accessibilityLabel={label}
        />
      )}
      {errors[key] ? <Text style={styles.error}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Thông tin sản phẩm</Text>
      {field('Tiêu đề', 'title', 'Ví dụ: Giáo trình còn mới 95%')}
      {field('Danh mục', 'category', null, CATEGORIES)}
      {field('Tình trạng', 'condition', null, CONDITIONS)}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text }]}>Giá bán (đ) *</Text>
        <TextInput
          value={values.price}
          onChangeText={(text) => onChange('price', text.replace(/[^0-9]/g, ''))}
          placeholder="Ví dụ: 100000"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: errors.price ? '#ba1a1a' : 'transparent' }]}
          accessibilityLabel="Giá bán"
        />
        {errors.price ? <Text style={styles.error}>{errors.price}</Text> : null}
      </View>
      <View style={styles.negotiableRow}>
        <View style={styles.negotiableText}>
          <Text style={[styles.label, { color: theme.text }]}>Có thể thương lượng</Text>
          <Text style={[styles.helper, { color: theme.textSecondary }]}>Cho phép người mua đề xuất giá</Text>
        </View>
        <Switch value={values.negotiable} onValueChange={(value) => onChange('negotiable', value)} trackColor={{ true: primaryColor }} />
      </View>
      {field('Mô tả chi tiết', 'description', 'Mô tả tình trạng, phụ kiện đi kèm, lý do bán...')}
      <Text style={[styles.helper, { color: theme.textSecondary }]}>
        {values.description.length} ký tự (tối thiểu 20)
      </Text>
      <TouchableOpacity
        style={[styles.aiButton, { backgroundColor: theme.background, opacity: isGenerating ? 0.6 : 1 }]}
        onPress={handleGenerateDescription}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <Ionicons name="sparkles" size={16} color={primaryColor} />
        )}
        <Text style={[styles.aiButtonText, { color: primaryColor }]}>
          {isGenerating ? 'Đang viết mô tả...' : 'Viết mô tả bằng AI'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <Text style={[styles.subheading, { color: theme.textSecondary }]}>Thông tin bổ sung</Text>
      {field('Quà tặng / Ưu đãi kèm theo', 'gift', 'Ví dụ: Tặng kèm tài liệu môn học, phụ kiện...', null, false)}
      {field('Lý do nhượng lại', 'reason', 'Ví dụ: Đã hoàn thành môn học, dư dùng pass lại...', null, false)}
      {field('Thời gian rảnh nhận đồ', 'pickupSchedule', 'Ví dụ: Hẹn gặp tại sảnh KTX sau giờ học...', null, false)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, marginBottom: 16, gap: 13 },
  heading: { fontWeight: '700', fontSize: 16 },
  subheading: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  divider: { height: 1, marginVertical: 4 },
  field: { gap: 6 },
  label: { fontWeight: '600', fontSize: 13 },
  input: { minHeight: 46, borderRadius: 9, paddingHorizontal: 12, borderWidth: 1, fontSize: 14 },
  description: { minHeight: 110, paddingTop: 11, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8 },
  error: { color: '#ba1a1a', fontSize: 11 },
  negotiableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  negotiableText: { gap: 3 },
  helper: { fontSize: 11 },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  aiButton: { borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  aiButtonText: { fontSize: 12, fontWeight: '600' },
});
