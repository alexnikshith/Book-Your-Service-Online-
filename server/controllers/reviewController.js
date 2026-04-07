const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Add review for a provider
// @route   POST /api/reviews
// @access  Private/Customer
const addReview = asyncHandler(async (req, res) => {
  const { providerId, rating, comment } = req.body;

  // 1. Double-Check Verification: Did the client actually hire this expert?
  // We'll allow reviews only from customers who have a 'completed' booking.
  const completedBooking = await Booking.findOne({
    user: req.user._id,
    provider: providerId,
    status: 'completed'
  });

  if (!completedBooking) {
    res.status(403);
    throw new Error('Reputation Guard: You must complete a service before leaving a review');
  }

  // 2. Prevent Review Spam: Did they already review this expert?
  const existingReview = await Review.findOne({
    user: req.user._id,
    provider: providerId
  });

  if (existingReview) {
    res.status(400);
    throw new Error('Sovereign Security: You have already praised this expert');
  }

  // 3. Forging the Reputation Pulse
  const review = await Review.create({
    user: req.user._id,
    provider: providerId,
    rating,
    comment
  });

  // 4. Dispatch Knowledge: Notifying the Provider
  const provider = await Provider.findById(providerId);
  if (provider) {
    await Notification.create({
        user: provider.user,
        type: 'review',
        title: 'Reputation Pulse: New Review Recieved',
        message: `You have received a new ${rating}-star review from ${req.user.name}.`,
        link: '/dashboard'
    });
  }

  res.status(201).json(review);
});

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate('user', 'name')
    .sort('-createdAt');

  res.json(reviews);
});

// @desc    Get reviews for the logged-in provider
// @route   GET /api/reviews/my-reviews
// @access  Private/Provider
const getMyProviderReviews = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ user: req.user._id });
  if (!provider) {
    res.status(404);
    throw new Error('Provider pulse not detected');
  }

  const reviews = await Review.find({ provider: provider._id })
    .populate('user', 'name')
    .sort('-createdAt');

  res.json(reviews);
});

module.exports = {
  addReview,
  getProviderReviews,
  getMyProviderReviews
};
