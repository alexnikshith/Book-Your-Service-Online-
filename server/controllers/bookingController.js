const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');

// @desc    Initialize Booking Pulse Hub
const createBooking = asyncHandler(async (req, res) => {
  const { providerId, serviceName, date, time, totalPrice, address, notes } = req.body;

  const provider = await Provider.findById(providerId);
  if (!provider) {
    res.status(404);
    throw new Error('Expert Pulse node not found');
  }

  const booking = await Booking.create({
    user: req.user._id,
    provider: providerId,
    serviceName,
    date,
    time,
    totalPrice,
    address,
    notes,
    status: 'pending',
    paymentStatus: 'unpaid'
  });

  // Notify Provider Pulse with All Details (Address included)
  await Notification.create({
    user: provider.user,
    type: 'booking_new',
    title: 'Pulse Initialized: New Service Request Hub',
    message: `New client ${req.user.name} for ${serviceName}. Visit Address: ${address || 'Client Hub Location'}.`,
    link: '/dashboard'
  });

  res.status(201).json(booking);
});

// @desc    Sovereign Escrow Hold (Mock Payment Pulse)
const holdEscrow = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Transaction node not found Pulse');
    }
    
    // Logic: In a real Stripe/Razorpay pulse, we would verify the transaction ID here.
    booking.paymentStatus = 'held_in_escrow';
    booking.status = 'confirmed';
    await booking.save();
    
    res.json({ message: 'Funds held in Sovereign Registry Hub successfully Pulse', booking });
});

// @desc    Release Escrow Milestone (Settlement Hub)
const releaseEscrow = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        res.status(404);
        throw new Error('Transaction node not identified Hub Pulse');
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Permission Denied: Only clients or Sovereigns can release Hub funds');
    }

    booking.paymentStatus = 'paid';
    booking.status = 'completed';
    booking.escrowReleased = true;
    await booking.save();

    // Notify Provider Pulse of Settlement success Hub
    const provider = await Provider.findById(booking.provider);
    await Notification.create({
        user: provider.user,
        type: 'payment_received',
        title: 'Settlement Synchronized: Funds Released Hub',
        message: `Milestone transmission for ${booking.serviceName} has been released by the client.`,
        link: '/dashboard'
    });

    res.json({ message: 'Funds released to Expert Pulse successfully Hub!', booking });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const query = req.user.role === 'provider' ? { provider: req.user.providerId } : { user: req.user._id };
  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate({
      path: 'provider',
      populate: { path: 'user', select: 'name' }
    })
    .sort('-createdAt');
  res.json(bookings);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking pulse node not found');
  }
  booking.status = status;
  await booking.save();
  res.json(booking);
});

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  holdEscrow,
  releaseEscrow
};
