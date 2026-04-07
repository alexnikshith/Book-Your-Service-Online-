const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getNotifications)
    .post(require('../controllers/notificationController').createNotification);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
