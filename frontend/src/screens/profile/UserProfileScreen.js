import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';

const defaultAvatar = 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&q=80';

const menuGroups = [
  {
    title: 'Quản lý giao dịch',
    items: [
      { label: 'Quản lý tin đăng', icon: 'clipboard-outline', iconColor: '#f26f21', iconBackground: '#ffdbcc', badge: '3 tin đang bán', route: 'MyListings' },
      { label: 'Lịch sử mua & đổi đồ', icon: 'bag-handle-outline', iconColor: '#3351ff', iconBackground: '#dee0ff' },
      { label: 'Mục yêu thích & Đã lưu', icon: 'heart-outline', iconColor: '#ba1a1a', iconBackground: '#ffdad6', detail: '14 món' },
    ],
  },
  {
    title: 'Tài khoản & Dịch vụ Campus',
    items: [
      { label: 'Chỉnh sửa hồ sơ', description: 'Thông tin liên lạc, KTX / Phòng học', icon: 'person-outline', iconColor: '#006b55', iconBackground: '#c7f8ea', route: 'EditProfile' },
      { label: 'Xác thực Thẻ SV & VNu-ID', description: 'Hạn xác thực: Học kỳ Spring 2025', icon: 'shield-checkmark-outline', iconColor: '#a04100', iconBackground: '#ffdbcc' },
      { label: 'Đánh giá từ bạn bè Campus', icon: 'star-outline', iconColor: '#f26f21', iconBackground: '#e8e8ec', detail: '4.9 / 5.0' },
    ],
  },
  {
    title: 'Hệ thống & Hỗ trợ',
    items: [
      { label: 'Cài đặt ứng dụng & Thông báo', icon: 'options-outline', iconColor: '#584238', iconBackground: '#e8e8ec', route: 'Settings' },
      { label: 'Trung tâm trợ giúp sinh viên', description: 'Quy tắc giao dịch an toàn tại KTX', icon: 'headset-outline', iconColor: '#0031e8', iconBackground: '#dee0ff' },
    ],
  },
];

function MenuItem({ item, navigation, theme, fontSizeScale }) {
  const handlePress = () => {
    if (item.route === 'MyListings') {
      navigation.navigate('MyListings');
    } else if (item.route === 'EditProfile') {
      navigation.navigate('EditProfile');
    } else if (item.route === 'Settings') {
      navigation.navigate('Settings');
    }
  };

  const content = (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: item.iconBackground }]}>
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.menuText}>
          <Text style={[styles.menuLabel, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
            {item.label}
          </Text>
          {item.description ? (
            <Text style={[styles.menuDescription, { color: theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
              {item.description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge ? (
          <Text style={[styles.badge, { backgroundColor: '#f26f21', fontSize: 10 * fontSizeScale }]}>
            {item.badge}
          </Text>
        ) : item.detail ? (
          <Text style={[styles.detail, { color: theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
            {item.detail}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={!item.route}
    >
      {content}
    </TouchableOpacity>
  );
}

export default function UserProfileScreen({ navigation }) {
  const { theme, isDarkMode, primaryColor, fontSizeScale } = useTheme();
  const { profile } = useProfile();
  const avatar = profile.avatar
    ? (typeof profile.avatar === 'string' ? { uri: profile.avatar } : profile.avatar)
    : { uri: defaultAvatar };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
          Student Profile
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity accessibilityLabel="Search Market" style={styles.headerButton}>
            <Ionicons name="search-outline" size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={[styles.headerAvatar, { backgroundColor: primaryColor }]}>
            <Ionicons name="person" size={18} color="#ffffff" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.identityCard, { backgroundColor: primaryColor }]}>
          <View style={styles.identityTopRow}>
            <View style={styles.campusPill}>
              <View style={styles.onlineDot} />
              <Text style={styles.campusText}>FPT UNIVERSITY CAMPUS</Text>
            </View>
            <View style={styles.identityActions}>
              <TouchableOpacity accessibilityLabel="Thông báo" style={styles.identityButton}>
                <Ionicons name="notifications-outline" size={20} color="#ffffff" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Cài đặt tài khoản"
                style={styles.identityButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Image source={avatar} style={styles.avatar} />
              <TouchableOpacity
                accessibilityLabel="Đổi ảnh đại diện"
                style={[styles.editAvatarButton, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="camera-outline" size={15} color={primaryColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={[styles.profileName, { fontSize: 20 * fontSizeScale }]}>
                  {profile.name}
                </Text>
                <Text style={styles.yearPill}>K16</Text>
              </View>
              <Text numberOfLines={1} style={[styles.profileMeta, { fontSize: 12 * fontSizeScale }]}>
                {profile.studentId} • {profile.major}
              </Text>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={16} color="#006b55" />
                <Text style={styles.verifiedText}>Đã xác minh FPT-ID / VNu</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Stat value="18" label="Đã đăng bán" theme={theme} fontSizeScale={fontSizeScale} />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <Stat value="12" label="Đã bàn giao" valueColor={primaryColor} theme={theme} fontSizeScale={fontSizeScale} />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <Stat value="4.9" label="42 đánh giá" icon="star" theme={theme} fontSizeScale={fontSizeScale} />
        </View>

        <View style={[styles.walletCard, { backgroundColor: theme.card }]}>
          <View style={styles.walletHeader}>
            <View style={styles.walletTitleRow}>
              <View style={[styles.smallIcon, { backgroundColor: '#ffdbcc' }]}>
                <Ionicons name="wallet-outline" size={18} color={primaryColor} />
              </View>
              <Text style={[styles.walletTitle, { color: theme.text, fontSize: 14 * fontSizeScale }]}>
                Campus Wallet & Xu
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.detailsLink, { color: primaryColor }]}>Chi tiết ›</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.balanceRow, { backgroundColor: theme.background }]}>
            <View>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Số dư khả dụng</Text>
              <Text style={[styles.balanceValue, { color: theme.text, fontSize: 20 * fontSizeScale }]}>350.000đ</Text>
            </View>
            <View>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>SmartPoints</Text>
              <Text style={[styles.balanceValue, { color: primaryColor, fontSize: 20 * fontSizeScale }]}>1.250 <Text style={styles.pointsLabel}>Xu</Text></Text>
            </View>
          </View>
          <View style={styles.walletActions}>
            <TouchableOpacity style={[styles.walletButton, { backgroundColor: primaryColor }]}>
              <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.walletButtonText}>Nạp / Rút ví</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.walletButton, { backgroundColor: theme.background }]}>
              <Ionicons name="gift-outline" size={18} color={primaryColor} />
              <Text style={[styles.walletButtonText, { color: theme.text }]}>Đổi voucher SV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {menuGroups.map((group) => (
          <View key={group.title} style={[styles.menuGroup, { backgroundColor: theme.card }]}>
            <Text style={[styles.groupTitle, { color: theme.textSecondary, fontSize: 10 * fontSizeScale }]}>
              {group.title.toUpperCase()}
            </Text>
            {group.items.map((item) => (
              <MenuItem key={item.label} item={item} navigation={navigation} theme={theme} fontSizeScale={fontSizeScale} />
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerTitle, { color: theme.textSecondary }]}>SMARTCAMPUS MARKET • FPT UNIVERSITY</Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Mạng lưới mua bán trao đổi an toàn dành riêng cho sinh viên</Text>
          <Text style={[styles.modeText, { color: theme.textSecondary }]}>{isDarkMode ? 'Chế độ tối' : 'Chế độ sáng'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label, valueColor, icon, theme, fontSizeScale }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: valueColor || theme.text, fontSize: 20 * fontSizeScale }]}>{value}</Text>
        {icon ? <Ionicons name={icon} size={16} color="#f26f21" /> : null}
      </View>
      <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: 10 * fontSizeScale }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 28 },
  identityCard: { padding: 16, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  identityTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  campusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)' },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#6dfad2', marginRight: 6 },
  campusText: { color: '#ffffff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  identityActions: { flexDirection: 'row', gap: 8 },
  identityButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: '#3351ff' },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrapper: { width: 82, height: 82, borderRadius: 41, padding: 3, backgroundColor: 'rgba(255,255,255,0.45)', marginRight: 14 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#e8e8ec' },
  editAvatarButton: { position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  profileDetails: { flex: 1, paddingTop: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  profileName: { color: '#ffffff', fontWeight: '700', flexShrink: 1 },
  yearPill: { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8, fontSize: 10, fontWeight: '700' },
  profileMeta: { color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: 16, paddingHorizontal: 9, paddingVertical: 6, marginTop: 10 },
  verifiedText: { color: '#006b55', fontSize: 10, fontWeight: '700', marginLeft: 4 },
  statsCard: { marginHorizontal: 16, marginTop: -12, borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  stat: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statValue: { fontWeight: '700' },
  statLabel: { marginTop: 2 },
  statDivider: { width: 1, height: 32 },
  walletCard: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 12, elevation: 1 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  walletTitleRow: { flexDirection: 'row', alignItems: 'center' },
  smallIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  walletTitle: { fontWeight: '600' },
  detailsLink: { fontSize: 12, fontWeight: '700' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8, padding: 12 },
  balanceLabel: { fontSize: 12 },
  balanceValue: { fontWeight: '700', marginTop: 3 },
  pointsLabel: { fontSize: 12, fontWeight: '400' },
  walletActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  walletButton: { flex: 1, height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  walletButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  menuGroup: { marginHorizontal: 16, marginTop: 16, padding: 6, borderRadius: 12, elevation: 1 },
  groupTitle: { fontWeight: '700', letterSpacing: 1, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  menuItem: { minHeight: 58, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuItemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  menuIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { flex: 1 },
  menuLabel: { fontWeight: '600' },
  menuDescription: { marginTop: 2 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 6 },
  badge: { color: '#ffffff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, fontWeight: '700' },
  detail: { fontWeight: '600' },
  footer: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 24 },
  footerTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textAlign: 'center' },
  footerText: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  modeText: { fontSize: 10, marginTop: 8 },
});
