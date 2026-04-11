const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const kycSchema = new mongoose.Schema({
  license:         { type: String, default: null },
  aadhaar:         { type: String, default: null },
  pan:             { type: String, default: null },
  status:          { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  reviewedAt:      { type: Date },
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: [true, 'Name is required'],
    trim:     true,
  },
  email: {
    type:      String,
    unique:    true,
    sparse:    true,       // allows multiple null values
    lowercase: true,
    trim:      true,
  },
  phone: {
    type:   String,        // always String — never Number
    unique: true,
    sparse: true,          // allows multiple null values
    trim:   true,
  },
  password: {
    type:     String,
    required: [true, 'Password is required'],
    select:   false,       // never returned in queries by default
  },
  profileImage: { type: String, default: null },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  kyc:          { type: kycSchema, default: () => ({}) },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

// ── Hash password before save ─────────────────────────────────────────────────
// Mongoose 7+: async pre-hook must NOT call next() — just return the promise
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
