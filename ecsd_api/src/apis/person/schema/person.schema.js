import mongoose from "mongoose";

export const PersonSchema = new mongoose.Schema({
  first_name: { required: true, type: String },
  last_name: { required: true, type: String },
  email: {type: String },
  email_verified_at: { type: Date },
  profile_image: { type: String },
  phone: { type: String },
  address: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
});

PersonSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
PersonSchema.set("toJSON", { virtuals: true });

export const PersonModel = mongoose.model("Person", PersonSchema);
