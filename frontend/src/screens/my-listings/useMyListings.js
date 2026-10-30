import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const EMPTY_COUNTS = { active: 0, hidden: 0, pending: 0, rejected: 0, sold: 0 };

function getAge(createdAt) {
  const date = createdAt?.toDate ? createdAt.toDate() : createdAt instanceof Date ? createdAt : null;
  if (!date) return 'Vừa đăng';
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;
  return `${Math.floor(elapsedHours / 24)} ngày trước`;
}

function normalizeStatus(status) {
  if (status === 'showing') return 'active';
  return ['active', 'hidden', 'pending', 'rejected', 'sold'].includes(status) ? status : 'pending';
}

// Loads only this user's Firestore listings and enforces ownership before every mutation.
export default function useMyListings(user) {
  const userId = user?.uid || user?.firebaseUid;
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadListings = useCallback(async () => {
    if (!userId) {
      setListings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const listingQuery = query(collection(db, 'products'), where('seller.uid', '==', userId));
      const snapshot = await getDocs(listingQuery);
      const result = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data();
        return {
          ...data,
          id: snapshotDoc.id,
          status: normalizeStatus(data.status),
          priceDisplay: data.priceDisplay || `${Number(data.price || 0).toLocaleString('vi-VN')} ₫`,
          imageCount: Array.isArray(data.images) ? data.images.length : data.image ? 1 : 0,
          age: getAge(data.createdAt),
          views: Number(data.views || 0),
        };
      });
      result.sort((first, second) => {
        const firstDate = first.createdAt?.toMillis?.() || 0;
        const secondDate = second.createdAt?.toMillis?.() || 0;
        return secondDate - firstDate;
      });
      setListings(result);
    } catch (error) {
      console.error('[MyListingsScreen] Failed to load listings:', error);
      Alert.alert('Không thể tải tin đăng', error.message || 'Kiểm tra kết nối rồi thử lại.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    loadListings();
  }, [loadListings]));

  const counts = useMemo(() => listings.reduce((result, listing) => {
    result[listing.status] += 1;
    return result;
  }, { ...EMPTY_COUNTS }), [listings]);

  const mutateListing = useCallback(async (listing, mutation) => {
    if (!userId) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập lại để quản lý tin đăng.');
      return;
    }
    try {
      const listingRef = doc(db, 'products', listing.id);
      const snapshot = await getDoc(listingRef);
      if (!snapshot.exists()) throw new Error('Tin đăng không còn tồn tại.');
      if (snapshot.data().seller?.uid !== userId) {
        throw new Error('Bạn không có quyền thay đổi tin đăng này.');
      }
      await mutation(listingRef);
      await loadListings();
    } catch (error) {
      console.error('[MyListingsScreen] Listing operation failed:', error);
      Alert.alert('Không thể cập nhật tin', error.message || 'Vui lòng thử lại.');
    }
  }, [loadListings, userId]);

  const setStatus = useCallback((listing, status) => {
    mutateListing(listing, (listingRef) => updateDoc(listingRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'sold' ? { soldAt: serverTimestamp() } : {}),
    }));
  }, [mutateListing]);

  const confirmDelete = useCallback((listing) => {
    Alert.alert('Xóa tin đăng?', 'Thao tác này không thể hoàn tác.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tin',
        style: 'destructive',
        onPress: () => mutateListing(listing, (listingRef) => deleteDoc(listingRef)),
      },
    ]);
  }, [mutateListing]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, [loadListings]);

  return {
    listings,
    counts,
    activeTab,
    setActiveTab,
    selectedListings: listings.filter((listing) => listing.status === activeTab),
    total: listings.length,
    isLoading,
    refreshing,
    refresh,
    setStatus,
    confirmDelete,
  };
}
