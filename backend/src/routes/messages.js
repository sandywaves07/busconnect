const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Get unique conversation partners
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();
    messages.forEach(msg => {
      const partnerId = msg.sender.toString() === userId.toString()
        ? msg.recipient.toString()
        : msg.sender.toString();
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    });

    const conversations = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([partnerId, lastMsg]) => {
        const partner = await User.findById(partnerId).select('name avatar role companyName');
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: userId,
          read: false
        });
        return { partner, lastMessage: lastMsg, unreadCount };
      })
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/:userId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content required' });

    const recipient = await User.findById(req.params.userId);
    if (!recipient) return res.status(404).json({ message: 'User not found' });

    const message = await Message.create({
      sender: req.user._id,
      recipient: req.params.userId,
      content
    });
    await message.populate('sender', 'name avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
