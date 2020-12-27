const mongoose = require('mongoose');

export const ReviewSchema = mongoose.Schema({
  rating: Number,
  review: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
});

export default mongoose.model(
  'ReviewSchema',
  ReviewSchema
);
