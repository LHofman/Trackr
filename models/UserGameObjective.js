import mongoose from 'mongoose';

export const UserGameObjectiveSchema = mongoose.Schema({
  gameObjective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameObjective',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    default: 0
  }
});

export default mongoose.model(
  'UserGameObjective',
  UserGameObjectiveSchema
);
