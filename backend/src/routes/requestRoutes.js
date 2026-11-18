const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const {
  createRequestValidator,
  updateRequestStatusValidator,
} = require('../validators/requestValidator');

// Recipient creates request
router.post(
  '/',
  protect,
  authorize('recipient', 'admin'),
  createRequestValidator,
  validate,
  createRequest
);

// Recipient views their requests
router.get('/my-requests', protect, authorize('recipient', 'admin'), getMyRequests);

// Donor views incoming requests for their food
router.get('/incoming', protect, authorize('donor', 'admin'), getIncomingRequests);

// Single request details
router.get('/:id', protect, getRequestById);

// Donor accepts/rejects request
router.put(
  '/:id/status',
  protect,
  authorize('donor', 'admin'),
  updateRequestStatusValidator,
  validate,
  updateRequestStatus
);

// Recipient cancels request
router.put('/:id/cancel', protect, authorize('recipient', 'admin'), cancelRequest);

module.exports = router;
