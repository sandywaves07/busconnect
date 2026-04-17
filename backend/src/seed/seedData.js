require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/busconnect';

const users = [
  { name: 'Rajesh Kumar', email: 'rajesh@mkttravels.com', password: 'password123', role: 'operator', companyName: 'MKT Travels', companyType: 'Bus Operator', location: 'Mumbai, Maharashtra', bio: 'Running MKT Travels for 15 years. Fleet of 45 buses across Maharashtra.', isVerified: true },
  { name: 'Priya Sharma', email: 'priya@srstransport.com', password: 'password123', role: 'operator', companyName: 'SRS Transport', companyType: 'Bus Operator', location: 'Bangalore, Karnataka', bio: 'South India bus operations specialist. 200+ routes covered.', isVerified: true },
  { name: 'Mohammed Ali', email: 'mali@busparts.in', password: 'password123', role: 'vendor', companyName: 'Ali Bus Parts', companyType: 'Spare Parts Dealer', location: 'Chennai, Tamil Nadu', bio: 'Authorized dealer for Ashok Leyland & Tata bus spare parts. 20+ years experience.' },
  { name: 'Suresh Reddy', email: 'suresh@apstc.gov.in', password: 'password123', role: 'operator', companyName: 'APSRTC', companyType: 'State Transport', location: 'Hyderabad, Telangana', bio: 'Operations Manager at APSRTC. Managing 500+ bus fleet.' },
  { name: 'Anita Patel', email: 'anita@gujarattours.com', password: 'password123', role: 'operator', companyName: 'Gujarat Luxury Tours', companyType: 'Luxury Bus Operator', location: 'Ahmedabad, Gujarat', bio: 'Premium luxury bus services. AC sleeper and semi-sleeper fleets.' },
  { name: 'Vikram Singh', email: 'vikram@mechpro.in', password: 'password123', role: 'mechanic', companyName: 'MechPro Garage', companyType: 'Workshop', location: 'Delhi, NCR', bio: 'Master mechanic with 25 years of bus repair experience. Specializing in Volvo & Mercedes buses.' },
  { name: 'Deepa Nair', email: 'deepa@keralartc.in', password: 'password123', role: 'operator', companyName: 'Kerala RTC', companyType: 'State Transport', location: 'Thiruvananthapuram, Kerala', bio: 'Fleet manager with expertise in hill station operations.' },
  { name: 'Amit Joshi', email: 'amit@driver.com', password: 'password123', role: 'driver', companyName: 'Freelance Driver', companyType: 'Driver', location: 'Pune, Maharashtra', bio: 'Professional bus driver with 12 years experience. HMV license holder. Available for long routes.' },
  { name: 'Ravi Shankar', email: 'ravi@busparts.com', password: 'password123', role: 'vendor', companyName: 'RS Auto Parts', companyType: 'Auto Parts Supplier', location: 'Coimbatore, Tamil Nadu', bio: 'Wholesale supplier of bus tyres, brakes, and electrical components.' },
  { name: 'Kavita Desai', email: 'kavita@rajasthanbus.com', password: 'password123', role: 'operator', companyName: 'Rajasthan Roadways Pvt', companyType: 'Bus Operator', location: 'Jaipur, Rajasthan', bio: 'Operating tourist and intercity routes across Rajasthan for 10 years.' }
];

const getPostsData = (userIds) => [
  {
    author: userIds[0],
    type: 'update',
    content: 'Excited to announce that MKT Travels has just added 10 new Volvo B11R Multi-Axle buses to our fleet! These are equipped with air suspension, USB charging ports, and reclining seats. Bookings open from next week for the Mumbai-Goa route. #BusIndustry #NewFleet #MKTTravels',
    tags: ['FleetExpansion', 'Volvo', 'Mumbai', 'Goa'],
    likes: [userIds[1], userIds[3], userIds[4], userIds[6]]
  },
  {
    author: userIds[1],
    type: 'update',
    content: 'Important update for all operators: CMVR 2024 compliance deadline is approaching. Make sure your fleet has updated emission control systems and speed governors installed. VAHAN portal has been updated with new inspection formats. Reach out if you need guidance on compliance documentation.',
    tags: ['CMVR2024', 'Compliance', 'BusRegulations'],
    likes: [userIds[0], userIds[2], userIds[3], userIds[5], userIds[7]]
  },
  {
    author: userIds[2],
    type: 'job',
    content: 'Hiring experienced bus drivers for our fleet operations. We offer competitive salary, accommodation, and career growth opportunities. Apply now!',
    jobDetails: {
      position: 'Senior Bus Driver (HMV)',
      jobLocation: 'Mumbai, Maharashtra',
      experience: '5+ years HMV experience required',
      salaryMin: 35000,
      salaryMax: 50000,
      salaryUnit: 'monthly',
      jobType: 'full-time',
      contactEmail: 'hr@mktravels.com',
      contactPhone: '+91-98765-43210'
    },
    likes: [userIds[7], userIds[0]]
  },
  {
    author: userIds[3],
    type: 'marketplace',
    content: 'Selling Ashok Leyland Eagle bus (2019 model) in excellent condition. Full service history available. Currently serving APSRTC routes. Price negotiable for quick sale.',
    marketplaceDetails: {
      listingTitle: 'Ashok Leyland Eagle Bus 2019 - Excellent Condition',
      price: 2800000,
      priceNegotiable: true,
      condition: 'excellent',
      category: 'buses',
      listingLocation: 'Hyderabad, Telangana',
      contactEmail: 'suresh@apstc.gov.in',
      contactPhone: '+91-99887-76655'
    },
    likes: [userIds[0], userIds[1], userIds[4]]
  },
  {
    author: userIds[2],
    type: 'marketplace',
    content: 'Genuine Ashok Leyland H-series engine parts available. All parts are brand new with warranty. Fast shipping available across India. Bulk orders get special discount.',
    marketplaceDetails: {
      listingTitle: 'Ashok Leyland H-Series Engine Parts - Genuine OEM',
      price: 45000,
      priceNegotiable: false,
      condition: 'new',
      category: 'engine-parts',
      listingLocation: 'Chennai, Tamil Nadu',
      contactEmail: 'mali@busparts.in',
      contactPhone: '+91-98765-11223'
    },
    likes: [userIds[0], userIds[3], userIds[5]]
  },
  {
    author: userIds[4],
    type: 'update',
    content: 'Tips for maintaining AC bus systems during summer: 1) Clean condenser coils every 2 weeks, 2) Check refrigerant levels monthly, 3) Inspect belt drives and compressor mounts, 4) Keep backup refrigerant kits on board for long routes. Summer is tough on AC systems, but proper maintenance prevents costly breakdowns. #BusMaintenance #ACBus',
    tags: ['BusMaintenance', 'ACBus', 'SummerTips'],
    likes: [userIds[0], userIds[1], userIds[2], userIds[3], userIds[5], userIds[6]]
  },
  {
    author: userIds[5],
    type: 'job',
    content: 'MechPro is expanding! Looking for certified bus mechanics to join our growing team. Work on premium bus brands in a modern workshop environment.',
    jobDetails: {
      position: 'Bus Mechanic / Technician',
      jobLocation: 'Delhi, NCR',
      experience: '3+ years bus/truck workshop experience',
      salaryMin: 25000,
      salaryMax: 40000,
      salaryUnit: 'monthly',
      jobType: 'full-time',
      contactEmail: 'vikram@mechpro.in',
      contactPhone: '+91-98100-55566'
    },
    likes: [userIds[7], userIds[8]]
  },
  {
    author: userIds[6],
    type: 'update',
    content: 'Kerala roads are challenging with narrow mountain passes and heavy monsoon. Sharing our experience with maintaining brake systems on Ghat routes: Always use OEM brake pads, inspect brake fluid every 500km on hill routes, and maintain drums properly. Safety first! #KeralaRoutes #BusSafety',
    tags: ['BusSafety', 'KeralaRoutes', 'BrakeMaintenance'],
    likes: [userIds[0], userIds[1], userIds[4], userIds[9]]
  },
  {
    author: userIds[8],
    type: 'marketplace',
    content: 'MRF Meteor Radial tyres for sale - fit for Tata and Ashok Leyland buses. 10 tyres available, barely used (less than 5000km). Selling due to fleet upgrade.',
    marketplaceDetails: {
      listingTitle: 'MRF Meteor Radial Bus Tyres (295/80 R22.5) - Set of 10',
      price: 85000,
      priceNegotiable: true,
      condition: 'excellent',
      category: 'tyres',
      listingLocation: 'Coimbatore, Tamil Nadu',
      contactEmail: 'ravi@busparts.com',
      contactPhone: '+91-97878-44455'
    },
    likes: [userIds[0], userIds[3]]
  },
  {
    author: userIds[9],
    type: 'job',
    content: 'Rajasthan Roadways is hiring! Join us and drive through the magnificent landscapes of Rajasthan. We provide accommodation, meals, and career advancement opportunities.',
    jobDetails: {
      position: 'Tourist Bus Driver',
      jobLocation: 'Jaipur, Rajasthan',
      experience: '3+ years experience, tourist routes preferred',
      salaryMin: 28000,
      salaryMax: 38000,
      salaryUnit: 'monthly',
      jobType: 'full-time',
      contactEmail: 'hr@rajasthanbus.com',
      contactPhone: '+91-99000-77788'
    },
    likes: [userIds[7], userIds[1]]
  },
  {
    author: userIds[0],
    type: 'marketplace',
    content: 'Selling 5-year old MKT Travels Scania Metrolink. Well-maintained with full service records. Equipped with GPS, CCTV, fire extinguishers. Suitable for long-distance routes.',
    marketplaceDetails: {
      listingTitle: 'Scania Metrolink 12m 2019 - Fleet Retirement Sale',
      price: 3500000,
      priceNegotiable: true,
      condition: 'good',
      category: 'buses',
      listingLocation: 'Mumbai, Maharashtra',
      contactEmail: 'rajesh@mkttravels.com',
      contactPhone: '+91-98765-43210'
    },
    likes: [userIds[1], userIds[4], userIds[9]]
  },
  {
    author: userIds[1],
    type: 'update',
    content: 'Great news for the industry! The government has announced a new subsidy scheme for electric bus procurement under FAME-III. Bus operators can get up to 40% subsidy on electric buses. This is a huge opportunity for the industry to go green. Details available on MoRTH website. #ElectricBus #FAME3 #GreenTransport',
    tags: ['ElectricBus', 'FAME3', 'GreenTransport', 'Subsidy'],
    likes: [userIds[0], userIds[2], userIds[3], userIds[4], userIds[5], userIds[6], userIds[9]]
  },
  {
    author: userIds[5],
    type: 'update',
    content: 'Workshop tip of the week: When inspecting air brake systems, always check the air dryer cartridge every 6 months. A clogged dryer causes moisture buildup in brake lines, leading to corrosion and brake fade. Simple maintenance, big safety impact. #WorkshopTips #BrakeSafety',
    tags: ['WorkshopTips', 'BrakeSafety', 'Maintenance'],
    likes: [userIds[0], userIds[1], userIds[3], userIds[6]]
  },
  {
    author: userIds[3],
    type: 'marketplace',
    content: 'CCTV surveillance system for sale - 8 camera setup suitable for 12m bus. Includes DVR, all cables, and installation manual. Perfect for operators needing passenger safety monitoring.',
    marketplaceDetails: {
      listingTitle: 'Bus CCTV System - 8 Camera HD Setup with DVR',
      price: 35000,
      priceNegotiable: false,
      condition: 'new',
      category: 'electrical',
      listingLocation: 'Hyderabad, Telangana',
      contactEmail: 'suresh@apstc.gov.in',
      contactPhone: '+91-99887-76655'
    },
    likes: [userIds[0], userIds[4]]
  },
  {
    author: userIds[7],
    type: 'update',
    content: 'Looking for long-distance bus driving opportunities. I have 12 years experience driving on Mumbai-Bangalore, Mumbai-Pune, and Pune-Goa routes. Clean license, punctual, and safety-conscious. If any operators need an experienced driver, please DM me. #BusDriver #JobSeeking #Pune',
    tags: ['BusDriver', 'JobSeeking', 'Pune', 'Maharashtra'],
    likes: [userIds[0], userIds[1], userIds[9]]
  }
];

const commentsData = [
  { content: 'Congratulations on the new fleet! Volvo makes excellent buses. What\'s the seating configuration?', postIndex: 0, userIndex: 1 },
  { content: 'MKT Travels always raises the bar! Looking forward to booking the Mumbai-Goa route.', postIndex: 0, userIndex: 4 },
  { content: 'Thanks for sharing! I\'ve been struggling with the new VAHAN formats. Any chance you can share a sample filled form?', postIndex: 1, userIndex: 0 },
  { content: 'This is very helpful. We had inspection issues last month. The new format is quite different.', postIndex: 1, userIndex: 3 },
  { content: 'Is HMV license sufficient or do we need additional endorsements for your routes?', postIndex: 2, userIndex: 7 },
  { content: 'What\'s the mileage on this bus? Is it still under warranty?', postIndex: 3, userIndex: 0 },
  { content: 'Do you ship to Maharashtra? Also, do you have similar parts for Tata LP 1512?', postIndex: 4, userIndex: 0 },
  { content: 'Great tips! We\'ve been having refrigerant issues this summer. The coil cleaning tip is golden.', postIndex: 5, userIndex: 3 },
  { content: 'Still available? What\'s the total mileage on these tyres?', postIndex: 8, userIndex: 0 }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(users.map(u => ({
      ...u,
      stats: { posts: 0, jobsPosted: 0, listingsPosted: 0 }
    })));

    // Hash passwords
    for (const user of createdUsers) {
      if (user.password) {
        const bcrypt = require('bcryptjs');
        user.password = await bcrypt.hash('password123', 10);
        await user.save();
      }
    }

    const userIds = createdUsers.map(u => u._id);
    console.log(`Created ${userIds.length} users`);

    // Add some follows
    await User.findByIdAndUpdate(userIds[0], { following: [userIds[1], userIds[2]], followers: [userIds[1], userIds[4]] });
    await User.findByIdAndUpdate(userIds[1], { following: [userIds[0], userIds[3]], followers: [userIds[0], userIds[2]] });
    await User.findByIdAndUpdate(userIds[2], { following: [userIds[0]], followers: [userIds[1], userIds[3]] });

    // Create posts
    const postsData = getPostsData(userIds);
    const createdPosts = await Post.insertMany(postsData);
    console.log(`Created ${createdPosts.length} posts`);

    // Create comments
    for (const c of commentsData) {
      if (c.postIndex < createdPosts.length && c.userIndex < userIds.length) {
        await Comment.create({
          post: createdPosts[c.postIndex]._id,
          author: userIds[c.userIndex],
          content: c.content
        });
        await Post.findByIdAndUpdate(createdPosts[c.postIndex]._id, { $inc: { commentCount: 1 } });
      }
    }
    console.log(`Created ${commentsData.length} comments`);

    console.log('\nSeed data created successfully!');
    console.log('Test accounts (all with password: password123):');
    users.forEach(u => u.email && console.log(` - ${u.email} (${u.role})`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
