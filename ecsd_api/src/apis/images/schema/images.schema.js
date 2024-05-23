import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  image_data: {data: Buffer, contentType: String, required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
});

imageSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
imageSchema.set("toJSON", { virtuals: true });

export const ImageModel = mongoose.model('Image', imageSchema);