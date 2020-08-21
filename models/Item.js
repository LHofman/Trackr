import mongoose from 'mongoose';

import Franchise from './Franchise';
import GameObjective from './GameObjective';
import UserItem from './UserItem';

const ItemSchema = mongoose.Schema({
  artists: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: String,
  genres: [String],
  links: [{
    index: {type: Number, required: true},
    title: {type: String, required: true},
    url: {type: String, required: true}
  }],
  ongoing: Boolean,
  platforms: [String],
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
  Franchise.update({}, { $pull: { items: this._id } }, { multi: true}).exec();
  GameObjective.remove({game: this._id}).exec();
  UserItem.remove({item: this._id}).exec();
  next();
});

export default mongoose.model('Item', ItemSchema);
