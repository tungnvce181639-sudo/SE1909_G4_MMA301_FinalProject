import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import FormTextField from '../../components/common/FormTextField';
import AvatarPicker from '../../components/common/AvatarPicker';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import ErrorBanner from '../../components/common/ErrorBanner';

const defaultAvatar = 'https://ui-avatars.com/api/?background=random&name=User';

export default function EditProfileScreen({ navigation }) {
  const { theme, primaryColor, fontSizeScale } = useTheme();
  const { profile, updateProfileData } = useProfile();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
  });
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load profile data on mount
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || profile.fullName || '',
        phone: profile.phone || profile.phoneNumber || '',
        address: profile.address || '',
        bio: profile.bio || '',
      });
      setAvatarUri(profile.avatar || profile.avatarUrl || null);
    }
  }, [profile]);

  // Track unsaved changes
  useEffect(() => {
    if (profile) {
      const isChanged =
        formData.name !== (profile.name || profile.fullName || '') ||
        formData.phone !== (profile.phone || profile.phoneNumber || '') ||
        formData.address !== (profile.address || '') ||
        formData.bio !== (profile.bio || '') ||
        avatarUri !== (profile.avatar || profile.avatarUrl || null);
      setHasUnsavedChanges(isChanged);
    }
  }, [formData, avatarUri, profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAvatarChange = (uri) => {
    setAvatarUri(uri);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (formData.bio && formData.bio.length > 200) {
      errors.bio = 'Giới thiệu không được quá 200 ký tự';
    }

    setFieldErrors(errors);
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Vui lòng sửa các lỗi trong form');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const updates = {
        name: formData.name,
        fullName: formData.name,
        phone: formData.phone,
        phoneNumber: formData.phone,
        address: formData.address,
        bio: formData.bio,
      };

      if (avatarUri && avatarUri !== (profile.avatar || profile.avatarUrl)) {
        updates.avatar = avatarUri;
        updates.avatarUrl = avatarUri;
      }

      await updateProfileData(updates);
      setSuccess(true);
      setHasUnsavedChanges(false);

      // Show success message and navigate back
      setTimeout(() => {
        Alert.alert('Thành công', 'Đã lưu hồ sơ thành công!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }, 500);
    } catch (err) {
      console.error('[EditProfileScreen] Error saving profile:', err);
      setError(err.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Chưa lưu thay đổi',
        'Bạn có muốn lưu thay đổi trước khi thoát không?',
        [
          {
            text: 'Không lưu',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Lưu',
            onPress: handleSave,
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerButton}
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: 20 * fontSizeScale }]}>
          Chỉnh sửa hồ sơ
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !hasUnsavedChanges}
          style={styles.headerButton}
          accessibilityLabel="Lưu thay đổi"
        >
          {loading ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <Text style={[styles.saveButtonText, { color: hasUnsavedChanges ? primaryColor : theme.textSecondary, fontSize: 14 * fontSizeScale }]}>
              Lưu
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      <ErrorBanner
        visible={!!error}
        message={error}
        onDismiss={() => setError(null)}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <AvatarPicker
            avatarUri={avatarUri}
            size={82}
            editable={true}
            onAvatarChange={handleAvatarChange}
            showEditButton={true}
          />
          <Text style={[styles.avatarHint, { color: theme.textSecondary, fontSize: 12 * fontSizeScale }]}>
            Chạm vào ảnh để đổi avatar
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <FormTextField
            label="Họ và tên"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Nhập họ và tên của bạn"
            icon="person-outline"
            iconColor={primaryColor}
            error={fieldErrors.name}
          />

          <FormTextField
            label="Số điện thoại"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            icon="call-outline"
            iconColor={primaryColor}
            error={fieldErrors.phone}
          />

          <FormTextField
            label="Địa chỉ"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            placeholder="Nhập địa chỉ của bạn"
            icon="location-outline"
            iconColor={primaryColor}
          />

          <FormTextField
            label="Giới thiệu"
            value={formData.bio}
            onChangeText={(text) => handleChange('bio', text)}
            placeholder="Giới thiệu ngắn về bản thân"
            multiline={true}
            numberOfLines={4}
            icon="document-text-outline"
            iconColor={primaryColor}
            error={fieldErrors.bio}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !hasUnsavedChanges}
          style={[
            styles.saveButton,
            {
              backgroundColor: hasUnsavedChanges ? primaryColor : theme.border,
              opacity: loading || !hasUnsavedChanges ? 0.5 : 1,
            },
          ]}
          accessibilityLabel="Lưu thay đổi hồ sơ"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.saveButtonText, { fontSize: 14 * fontSizeScale }]}>
              Lưu thay đổi
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message="Đang lưu..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  saveButtonText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  avatarHint: {
    marginTop: 12,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
});
