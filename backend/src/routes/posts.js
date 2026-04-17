const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

// Get posts (feed / filtered)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20, author } = req.query;
    const query = {};
    if (type && type !== 'all') query.type = type;
    if (author) query.author = author;

    const posts = await Post.find(query)
      .populate('author', 'name avatar role companyName location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    const postsWithLiked = posts.map(post => {
      const obj = post.toObject();
      obj.likeCount = post.likes.length;
      obj.isLiked = req.user ? post.likes.includes(req.user._id) : false;
      return obj;
    });

    res.json({ posts: postsWithLiked, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get jobs (type=job with extra filters)
router.get('/jobs', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, jobType, location, search } = req.query;
    const query = { type: 'job' };
    if (jobType) query['jobDetails.jobType'] = jobType;
    if (location) query['jobDetails.jobLocation'] = { $regex: location, $options: 'i' };
    if (search) query['$or'] = [
      { content: { $regex: search, $options: 'i' } },
      { 'jobDetails.position': { $regex: search, $options: 'i' } }
    ];

    const posts = await Post.find(query)
      .populate('author', 'name avatar role companyName location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get marketplace listings
router.get('/marketplace', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, condition, minPrice, maxPrice, search, location } = req.query;
    const query = { type: 'marketplace' };
    if (category) query['marketplaceDetails.category'] = category;
    if (condition) query['marketplaceDetails.condition'] = condition;
    if (location) query['marketplaceDetails.listingLocation'] = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query['marketplaceDetails.price'] = {};
      if (minPrice) query['marketplaceDetails.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['marketplaceDetails.price'].$lte = parseFloat(maxPrice);
    }
    if (search) query['$or'] = [
      { content: { $regex: search, $options: 'i' } },
      { 'marketplaceDetails.listingTitle': { $regex: search, $options: 'i' } }
    ];

    const posts = await Post.find(query)
      .populate('author', 'name avatar role companyName location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const { type, content, images, tags, jobDetails, marketplaceDetails } = req.body;
    if (!content || !type) return res.status(400).json({ message: 'Type and content are required' });

    const post = await Post.create({
      author: req.user._id,
      type, content, images: images || [], tags: tags || [],
      jobDetails: type === 'job' ? jobDetails : undefined,
      marketplaceDetails: type === 'marketplace' ? marketplaceDetails : undefined
    });

    // Update user stats
    const statField = type === 'job' ? 'stats.jobsPosted' : type === 'marketplace' ? 'stats.listingsPosted' : 'stats.posts';
    await User.findByIdAndUpdate(req.user._id, { $inc: { [statField]: 1 } });

    await post.populate('author', 'name avatar role companyName location');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name avatar role companyName location bio');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const obj = post.toObject();
    obj.isLiked = req.user ? post.likes.includes(req.user._id) : false;
    obj.likeCount = post.likes.length;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like/unlike post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
      }
    }
    await post.save();
    res.json({ liked: !liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get comments
router.get('/:id/comments', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name avatar role companyName')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      content
    });
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
    }

    await comment.populate('author', 'name avatar role companyName');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await comment.deleteOne();
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: -1 } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
