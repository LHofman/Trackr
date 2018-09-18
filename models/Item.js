import mongoose from 'mongoose';

import UserItem from './UserItem';
import GameObjective from './GameObjective';

const ItemSchema = mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  title_id: {
    type: String,
    required: true
  },
  releaseDate: {
    type: String,
    required: true
  },
  author: String,
  ongoing: Boolean,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

ItemSchema.pre('remove', function (next) {
  UserItem.remove({item: this._id}).exec();
  GameObjective.remove({game: this._id}).exec();
  next();
});

export default mongoose.model('Item', ItemSchema);
