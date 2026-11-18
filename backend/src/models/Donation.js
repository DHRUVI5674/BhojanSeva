const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide food title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'cooked_meals',
        'raw_ingredients',
        'packaged_food',
        'bakery_items',
        'fruits_vegetables',
        'beverages',
        'other',
      ],
      default: 'cooked_meals',
    },
    images: {
      type: [String],
      default: [],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['kg', 'packets', 'servings', 'boxes', 'liters', 'items'],
      default: 'servings',
    },
    peopleServed: {
      type: Number,
      default: 1,
      min: [1, 'Must serve at least 1 person'],
    },
    preparationTime: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Please provide expiry date and time'],
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    allergens: {
      type: [String],
      default: [],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please provide pickup address'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [72.5714, 23.0225], // default Ahmedabad [lng, lat]
      },
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'REQUESTED',
        'ACCEPTED',
        'ASSIGNED',
        'PICKED_UP',
        'DELIVERED',
        'REJECTED',
        'CANCELLED',
        'EXPIRED',
      ],
      default: 'AVAILABLE',
    },
    claimedQuantity: {
      type: Number,
      default: 0,
    },
    activeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      default: null,
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

donationSchema.index({ status: 1 });
donationSchema.index({ category: 1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ expiryTime: 1 });
donationSchema.index({ location: '2dsphere' });

// Auto mark as expired if passed expiry time
donationSchema.methods.isExpired = function () {
  return new Date() > new Date(this.expiryTime);
};

module.exports = mongoose.model('Donation', donationSchema);
