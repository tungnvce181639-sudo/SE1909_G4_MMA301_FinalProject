import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  validateFPTEduEmail,
  validatePassword,
  validateFullName,
  validatePasswordMatch,
} from '../../utils/validation';
import apiClient from '../../services/api/apiClient';

export default function RegisterScreen({ navigation }) {
  const { theme, primaryColor } = useTheme();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const surfaceColor = theme?.background || '#f9f9fd';
  const textColor = theme?.text || '#1a1c1f';
  const mutedColor = theme?.textSecondary || '#584238';
  const cardColor = theme?.card || '#ffffff';
  const inputColor = theme?.input || '#f3f3f7';
  const borderColor = theme?.border || '#e2e2e6';
  const accentColor = primaryColor || '#f26f21';
  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async () => {
    // Reset errors
    setErrors({});

    // Validate full name
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      setErrors((prev) => ({ ...prev, fullName: nameValidation.error }));
      return;
    }

    // Validate email
    const emailValidation = validateFPTEduEmail(email);
    if (!emailValidation.isValid) {
      setErrors((prev) => ({ ...prev, email: emailValidation.error }));
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrors((prev) => ({ ...prev, password: passwordValidation.error }));
      return;
    }

    // Validate password match
    const matchValidation = validatePasswordMatch(password, confirmPassword);
    if (!matchValidation.isValid) {
      setErrors((prev) => ({ ...prev, confirmPassword: matchValidation.error }));
      return;
    }

    // Check terms acceptance
    if (!termsAccepted) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với quy chế văn hóa giao dịch để tiếp tục.');
      return;
    }

    setIsSubmitting(true);

    try {
      // BƯỚC 1: Kiểm tra email qua backend API
      let emailCheckData;
      try {
        emailCheckData = await apiClient.post('/auth/check-email', {
          email: email.trim(),
        });
      } catch (emailCheckError) {
        // Bất kỳ lỗi nào trong quá trình kiểm tra email đều DỪNG lại ngay
        let errorMessage = 'Không thể kiểm tra email. Vui lòng thử lại.';

        if (emailCheckError.message === 'Network Error') {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.';
        } else if (emailCheckError.code === 'ECONNREFUSED' || emailCheckError.code === 'ERR_NETWORK') {
          errorMessage = 'Máy chủ không phản hồi. Vui lòng đảm bảo backend đang chạy trên port 5000.';
        } else if (emailCheckError.statusCode === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        } else if (emailCheckError.message) {
          errorMessage = emailCheckError.message;
        }

        Alert.alert('Lỗi kiểm tra email', errorMessage);
        setIsSubmitting(false);
        return;
      }

      // BƯỚC 2: Nếu email đã tồn tại (exists: true)
      console.log('[RegisterScreen] Email check result:', emailCheckData);
      if (emailCheckData && emailCheckData.exists) {
        console.log('[RegisterScreen] Email already exists - stopping flow');
        Alert.alert(
          'Tài khoản đã tồn tại',
          'Email này đã được đăng ký. Bạn sẽ được chuyển đến trang đăng nhập.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login');
              },
            },
          ]
        );
        setIsSubmitting(false);
        return;
      }

      // BƯỚC 3: Nếu email chưa tồn tại (exists: false) - gửi OTP
      console.log('[RegisterScreen] Email does not exist - proceeding to send OTP');
      try {
        // Generate OTP (in production, this should be sent by backend)
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('[RegisterScreen] Generated OTP:', generatedOTP);

        // Send OTP via EmailJS
        const emailData = {
          service_id: 'service_fgcne1k',
          template_id: 'template_svmcnzn',
          user_id: '9ZH5YHDvmUrekjwkP',
          template_params: {
            email: email.trim(),
            passcode: generatedOTP,
          },
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error('Failed to send OTP email');
        }

        // Navigate to OTP verification screen with registration data
        navigation.navigate('OTPVerification', {
          email: email.trim(),
          actualOTP: generatedOTP,
          registrationData: {
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            phoneNumber: null,
          },
          isRegistration: true,
        });
      } catch (otpError) {
        // Lỗi khi gửi OTP - không tiếp tục
        Alert.alert(
          'Lỗi gửi OTP',
          'Không thể gửi mã OTP đến email của bạn. Vui lòng thử lại sau.'
        );
        setIsSubmitting(false);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: surfaceColor }]}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNavigation}>
            <TouchableOpacity
              accessibilityLabel="Quay lại"
              onPress={() => navigation?.goBack()}
              style={[styles.backButton, { backgroundColor: inputColor }]}
            >
              <Ionicons name="arrow-back" size={20} color={textColor} />
            </TouchableOpacity>
            <View style={[styles.accountBadge, { backgroundColor: '#dee0ff' }]}>
              <Ionicons name="school-outline" size={14} color="#000e5e" />
              <Text style={styles.accountBadgeText}>FPT Edu Account</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.campusRow}>
              <View style={[styles.campusDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.campusText, { color: accentColor }]}>HOLA PARK CAMPUS</Text>
            </View>
            <Text style={[styles.title, { color: textColor }]}>Tạo tài khoản mới</Text>
            <Text style={[styles.description, { color: mutedColor }]}>
              Đăng ký tài khoản để mua bán giáo trình, pass đồ dùng KTX Hola Park nhanh chóng & an toàn.
            </Text>
          </View>

          <View style={[styles.form, { backgroundColor: cardColor }]}>
            <FieldLabel text="Họ và tên sinh viên" textColor={textColor} accentColor={accentColor} />
            <Input
              icon="person-outline"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChangeText={setFullName}
              textColor={textColor}
              mutedColor={mutedColor}
              inputColor={inputColor}
              error={errors.fullName}
            />
            {errors.fullName ? <Text style={[styles.errorText, { color: '#ba1a1a' }]}>{errors.fullName}</Text> : null}

            <View style={styles.labelRow}>
              <FieldLabel text="Email FPT Edu" textColor={textColor} accentColor={accentColor} />
              <View style={[styles.emailBadge, { backgroundColor: '#d9f7ed' }]}>
                <Ionicons name="checkmark-circle-outline" size={12} color="#006b55" />
                <Text style={styles.emailBadgeText}>Đuôi @fpt.edu.vn</Text>
              </View>
            </View>
            <Input
              icon="mail-outline"
              placeholder="anvhe180123@fpt.edu.vn"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              textColor={textColor}
              mutedColor={mutedColor}
              inputColor={inputColor}
              error={errors.email}
            />
            {errors.email ? <Text style={[styles.errorText, { color: '#ba1a1a' }]}>{errors.email}</Text> : null}
            <Text style={[styles.helperText, { color: mutedColor }]}>
              <Ionicons name="checkmark-circle" size={14} color="#006b55" /> Dùng email trường để nhận tick xác thực sinh viên uy tín.
            </Text>

            <FieldLabel text="Mật khẩu" textColor={textColor} accentColor={accentColor} />
            <Input
              icon="lock-closed-outline"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              textColor={textColor}
              mutedColor={mutedColor}
              inputColor={inputColor}
              trailingIcon={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              onTrailingPress={() => setIsPasswordVisible((visible) => !visible)}
              error={errors.password}
            />
            {errors.password ? <Text style={[styles.errorText, { color: '#ba1a1a' }]}>{errors.password}</Text> : null}
            <PasswordStrength strength={passwordStrength} mutedColor={mutedColor} accentColor={accentColor} />

            <FieldLabel text="Xác nhận mật khẩu" textColor={textColor} accentColor={accentColor} />
            <Input
              icon="shield-checkmark-outline"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              autoCapitalize="none"
              textColor={textColor}
              mutedColor={mutedColor}
              inputColor={inputColor}
              trailingIcon={confirmPassword === password && confirmPassword ? 'checkmark-circle' : (isConfirmPasswordVisible ? 'eye-outline' : 'eye-off-outline')}
              trailingColor={confirmPassword === password && confirmPassword ? '#006b55' : mutedColor}
              onTrailingPress={confirmPassword === password && confirmPassword ? undefined : () => setIsConfirmPasswordVisible((visible) => !visible)}
              error={errors.confirmPassword}
            />
            {errors.confirmPassword ? <Text style={[styles.errorText, { color: '#ba1a1a' }]}>{errors.confirmPassword}</Text> : null}

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: termsAccepted }}
              onPress={() => setTermsAccepted((accepted) => !accepted)}
              style={[styles.terms, { backgroundColor: inputColor }]}
            >
              <View style={[styles.checkbox, { backgroundColor: termsAccepted ? accentColor : cardColor, borderColor }]}>
                {termsAccepted ? <Ionicons name="checkmark" size={16} color="#ffffff" /> : null}
              </View>
              <Text style={[styles.termsText, { color: textColor }]}>
                Tôi đồng ý với <Text style={[styles.termsLink, { color: accentColor }]}>Quy chế văn hóa giao dịch</Text> & bảo vệ dữ liệu sinh viên KTX Hola Park.
              </Text>
            </Pressable>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isSubmitting}
              style={[styles.primaryButton, { backgroundColor: accentColor, opacity: isSubmitting ? 0.7 : 1 }]}
            >
              {isSubmitting ? (
                <Text style={styles.primaryButtonText}>Đang gửi OTP...</Text>
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Đăng ký tài khoản</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <Text style={[styles.dividerText, { color: mutedColor }]}>HOẶC TIẾP TỤC VỚI</Text>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
          </View>

          <TouchableOpacity style={[styles.googleButton, { backgroundColor: cardColor }]}>
            <Ionicons name="logo-google" size={20} color="#4285f4" />
            <Text style={[styles.googleText, { color: textColor }]}>FPT Mail (@fpt.edu.vn)</Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={[styles.loginPromptText, { color: mutedColor }]}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
              <Text style={[styles.loginLink, { color: accentColor }]}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footer, { color: mutedColor }]}>
            <Ionicons name="lock-closed-outline" size={14} color="#006b55" /> Bảo vệ bởi hệ sinh thái sinh viên FPT Edu
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ text, textColor, accentColor }) {
  return (
    <Text style={[styles.label, { color: textColor }]}>
      {text} <Text style={{ color: accentColor }}>*</Text>
    </Text>
  );
}

function Input({
  icon,
  placeholder,
  textColor,
  mutedColor,
  inputColor,
  trailingIcon,
  trailingColor,
  onTrailingPress,
  error,
  ...props
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={mutedColor} style={styles.inputIcon} />
      <TextInput
        {...props}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        style={[
          styles.input,
          { backgroundColor: inputColor, color: textColor },
          error && styles.inputError,
        ]}
      />
      {trailingIcon ? (
        <Pressable disabled={!onTrailingPress} onPress={onTrailingPress} style={styles.trailingButton}>
          <Ionicons name={trailingIcon} size={20} color={trailingColor || mutedColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

function getPasswordStrength(password) {
  if (!password) return { label: 'Độ mạnh', color: '#8c7166', level: 0 };
  if (password.length < 6) return { label: 'Yếu', color: '#ba1a1a', level: 1 };
  if (password.length < 10) return { label: 'Tốt', color: '#f26f21', level: 2 };
  return { label: 'Rất mạnh', color: '#006b55', level: 3 };
}

function PasswordStrength({ strength, mutedColor, accentColor }) {
  return (
    <View style={styles.strengthRow}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[styles.strengthBar, { backgroundColor: index < strength.level ? strength.color : '#e8e8ec' }]}
        />
      ))}
      <Text style={[styles.strengthText, { color: strength.level ? strength.color : mutedColor }]}>
        {strength.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  topNavigation: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  accountBadge: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 6 },
  accountBadgeText: { color: '#000e5e', fontSize: 10, fontWeight: '700' },
  hero: { gap: 8, marginBottom: 24 },
  campusRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  campusDot: { borderRadius: 5, height: 10, width: 10 },
  campusText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '700', marginTop: 4 },
  description: { fontSize: 14, lineHeight: 21 },
  form: { borderRadius: 14, gap: 8, padding: 16 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  labelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  emailBadge: { alignItems: 'center', borderRadius: 4, flexDirection: 'row', gap: 3, paddingHorizontal: 8, paddingVertical: 3 },
  emailBadgeText: { color: '#006b55', fontSize: 10, fontWeight: '700' },
  inputWrapper: { alignItems: 'center', flexDirection: 'row', marginBottom: 2 },
  inputIcon: { left: 14, position: 'absolute', zIndex: 1 },
  input: { borderRadius: 10, flex: 1, fontSize: 14, height: 48, paddingHorizontal: 44 },
  inputError: { borderWidth: 1, borderColor: '#ba1a1a' },
  trailingButton: { padding: 8, position: 'absolute', right: 4 },
  helperText: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  errorText: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  strengthRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: 4, paddingHorizontal: 2 },
  strengthBar: { borderRadius: 3, flex: 1, height: 4 },
  strengthText: { fontSize: 10, paddingLeft: 2 },
  terms: { alignItems: 'flex-start', borderRadius: 10, flexDirection: 'row', gap: 12, marginTop: 8, padding: 14 },
  checkbox: { alignItems: 'center', borderRadius: 4, borderWidth: 1, height: 20, justifyContent: 'center', width: 20 },
  termsText: { flex: 1, fontSize: 12, lineHeight: 18 },
  termsLink: { fontWeight: '700' },
  primaryButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 8, height: 48, justifyContent: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  googleButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 12, justifyContent: 'center', padding: 15 },
  googleText: { fontSize: 14, fontWeight: '600' },
  loginPrompt: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginPromptText: { fontSize: 12 },
  loginLink: { fontSize: 12, fontWeight: '700' },
  footer: { fontSize: 12, marginTop: 24, textAlign: 'center' },
});
