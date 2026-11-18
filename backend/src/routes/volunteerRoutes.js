const express = require('express');
const router = express.Router();
const {
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  confirmPickup,
  confirmDelivery,
  getVolunteerStats,
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All volunteer endpoints require volunteer or admin
router.use(protect, authorize('volunteer', 'admin'));

router.get('/available-tasks', getAvailableTasks);
router.get('/my-tasks', getMyTasks);
router.get('/stats', getVolunteerStats);
router.put('/tasks/:id/accept', acceptTask);
router.put('/tasks/:id/pickup', confirmPickup);
router.put('/tasks/:id/deliver', confirmDelivery);

module.exports = router;
