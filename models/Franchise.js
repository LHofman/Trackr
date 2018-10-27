import mongoose from 'mongoose';

const FranchiseSchema = mongoose.Schema({
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
  }
});

const autoPopulate = function(next) {
  this.populate('createdBy', 'username');
  next();
};

FranchiseSchema.pre('findOne', autoPopulate);
FranchiseSchema.pre('findById', autoPopulate);
FranchiseSchema.pre('find', autoPopulate);

export default mongoose.model('Franchise', FranchiseSchema);
