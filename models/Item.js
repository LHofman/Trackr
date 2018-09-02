import mongoose from 'mongoose';

export default mongoose.model(
  'Item',
  mongoose.Schema({
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
    },
  })
);
