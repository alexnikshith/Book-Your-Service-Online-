const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(20);

  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    if (notification.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to read this notification pulse');
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404);
    throw new Error('Notification not found in system logs');
  }
});

// @desc    Create a new notification node
// @route   POST /api/notifications
// @access  Private
const createNotification = asyncHandler(async (req, res) => {
  const { user, type, title, message, link } = req.body;
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    link
  });
  res.status(201).json(notification);
});

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
