const mongoose = require('mongoose');

if (mongoose.models.Review) delete mongoose.models.Review;

const reviewSchema = new mongoose.Schema({
  bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  vehicleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

  // Overall star rating
  rating: { type: Number, required: true, min: 1, max: 5 },

  // Review text
  text: { type: String, default: '', trim: true },

  // Category breakdown (1-5 each)
  categories: {
    cleanliness:   { type: Number, min: 1, max: 5, default: null },
    condition:     { type: Number, min: 1, max: 5, default: null },
    communication: { type: Number, min: 1, max: 5, default: null },
    accuracy:      { type: Number, min: 1, max: 5, default: null },
    value:         { type: Number, min: 1, max: 5, default: null },
  },
}, { timestamps: true });

reviewSchema.index({ ownerId: 1, createdAt: -1 });
reviewSchema.index({ vehicleId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
