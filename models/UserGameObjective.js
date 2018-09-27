import mongoose from 'mongoose';

export default mongoose.model(
  'UserGameObjective',
  mongoose.Schema({
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
    }
  })
);
