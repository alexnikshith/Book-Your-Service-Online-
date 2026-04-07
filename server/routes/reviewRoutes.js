const express = require('express');
const router = express.Router();
const {
  addReview,
  getProviderReviews,
  getMyProviderReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Sovereign Reputation Registry
router.route('/provider/:providerId')
  .get(getProviderReviews);

router.use(protect);

router.route('/my-reviews')
  .get(getMyProviderReviews);

router.route('/')
  .post(addReview);

module.exports = router;
