const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversations,
  editMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(sendMessage);

router.route('/conversations/list')
  .get(getConversations);

router.route('/:id')
  .put(editMessage)
  .delete(deleteMessage);

router.route('/chat/:userId')
  .get(getMessages);

module.exports = router;
