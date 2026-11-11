import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ORDERS_COLLECTION = 'orders';

function toOrder(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getOrdersForUser(userId) {
  if (!userId) throw new Error('Bạn cần đăng nhập để xem đơn hàng.');

  const [buyerSnapshot, sellerSnapshot] = await Promise.all([
    getDocs(query(collection(db, ORDERS_COLLECTION), where('buyerId', '==', userId))),
    getDocs(query(collection(db, ORDERS_COLLECTION), where('sellerId', '==', userId))),
  ]);
  const orders = new Map();
  [...buyerSnapshot.docs, ...sellerSnapshot.docs].forEach((snapshot) => {
    orders.set(snapshot.id, toOrder(snapshot));
  });
  return [...orders.values()].sort((first, second) => {
    const firstDate = first.createdAt?.toDate?.()?.getTime?.() || 0;
    const secondDate = second.createdAt?.toDate?.()?.getTime?.() || 0;
    return secondDate - firstDate;
  });
}

export async function createOrder({ product, buyer, sellerId }) {
  const buyerId = buyer?.uid || buyer?.firebaseUid || buyer?._id;
  if (!buyerId) throw new Error('Không xác định được tài khoản người mua.');
  if (!product?.id || !product?.title) throw new Error('Thông tin sản phẩm không hợp lệ.');

  const order = {
    buyerId,
    buyerName: buyer.fullName || buyer.displayName || buyer.email || 'Sinh viên',
    sellerId: sellerId || null,
    sellerName: product.seller?.name || 'Người bán',
    productId: product.id,
    productTitle: product.title,
    productDescription:
      product.description?.conditionDetail ||
      (typeof product.description === 'string' ? product.description : ''),
    productCategory: product.category || 'Sản phẩm',
    productLocation: product.location || '',
    productPrice: Number(product.price) || 0,
    productImage: product.images?.[0] || product.image || '',
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
  return { id: orderRef.id, ...order };
}

export async function updateOrderStatus(orderId, status) {
  if (!orderId || !['approved', 'completed', 'cancelled'].includes(status)) {
    throw new Error('Trạng thái đơn hàng không hợp lệ.');
  }

  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
