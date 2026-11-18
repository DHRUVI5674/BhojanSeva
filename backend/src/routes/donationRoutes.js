const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  cancelDonation,
} = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const {
  createDonationValidator,
  updateDonationValidator,
} = require('../validators/donationValidator');

// Public or authenticated to browse
router.get('/', getDonations);
router.get('/my-donations', protect, authorize('donor', 'admin'), getMyDonations);
router.get('/:id', getDonationById);

// Donor & Admin actions
router.post(
  '/',
  protect,
  authorize('donor', 'admin'),
  createDonationValidator,
  validate,
  createDonation
);

router.put(
  '/:id',
  protect,
  authorize('donor', 'admin'),
  updateDonationValidator,
  validate,
  updateDonation
);

router.put('/:id/cancel', protect, authorize('donor', 'admin'), cancelDonation);

module.exports = router;
