import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SETTINGS_KEY = '@smartcampus/settings';
const colors = ['#f26f21', '#0031e8', '#006b55', '#8b5cf6', '#d946ef'];

export default function SettingsScreen({ navigation }) {
  const {
    theme,
    isDarkMode,
    toggleDarkMode,
    primaryColor,
    setPrimaryColor,
    fontSizeScale,
    setFontSizeScale,
  } = useTheme();
  const [notifications, setNotifications] = useState({
    orders: true,
    campus: true,
    sound: false,
    wifi: true,
  });

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(SETTINGS_KEY)
      .then((storedSettings) => {
        if (!mounted || !storedSettings) return;
        const savedSettings = JSON.parse(storedSettings);
        if (savedSettings.notifications) setNotifications(savedSettings.notifications);
        if (savedSettings.primaryColor) setPrimaryColor(savedSettings.primaryColor);
        if (savedSettings.fontSizeScale) setFontSizeScale(savedSettings.fontSizeScale);
      })
      .catch((error) => console.warn('Không thể tải cài đặt:', error));

    return () => {
      mounted = false;
    };
  }, [setFontSizeScale, setPrimaryColor]);

  useEffect(() => {
    AsyncStorage.mergeItem(
      SETTINGS_KEY,
      JSON.stringify({ notifications, primaryColor, fontSizeScale }),
    ).catch((error) => console.warn('Không thể lưu cài đặt:', error));
  }, [fontSizeScale, notifications, primaryColor]);

  const updateNotification = (key, value) => {
    setNotifications((current) => ({ ...current, [key]: value }));
  };

  const clearAppCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm?',
      'Thao tác này sẽ xóa dữ liệu cục bộ và các cài đặt đã lưu trên thiết bị.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            AsyncStorage.clear()
              .then(() => Alert.alert('Đã xóa cache', 'Bộ nhớ đệm ứng dụng đã được giải phóng.'))
              .catch(() => Alert.alert('Không thể xóa cache', 'Vui lòng thử lại sau.'));
          },
        },
      ],
    );
  };

  const renderSwitch = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.border, true: primaryColor }}
      thumbColor="#ffffff"
      ios_backgroundColor={theme.border}
    />
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} accessibilityLabel="Quay lại">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>Cài đặt & Giao diện</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('UserProfile')} accessibilityLabel="Tài khoản cá nhân">
          <View style={[styles.profileIcon, { backgroundColor: primaryColor }]}>
            <Ionicons name="person" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }}
            style={styles.profileImage}
          />
          <View style={styles.profileCopy}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: theme.text }]}>Nguyễn Minh Quân</Text>
              <Ionicons name="checkmark-circle" size={17} color="#0031e8" />
            </View>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>quan.nm.se17@fpt.edu.vn</Text>
            <View style={[styles.studentBadge, { backgroundColor: '#dee0ff' }]}>
              <Ionicons name="school-outline" size={12} color="#002bcf" />
              <Text style={styles.studentBadgeText}>Sinh viên FPT đã xác thực</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <SettingsSection title="Giao diện" icon="color-palette-outline" color={primaryColor} theme={theme}>
          <SettingsRow
            icon={isDarkMode ? 'moon' : 'sunny'}
            iconColor={primaryColor}
            title={isDarkMode ? 'Chế độ tối' : 'Chế độ sáng'}
            description="Tự động điều chỉnh màu sắc giao diện"
            theme={theme}
            trailing={renderSwitch(isDarkMode, toggleDarkMode)}
          />
          <Divider theme={theme} />
          <View style={styles.settingBlock}>
            <View style={styles.settingTitleRow}>
              <View style={[styles.rowIcon, { backgroundColor: `${primaryColor}18` }]}>
                <Ionicons name="color-palette-outline" size={19} color={primaryColor} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Màu chủ đạo</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Cá nhân hóa màu nhấn của ứng dụng</Text>
              </View>
            </View>
            <View style={styles.colorOptions}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, primaryColor === color && styles.selectedColor]}
                  onPress={() => setPrimaryColor(color)}
                  accessibilityLabel={`Chọn màu ${color}`}
                >
                  {primaryColor === color && <Ionicons name="checkmark" size={17} color="#ffffff" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Divider theme={theme} />
          <View style={styles.settingBlock}>
            <View style={styles.settingTitleRow}>
              <View style={[styles.rowIcon, { backgroundColor: `${primaryColor}18` }]}>
                <Ionicons name="text-outline" size={19} color={primaryColor} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Cỡ chữ</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Điều chỉnh kích thước văn bản</Text>
              </View>
            </View>
            <View style={[styles.fontOptions, { backgroundColor: theme.background }]}>
              {[
                { value: 0.9, label: 'Nhỏ' },
                { value: 1, label: 'Chuẩn' },
                { value: 1.15, label: 'Lớn' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.fontOption, fontSizeScale === option.value && { backgroundColor: primaryColor }]}
                  onPress={() => setFontSizeScale(option.value)}
                >
                  <Text style={[styles.fontOptionText, { color: fontSizeScale === option.value ? '#ffffff' : theme.textSecondary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.preview, { backgroundColor: theme.background }]}>
              <Ionicons name="eye-outline" size={18} color={primaryColor} />
              <Text style={[styles.previewText, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
                Mẫu hiển thị: Chợ đồ cũ sinh viên FPT Hola
              </Text>
            </View>
          </View>
        </SettingsSection>

        <SettingsSection title="Thông báo & Cảnh báo" icon="notifications-outline" color={primaryColor} theme={theme}>
          <SettingsRow icon="notifications-active-outline" iconColor={primaryColor} title="Đơn hàng & Điểm hẹn" description="Nhận tin khi có người đặt mua hoặc tới KTX" theme={theme} trailing={renderSwitch(notifications.orders, (value) => updateNotification('orders', value))} />
          <Divider theme={theme} />
          <SettingsRow icon="megaphone-outline" iconColor="#0031e8" title="Khuyến mãi & Tin Campus" description="Bản tin pass đồ xịn, hội chợ đồ cũ cuối kỳ" theme={theme} trailing={renderSwitch(notifications.campus, (value) => updateNotification('campus', value))} />
          <Divider theme={theme} />
          <SettingsRow icon="volume-medium-outline" iconColor="#006b55" title="Âm thanh & Rung phản hồi" description="Bật chuông báo tin nhắn trao đổi" theme={theme} trailing={renderSwitch(notifications.sound, (value) => updateNotification('sound', value))} />
        </SettingsSection>

        <SettingsSection title="Dữ liệu & Bộ nhớ" icon="server-outline" color={primaryColor} theme={theme}>
          <SettingsRow icon="server-outline" iconColor={theme.textSecondary} title="Dung lượng bộ nhớ đệm" description="Ảnh sản phẩm và cache danh mục" theme={theme} trailing={<Text style={[styles.cacheSize, { color: primaryColor }]}>48.6 MB</Text>} />
          <Divider theme={theme} />
          <SettingsRow
            icon="trash-outline"
            iconColor="#ba1a1a"
            title="Xóa Cache ứng dụng"
            description="AsyncStorage & hình ảnh tải về"
            theme={theme}
            trailing={
              <TouchableOpacity style={[styles.clearButton, { backgroundColor: theme.background }]} onPress={clearAppCache}>
                <Ionicons name="trash-outline" size={16} color="#ba1a1a" />
                <Text style={styles.clearButtonText}>Giải phóng</Text>
              </TouchableOpacity>
            }
          />
          <Divider theme={theme} />
          <SettingsRow icon="wifi-outline" iconColor="#006b55" title="Đồng bộ WiFi FPT Edu" description="Ưu tiên đồng bộ dữ liệu khi kết nối Campus" theme={theme} trailing={renderSwitch(notifications.wifi, (value) => updateNotification('wifi', value))} />
        </SettingsSection>

        <SettingsSection title="Hệ thống & Điều khoản" icon="information-circle-outline" color={primaryColor} theme={theme}>
          <SettingsRow icon="information-circle-outline" iconColor={theme.textSecondary} title="Phiên bản ứng dụng" description="Smart Campus Market" theme={theme} trailing={<Text style={[styles.version, { color: theme.textSecondary }]}>v1.0.0</Text>} />
          <Divider theme={theme} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: theme.text }]}>Điều khoản sử dụng</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          <Divider theme={theme} />
          <TouchableOpacity style={styles.linkRow}>
            <Text style={[styles.linkText, { color: theme.text }]}>Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, icon, color, theme, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={17} color={color} />
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function SettingsRow({ icon, iconColor, title, description, theme, trailing }) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.rowIcon, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      {trailing}
    </View>
  );
}

function Divider({ theme }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700' },
  profileIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 36, gap: 20 },
  profileCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e2e2e6' },
  profileCopy: { flex: 1, gap: 4 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 11 },
  studentBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  studentBadgeText: { color: '#002bcf', fontSize: 9, fontWeight: '700' },
  section: { gap: 8 },
  sectionTitleRow: { paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  settingRow: { minHeight: 76, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { fontSize: 14, fontWeight: '700' },
  settingDescription: { fontSize: 11, lineHeight: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 63 },
  settingBlock: { padding: 14, gap: 12 },
  settingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  colorOptions: { flexDirection: 'row', gap: 12, paddingLeft: 49 },
  colorOption: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  selectedColor: { borderWidth: 3, borderColor: '#ffffff', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 3, elevation: 3 },
  fontOptions: { borderRadius: 9, padding: 3, flexDirection: 'row', marginLeft: 49 },
  fontOption: { flex: 1, borderRadius: 7, paddingVertical: 8, alignItems: 'center' },
  fontOptionText: { fontSize: 11, fontWeight: '700' },
  preview: { borderRadius: 10, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewText: { flex: 1, lineHeight: 20 },
  cacheSize: { fontSize: 15, fontWeight: '700' },
  clearButton: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearButtonText: { color: '#ba1a1a', fontSize: 11, fontWeight: '700' },
  version: { fontSize: 11, fontWeight: '700' },
  linkRow: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { fontSize: 14, fontWeight: '600' },
});
