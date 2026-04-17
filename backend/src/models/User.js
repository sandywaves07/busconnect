const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String },
  role: {
    type: String,
    enum: ['operator', 'driver', 'vendor', 'mechanic', 'admin', 'guest'],
    default: 'operator'
  },
  companyName: { type: String, trim: true },
  companyType: { type: String, trim: true },
  location: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  phone: { type: String },
  website: { type: String },
  isGuest: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stats: {
    posts: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
    listingsPosted: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
