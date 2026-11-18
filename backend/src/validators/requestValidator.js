const { body } = require('express-validator');

const createRequestValidator = [
  body('donationId').notEmpty().withMessage('Donation ID is required'),
  body('requestedQuantity')
    .isNumeric()
    .withMessage('Requested quantity must be a number')
    .custom((val) => val > 0)
    .withMessage('Requested quantity must be greater than 0'),
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
];

const updateRequestStatusValidator = [
  body('status')
    .isIn(['ACCEPTED', 'REJECTED', 'CANCELLED'])
    .withMessage('Valid status update required (ACCEPTED, REJECTED, CANCELLED)'),
];

module.exports = {
  createRequestValidator,
  updateRequestStatusValidator,
};
