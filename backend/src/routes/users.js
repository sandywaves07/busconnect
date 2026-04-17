const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');

// Get suggested users
router.get('/suggestions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const suggestions = await User.find({
      _id: { $ne: req.user._id, $nin: user.following },
      isGuest: false
    })
      .select('name avatar role companyName location followers')
      .limit(8)
      .sort({ followers: -1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const obj = user.toObject();
    obj.isFollowing = req.user ? user.followers.includes(req.user._id) : false;
    obj.followerCount = user.followers.length;
    obj.followingCount = user.following.length;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user posts
router.get('/:id/posts', optionalAuth, async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = { author: req.params.id };
    if (type) query.type = type;
    const posts = await Post.find(query)
      .populate('author', 'name avatar role companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Post.countDocuments(query);
    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow/unfollow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = targetUser.followers.includes(req.user._id);
    if (isFollowing) {
      targetUser.followers.pull(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
    } else {
      targetUser.followers.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow'
      });
    }
    await targetUser.save();
    res.json({ following: !isFollowing, followerCount: targetUser.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get followers/following
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name avatar role companyName location');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name avatar role companyName location');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
