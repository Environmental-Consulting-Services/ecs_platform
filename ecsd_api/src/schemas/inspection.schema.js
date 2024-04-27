import mongoose from "mongoose";

import { livingNarrativeSchema } from "./managementplan.schema";


// Define schema for Project
const inspectionSchema = new mongoose.Schema({
  scheduled_date: { type: Date},
  type: { type: String, required: false },
  status: {
    type: String,
    required: false,
    enum: ["unscheduled","scheduled", "started", "complete"],
    default: "unscheduled",
  },
  template: {
    type: mongoose.Schema.Types.ObjectId, ref: 'InspectionTemplate', required: false
  },
  actions: [{type: mongoose.Schema.Types.ObjectId, ref: 'ActionItem', required: false }],
  living_narratives: [{type:livingNarrativeSchema, required: false }],
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

inspectionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
inspectionSchema.set("toJSON", { virtuals: true });

export const InspectionModel = mongoose.model("Inspection", inspectionSchema);