const mongoose = require('mongoose');

// Delete cached model to prevent stale schema issues on hot-reload
if (mongoose.models.Booking) delete mongoose.models.Booking;

const bookingSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  // Dates & times
  startDate: { type: String, required: true },
  endDate:   { type: String, required: true },
  startTime: { type: String, default: '10:00' },
  endTime:   { type: String, default: '10:00' },
  days:      { type: Number, required: true, min: 1 },

  // Pricing breakdown
  subtotal:    { type: Number, default: 0 },
  addonsTotal: { type: Number, default: 0 },
  insurance:   { type: Number, default: 0 },
  serviceFee:  { type: Number, default: 0 },
  total:       { type: Number, required: true },

  // Add-ons selected
  addons: [{ type: String }],

  // Status
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Snapshot of vehicle info at booking time
  // Stored as a plain sub-document (NOT a String)
  vehicleSnapshot: {
    name:  { type: String, default: '' },
    image: { type: String, default: '' },   // URL only — never base64
    city:  { type: String, default: '' },
    area:  { type: String, default: '' },
    type:  { type: String, default: 'bike' },
    price: { type: Number, default: 0 },
  },

  // Rating left by renter after trip
  rating: {
    stars:     { type: Number, min: 1, max: 5, default: null },
    review:    { type: String, default: '' },
    createdAt: { type: Date },
  },

}, { timestamps: true });

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ ownerId: 1, createdAt: -1 });
bookingSchema.index({ vehicleId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
