import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';

const defaultAvatar = 'https://ui-avatars.com/api/?background=random&name=User';

export default function AvatarPicker({
  avatarUri,
  size = 82,
  editable = true,
  onAvatarChange,
  showEditButton = true,
}) {
  const { theme, primaryColor } = useTheme();

  const handlePickImage = async () => {
    if (!editable) return;

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần cấp quyền',
          'Vui lòng cho phép truy cập thư viện ảnh để đổi ảnh đại diện.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (onAvatarChange) {
          onAvatarChange(uri);
        }
      }
    } catch (error) {
      console.error('[AvatarPicker] Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const avatarSource = avatarUri
    ? { uri: avatarUri }
    : { uri: defaultAvatar };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity
        onPress={handlePickImage}
        disabled={!editable}
        activeOpacity={editable ? 0.7 : 1}
        accessibilityLabel="Đổi ảnh đại diện"
        accessibilityRole="button"
        accessibilityState={{ disabled: !editable }}
      >
        <View
          style={[
            styles.avatarContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: theme.card,
            },
          ]}
        >
          <Image
            source={avatarSource}
            style={[
              styles.avatar,
              {
                width: size - 6,
                height: size - 6,
                borderRadius: (size - 6) / 2,
              },
            ]}
          />
          {showEditButton && editable && (
            <TouchableOpacity
              style={[
                styles.editButton,
                {
                  backgroundColor: theme.card,
                  right: -2,
                  bottom: -2,
                },
              ]}
              onPress={handlePickImage}
              accessibilityLabel="Đổi ảnh đại diện"
              accessibilityRole="button"
            >
              <Ionicons name="camera-outline" size={15} color={primaryColor} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  avatarContainer: {
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatar: {
    backgroundColor: '#e8e8ec',
  },
  editButton: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
