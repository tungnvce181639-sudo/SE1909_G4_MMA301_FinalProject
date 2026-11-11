const admin = require('../../config/firebaseAdmin');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

class AdminListingController {
  getPendingListings = asyncHandler(async (req, res) => {
    try {
      const snapshot = await admin.firestore()
        .collection('products')
        .where('status', '==', 'pending')
        .get();

      const listings = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          id: document.id,
          ...data,
          createdAt: data.createdAt?.toDate?.().toISOString() || null,
        };
      });

      res.status(200).json({ success: true, listings });
    } catch (error) {
      console.error('[AdminListings] Failed to load pending listings:', error.message);
      res.status(503).json({
        success: false,
        message: 'Backend chưa truy cập được Firestore. Cần cấu hình Firebase service account cho backend.',
      });
    }
  });

  approveListing = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(listingId)) {
      return res.status(400).json({ success: false, message: 'Mã tin đăng không hợp lệ.' });
    }

    try {
      const listingRef = admin.firestore().collection('products').doc(listingId);
      await admin.firestore().runTransaction(async (transaction) => {
        const listing = await transaction.get(listingRef);
        if (!listing.exists) {
          const error = new Error('Không tìm thấy tin đăng.');
          error.statusCode = 404;
          throw error;
        }
        if (listing.get('status') !== 'pending') {
          const error = new Error('Tin đăng không còn ở trạng thái chờ duyệt.');
          error.statusCode = 409;
          throw error;
        }
        transaction.update(listingRef, {
          status: 'active',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: String(req.user._id),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      res.status(200).json({ success: true, message: 'Đã duyệt tin đăng.' });
    } catch (error) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error('[AdminListings] Failed to approve listing:', error.message);
      res.status(503).json({
        success: false,
        message: 'Backend chưa cập nhật được Firestore. Kiểm tra cấu hình Firebase service account.',
      });
    }
  });

  rejectListing = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(listingId)) {
      return res.status(400).json({ success: false, message: 'Mã tin đăng không hợp lệ.' });
    }

    try {
      const listingRef = admin.firestore().collection('products').doc(listingId);
      await admin.firestore().runTransaction(async (transaction) => {
        const listing = await transaction.get(listingRef);
        if (!listing.exists) {
          const error = new Error('Không tìm thấy tin đăng.');
          error.statusCode = 404;
          throw error;
        }
        if (listing.get('status') !== 'pending') {
          const error = new Error('Tin đăng không còn ở trạng thái chờ duyệt.');
          error.statusCode = 409;
          throw error;
        }
        transaction.update(listingRef, {
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          rejectedBy: String(req.user._id),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      res.status(200).json({ success: true, message: 'Đã từ chối tin đăng.' });
    } catch (error) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error('[AdminListings] Failed to reject listing:', error.message);
      res.status(503).json({
        success: false,
        message: 'Backend chưa cập nhật được Firestore. Kiểm tra cấu hình Firebase service account.',
      });
    }
  });
}

module.exports = new AdminListingController();
