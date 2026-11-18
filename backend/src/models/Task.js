const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
      default: 'ASSIGNED',
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    pickupTime: {
      type: Date,
      default: null,
    },
    deliveredTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    donorContact: {
      name: String,
      phone: String,
    },
    recipientContact: {
      name: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ volunteer: 1, status: 1 });
taskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', taskSchema);
