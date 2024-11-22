import mongoose from "mongoose";
const Schema = mongoose.Schema;

const KeyValuePairSchema = new Schema({
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
});

// Create and export the model
export const KeyPairModel = mongoose.model('KeyValuePair', KeyValuePairSchema);