import mongoose from "mongoose";

// Define schema for Project
const inspectionTemplateSchema = new mongoose.Schema({
  type: { type: String, required: false },
  form: {
    type: mongoose.Schema.Types.ObjectId, ref: 'InspectionForm', required: false
  },
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

inspectionTemplateSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
inspectionTemplateSchema.set("toJSON", { virtuals: true });

export const InspectionTemplateModel = mongoose.model("InspectionTempate", inspectionTemplateSchema);