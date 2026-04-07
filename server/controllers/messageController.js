const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const AIReport = require('../models/AIReport');
const { moderateChat } = require('../utils/aiService');

// @desc    Send a message (with AI Moderation Pulse)
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, bookingId, imageUrl } = req.body;

  if (!content && !imageUrl) {
    res.status(400);
    throw new Error('Message pulse cannot be empty');
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    booking: bookingId,
    imageUrl: imageUrl
  });

  let isFlagged = false;
  let flaggedWords = [];

  // AI Moderation Pulse hub Pulse
  if (content && process.env.GROQ_API_KEY) {
    const aiCheck = await moderateChat(content);
    if (!aiCheck.isProfessional) {
      isFlagged = true;
      flaggedWords = aiCheck.flaggedWords || [];
      await AIReport.create({
        type: 'chat_mod',
        severity: flaggedWords.length > 5 ? 'critical' : 'high',
        content: `Offensive words detected in signal: ${flaggedWords.join(', ')}`,
        relatedUser: req.user._id,
        relatedMessage: message._id,
        aiAnalysis: `Policy Breach Detected in live transmission.`
      });
    }
  }

  res.status(201).json({ ...message._doc, isFlagged, flaggedWords });
});

// @desc    Edit a message
const editMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message || message.sender.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Permission Denied for message edit pulse');
    }
    
    let isFlagged = false;
    if (req.body.content) {
        if (process.env.GROQ_API_KEY) {
            const aiCheck = await moderateChat(req.body.content);
            if (!aiCheck.isProfessional) {
                isFlagged = true;
                await AIReport.create({
                    type: 'chat_mod',
                    severity: 'medium',
                    content: `Edited breach transmission: ${req.body.content}`,
                    relatedUser: req.user._id,
                    relatedMessage: message._id
                });
            }
        }
        message.content = req.body.content;
        message.isEdited = true;
    }
    
    await message.save();
    res.json({ ...message._doc, isFlagged });
});

// @desc    Delete a message
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message || message.sender.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Permission Denied for message removal pulse');
    }
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message removal pulse successful' });
});

// @desc    Get messages for a specific conversation
const getMessages = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: otherUserId },
      { sender: otherUserId, recipient: req.user._id }
    ]
  }).sort('createdAt');
  
  await Message.updateMany(
    { sender: otherUserId, recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.json(messages);
});

// @desc    Get all conversations
const getConversations = asyncHandler(async (req, res) => {
  const queryIds = [req.user._id];
  if (req.user.providerId) queryIds.push(req.user.providerId);

  const queryIdsStr = queryIds.map(id => id.toString());
  const messages = await Message.find({
    $or: [{ sender: { $in: queryIds } }, { recipient: { $in: queryIds } }]
  }).sort('-createdAt');

  const conversationUsers = new Map();
  messages.forEach(msg => {
    const isMe = queryIdsStr.includes(msg.sender.toString());
    const otherUser = isMe ? msg.recipient : msg.sender;
    const otherUserIdStr = otherUser.toString();
    if (!conversationUsers.has(otherUserIdStr)) {
      conversationUsers.set(otherUserIdStr, {
        userId: otherUser,
        lastMessage: msg.content || '[Evidence Captured]',
        lastDate: msg.createdAt,
        unread: !msg.isRead && msg.recipient.toString() === req.user._id.toString()
      });
    }
  });

  const User = require('../models/User'); 
  const results = await Promise.all(
    Array.from(conversationUsers.values()).map(async (conv) => {
      const u = await User.findById(conv.userId).select('name email role');
      return { ...conv, name: u?.name, role: u?.role };
    })
  );
  res.json(results);
});

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  editMessage,
  deleteMessage
};
