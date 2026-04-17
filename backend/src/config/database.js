const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no external URI set, spin up in-memory MongoDB
    if (!uri || uri.includes('localhost')) {
      console.log('Starting in-memory MongoDB...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('In-memory MongoDB started');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Seed data if DB is empty
    const User = require('../models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial data...');
      await seedInitialData();
      console.log('Seed data loaded');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function seedInitialData() {
  const User = require('../models/User');
  const Post = require('../models/Post');
  const Comment = require('../models/Comment');
  const bcrypt = require('bcryptjs');

  const usersData = [
    { name: 'Rajesh Kumar', email: 'rajesh@mkttravels.com', password: await bcrypt.hash('password123', 10), role: 'operator', companyName: 'MKT Travels', companyType: 'Bus Operator', location: 'Mumbai, Maharashtra', bio: 'Running MKT Travels for 15 years. Fleet of 45 buses across Maharashtra.', isVerified: true },
    { name: 'Priya Sharma', email: 'priya@srstransport.com', password: await bcrypt.hash('password123', 10), role: 'operator', companyName: 'SRS Transport', companyType: 'Bus Operator', location: 'Bangalore, Karnataka', bio: 'South India bus operations specialist.', isVerified: true },
    { name: 'Mohammed Ali', email: 'mali@busparts.in', password: await bcrypt.hash('password123', 10), role: 'vendor', companyName: 'Ali Bus Parts', companyType: 'Spare Parts Dealer', location: 'Chennai, Tamil Nadu', bio: 'Authorized dealer for Ashok Leyland & Tata bus spare parts.' },
    { name: 'Suresh Reddy', email: 'suresh@apstc.gov.in', password: await bcrypt.hash('password123', 10), role: 'operator', companyName: 'APSRTC', companyType: 'State Transport', location: 'Hyderabad, Telangana', bio: 'Operations Manager at APSRTC. Managing 500+ bus fleet.' },
    { name: 'Vikram Singh', email: 'vikram@mechpro.in', password: await bcrypt.hash('password123', 10), role: 'mechanic', companyName: 'MechPro Garage', companyType: 'Workshop', location: 'Delhi, NCR', bio: 'Master mechanic with 25 years of bus repair experience.' },
    { name: 'Amit Joshi', email: 'amit@driver.com', password: await bcrypt.hash('password123', 10), role: 'driver', companyName: 'Freelance Driver', location: 'Pune, Maharashtra', bio: 'Professional bus driver with 12 years experience. HMV license holder.' },
  ];

  const users = await User.insertMany(usersData);
  const [u0, u1, u2, u3, u4, u5] = users;

  const posts = await Post.insertMany([
    {
      author: u0._id, type: 'update',
      content: 'Excited to announce MKT Travels has added 10 new Volvo B11R Multi-Axle buses to our fleet! Bookings open next week for the Mumbai-Goa route. #BusIndustry #NewFleet',
      tags: ['FleetExpansion', 'Volvo', 'Mumbai'], likes: [u1._id, u3._id]
    },
    {
      author: u1._id, type: 'update',
      content: 'CMVR 2024 compliance deadline is approaching. Make sure your fleet has updated emission control systems. VAHAN portal has new inspection formats. #BusRegulations #Compliance',
      tags: ['CMVR2024', 'Compliance'], likes: [u0._id, u2._id, u3._id]
    },
    {
      author: u0._id, type: 'job',
      content: 'Hiring experienced bus drivers for MKT Travels fleet operations. Competitive salary and accommodation provided.',
      jobDetails: { position: 'Senior Bus Driver (HMV)', jobLocation: 'Mumbai, Maharashtra', experience: '5+ years HMV', salaryMin: 35000, salaryMax: 50000, salaryUnit: 'monthly', jobType: 'full-time', contactEmail: 'hr@mkttravels.com', contactPhone: '+91-98765-43210' },
      likes: [u5._id]
    },
    {
      author: u3._id, type: 'marketplace',
      content: 'Selling Ashok Leyland Eagle bus (2019 model) in excellent condition. Full service history. Price negotiable.',
      marketplaceDetails: { listingTitle: 'Ashok Leyland Eagle Bus 2019 - Excellent Condition', price: 2800000, priceNegotiable: true, condition: 'excellent', category: 'buses', listingLocation: 'Hyderabad, Telangana', contactEmail: 'suresh@apstc.gov.in', contactPhone: '+91-99887-76655' },
      likes: [u0._id, u1._id]
    },
    {
      author: u2._id, type: 'marketplace',
      content: 'Genuine Ashok Leyland H-series engine parts available. Brand new with warranty. Bulk orders get special discount.',
      marketplaceDetails: { listingTitle: 'Ashok Leyland H-Series Engine Parts - Genuine OEM', price: 45000, priceNegotiable: false, condition: 'new', category: 'engine-parts', listingLocation: 'Chennai, Tamil Nadu', contactEmail: 'mali@busparts.in', contactPhone: '+91-98765-11223' },
      likes: [u0._id, u3._id]
    },
    {
      author: u4._id, type: 'job',
      content: 'MechPro is expanding! Looking for certified bus mechanics in Delhi NCR. Modern workshop, premium brands.',
      jobDetails: { position: 'Bus Mechanic / Technician', jobLocation: 'Delhi, NCR', experience: '3+ years bus/truck workshop', salaryMin: 25000, salaryMax: 40000, salaryUnit: 'monthly', jobType: 'full-time', contactEmail: 'vikram@mechpro.in', contactPhone: '+91-98100-55566' },
      likes: [u5._id]
    },
    {
      author: u1._id, type: 'update',
      content: 'Government announced subsidy scheme for electric bus procurement under FAME-III. Up to 40% subsidy on electric buses. Huge opportunity! #ElectricBus #FAME3 #GreenTransport',
      tags: ['ElectricBus', 'FAME3', 'GreenTransport'], likes: [u0._id, u2._id, u3._id, u4._id]
    },
  ]);

  await Comment.insertMany([
    { post: posts[0]._id, author: u1._id, content: 'Congratulations on the new fleet! What is the seating configuration on the Volvo?' },
    { post: posts[1]._id, author: u0._id, content: 'Thanks for sharing! Any chance you can share a sample filled VAHAN form?' },
    { post: posts[3]._id, author: u0._id, content: 'What is the total mileage on this bus? Is it still under warranty?' },
    { post: posts[6]._id, author: u3._id, content: 'This is excellent news! We have been waiting for FAME-III details.' },
  ]);

  // Update comment counts
  await Post.findByIdAndUpdate(posts[0]._id, { commentCount: 1 });
  await Post.findByIdAndUpdate(posts[1]._id, { commentCount: 1 });
  await Post.findByIdAndUpdate(posts[3]._id, { commentCount: 1 });
  await Post.findByIdAndUpdate(posts[6]._id, { commentCount: 1 });
}

module.exports = connectDB;
