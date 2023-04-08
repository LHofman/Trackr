import mongoose from 'mongoose';

import UserGameObjective from './UserGameObjective';

const GameObjectiveSchema = mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameObjective'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: Number,
  hint: String,
  index: {
    type: Number,
    default: 0
  },
  objective: {
    type: String,
    required: true
  },
  objective_id: {
    type: String,
    required: true
  },
  spoiler: Boolean
});

const GameObjective = mongoose.model('GameObjective', GameObjectiveSchema);

GameObjectiveSchema.pre('remove', function (next) {
  UserGameObjective.remove({ gameObjective: this._id }).exec();
  GameObjective.remove({ parent: this._id }).exec();
  next();
});

export default GameObjective;
