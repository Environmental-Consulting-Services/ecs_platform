import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  type: { required: true, type: String },
  first_name: { required: true, type: String },
  last_name: { required: true, type: String },
  email: { required: true, type: String },
  email_verified_at: { type: Date },
  password: { required: true, type: String },
  profile_image: { type: String },
  phone: { type: String },
  address: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
  expert_thread: { type: String} ,
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
});

UserSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
UserSchema.set("toJSON", { virtuals: true });

export const UserModel = mongoose.model("User", UserSchema);
