import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api/apiClient';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen({ route, navigation }) {
  const { email, actualOTP, registrationData, isRegistration } = route.params || {};
  const { register } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { formattedTime, isRunning, start, reset } = useCountdown(120, () => {
    // Timer expired callback
  });

  useEffect(() => {
    start();
  }, [start]);

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (
      nativeEvent.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.join('') !== actualOTP) {
      Alert.alert('Mã OTP không chính xác', 'Vui lòng kiểm tra lại mã trong email của bạn.');
      return;
    }

    setIsVerifying(true);

    try {
      if (isRegistration && registrationData) {
        // Registration flow: proceed with registration
        await register(registrationData.email, registrationData.password, registrationData.fullName);
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
          },
        ]);
      } else {
        // Password reset flow: verify OTP with backend
        await apiClient.post('/auth/verify-otp', { email, otp: otp.join('') });
        navigation.navigate('CreateNewPassword', { email: email });
      }
    } catch (error) {
      console.error('[OTPVerificationScreen] Error:', error);
      Alert.alert('Lỗi', error.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isRunning) {
      Alert.alert('Thông báo', 'Vui lòng đợi đến khi hết thời gian đếm ngược.');
      return;
    }

    setIsResending(true);

    try {
      // Call backend to generate new OTP and send email
      const response = await apiClient.post('/auth/forgot-password', { email });

      // Update the actualOTP in route params
      navigation.setParams({ actualOTP: response.otp });

      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
      start(); // Restart countdown
    } catch (error) {
      console.error('[OTPVerificationScreen] Resend error:', error);
      Alert.alert('Lỗi', 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topNavigation}>
            <TouchableOpacity
              accessibilityLabel="Quay lại"
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1a1c1f" />
            </TouchableOpacity>

            <View style={styles.accountBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#f26f21" />
              <Text style={styles.accountBadgeText}>FPT Edu Secure</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIconWrapper}>
              <View style={styles.heroIcon}>
                <Ionicons name="mail-open" size={36} color="#f26f21" />
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
              </View>
            </View>

            <View style={styles.campusTag}>
              <View style={styles.campusDot} />
              <Text style={styles.campusTagText}>HOLA PARK CAMPUS • BẢO MẬT 2 LỚP</Text>
            </View>

            <Text style={styles.title}>Xác thực OTP</Text>
            <Text style={styles.description}>
              {isRegistration
                ? 'Vui lòng nhập mã 6 số đã được gửi đến email để hoàn tất đăng ký'
                : 'Vui lòng nhập mã 6 số đã được gửi đến email'
              }
            </Text>
            <View style={styles.emailChip}>
              <Ionicons name="at-outline" size={16} color="#0031e8" />
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>

          <View style={styles.otpSection}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  accessibilityLabel={`Mã OTP số ${index + 1}`}
                  autoComplete="one-time-code"
                  key={index}
                  keyboardType="numeric"
                  maxLength={1}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  selectTextOnFocus
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : styles.otpInputEmpty,
                    index === otp.findIndex((value) => !value) && styles.otpInputActive,
                  ]}
                  textAlign="center"
                  value={digit}
                />
              ))}
            </View>
          </View>

          <View style={styles.timerSection}>
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={16} color="#f26f21" />
              <Text style={styles.timerLabel}>Mã có hiệu lực trong:</Text>
              <Text style={styles.timer}>{formattedTime}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleResendOTP}
              disabled={isRunning || isResending}
              style={styles.resendButton}
            >
              <Text style={styles.resendLabel}>
                {isResending ? 'Đang gửi...' : isRunning ? 'Gửi lại sau:' : 'Chưa nhận được mã?'}
              </Text>
              <Text style={[styles.resendText, isRunning && styles.resendTextDisabled]}>
                {isRunning ? formattedTime : 'Gửi lại mã'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleVerifyOTP}
            disabled={isVerifying}
            style={[styles.submitButton, isVerifying && styles.submitButtonDisabled]}
          >
            {isVerifying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Xác nhận</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityCard}>
            <View style={styles.securityTitleRow}>
              <View style={styles.securityIcon}>
                <Ionicons name="shield-checkmark" size={18} color="#f26f21" />
              </View>
              <Text style={styles.securityTitle}>Lưu ý bảo mật FPT Hola</Text>
              <Text style={styles.ruleBadge}>Campus Rule</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color="#006b55" />
              <Text style={styles.guidelineText}>
                Tuyệt đối không chia sẻ mã OTP cho bất kỳ ai, kể cả Admin Marketplace hoặc Quản lý KTX.
              </Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color="#006b55" />
              <Text style={styles.guidelineText}>
                Giao dịch an toàn trực tiếp tại các điểm hẹn công cộng.
              </Text>
            </View>
            <View style={styles.hotlineRow}>
              <View style={styles.hotlineLabel}>
                <Ionicons name="headset-outline" size={16} color="#0031e8" />
                <View>
                  <Text style={styles.hotlineCaption}>Hotline An Ninh KTX Hola</Text>
                  <Text style={styles.hotlineNumber}>(024) 7300 1866</Text>
                </View>
              </View>
              <TouchableOpacity accessibilityRole="link" style={styles.callButton}>
                <Ionicons name="call-outline" size={14} color="#1a1c1f" />
                <Text style={styles.callText}>Gọi</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.returnButton}
          >
            <Ionicons name="swap-horizontal" size={16} color="#0031e8" />
            <Text style={styles.returnButtonText}>Đổi phương thức xác thực hoặc Đăng nhập lại</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f9f9fd',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  topNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#1a1c1f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    width: 40,
  },
  accountBadge: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  accountBadgeText: {
    color: '#584238',
    fontSize: 12,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 16,
  },
  heroIconWrapper: {
    alignItems: 'center',
    backgroundColor: '#ffdbcc',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 12,
    width: 80,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: '#f26f21',
    borderRadius: 14,
    bottom: -2,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 28,
  },
  campusTag: {
    alignItems: 'center',
    backgroundColor: '#e8e8ec',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  campusDot: {
    backgroundColor: '#f26f21',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  campusTagText: {
    color: '#584238',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: '#1a1c1f',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#584238',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emailChip: {
    alignItems: 'center',
    backgroundColor: '#eeedf2',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  emailText: {
    color: '#1a1c1f',
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  otpSection: {
    marginVertical: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    height: 62,
    width: 43,
  },
  otpInputEmpty: {
    backgroundColor: '#e8e8ec',
    color: '#1a1c1f',
  },
  otpInputFilled: {
    backgroundColor: '#ffffff',
    color: '#1a1c1f',
    elevation: 2,
    shadowColor: '#1a1c1f',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  otpInputActive: {
    backgroundColor: '#ffdbcc',
    borderColor: '#f26f21',
    borderWidth: 2,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  timerLabel: {
    color: '#584238',
    fontSize: 12,
  },
  timer: {
    color: '#f26f21',
    fontSize: 20,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
    padding: 4,
  },
  resendLabel: {
    color: '#584238',
    fontSize: 12,
  },
  resendText: {
    color: '#a04100',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: '#8c7166',
    textDecorationLine: 'none',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#f26f21',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  securityCard: {
    backgroundColor: '#eeedf2',
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  securityTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  securityIcon: {
    alignItems: 'center',
    backgroundColor: '#ffede7',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  securityTitle: {
    color: '#1a1c1f',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  ruleBadge: {
    backgroundColor: '#e8e8ec',
    borderRadius: 12,
    color: '#584238',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guideline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  guidelineText: {
    color: '#584238',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  hotlineRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  hotlineLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  hotlineCaption: {
    color: '#584238',
    fontSize: 10,
  },
  hotlineNumber: {
    color: '#1a1c1f',
    fontSize: 12,
    fontWeight: '700',
  },
  callButton: {
    alignItems: 'center',
    backgroundColor: '#e8e8ec',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  callText: {
    color: '#1a1c1f',
    fontSize: 10,
    fontWeight: '700',
  },
  returnButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  returnButtonText: {
    color: '#0031e8',
    fontSize: 12,
  },
});
