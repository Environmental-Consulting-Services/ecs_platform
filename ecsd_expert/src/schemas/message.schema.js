import mongoose, { version } from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { required: true, type: String },
  to: { required: true, type: String },
  message: { type: String },
  created_at: { type: Date ,  default: Date.now},
  updated_at: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false},
  read: { type: Boolean, default: false},
});

messageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
messageSchema.set("toJSON", { virtuals: true });

export const messageModel = mongoose.model("Message", messageSchema);
