import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { loginWithEmail, loginWithGoogle } from '../../services/authService';

const getScaledFontSize = (size, scale) =>
  size * (typeof scale === 'number' ? scale : 1);

export default function LoginScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { login, googleSignIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const surfaceColor = theme?.background || theme?.surface || '#f9f9fd';
  const textColor = theme?.text || theme?.onSurface || (isDarkMode ? '#f5f5f5' : '#1a1c1f');
  const mutedColor = theme?.textSecondary || theme?.onSurfaceVariant || (isDarkMode ? '#b9b9c0' : '#584238');
  const cardColor = theme?.card || theme?.surfaceContainerLowest || (isDarkMode ? '#24252a' : '#ffffff');
  const inputColor = theme?.input || theme?.surfaceContainerLow || (isDarkMode ? '#303136' : '#f3f3f7');
  const borderColor = theme?.border || theme?.surfaceVariant || (isDarkMode ? '#4a4b52' : '#e2e2e6');
  const accentColor = primaryColor || '#f26f21';

  const showNotice = (message, success = false) => {
    setNotice(message);
    setIsSuccess(success);
  };

  /**
   * Handle Email/Password authentication
   */
  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      showNotice('Vui lòng điền tài khoản email sinh viên!');
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('@fpt.edu.vn')) {
      showNotice('Vui lòng sử dụng định dạng MSSV@fpt.edu.vn');
      return;
    }

    if (!password) {
      showNotice('Vui lòng nhập mật khẩu tài khoản');
      return;
    }

    setNotice('');
    setIsLoading(true);

    try {
      // Connect to authService (or useAuth context wrapper)
      if (login) {
        await login(trimmedEmail, password);
      } else {
        await loginWithEmail(trimmedEmail, password);
      }
      showNotice('Đăng nhập thành công!', true);
    } catch (error) {
      console.error('[LoginScreen] handleLogin error:', error);
      Alert.alert('Lỗi đăng nhập', error.message || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google Sign-in flow
   */
  const handleGoogleSignIn = async () => {
    setNotice('');
    setIsGoogleLoading(true);

    try {
      // Connect to Google Sign-in workflow in authService / useAuth
      if (googleSignIn) {
        await googleSignIn();
      } else {
        await loginWithGoogle();
      }
      showNotice('Đăng nhập Google thành công!', true);
    } catch (error) {
      console.error('[LoginScreen] handleGoogleSignIn error:', error);
      Alert.alert(
        'Đăng nhập Google thất bại',
        error.message || 'Không thể xác thực bằng tài khoản Google FPT.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = () => {
    navigation?.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, { backgroundColor: surfaceColor }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: cardColor, borderColor: accentColor }]}>
            <Ionicons name="storefront" size={34} color={accentColor} />
          </View>
          <View style={[styles.trustBadge, { backgroundColor: `${accentColor}22` }]}>
            <Ionicons name="checkmark-circle" size={14} color={accentColor} />
            <Text style={[styles.trustText, { color: accentColor, fontSize: getScaledFontSize(10, fontSizeScale) }]}>
              DÀNH RIÊNG CHO SINH VIÊN FPT
            </Text>
          </View>
          <Text style={[styles.title, { color: textColor, fontSize: getScaledFontSize(27, fontSizeScale) }]}>
            SmartCampus <Text style={{ color: accentColor }}>Market</Text>
          </Text>
          <Text style={[styles.subtitle, { color: mutedColor, fontSize: getScaledFontSize(14, fontSizeScale) }]}>
            Chợ đồ cũ sinh viên thông minh • Trao đổi an tâm
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          {notice ? (
            <View style={[styles.notice, { backgroundColor: isSuccess ? '#d9f7ed' : inputColor }]}>
              <Ionicons
                name={isSuccess ? 'checkmark-circle' : 'information-circle'}
                size={18}
                color={isSuccess ? '#006b55' : accentColor}
              />
              <Text
                style={[
                  styles.noticeText,
                  { color: isSuccess ? '#006b55' : textColor, fontSize: getScaledFontSize(12, fontSizeScale) },
                ]}
              >
                {notice}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: textColor, fontSize: getScaledFontSize(12, fontSizeScale) }]}>
                Email sinh viên <Text style={{ color: accentColor }}>*</Text>
              </Text>
              <Text style={[styles.hint, { color: mutedColor, fontSize: getScaledFontSize(10, fontSizeScale) }]}>
                MSSV @fpt.edu.vn
              </Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={mutedColor} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!isLoading && !isGoogleLoading}
                onChangeText={setEmail}
                placeholder="mssv@fpt.edu.vn"
                placeholderTextColor={mutedColor}
                style={[
                  styles.input,
                  { backgroundColor: inputColor, color: textColor, fontSize: getScaledFontSize(14, fontSizeScale) },
                ]}
                value={email}
              />
              {email ? (
                <Pressable
                  accessibilityLabel="Xóa email"
                  onPress={() => setEmail('')}
                  style={styles.trailingButton}
                >
                  <Ionicons name="close-circle" size={19} color={mutedColor} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: textColor, fontSize: getScaledFontSize(12, fontSizeScale) }]}>
              Mật khẩu <Text style={{ color: accentColor }}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={mutedColor} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading && !isGoogleLoading}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={mutedColor}
                secureTextEntry={!isPasswordVisible}
                style={[
                  styles.input,
                  { backgroundColor: inputColor, color: textColor, fontSize: getScaledFontSize(14, fontSizeScale) },
                ]}
                value={password}
              />
              <Pressable
                accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
                style={styles.trailingButton}
              >
                <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color={mutedColor} />
              </Pressable>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            disabled={isLoading || isGoogleLoading}
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotButton}
          >
            <Text style={[styles.actionText, { color: accentColor, fontSize: getScaledFontSize(12, fontSizeScale) }]}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* Login Button with Loading State */}
          <TouchableOpacity
            disabled={isLoading || isGoogleLoading}
            onPress={handleLogin}
            style={[styles.primaryButton, { backgroundColor: accentColor, opacity: isLoading ? 0.8 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={[styles.primaryButtonText, { fontSize: getScaledFontSize(14, fontSizeScale) }]}>
                  ĐĂNG NHẬP
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          {/* Register Navigation */}
          <TouchableOpacity
            disabled={isLoading || isGoogleLoading}
            onPress={handleRegister}
            style={[styles.secondaryButton, { backgroundColor: inputColor }]}
          >
            <Ionicons name="person-add-outline" size={18} color={mutedColor} />
            <Text
              style={[
                styles.secondaryButtonText,
                { color: textColor, fontSize: getScaledFontSize(14, fontSizeScale) },
              ]}
            >
              Đăng ký tài khoản mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
          <Text style={[styles.dividerText, { color: mutedColor, fontSize: getScaledFontSize(12, fontSizeScale) }]}>
            Hoặc đăng nhập bằng
          </Text>
          <View style={[styles.divider, { backgroundColor: borderColor }]} />
        </View>

        {/* Google Sign-in Button with Loading State */}
        <TouchableOpacity
          disabled={isLoading || isGoogleLoading}
          onPress={handleGoogleSignIn}
          style={[styles.googleButton, { backgroundColor: cardColor, opacity: isGoogleLoading ? 0.7 : 1 }]}
        >
          <View style={styles.socialContent}>
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#4285f4" />
            ) : (
              <Ionicons name="logo-google" size={21} color="#4285f4" />
            )}
            <View>
              <Text style={[styles.socialTitle, { color: textColor, fontSize: getScaledFontSize(14, fontSizeScale) }]}>
                {isGoogleLoading ? 'Đang kết nối Google...' : 'Google FPT Edu'}
              </Text>
              <Text style={[styles.socialSubtitle, { color: mutedColor, fontSize: getScaledFontSize(10, fontSizeScale) }]}>
                @fpt.edu.vn workspace
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={accentColor} />
        </TouchableOpacity>

        <View style={[styles.badges, { backgroundColor: inputColor }]}>
          <TrustBadge
            icon="shield-checkmark-outline"
            text="Xác thực FPT ID"
            color="#006b55"
            mutedColor={mutedColor}
            fontSizeScale={fontSizeScale}
          />
          <View style={[styles.badgeDivider, { backgroundColor: borderColor }]} />
          <TrustBadge
            icon="hand-left-outline"
            text="Giao dịch nội khu"
            color={accentColor}
            mutedColor={mutedColor}
            fontSizeScale={fontSizeScale}
          />
          <View style={[styles.badgeDivider, { backgroundColor: borderColor }]} />
          <TrustBadge
            icon="shield-outline"
            text="0% Phí sàn"
            color="#3351ff"
            mutedColor={mutedColor}
            fontSizeScale={fontSizeScale}
          />
        </View>

        <Text style={[styles.footerText, { color: mutedColor, fontSize: getScaledFontSize(12, fontSizeScale) }]}>
          <Ionicons name="lock-closed-outline" size={14} color="#006b55" /> Bảo vệ bởi hệ sinh thái sinh viên FPT Edu
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TrustBadge({ icon, text, color, mutedColor, fontSizeScale }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[styles.badgeText, { color: mutedColor, fontSize: getScaledFontSize(9, fontSizeScale) }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  logo: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 12,
    padding: 14,
  },
  trustBadge: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  trustText: { fontWeight: '700', letterSpacing: 0.5 },
  title: { fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { marginTop: 4, textAlign: 'center' },
  card: { borderRadius: 14, gap: 16, padding: 20 },
  notice: { alignItems: 'center', borderRadius: 9, flexDirection: 'row', gap: 8, padding: 12 },
  noticeText: { flex: 1, fontWeight: '600' },
  field: { gap: 7 },
  labelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontWeight: '600' },
  hint: { fontWeight: '400' },
  inputWrapper: { alignItems: 'center', flexDirection: 'row' },
  inputIcon: { left: 14, position: 'absolute', zIndex: 1 },
  input: { borderRadius: 9, flex: 1, height: 48, paddingHorizontal: 44 },
  trailingButton: { padding: 8, position: 'absolute', right: 5 },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: 2 },
  actionText: { fontWeight: '600' },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', letterSpacing: 1 },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: { fontWeight: '600' },
  dividerRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginVertical: 24, paddingHorizontal: 8 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontWeight: '600' },
  googleButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  socialContent: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  socialTitle: { fontWeight: '600' },
  socialSubtitle: { marginTop: 2 },
  badges: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  badge: { alignItems: 'center', flex: 1, gap: 4 },
  badgeText: { textAlign: 'center' },
  badgeDivider: { height: 20, width: 1 },
  footerText: { marginTop: 24, textAlign: 'center' },
});
