const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Owner
  ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, default: '' },

  // Core info
  type:  { type: String, enum: ['bike', 'car'], required: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year:  { type: Number, required: true },
  fuel:  { type: String, required: true },
  seats: { type: Number },

  // Location
  city:     { type: String, required: true, trim: true },
  area:     { type: String, trim: true, default: '' },
  address:  { type: String, trim: true, default: '' },   // full pickup address
  landmark: { type: String, trim: true, default: '' },   // optional landmark
  lat:      { type: Number, default: null },
  lng:      { type: Number, default: null },

  // Pricing
  pricingType:     { type: String, enum: ['daily', 'hourly'], default: 'daily' },
  dailyPrice:      { type: Number, default: 0 },
  hourlyPrice:     { type: Number, default: 0 },
  isDailyEnabled:  { type: Boolean, default: false },
  weeklyDiscount:  { type: Number, default: 10 },
  monthlyDiscount: { type: Number, default: 20 },
  deposit:         { type: Number, default: 0 },

  // Media
  photos: [{ url: String, public_id: String }],

  // Details
  description: { type: String, default: '' },
  features:    [String],

  // Availability
  availableDays:  { type: [String], default: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  availableDates: { type: [String], default: [] },
  startTime:      { type: String, default: '08:00' },
  endTime:       { type: String, default: '20:00' },
  instantBook:   { type: Boolean, default: true },
  blockedDates:  [String],

  // Status
  isAvailable:      { type: Boolean, default: true },
  isLive:           { type: Boolean, default: false },
  isCurrentlyBooked:{ type: Boolean, default: false },
  bookingType:      { type: String, enum: ['instant', 'advance', 'both'], default: 'both' },
  ownerListingType: { type: String, enum: ['personal', 'business'], default: 'business' },
  status:           { type: String, enum: ['pending', 'approved', 'rejected', 'removed'], default: 'pending' },

}, { timestamps: true });

// Index for fast city + type queries
vehicleSchema.index({ city: 1, type: 1, isAvailable: 1 });
vehicleSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
