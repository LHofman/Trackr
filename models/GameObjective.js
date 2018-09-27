import mongoose from 'mongoose';

import UserGameObjective from './UserGameObjective';

const GameObjectiveSchema = mongoose.Schema({
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
  },
  objective_id: {
    type: String,
    required: true
  }
});

GameObjectiveSchema.pre('remove', function (next) {
  UserGameObjective.remove({gameObjective: this._id}).exec();
  next();
});

export default mongoose.model('GameObjective', GameObjectiveSchema);
