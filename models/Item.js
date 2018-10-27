import mongoose from 'mongoose';

import Franchise from './Franchise';
import GameObjective from './GameObjective';
import UserItem from './UserItem';

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
  releaseDateDvd: String,
  releaseDateDvdStatus: {
    type: String,
    enum: ['Date', 'TBA', 'Unknown']
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
  Franchise.update({}, { $pull: { items: item_id } }, { multi: true}).exec();
  GameObjective.remove({game: this._id}).exec();
  UserItem.remove({item: this._id}).exec();
  next();
});

export default mongoose.model('Item', ItemSchema);
