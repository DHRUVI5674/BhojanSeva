const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllDonations,
  getAllVolunteers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Admin only
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/donations', getAllDonations);
router.get('/volunteers', getAllVolunteers);

module.exports = router;
