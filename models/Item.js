import mongoose from 'mongoose';

import UserItem from './UserItem';
import GameObjective from './GameObjective';

const ItemSchema = mongoose.Schema({
  artist: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: String,
  ongoing: Boolean,
  releaseDate: String,
  releaseDateStatus: {
    type: String,
    enum: ['Date', 'TBA', 'Unknown'],
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
  type: {
    type: String,
    required: true
  }
});

const autoPopulate = function (next) {
  this.populate('createdBy', 'username');
  next();
}

ItemSchema.pre('findOne', autoPopulate);
ItemSchema.pre('findById', autoPopulate);
ItemSchema.pre('find', autoPopulate);

ItemSchema.pre('remove', function (next) {
  UserItem.remove({item: this._id}).exec();
  GameObjective.remove({game: this._id}).exec();
  next();
});

export default mongoose.model('Item', ItemSchema);
