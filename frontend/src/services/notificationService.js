import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { AppOwnership } from 'expo-constants';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';
import {
  registerPushToken,
  unregisterPushToken,
  updatePushPreferences,
} from './api/notificationApi';

const SETTINGS_KEY = '@smartcampus/settings';
const PUSH_TOKEN_KEY = '@smartcampus/expoPushToken';

let notificationsModule;

async function getNotificationsModule() {
  if (Constants.appOwnership === AppOwnership.Expo) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return notificationsModule;
}

export async function requestNotificationPermission() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return true;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Đơn hàng',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f26f21',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function sendOrderNotification(title, body, sound = true) {
  const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
  const preferences = savedSettings ? JSON.parse(savedSettings).notifications : null;
  if (preferences?.orders === false) return false;

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    Alert.alert(title, body);
    return true;
  }

  const permitted = await requestNotificationPermission();
  if (!permitted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: sound && preferences?.sound !== false ? 'default' : null,
      data: { type: 'order' },
    },
    trigger: null,
  });
  return true;
}

export async function registerForRemoteNotifications(userId, sound = false) {
  if (!userId) throw new Error('Không xác định được tài khoản để đăng ký thông báo.');
  if (!Device.isDevice) throw new Error('Push notification cần chạy trên thiết bị thật.');

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    console.info('[notificationService] Expo Push requires a development or release build.');
    return null;
  }

  const permitted = await requestNotificationPermission();
  if (!permitted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('Chưa liên kết EAS project. Chạy "npx eas-cli init" trong thư mục frontend.');
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken(tokenResult.data, sound);
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, tokenResult.data);
  return tokenResult.data;
}

export async function updateRemoteNotificationSound(sound) {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  if (token) await updatePushPreferences(sound);
}

export async function unregisterFromRemoteNotifications() {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  if (!token) return;
  await unregisterPushToken();
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}