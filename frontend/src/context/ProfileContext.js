import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { db, USERS_COLLECTION } from '../services/firebaseConfig';
import profileApi from '../services/api/profileApi';

const ProfileContext = createContext(null);

const defaultProfile = {
  name: 'Sinh viên FPT',
  fullName: 'Sinh viên FPT',
  studentId: 'Chưa cập nhật MSSV',
  major: 'Chưa cập nhật ngành học',
  avatar: null,
  avatarUrl: null,
  walletPoints: 0,
  role: null,
};

export function ProfileProvider({ children, initialProfile = defaultProfile }) {
  const auth = useAuth();
  const user = auth?.user;
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!user) {
        setProfile(initialProfile);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        const fullName = data.fullName || user.displayName || initialProfile.fullName;
        const avatarUrl = data.avatarUrl || null;

        if (isActive) {
          setProfile({
            ...initialProfile,
            ...data,
            fullName,
            name: data.name || fullName,
            avatarUrl,
            avatar: data.avatar || avatarUrl,
            role: data.role || null,
          });
        }
      } catch (error) {
        console.error('[ProfileContext] Loading profile failed:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      isActive = false;
    };
  }, [initialProfile, user]);

  const updateProfileData = useCallback(async (updates) => {
    if (!user) {
      throw new Error('Cannot update profile without an authenticated user.');
    }

    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.name && !normalizedUpdates.fullName) {
      normalizedUpdates.fullName = normalizedUpdates.name;
    }
    if (normalizedUpdates.fullName && !normalizedUpdates.name) {
      normalizedUpdates.name = normalizedUpdates.fullName;
    }
    if (normalizedUpdates.avatar && !normalizedUpdates.avatarUrl) {
      normalizedUpdates.avatarUrl = normalizedUpdates.avatar;
    }
    if (normalizedUpdates.avatarUrl && !normalizedUpdates.avatar) {
      normalizedUpdates.avatar = normalizedUpdates.avatarUrl;
    }

    try {
      // Try to update via backend API first
      const apiUpdates = {
        fullName: normalizedUpdates.fullName,
        phoneNumber: normalizedUpdates.phone || normalizedUpdates.phoneNumber,
        avatarUrl: normalizedUpdates.avatarUrl,
      };

      // Remove undefined values
      Object.keys(apiUpdates).forEach(key => {
        if (apiUpdates[key] === undefined) {
          delete apiUpdates[key];
        }
      });

      // Only call API if there are valid updates
      if (Object.keys(apiUpdates).length > 0) {
        await profileApi.updateProfile(apiUpdates);
      }

      // Also update Firestore as fallback/sync
      await setDoc(doc(db, USERS_COLLECTION, user.uid), normalizedUpdates, { merge: true });
      setProfile((currentProfile) => ({ ...currentProfile, ...normalizedUpdates }));
      return normalizedUpdates;
    } catch (error) {
      console.error('[ProfileContext] Updating profile failed:', error);
      // If API fails, still try to update Firestore
      try {
        await setDoc(doc(db, USERS_COLLECTION, user.uid), normalizedUpdates, { merge: true });
        setProfile((currentProfile) => ({ ...currentProfile, ...normalizedUpdates }));
        return normalizedUpdates;
      } catch (firestoreError) {
        console.error('[ProfileContext] Firestore update also failed:', firestoreError);
        throw error;
      }
    }
  }, [user]);

  const updateAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần cấp quyền', 'Vui lòng cho phép truy cập thư viện ảnh để đổi ảnh đại diện.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    const avatarUrl = result.canceled ? null : result.assets?.[0]?.uri;

    if (!avatarUrl) {
      return null;
    }

    await updateProfileData({ avatarUrl, avatar: avatarUrl });
    return avatarUrl;
  }, [updateProfileData]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      isLoading: loading,
      setProfile,
      updateProfileData,
      updateAvatar,
    }),
    [loading, profile, updateAvatar, updateProfileData],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext) || {
    profile: defaultProfile,
    loading: false,
    isLoading: false,
  };
}