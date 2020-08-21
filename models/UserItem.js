const mongoose = require('mongoose');

export default mongoose.model(
  'UserItem',
  mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    inCollection: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      required: true,
      default: 'To Do'
    },
    completedHistory: [String],
    rating: Number,
    reviews: [{
      rating: Number,
      review: {
        type: String,
        required: true
      },
      timestamp: {
        type: String,
        required: true
      }
    }]
  })
);
