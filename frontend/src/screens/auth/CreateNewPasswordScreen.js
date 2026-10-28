import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validatePassword, validatePasswordMatch } from '../../utils/validation';
import apiClient from '../../services/api/apiClient';

export default function CreateNewPasswordScreen({ route, navigation }) {
  const email = route?.params?.email;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  ].filter(Boolean).length;

  const handleUpdatePassword = async () => {
    // Reset errors
    setErrors({});

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setErrors((prev) => ({ ...prev, newPassword: passwordValidation.error }));
      return;
    }

    // Validate password match
    const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchValidation.isValid) {
      setErrors((prev) => ({ ...prev, confirmPassword: matchValidation.error }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        newPassword,
      });

      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]);
    } catch (error) {
      console.error('[CreateNewPasswordScreen] Error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNavigation}>
            <TouchableOpacity
              accessibilityLabel="Quay lại"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1a1c1f" />
            </TouchableOpacity>
            <View style={styles.accountBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#006b55" />
              <Text style={styles.accountBadgeText}>FPT Edu Security</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIconWrapper}>
              <View style={styles.heroIcon}>
                <Ionicons name="key-outline" size={34} color="#ffffff" />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            </View>

            <View style={styles.campusTag}>
              <View style={styles.campusDot} />
              <Text style={styles.campusTagText}>HOLA PARK CAMPUS • BẢO MẬT TÀI KHOẢN</Text>
            </View>
            <Text style={styles.title}>Tạo mật khẩu mới</Text>
            <Text style={styles.description}>
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </Text>
            {email ? (
              <View style={styles.emailChip}>
                <Ionicons name="at-outline" size={16} color="#0031e8" />
                <Text style={styles.emailText}>{email}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.form}>
            <PasswordField
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!isNewPasswordVisible}
              isVisible={isNewPasswordVisible}
              onToggleVisibility={() => setIsNewPasswordVisible((visible) => !visible)}
              icon="lock-closed-outline"
              error={errors.newPassword}
            />
            {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}

            <View style={styles.strengthSection}>
              <View style={styles.strengthBars}>
                {[0, 1, 2].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.strengthBar,
                      bar < passwordStrength && {
                        backgroundColor: passwordStrength === 1 ? '#ba1a1a' : '#006b55',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.strengthText}>
                {newPassword ? `Độ mạnh: ${passwordStrength === 3 ? 'Rất mạnh' : passwordStrength === 2 ? 'Khá' : 'Yếu'}` : 'Chưa nhập'}
              </Text>
            </View>

            <PasswordField
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              isVisible={isConfirmPasswordVisible}
              onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)}
              icon="shield-checkmark-outline"
              error={errors.confirmPassword}
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            <View style={styles.criteriaCard}>
              <Text style={styles.criteriaTitle}>TIÊU CHUẨN AN TOÀN FPT EDU</Text>
              <Criterion valid={newPassword.length >= 8} text="Độ dài tối thiểu 8 ký tự" />
              <Criterion valid={/[A-Z]/.test(newPassword)} text="Chứa ít nhất 1 chữ cái in hoa (A-Z)" />
              <Criterion
                valid={/[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword)}
                text="Có ít nhất 1 số hoặc ký tự đặc biệt (@, #, $...)"
              />
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleUpdatePassword}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Cập nhật mật khẩu</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.advisoryCard}>
            <View style={styles.advisoryTitleRow}>
              <View style={styles.advisoryIcon}>
                <Ionicons name="shield-checkmark" size={18} color="#a04100" />
              </View>
              <Text style={styles.advisoryTitle}>Tiêu chuẩn mật khẩu an toàn Hola ID</Text>
            </View>
            <Text style={styles.advisoryText}>
              Không dùng lại mật khẩu tài khoản email trường <Text style={styles.emphasis}>@fpt.edu.vn</Text> hoặc ngày tháng năm sinh để phòng tránh rủi ro gian lận khi trao đổi hàng hoá tại chợ ký túc xá.
            </Text>
            <View style={styles.hotlineRow}>
              <Text style={styles.hotlineLabel}>Hỗ trợ KTX Hola:</Text>
              <Text style={styles.hotlineNumber}>(024) 7300 1866</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.returnButton}>
            <Ionicons name="arrow-back" size={18} color="#a04100" />
            <Text style={styles.returnButtonText}>Nhớ lại mật khẩu cũ? Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  isVisible,
  onToggleVisibility,
  icon,
  error,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label} <Text style={styles.required}>*</Text></Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#584238" style={styles.inputIcon} />
        <TextInput
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8c7166"
          secureTextEntry={secureTextEntry}
          style={[styles.input, error && styles.inputError]}
          value={value}
        />
        <TouchableOpacity
          accessibilityLabel={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onPress={onToggleVisibility}
          style={styles.visibilityButton}
        >
          <Ionicons name={isVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#584238" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Criterion({ valid, text }) {
  return (
    <View style={styles.criterion}>
      <Ionicons
        name={valid ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={valid ? '#006b55' : '#584238'}
      />
      <Text style={[styles.criterionText, valid && styles.criterionValid]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9fd' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  topNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eeedf2' },
  accountBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#eeedf2' },
  accountBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: '#006b55' },
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 24 },
  heroIconWrapper: { position: 'relative', marginBottom: 16 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f26f21' },
  verifiedBadge: { position: 'absolute', right: -3, bottom: -3, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00aa89' },
  campusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: '#e8e8ec' },
  campusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f26f21' },
  campusTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#584238' },
  title: { marginTop: 10, color: '#1a1c1f', fontSize: 24, fontWeight: '600' },
  description: { maxWidth: 290, marginTop: 4, textAlign: 'center', color: '#584238', fontSize: 14, lineHeight: 20 },
  emailChip: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#dee0ff' },
  emailText: { color: '#000e5e', fontSize: 12, fontWeight: '600' },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { color: '#1a1c1f', fontSize: 14, fontWeight: '600' },
  required: { color: '#ba1a1a', fontWeight: '700' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', minHeight: 50, borderRadius: 12, backgroundColor: '#f3f3f7', paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1a1c1f', fontSize: 14, paddingVertical: 12 },
  inputError: { borderWidth: 1, borderColor: '#ba1a1a' },
  visibilityButton: { padding: 5 },
  errorText: { color: '#ba1a1a', fontSize: 11, marginTop: 4, fontWeight: '500' },
  strengthSection: { gap: 6, marginTop: -4 },
  strengthBars: { flexDirection: 'row', gap: 8 },
  strengthBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#e2e2e6' },
  strengthText: { color: '#584238', fontSize: 11, fontWeight: '600' },
  criteriaCard: { gap: 8, padding: 14, borderRadius: 12, backgroundColor: '#f3f3f7' },
  criteriaTitle: { color: '#584238', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  criterion: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  criterionText: { color: '#584238', fontSize: 12 },
  criterionValid: { color: '#006b55', fontWeight: '600' },
  submitButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, backgroundColor: '#f26f21', elevation: 3 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  advisoryCard: { gap: 10, marginTop: 24, padding: 16, borderRadius: 18, backgroundColor: '#eeedf2' },
  advisoryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  advisoryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffdbcc' },
  advisoryTitle: { flex: 1, color: '#1a1c1f', fontSize: 16, fontWeight: '600' },
  advisoryText: { color: '#584238', fontSize: 12, lineHeight: 18 },
  emphasis: { color: '#1a1c1f', fontWeight: '600' },
  hotlineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  hotlineLabel: { color: '#584238', fontSize: 12 },
  hotlineNumber: { color: '#a04100', fontSize: 12, fontWeight: '700' },
  returnButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  returnButtonText: { color: '#a04100', fontSize: 12, fontWeight: '600' },
});
