import apiClient from './apiClient';

export async function registerPushToken(token, sound) {
  if (!token) throw new Error('Thiếu Expo Push Token.');
  return apiClient.post('/notifications/device-token', { token, sound });
}

export async function unregisterPushToken() {
  return apiClient.delete('/notifications/device-token');
}

export async function updatePushPreferences(sound) {
  return apiClient.put('/notifications/preferences', { sound });
}

export async function notifyOrderEvent(orderId, event) {
  if (!orderId || !['created', 'approved', 'completed', 'cancelled'].includes(event)) {
    throw new Error('Sự kiện đơn hàng không hợp lệ.');
  }
  return apiClient.post('/notifications/order-event', { orderId, event });
}
