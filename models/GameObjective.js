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

const autoPopulate = function (next) {
  this.populate('createdBy', 'username')
    .populate('game')
    .populate('parent');
  next();
}

GameObjectiveSchema.pre('findOne', autoPopulate);
GameObjectiveSchema.pre('findById', autoPopulate);
GameObjectiveSchema.pre('find', autoPopulate);

const GameObjective = mongoose.model('GameObjective', GameObjectiveSchema);

GameObjectiveSchema.pre('remove', function (next) {
  UserGameObjective.remove({ gameObjective: this._id }).exec();
  GameObjective.remove({ parent: this._id }).exec();
  next();
});

export default GameObjective;
