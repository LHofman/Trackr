import { ReviewSchema } from './Review';
import { UserGameObjectiveSchema } from './UserGameObjective';

const mongoose = require('mongoose');

export const UserItemSchema = mongoose.Schema({
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
  reviews: [ReviewSchema],
  userGameObjectives: [UserGameObjectiveSchema]
});

export default mongoose.model(
  'UserItem',
  UserItemSchema
);
