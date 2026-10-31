const admin = require('../../config/firebaseAdmin');
const userRepository = require('../repositories/userRepository');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const validExpoToken = /^(Exponent|Expo)PushToken\[[A-Za-z0-9_-]+\]$/;

const eventCopy = {
  created: (order) => ({
    title: 'Bạn có yêu cầu mua mới',
    body: `${order.productTitle || 'Sản phẩm'} - người mua đang chờ bạn duyệt.`,
  }),
  approved: (order) => ({
    title: 'Yêu cầu mua đã được duyệt',
    body: `Người bán đã duyệt yêu cầu cho ${order.productTitle || 'sản phẩm'}.`,
  }),
  completed: (order) => ({
    title: 'Đơn hàng đã hoàn thành',
    body: `Giao dịch ${order.productTitle || 'sản phẩm'} đã hoàn tất.`,
  }),
  cancelled: (order) => ({
    title: 'Đơn hàng đã bị hủy',
    body: `Yêu cầu cho ${order.productTitle || 'sản phẩm'} đã bị hủy.`,
  }),
};

function getActorSide(order, actorIds) {
  const buyerMatches = actorIds.includes(String(order.buyerId));
  const sellerMatches = actorIds.includes(String(order.sellerId));
  if (buyerMatches && sellerMatches) return 'both';
  if (buyerMatches) return 'buyer';
  if (sellerMatches) return 'seller';
  return null;
}

function getRecipientId(order, event, actorSide) {
  if (event === 'created' && actorSide === 'buyer' && order.status === 'pending') return order.sellerId;
  if (event === 'approved' && actorSide === 'seller' && order.status === 'approved') return order.buyerId;
  if (event === 'cancelled' && actorSide === 'buyer' && order.status === 'cancelled') return order.sellerId;
  if (event === 'completed' && order.status === 'completed') {
    if (actorSide === 'buyer') return order.sellerId;
    if (actorSide === 'seller') return order.buyerId;
  }
  return null;
}

async function saveDeviceToken(userId, token, sound) {
  const user = await userRepository.updateExpoPushToken(userId, token, sound);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
}

async function sendExpoPush(token, message, orderId, event, sound) {
  let response;
  try {
    response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: message.title,
        body: message.body,
        sound: sound ? 'default' : null,
        priority: 'high',
        channelId: 'orders',
        data: { type: 'order', orderId, event },
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (cause) {
    const error = new Error('Could not reach Expo Push Service.');
    error.statusCode = 502;
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Expo Push Service returned HTTP ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const result = await response.json();
  const tickets = Array.isArray(result.data) ? result.data : [result.data];
  const failedTicket = tickets.find((ticket) => ticket?.status === 'error');
  if (failedTicket) {
    const error = new Error(failedTicket.message || 'Expo could not deliver the push notification.');
    error.statusCode = 502;
    throw error;
  }
  if (tickets.length !== 1 || tickets[0]?.status !== 'ok') {
    const error = new Error('Expo returned an invalid push notification receipt.');
    error.statusCode = 502;
    throw error;
  }
}

async function notifyOrderEvent({ orderId, event, actorIds }) {
  if (!Object.prototype.hasOwnProperty.call(eventCopy, event)) {
    const error = new Error('Unsupported order notification event.');
    error.statusCode = 400;
    throw error;
  }

  const orderSnapshot = await admin.firestore().collection('orders').doc(orderId).get();
  if (!orderSnapshot.exists) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const order = orderSnapshot.data();
  const actorSide = getActorSide(order, actorIds);
  if (!actorSide) {
    const error = new Error('You are not a participant in this order.');
    error.statusCode = 403;
    throw error;
  }

  const recipientId = getRecipientId(order, event, actorSide);
  if (!recipientId) {
    const error = new Error('This order state does not allow the requested notification.');
    error.statusCode = 409;
    throw error;
  }

  const recipient = await userRepository.findByFirebaseUidOrId(String(recipientId));
  if (!recipient) {
    return { sent: false, reason: 'recipient_not_found' };
  }
  if (!recipient.expoPushToken || !validExpoToken.test(recipient.expoPushToken)) {
    return { sent: false, reason: 'recipient_has_no_push_token' };
  }

  await sendExpoPush(
    recipient.expoPushToken,
    eventCopy[event](order),
    orderId,
    event,
    recipient.notificationSound,
  );
  return { sent: true };
}

module.exports = {
  notifyOrderEvent,
  saveDeviceToken,
  validExpoToken,
};