const mongoose = require('mongoose');

const eventRegSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventRegistration', eventRegSchema);
