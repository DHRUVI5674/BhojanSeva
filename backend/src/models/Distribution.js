const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: false },
  quantityKg: { type: Number, required: true },
  mealsServed: { type: Number, default: 0 },
  peopleServed: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'completed' },
  location: { type: String },
  recipient: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Distribution', distributionSchema);
