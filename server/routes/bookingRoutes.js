const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  holdEscrow,
  releaseEscrow
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Sovereign Booking Registry
router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getMyBookings);

router.route('/:id/status')
  .put(updateBookingStatus);

router.route('/:id/escrow')
  .put(holdEscrow);

router.route('/:id/release')
  .put(releaseEscrow);

module.exports = router;
