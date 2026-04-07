const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating (1-5)'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating for the provider when a review is added
reviewSchema.statics.getAverageRating = async function(providerId) {
  const obj = await this.aggregate([
    {
      $match: { provider: providerId }
    },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
        numReviews: { $count: {} }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('Provider').findByIdAndUpdate(providerId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        numReviews: obj[0].numReviews
      });
    } else {
      await mongoose.model('Provider').findByIdAndUpdate(providerId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Update rating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.provider);
});

// Update rating after remove
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.provider);
});

module.exports = mongoose.model('Review', reviewSchema);
