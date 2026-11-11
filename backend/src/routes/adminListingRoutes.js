const express = require('express');
const adminListingController = require('../controllers/adminListingController');
const { verifyToken } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới được duyệt tin đăng.' });
  }
  next();
});

router.get('/pending', adminListingController.getPendingListings);
router.patch('/:listingId/approve', adminListingController.approveListing);
router.patch('/:listingId/reject', adminListingController.rejectListing);

module.exports = router;
