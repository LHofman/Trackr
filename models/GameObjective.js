import mongoose from 'mongoose';

export default mongoose.model(
  'GameObjective',
  mongoose.Schema({
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    index: {
      type: Number,
      default: 0
    },
    objective: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  })
);
