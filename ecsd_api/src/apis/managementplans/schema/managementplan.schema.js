import mongoose from "mongoose";

import {UserModel} from "../../users/schema/user.schema.js";
import {AddressModel} from "../../schemas/address.schema.js";



const phaseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: false, 
    enum: ["initial", "interim", "final", "initial/interim", "initial/final"],
    default: "initial",
  },
  site_map: [
      {
        upate_date: {type:Date}, 
        map: {type: mongoose.Schema.Types.ObjectId, ref: 'SiteMapFiles', required: false }
      }],
  start_date: { type: Date, required: false },
  end_date: { type: Date, required: false },
  inspection_frequency: { type: String, required: false },
});


const source_controls = new mongoose.Schema({
  source_description: { type: String, required: false },
  source_type: { type: String, required: false },
  source_status: { type: String, required: false },
  controls: [{name: {type:String}, description:{type:String}, required: false }],
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

const livingNarrativeSchema = new mongoose.Schema({
  description:  { type: String, required: false },
  narrative: {type: String, required: false },
  phases: [{type: phaseSchema, required: false }],
  people: [
    {
      "project_role": String, 
      "project_member":{type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
  ],
  distrurbance_area: { type: String, required: false },
  areas_of_inspection: [{ type: String, required: false }],
  source_controls: [{type: source_controls, required: false }],
});

// Define schema for Project
const managementPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["active", "inactive", "complete"],
    default: "initial",
  },
  current_phase: [{ 
      type: phaseSchema, 
      required: false,
  }],
  version: { type: Number, required: true },
  site_narrative: {type: mongoose.Schema.Types.ObjectId, ref: 'NarrativeFiles', required: false },
  living_narratives: [{type:livingNarrativeSchema, required: false }],
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

managementPlanSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
managementPlanSchema.set("toJSON", { virtuals: true });



export const LivingNarrativeSchema = livingNarrativeSchema;

export const ManagementPlanModel = mongoose.model("ManagementPlan", managementPlanSchema);