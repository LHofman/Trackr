import mongoose from 'mongoose';

const ListSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  title_id: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.itemModel'
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Item', 'Franchise']
    }
  }]
});

const autoPopulate = function(next) {
  this.populate('createdBy', 'username');
  next();
};

ListSchema.pre('findOne', autoPopulate);
ListSchema.pre('findById', autoPopulate);
ListSchema.pre('find', autoPopulate);

export default mongoose.model('List', ListSchema);
