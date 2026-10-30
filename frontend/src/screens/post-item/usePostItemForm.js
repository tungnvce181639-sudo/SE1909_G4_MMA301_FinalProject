import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { createListing, updateListing } from '../../services/api/productApi';
import { CATEGORIES, CONDITIONS, LOCATIONS } from './listingConstants';
import { validateListing } from './listingValidation';

const INITIAL_VALUES = {
  title: '',
  images: [],
  category: '',
  condition: '',
  price: '',
  description: '',
  location: LOCATIONS[0],
  locationCoords: null,
  negotiable: true,
};

// Owns listing form state, device permissions, validation and Firestore submit flow.
export default function usePostItemForm({ navigation, listingId, user, profile }) {
  const userId = user?.uid || user?.firebaseUid;
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(listingId));
  const [existingListing, setExistingListing] = useState(null);
  const category = useMemo(() => CATEGORIES.find((item) => item.id === values.category), [values.category]);
  const condition = useMemo(() => CONDITIONS.find((item) => item.id === values.condition), [values.condition]);

  useEffect(() => {
    if (!listingId) {
      setExistingListing(null);
      setValues(INITIAL_VALUES);
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    setIsLoading(true);
    getDoc(doc(db, 'products', listingId))
      .then((snapshot) => {
        if (!snapshot.exists()) throw new Error('Không tìm thấy tin đăng.');
        const data = snapshot.data();
        if (!userId || data.seller?.uid !== userId) {
          throw new Error('Bạn không có quyền chỉnh sửa tin này.');
        }
        if (!active) return;
        setExistingListing(data);
        setValues({
          ...INITIAL_VALUES,
          title: data.title || '',
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
          category: data.category || '',
          condition: data.condition || '',
          price: String(data.price ?? ''),
          description: typeof data.description === 'string' ? data.description : '',
          location: data.location || LOCATIONS[0],
          locationCoords: data.locationCoords || null,
          negotiable: data.negotiable ?? true,
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error('[PostItemScreen] Failed to load listing:', error);
        Alert.alert('Không thể mở tin đăng', error.message || 'Vui lòng thử lại.');
        navigation.setParams({ listingId: undefined });
        navigation.navigate('MyListings');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [listingId, navigation, userId]);

  const change = useCallback((key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }, []);

  const addImages = useCallback(async () => {
    if (values.images.length >= 5) {
      Alert.alert('Đã đủ ảnh', 'Tin đăng chỉ hỗ trợ tối đa 5 ảnh.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần cấp quyền', 'Cho phép truy cập thư viện ảnh để chọn ảnh sản phẩm.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5 - values.images.length,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.length) return;
      if (result.assets.some((asset) => !asset.base64)) {
        Alert.alert('Không đọc được ảnh', 'Vui lòng chọn lại ảnh từ thư viện.');
        return;
      }
      const selected = result.assets.map((asset) => {
        const mimeType = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
        return `data:${mimeType};base64,${asset.base64}`;
      });
      setValues((current) => ({ ...current, images: [...current.images, ...selected].slice(0, 5) }));
      setErrors((current) => ({ ...current, images: undefined }));
    } catch (error) {
      console.error('[PostItemScreen] Image picker failed:', error);
      Alert.alert('Không thể chọn ảnh', error.message || 'Kiểm tra quyền thư viện rồi thử lại.');
    }
  }, [values.images.length]);

  const removeImage = useCallback((index) => {
    setValues((current) => ({ ...current, images: current.images.filter((_, position) => position !== index) }));
  }, []);

  const pickLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Cho phép truy cập vị trí hoặc chọn điểm hẹn trong danh sách.');
        return;
      }
      if (Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (error) {
          console.warn('[PostItemScreen] Could not enable network location provider:', error);
        }
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        Alert.alert('GPS đang tắt', 'Bật dịch vụ vị trí hoặc chọn điểm hẹn trong danh sách.');
        return;
      }

      let position;
      try {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
      } catch (currentError) {
        position = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 500 });
        if (!position) throw currentError;
      }

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      let label = `GPS (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`;
      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) {
          label = [
            address.name,
            address.street,
            address.district,
            address.city,
          ].filter(Boolean).join(', ') || label;
        }
      } catch (error) {
        console.warn('[PostItemScreen] Reverse geocoding unavailable; keeping coordinates:', error);
      }
      setValues((current) => ({ ...current, location: label, locationCoords: coords }));
      setErrors((current) => ({ ...current, location: undefined }));
      Alert.alert('Đã ghim vị trí', 'Tọa độ GPS đã được lưu cùng tin đăng.');
    } catch (error) {
      console.warn('[PostItemScreen] GPS unavailable:', error);
      Alert.alert('Không lấy được GPS', 'LDPlayer cần bật dịch vụ vị trí và đặt tọa độ bằng công cụ Location. Bạn vẫn có thể chọn điểm hẹn bên dưới.');
    }
  }, []);

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setExistingListing(null);
  }, []);

  const submit = useCallback(async () => {
    const validationErrors = validateListing({
      title: values.title,
      images: values.images,
      category: values.category,
      condition: values.condition,
      price: values.price,
      description: values.description,
      selectedLocation: values.location,
    });
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      Alert.alert('Chưa đủ thông tin', 'Kiểm tra các trường được đánh dấu bên dưới.');
      return;
    }
    if (!userId) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập lại trước khi đăng tin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const numericPrice = Number(String(values.price).replace(/[^0-9]/g, ''));
      const listingData = {
        title: values.title.trim(),
        category: values.category,
        condition: values.condition,
        conditionLabel: condition?.label || values.condition,
        price: numericPrice,
        priceDisplay: `${numericPrice.toLocaleString('vi-VN')} ₫`,
        description: values.description.trim(),
        location: values.location,
        locationCoords: values.locationCoords,
        campus: 'FPT Hòa Lạc',
        negotiable: values.negotiable,
        status: existingListing?.status || 'pending',
        seller: {
          ...existingListing?.seller,
          uid: userId,
          name: profile?.fullName || profile?.name || 'Sinh viên FPT',
          tag: profile?.major ? `${profile.studentId || 'SV'} ${profile.major}` : (profile?.studentId || 'SV FPT'),
          avatar: profile?.avatarUrl || profile?.avatar || null,
          verified: Boolean(user.email?.endsWith('@fpt.edu.vn') || user.email?.endsWith('@fe.edu.vn')),
          phone: profile?.phone || null,
        },
      };

      if (listingId) {
        await updateListing(listingId, listingData, userId, values.images);
        Alert.alert('Đã cập nhật tin', 'Thông tin tin đăng đã được lưu.', [
          {
            text: 'Xem tin của tôi',
            onPress: () => {
              navigation.setParams({ listingId: undefined });
              navigation.navigate('MyListings');
            },
          },
          {
            text: 'Đóng',
            onPress: () => {
              navigation.setParams({ listingId: undefined });
              navigation.navigate('MyListings');
            },
          },
        ]);
      } else {
        await createListing(listingData, userId, values.images);
        Alert.alert('Đăng tin thành công', 'Tin đang chờ quản trị viên duyệt.', [
          { text: 'Xem tin của tôi', onPress: () => navigation.navigate('MyListings') },
          { text: 'Đăng tin khác', onPress: reset },
        ]);
      }
    } catch (error) {
      console.error('[PostItemScreen] Submit failed:', {
        statusCode: error?.statusCode || error?.response?.status || null,
        code: error?.code || error?.originalError?.code || 'unknown',
        message: error?.message || 'Unknown submit error',
      });
      Alert.alert('Đăng tin thất bại', error.message || 'Không thể lưu tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [condition, existingListing, listingId, navigation, profile, reset, user?.email, userId, values]);

  return {
    values, errors, isSubmitting, isLoading, isEditing: Boolean(listingId),
    change, addImages, removeImage, pickLocation, submit,
  };
}
