require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const SECRET = process.env.JWT_SECRET || 'busconnect_secret';

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// ─── In-Memory Store ─────────────────────────────────────────────────────────
const db = {
  users: [],
  posts: [],
  comments: [],
  messages: [],
  notifications: [],
};

// ─── Seed Data ───────────────────────────────────────────────────────────────
async function seed() {
  const hash = (p) => bcrypt.hashSync(p, 8);
  const u = (data) => ({ _id: uuidv4(), followers: [], following: [], stats: { posts: 0, jobsPosted: 0, listingsPosted: 0 }, isGuest: false, isVerified: false, createdAt: new Date(), ...data });

  db.users = [
    u({ name: 'Rajesh Kumar', email: 'rajesh@mkttravels.com', password: hash('password123'), role: 'operator', companyName: 'MKT Travels', companyType: 'Bus Operator', location: 'Mumbai, Maharashtra', bio: 'Running MKT Travels for 15 years. Fleet of 45 buses across Maharashtra.', isVerified: true }),
    u({ name: 'Priya Sharma', email: 'priya@srstransport.com', password: hash('password123'), role: 'operator', companyName: 'SRS Transport', companyType: 'Bus Operator', location: 'Bangalore, Karnataka', bio: 'South India bus operations specialist.', isVerified: true }),
    u({ name: 'Mohammed Ali', email: 'mali@busparts.in', password: hash('password123'), role: 'vendor', companyName: 'Ali Bus Parts', companyType: 'Spare Parts Dealer', location: 'Chennai, Tamil Nadu', bio: 'Authorized dealer for Ashok Leyland & Tata spare parts.' }),
    u({ name: 'Suresh Reddy', email: 'suresh@apstc.gov.in', password: hash('password123'), role: 'operator', companyName: 'APSRTC', companyType: 'State Transport', location: 'Hyderabad, Telangana', bio: 'Operations Manager at APSRTC. 500+ bus fleet.' }),
    u({ name: 'Vikram Singh', email: 'vikram@mechpro.in', password: hash('password123'), role: 'mechanic', companyName: 'MechPro Garage', companyType: 'Workshop', location: 'Delhi, NCR', bio: '25 years of bus repair experience.' }),
    u({ name: 'Amit Joshi', email: 'amit@driver.com', password: hash('password123'), role: 'driver', companyName: 'Freelance Driver', location: 'Pune, Maharashtra', bio: 'Professional bus driver, 12 years experience, HMV license.' }),
  ];

  const [u0, u1, u2, u3, u4, u5] = db.users;
  const p = (data) => ({ _id: uuidv4(), images: [], tags: [], likes: [], shares: 0, commentCount: 0, createdAt: new Date(), ...data });

  db.posts = [
    p({ author: u0._id, type: 'update', content: 'Excited to announce MKT Travels has added 10 new Volvo B11R Multi-Axle buses to our fleet! Bookings open next week for the Mumbai-Goa route. #BusIndustry #NewFleet #MKTTravels', tags: ['FleetExpansion', 'Volvo', 'Mumbai'], likes: [u1._id, u3._id], commentCount: 2 }),
    p({ author: u1._id, type: 'update', content: 'CMVR 2024 compliance deadline is approaching. Make sure your fleet has updated emission control systems installed. VAHAN portal has new inspection formats. #Compliance #BusRegulations', tags: ['CMVR2024', 'Compliance'], likes: [u0._id, u2._id, u3._id], commentCount: 1 }),
    p({ author: u0._id, type: 'job', content: 'MKT Travels is hiring experienced bus drivers for Mumbai-Goa and Mumbai-Pune routes. Accommodation and meals provided.', jobDetails: { position: 'Senior Bus Driver (HMV)', jobLocation: 'Mumbai, Maharashtra', experience: '5+ years HMV experience', salaryMin: 35000, salaryMax: 50000, salaryUnit: 'monthly', jobType: 'full-time', contactEmail: 'hr@mkttravels.com', contactPhone: '+91-98765-43210' }, likes: [u5._id] }),
    p({ author: u3._id, type: 'marketplace', content: 'Selling Ashok Leyland Eagle bus (2019 model) in excellent condition. Full service history available. Currently on APSRTC routes. Quick sale needed.', marketplaceDetails: { listingTitle: 'Ashok Leyland Eagle Bus 2019 - Excellent Condition', price: 2800000, priceNegotiable: true, condition: 'excellent', category: 'buses', listingLocation: 'Hyderabad, Telangana', contactEmail: 'suresh@apstc.gov.in', contactPhone: '+91-99887-76655' }, likes: [u0._id, u1._id] }),
    p({ author: u2._id, type: 'marketplace', content: 'Genuine Ashok Leyland H-series engine parts available. All brand new with warranty. Fast shipping across India. Bulk orders get special discount.', marketplaceDetails: { listingTitle: 'Ashok Leyland H-Series Engine Parts - Genuine OEM', price: 45000, priceNegotiable: false, condition: 'new', category: 'engine-parts', listingLocation: 'Chennai, Tamil Nadu', contactEmail: 'mali@busparts.in', contactPhone: '+91-98765-11223' }, likes: [u0._id, u3._id] }),
    p({ author: u4._id, type: 'job', content: 'MechPro is expanding! Looking for certified bus mechanics to join our Delhi NCR workshop. Work on premium bus brands in a modern facility.', jobDetails: { position: 'Bus Mechanic / Technician', jobLocation: 'Delhi, NCR', experience: '3+ years bus/truck workshop', salaryMin: 25000, salaryMax: 40000, salaryUnit: 'monthly', jobType: 'full-time', contactEmail: 'vikram@mechpro.in', contactPhone: '+91-98100-55566' }, likes: [u5._id] }),
    p({ author: u1._id, type: 'update', content: 'Government announced FAME-III subsidy scheme for electric bus procurement. Up to 40% subsidy available. Huge opportunity for fleet modernisation! #ElectricBus #FAME3 #GreenTransport', tags: ['ElectricBus', 'FAME3', 'GreenTransport'], likes: [u0._id, u2._id, u3._id, u4._id], commentCount: 1 }),
    p({ author: u2._id, type: 'marketplace', content: 'MRF Meteor Radial bus tyres for sale. Fit for Tata and Ashok Leyland. 10 tyres, barely used (under 5000km). Selling due to fleet upgrade.', marketplaceDetails: { listingTitle: 'MRF Meteor Radial Bus Tyres (295/80 R22.5) - Set of 10', price: 85000, priceNegotiable: true, condition: 'excellent', category: 'tyres', listingLocation: 'Chennai, Tamil Nadu', contactEmail: 'mali@busparts.in', contactPhone: '+91-98765-11223' }, likes: [u0._id] }),
    p({ author: u5._id, type: 'update', content: 'Looking for long-distance bus driving opportunities. 12 years experience on Mumbai-Bangalore and Mumbai-Pune routes. Clean license, safety-conscious. DM me! #BusDriver #JobSeeking #Pune', tags: ['BusDriver', 'JobSeeking'], likes: [u0._id, u1._id] }),
  ];

  db.comments = [
    { _id: uuidv4(), post: db.posts[0]._id, author: u1._id, content: 'Congratulations! What is the seating configuration on the new Volvos?', likes: [], createdAt: new Date() },
    { _id: uuidv4(), post: db.posts[0]._id, author: u3._id, content: 'MKT always sets the benchmark. Looking forward to the Mumbai-Goa service!', likes: [], createdAt: new Date() },
    { _id: uuidv4(), post: db.posts[1]._id, author: u0._id, content: 'Thanks for the heads up. Any chance you have the sample VAHAN form?', likes: [], createdAt: new Date() },
    { _id: uuidv4(), post: db.posts[6]._id, author: u3._id, content: 'Excellent news! We have been evaluating electric buses for APSRTC.', likes: [], createdAt: new Date() },
  ];
  console.log(`Seeded: ${db.users.length} users, ${db.posts.length} posts`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mkToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '30d' });
const auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const { id } = jwt.verify(h.split(' ')[1], SECRET);
    const user = db.users.find(u => u._id === id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};
const optAuth = (req, res, next) => {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) {
    try { const { id } = jwt.verify(h.split(' ')[1], SECRET); req.user = db.users.find(u => u._id === id); } catch { }
  }
  next();
};
const safe = (u) => { if (!u) return null; const { password, ...rest } = u; return rest; };
const populateAuthor = (post) => ({ ...post, author: safe(db.users.find(u => u._id === post.author)) });
const populateComment = (c) => ({ ...c, author: safe(db.users.find(u => u._id === c.author)) });

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyType, location } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });
    const user = { _id: uuidv4(), name, email, password: await bcrypt.hash(password, 10), role: role || 'operator', companyName, companyType, location, bio: '', isGuest: false, isVerified: false, followers: [], following: [], stats: { posts: 0, jobsPosted: 0, listingsPosted: 0 }, createdAt: new Date() };
    db.users.push(user);
    res.status(201).json({ token: mkToken(user._id), user: safe(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: mkToken(user._id), user: safe(user) });
});

app.post('/api/auth/guest', (req, res) => {
  const { name, role = 'operator', companyName } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const user = { _id: uuidv4(), name, role, companyName: companyName || '', isGuest: true, isVerified: false, followers: [], following: [], stats: { posts: 0, jobsPosted: 0, listingsPosted: 0 }, createdAt: new Date() };
  db.users.push(user);
  res.status(201).json({ token: mkToken(user._id), user: safe(user) });
});

app.get('/api/auth/me', auth, (req, res) => res.json(safe(req.user)));
app.put('/api/auth/me', auth, (req, res) => {
  const allowed = ['name', 'bio', 'companyName', 'companyType', 'location', 'phone', 'website'];
  const user = db.users.find(u => u._id === req.user._id);
  allowed.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
  res.json(safe(user));
});

// ─── Posts Routes ─────────────────────────────────────────────────────────────
app.get('/api/posts', optAuth, (req, res) => {
  let posts = [...db.posts];
  const { type, author, page = 1, limit = 20 } = req.query;
  if (type && type !== 'all') posts = posts.filter(p => p.type === type);
  if (author) posts = posts.filter(p => p.author === author);
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = posts.length;
  const paginated = posts.slice((page - 1) * limit, page * limit);
  res.json({ posts: paginated.map(p => ({ ...populateAuthor(p), likeCount: p.likes.length, isLiked: req.user ? p.likes.includes(req.user._id) : false })), total, page: +page, pages: Math.ceil(total / limit) });
});

app.get('/api/posts/jobs', optAuth, (req, res) => {
  let posts = db.posts.filter(p => p.type === 'job');
  const { jobType, location, search } = req.query;
  if (jobType) posts = posts.filter(p => p.jobDetails?.jobType === jobType);
  if (location) posts = posts.filter(p => p.jobDetails?.jobLocation?.toLowerCase().includes(location.toLowerCase()));
  if (search) posts = posts.filter(p => p.content?.toLowerCase().includes(search.toLowerCase()) || p.jobDetails?.position?.toLowerCase().includes(search.toLowerCase()));
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ posts: posts.map(populateAuthor), total: posts.length });
});

app.get('/api/posts/marketplace', optAuth, (req, res) => {
  let posts = db.posts.filter(p => p.type === 'marketplace');
  const { category, condition, minPrice, maxPrice, search, location } = req.query;
  if (category) posts = posts.filter(p => p.marketplaceDetails?.category === category);
  if (condition) posts = posts.filter(p => p.marketplaceDetails?.condition === condition);
  if (minPrice) posts = posts.filter(p => (p.marketplaceDetails?.price || 0) >= +minPrice);
  if (maxPrice) posts = posts.filter(p => (p.marketplaceDetails?.price || 0) <= +maxPrice);
  if (location) posts = posts.filter(p => p.marketplaceDetails?.listingLocation?.toLowerCase().includes(location.toLowerCase()));
  if (search) posts = posts.filter(p => p.marketplaceDetails?.listingTitle?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase()));
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ posts: posts.map(populateAuthor), total: posts.length });
});

app.post('/api/posts', auth, (req, res) => {
  const { type, content, images, tags, jobDetails, marketplaceDetails } = req.body;
  if (!type || !content) return res.status(400).json({ message: 'Type and content required' });
  const post = { _id: uuidv4(), author: req.user._id, type, content, images: images || [], tags: tags || [], likes: [], commentCount: 0, shares: 0, jobDetails: type === 'job' ? jobDetails : undefined, marketplaceDetails: type === 'marketplace' ? marketplaceDetails : undefined, createdAt: new Date() };
  db.posts.unshift(post);
  const user = db.users.find(u => u._id === req.user._id);
  if (user) { if (type === 'job') user.stats.jobsPosted++; else if (type === 'marketplace') user.stats.listingsPosted++; else user.stats.posts++; }
  res.status(201).json(populateAuthor(post));
});

app.get('/api/posts/:id', optAuth, (req, res) => {
  const post = db.posts.find(p => p._id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ ...populateAuthor(post), likeCount: post.likes.length, isLiked: req.user ? post.likes.includes(req.user._id) : false });
});

app.delete('/api/posts/:id', auth, (req, res) => {
  const idx = db.posts.findIndex(p => p._id === req.params.id && p.author === req.user._id);
  if (idx === -1) return res.status(404).json({ message: 'Not found or not authorized' });
  db.posts.splice(idx, 1);
  db.comments = db.comments.filter(c => c.post !== req.params.id);
  res.json({ message: 'Deleted' });
});

app.post('/api/posts/:id/like', auth, (req, res) => {
  const post = db.posts.find(p => p._id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const liked = post.likes.includes(req.user._id);
  if (liked) post.likes = post.likes.filter(id => id !== req.user._id);
  else post.likes.push(req.user._id);
  res.json({ liked: !liked, likeCount: post.likes.length });
});

app.get('/api/posts/:id/comments', optAuth, (req, res) => {
  res.json(db.comments.filter(c => c.post === req.params.id).map(populateComment));
});

app.post('/api/posts/:id/comments', auth, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  const post = db.posts.find(p => p._id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const comment = { _id: uuidv4(), post: req.params.id, author: req.user._id, content, likes: [], createdAt: new Date() };
  db.comments.push(comment);
  post.commentCount = (post.commentCount || 0) + 1;
  res.status(201).json(populateComment(comment));
});

app.delete('/api/posts/:postId/comments/:commentId', auth, (req, res) => {
  const idx = db.comments.findIndex(c => c._id === req.params.commentId && c.author === req.user._id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  db.comments.splice(idx, 1);
  const post = db.posts.find(p => p._id === req.params.postId);
  if (post) post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
  res.json({ message: 'Deleted' });
});

// ─── Users Routes ─────────────────────────────────────────────────────────────
app.get('/api/users/suggestions', auth, (req, res) => {
  const suggestions = db.users.filter(u => u._id !== req.user._id && !u.isGuest && !req.user.following?.includes(u._id)).slice(0, 6).map(safe);
  res.json(suggestions);
});

app.get('/api/users/:id', optAuth, (req, res) => {
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ ...safe(user), isFollowing: req.user ? user.followers.includes(req.user._id) : false, followerCount: user.followers.length, followingCount: user.following.length });
});

app.get('/api/users/:id/posts', optAuth, (req, res) => {
  let posts = db.posts.filter(p => p.author === req.params.id);
  if (req.query.type) posts = posts.filter(p => p.type === req.query.type);
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ posts: posts.map(populateAuthor), total: posts.length });
});

app.post('/api/users/:id/follow', auth, (req, res) => {
  if (req.params.id === req.user._id) return res.status(400).json({ message: 'Cannot follow yourself' });
  const target = db.users.find(u => u._id === req.params.id);
  const me = db.users.find(u => u._id === req.user._id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  const isFollowing = target.followers.includes(req.user._id);
  if (isFollowing) {
    target.followers = target.followers.filter(id => id !== req.user._id);
    me.following = me.following.filter(id => id !== req.params.id);
  } else {
    target.followers.push(req.user._id);
    if (!me.following.includes(req.params.id)) me.following.push(req.params.id);
  }
  res.json({ following: !isFollowing, followerCount: target.followers.length });
});

app.get('/api/users/:id/followers', (req, res) => {
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user.followers.map(id => safe(db.users.find(u => u._id === id))).filter(Boolean));
});

app.get('/api/users/:id/following', (req, res) => {
  const user = db.users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user.following.map(id => safe(db.users.find(u => u._id === id))).filter(Boolean));
});

// ─── Messages Routes ──────────────────────────────────────────────────────────
app.get('/api/messages/conversations', auth, (req, res) => {
  const myId = req.user._id;
  const myMsgs = db.messages.filter(m => m.sender === myId || m.recipient === myId);
  const partnerIds = [...new Set(myMsgs.map(m => m.sender === myId ? m.recipient : m.sender))];
  const convos = partnerIds.map(pid => {
    const partnerMsgs = myMsgs.filter(m => m.sender === pid || m.recipient === pid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { partner: safe(db.users.find(u => u._id === pid)), lastMessage: partnerMsgs[0], unreadCount: db.messages.filter(m => m.sender === pid && m.recipient === myId && !m.read).length };
  });
  res.json(convos);
});

app.get('/api/messages/unread/count', auth, (req, res) => {
  res.json({ count: db.messages.filter(m => m.recipient === req.user._id && !m.read).length });
});

app.get('/api/messages/:userId', auth, (req, res) => {
  const msgs = db.messages.filter(m => (m.sender === req.user._id && m.recipient === req.params.userId) || (m.sender === req.params.userId && m.recipient === req.user._id));
  db.messages.filter(m => m.sender === req.params.userId && m.recipient === req.user._id).forEach(m => m.read = true);
  res.json(msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(m => ({ ...m, sender: safe(db.users.find(u => u._id === m.sender)) })));
});

app.post('/api/messages/:userId', auth, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  const recipient = db.users.find(u => u._id === req.params.userId);
  if (!recipient) return res.status(404).json({ message: 'User not found' });
  const msg = { _id: uuidv4(), sender: req.user._id, recipient: req.params.userId, content, read: false, createdAt: new Date() };
  db.messages.push(msg);
  res.status(201).json({ ...msg, sender: safe(req.user) });
});

// ─── Notifications Routes ─────────────────────────────────────────────────────
app.get('/api/notifications', auth, (req, res) => {
  res.json(db.notifications.filter(n => n.recipient === req.user._id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50).map(n => ({ ...n, sender: safe(db.users.find(u => u._id === n.sender)) })));
});

app.get('/api/notifications/unread/count', auth, (req, res) => {
  res.json({ count: db.notifications.filter(n => n.recipient === req.user._id && !n.read).length });
});

app.put('/api/notifications/read-all', auth, (req, res) => {
  db.notifications.filter(n => n.recipient === req.user._id).forEach(n => n.read = true);
  res.json({ message: 'Done' });
});

app.put('/api/notifications/:id/read', auth, (req, res) => {
  const n = db.notifications.find(n => n._id === req.params.id);
  if (n) n.read = true;
  res.json({ message: 'Done' });
});

app.delete('/api/notifications/:id', auth, (req, res) => {
  const idx = db.notifications.findIndex(n => n._id === req.params.id && n.recipient === req.user._id);
  if (idx !== -1) db.notifications.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// ─── Search Route ─────────────────────────────────────────────────────────────
app.get('/api/search', optAuth, (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(400).json({ message: 'Query too short' });
  const rx = new RegExp(q, 'i');
  res.json({
    users: db.users.filter(u => !u.isGuest && (rx.test(u.name) || rx.test(u.companyName) || rx.test(u.location))).slice(0, 10).map(safe),
    posts: db.posts.filter(p => p.type === 'update' && rx.test(p.content)).slice(0, 10).map(populateAuthor),
    jobs: db.posts.filter(p => p.type === 'job' && (rx.test(p.content) || rx.test(p.jobDetails?.position) || rx.test(p.jobDetails?.jobLocation))).slice(0, 10).map(populateAuthor),
    marketplace: db.posts.filter(p => p.type === 'marketplace' && (rx.test(p.content) || rx.test(p.marketplaceDetails?.listingTitle))).slice(0, 10).map(populateAuthor),
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'BusConnect API running (in-memory)' }));

app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
seed().then(() => {
  app.listen(PORT, () => {
    console.log(`\nBusConnect API ready at http://localhost:${PORT}`);
    console.log('Mode: In-memory (no database required)');
    console.log('\nTest logins (password: password123):');
    console.log('  rajesh@mkttravels.com  (Operator)');
    console.log('  priya@srstransport.com (Operator)');
    console.log('  mali@busparts.in       (Vendor)');
    console.log('  amit@driver.com        (Driver)\n');
  });
});
