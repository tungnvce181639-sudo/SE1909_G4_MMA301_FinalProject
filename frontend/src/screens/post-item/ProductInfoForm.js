import React from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CONDITIONS } from './listingConstants';

// Keeps listing inputs and their validation feedback separate from screen layout.
export default function ProductInfoForm({
  values, errors, theme, primaryColor, onChange, onSelectCategory, onSelectCondition,
}) {
  const field = (label, key, placeholder, options) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.text }]}>{label} *</Text>
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
          maxLength={key === 'title' ? 100 : key === 'description' ? 1000 : undefined}
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
      <View style={styles.aiRow}>
        <Ionicons name="sparkles-outline" size={15} color={primaryColor} />
        <Text style={[styles.helper, { color: primaryColor }]}>Bạn có thể dùng AI để gợi ý nội dung sau.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, marginBottom: 16, gap: 13 },
  heading: { fontWeight: '700', fontSize: 16 },
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
});
