import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street_one: String,
  street_two: String,
  city: String,
  state: String,
  zip_code: String,
});

addressSchema.set("toJSON", { virtuals: true });

export const AddressModel = mongoose.model("Address", addressSchema);