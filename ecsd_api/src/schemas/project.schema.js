import mongoose from "mongoose";
import {AddressModel} from "./address.schema.js";

const permitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: { type: String, required: true },
  status: {
    type: String,
    required: true
  },
  type: { type: String, required: true },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });


// Define schema for Project
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: { type: String, required: true },
  status: {
    type: String,
    required: true
  },
  address: {
    street_one: {type:String},
    street_two: {type:String},
    city: {type:String},
    state: {type:String},
    zip_code: {type:String},
  },
  people: [
            {
              project_role: {type:String}, 
              project_member:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
            },
          ],
  type: { type: String, required: true },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  primary_contact:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  start_date: { type: Date},
  end_date:   { type: Date},
  permits: [{type: permitSchema},],
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

projectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
projectSchema.set("toJSON", { virtuals: true });

export const ProjectModel = mongoose.model("Project", projectSchema);