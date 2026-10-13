import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email của bạn.');
            return;
        }

        setIsSubmitting(true);

        try {
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            const emailData = {
                service_id: 'service_fgcne1k',
                template_id: 'template_svmcnzn',
                user_id: '9ZH5YHDvmUrekjwkP',
                template_params: {
                    email: email,         // Sửa từ to_email thành email (khớp với {{email}} bên phải)[cite: 5]
                    passcode: generatedOTP, // Sửa từ otp_code thành passcode (khớp với {{passcode}} trong nội dung)[cite: 5]
                },
            };

            console.log("Sending EmailJS data:", JSON.stringify(emailData, null, 2));

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || 'Failed to send email');
            }

            navigation.navigate('OTPVerification', { email: email, actualOTP: generatedOTP });
        } catch (error) {
            console.error("EMAILJS ERROR DETAIL:", error);
            Alert.alert("Lỗi Gửi Email", error.message || "Không thể gửi mã OTP, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior="padding"
                style={styles.flex}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.topNavigation}>
                        <TouchableOpacity
                            accessibilityLabel="Quay lại đăng nhập"
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={22} color="#1a1c1f" />
                        </TouchableOpacity>

                        <View style={styles.accountBadge}>
                            <Ionicons name="shield-checkmark" size={18} color="#f26f21" />
                            <Text style={styles.accountBadgeText}>FPT Edu Account</Text>
                        </View>
                    </View>

                    <View style={styles.hero}>
                        <View style={styles.heroIconWrapper}>
                            <View style={styles.heroIcon}>
                                <Ionicons name="key" size={36} color="#f26f21" />
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                            </View>
                        </View>

                        <View style={styles.campusTag}>
                            <View style={styles.campusDot} />
                            <Text style={styles.campusTagText}>HOLA PARK CAMPUS • BẢO MẬT TÀI KHOẢN</Text>
                        </View>

                        <Text style={styles.title}>Khôi phục mật khẩu</Text>
                        <Text style={styles.description}>
                            Vui lòng nhập địa chỉ email sinh viên đã đăng ký. Chúng tôi sẽ gửi liên kết khôi
                            phục an toàn tới hộp thư của bạn.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Email sinh viên FPT Edu</Text>
                            <Text style={styles.emailHint}>Đuôi @fpt.edu.vn</Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#584238" style={styles.inputIcon} />
                            <TextInput
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder="vd: tuanlmse160234@fpt.edu.vn"
                                placeholderTextColor="#8c7166"
                                style={styles.input}
                                value={email}
                            />
                        </View>

                        <View style={styles.helperRow}>
                            <Ionicons name="information-circle" size={16} color="#f26f21" />
                            <Text style={styles.helperText}>
                                Link đặt lại mật khẩu có hiệu lực trong <Text style={styles.helperTextStrong}>15 phút</Text>{' '}
                                qua hệ thống FPT Webmail.
                            </Text>
                        </View>

                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityState={{ disabled: isSubmitting }}
                                disabled={isSubmitting}
                                onPress={handleResetPassword}
                                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
                                </Text>
                                <Ionicons
                                    name={isSubmitting ? 'hourglass-outline' : 'arrow-forward'}
                                    size={20}
                                    color="#ffffff"
                                />
                            </TouchableOpacity>
                            <Text style={styles.submitHint}>
                                Kiểm tra hòm thư Spam/Rác nếu không thấy thư sau 1 phút
                            </Text>
                        </View>
                    </View>

                    <View style={styles.securityCard}>
                        <View style={styles.securityTitleRow}>
                            <View style={styles.securityIcon}>
                                <Ionicons name="shield-checkmark" size={18} color="#f26f21" />
                            </View>
                            <Text style={styles.securityTitle}>Cơ chế an toàn sinh viên Hola ID</Text>
                        </View>
                        <Text style={styles.securityDescription}>
                            Tuyệt đối không chia sẻ mã xác thực OTP hoặc liên kết khôi phục cho bất kỳ ai, kể cả
                            Admin KTX Hola hoặc Ban Quản lý ký túc xá.
                        </Text>
                        <View style={styles.hotlineRow}>
                            <View style={styles.hotlineLabel}>
                                <Ionicons name="headset-outline" size={16} color="#584238" />
                                <Text style={styles.hotlineLabelText}>Hotline hỗ trợ KTX:</Text>
                            </View>
                            <TouchableOpacity accessibilityRole="link">
                                <Text style={styles.hotlineNumber}>(024) 7300 1866</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => navigation.goBack()}
                        style={styles.returnButton}
                    >
                        <Ionicons name="arrow-back" size={18} color="#a04100" />
                        <Text style={styles.returnButtonText}>Quay lại trang Đăng nhập</Text>
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
        elevation: 1,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    accountBadgeText: {
        color: '#1a1c1f',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    hero: {
        alignItems: 'center',
        paddingTop: 8,
    },
    heroIconWrapper: {
        marginBottom: 16,
        position: 'relative',
    },
    heroIcon: {
        alignItems: 'center',
        backgroundColor: '#ffdbcc',
        borderRadius: 16,
        height: 64,
        justifyContent: 'center',
        width: 64,
    },
    verifiedBadge: {
        alignItems: 'center',
        backgroundColor: '#00aa89',
        borderRadius: 12,
        bottom: -4,
        height: 24,
        justifyContent: 'center',
        position: 'absolute',
        right: -4,
        width: 24,
    },
    campusTag: {
        alignItems: 'center',
        backgroundColor: '#eeedf2',
        borderRadius: 6,
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    campusDot: {
        backgroundColor: '#f26f21',
        borderRadius: 3,
        height: 6,
        width: 6,
    },
    campusTagText: {
        color: '#584238',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    title: {
        color: '#1a1c1f',
        fontSize: 30,
        fontWeight: '700',
        lineHeight: 38,
        marginTop: 4,
    },
    description: {
        color: '#584238',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        maxWidth: 340,
        textAlign: 'center',
    },
    form: {
        marginTop: 24,
    },
    labelRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        color: '#1a1c1f',
        fontSize: 14,
        fontWeight: '600',
    },
    emailHint: {
        color: '#584238',
        fontSize: 10,
        fontWeight: '700',
    },
    inputWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    inputIcon: {
        left: 14,
        position: 'absolute',
        zIndex: 1,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        color: '#1a1c1f',
        flex: 1,
        fontSize: 14,
        height: 48,
        paddingHorizontal: 44,
        shadowColor: '#1a1c1f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    helperRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 6,
        marginTop: 10,
        paddingHorizontal: 4,
    },
    helperText: {
        color: '#584238',
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
    },
    helperTextStrong: {
        color: '#1a1c1f',
        fontWeight: '600',
    },
    actionSection: {
        marginTop: 16,
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#f26f21',
        borderRadius: 12,
        flexDirection: 'row',
        gap: 8,
        height: 48,
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    submitHint: {
        color: '#584238',
        fontSize: 12,
        marginTop: 10,
        textAlign: 'center',
    },
    securityCard: {
        backgroundColor: '#f3f3f7',
        borderRadius: 16,
        marginTop: 24,
        padding: 16,
    },
    securityTitleRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    securityIcon: {
        alignItems: 'center',
        backgroundColor: '#e8e8ec',
        borderRadius: 8,
        height: 28,
        justifyContent: 'center',
        width: 28,
    },
    securityTitle: {
        color: '#1a1c1f',
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    securityDescription: {
        color: '#584238',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 12,
    },
    hotlineRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    hotlineLabel: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    hotlineLabelText: {
        color: '#584238',
        fontSize: 10,
        fontWeight: '700',
    },
    hotlineNumber: {
        color: '#0031e8',
        fontSize: 10,
        fontWeight: '700',
    },
    returnButton: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
        paddingVertical: 16,
    },
    returnButtonText: {
        color: '#a04100',
        fontSize: 14,
        fontWeight: '600',
    },
});
