import mongoose from "mongoose";

import {AddressModel} from "../../schemas/address.schema.js";

// Define schema for Company
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  address: AddressModel.schema,
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  primary_contact:{type: mongoose.Schema.Types.ObjectId, ref: 'Person'},
  people: [
    {
      role: {type:String}, 
      person:{ type: mongoose.Schema.Types.ObjectId, ref: 'Person'},
    },
  ],
  users: [
    {
      role: {type:String}, 
      user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    },
  ],
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

companySchema.virtual("id").get(function () {
  return this._id.toHexString();
});
companySchema.set("toJSON", { virtuals: true });

export const CompanyModel = mongoose.model("Company", companySchema);