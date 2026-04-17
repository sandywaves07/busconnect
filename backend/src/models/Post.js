const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['update', 'job', 'marketplace'],
    required: true
  },
  content: { type: String, required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },

  // Job-specific fields
  jobDetails: {
    position: String,
    jobLocation: String,
    experience: String,
    salaryMin: Number,
    salaryMax: Number,
    salaryUnit: { type: String, enum: ['hourly', 'monthly', 'annual'], default: 'monthly' },
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'temporary'] },
    contactEmail: String,
    contactPhone: String,
    deadline: Date
  },

  // Marketplace-specific fields
  marketplaceDetails: {
    listingTitle: String,
    price: Number,
    priceNegotiable: { type: Boolean, default: false },
    condition: { type: String, enum: ['new', 'excellent', 'good', 'fair', 'for-parts'] },
    category: {
      type: String,
      enum: ['engine-parts', 'body-parts', 'electrical', 'brakes', 'tyres', 'seats', 'buses', 'tools', 'other']
    },
    listingLocation: String,
    contactEmail: String,
    contactPhone: String,
    partNumber: String
  }
}, { timestamps: true });

postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'jobDetails.jobLocation': 1 });
postSchema.index({ 'marketplaceDetails.category': 1 });

module.exports = mongoose.model('Post', postSchema);
