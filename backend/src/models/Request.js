const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation ID is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Please specify requested quantity'],
      min: [1, 'Requested quantity must be at least 1'],
    },
    peopleToFeed: {
      type: Number,
      default: 1,
      min: [1, 'Must feed at least 1 person'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'],
      default: 'PENDING',
    },
    deliveryInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: '',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    donorNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ donation: 1, recipient: 1 });
requestSchema.index({ recipient: 1, status: 1 });
requestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', requestSchema);
