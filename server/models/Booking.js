const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'confirmed', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'held_in_escrow', 'paid', 'refunded'],
    default: 'unpaid'
  },
  escrowReleaseKey: {
      type: String,
      default: () => Math.random().toString(36).substring(7).toUpperCase()
  },
  escrowReleased: {
      type: Boolean,
      default: false
  },
  videoDiagnosis: {
      url: String,
      active: { type: Boolean, default: false },
      scheduledAt: Date
  },
  totalPrice: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
