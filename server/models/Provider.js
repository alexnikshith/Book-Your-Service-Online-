const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: String,
    required: true
  }],
  location: {
    city: String,
    region: String,
    coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere'
    }
  },
  experience: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  priceRange: {
    min: Number,
    max: Number
  },
  upiId: {
      type: String,
      default: '' // Registry for Direct UPI Settlement Hub
  },
  servicesOffered: [{
     name: String,
     price: Number,
     duration: String
  }],
  portfolioImages: [{
      url: String,
      caption: String,
      verifiedSource: { type: Boolean, default: false }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isAIVerified: {
    type: Boolean,
    default: false
  },
  trustScore: {
    type: Number,
    default: 100
  },
  flags: {
    type: Number,
    default: 0
  },
  flaggedUsers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  availability: {
      blockedDates: [Date],
      workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }
  },
  serviceableCities: [String],
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Provider', providerSchema);
