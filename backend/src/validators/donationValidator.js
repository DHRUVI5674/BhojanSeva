const { body } = require('express-validator');

const createDonationValidator = [
  body('title').trim().notEmpty().withMessage('Food title is required'),
  body('category')
    .isIn([
      'cooked_meals',
      'raw_ingredients',
      'packaged_food',
      'bakery_items',
      'fruits_vegetables',
      'beverages',
      'other',
    ])
    .withMessage('Valid food category is required'),
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((val) => val > 0)
    .withMessage('Quantity must be greater than 0'),
  body('unit')
    .isIn(['kg', 'packets', 'servings', 'boxes', 'liters', 'items'])
    .withMessage('Valid measurement unit is required'),
  body('expiryTime')
    .notEmpty()
    .withMessage('Expiry date and time is required')
    .isISO8601()
    .withMessage('Expiry time must be a valid date'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
];

const updateDonationValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('quantity').optional().isNumeric().custom((val) => val > 0),
  body('expiryTime').optional().isISO8601(),
  body('pickupAddress').optional().trim().notEmpty(),
];

module.exports = {
  createDonationValidator,
  updateDonationValidator,
};
