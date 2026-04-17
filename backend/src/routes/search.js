const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const regex = { $regex: q, $options: 'i' };
    const results = {};

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [{ name: regex }, { companyName: regex }, { location: regex }],
        isGuest: false
      }).select('name avatar role companyName location followers').limit(parseInt(limit));
    }

    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        type: 'update',
        $or: [{ content: regex }]
      }).populate('author', 'name avatar role companyName').sort({ createdAt: -1 }).limit(parseInt(limit));
    }

    if (type === 'all' || type === 'jobs') {
      results.jobs = await Post.find({
        type: 'job',
        $or: [
          { content: regex },
          { 'jobDetails.position': regex },
          { 'jobDetails.jobLocation': regex }
        ]
      }).populate('author', 'name avatar role companyName').sort({ createdAt: -1 }).limit(parseInt(limit));
    }

    if (type === 'all' || type === 'marketplace') {
      results.marketplace = await Post.find({
        type: 'marketplace',
        $or: [
          { content: regex },
          { 'marketplaceDetails.listingTitle': regex },
          { 'marketplaceDetails.listingLocation': regex }
        ]
      }).populate('author', 'name avatar role companyName').sort({ createdAt: -1 }).limit(parseInt(limit));
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
