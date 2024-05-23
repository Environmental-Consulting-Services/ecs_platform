import mongoose from "mongoose";

// Define schema for Project
const inspectionFormSchema = new mongoose.Schema({
  status: {
    type: String,
    required: false,
    enum: ["active","inactive", ],
    default: "inactive",
  },
  inspection: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: false
  }, 
  template: {
    type: mongoose.Schema.Types.ObjectId, ref: 'InspectionTempate', required: false
  },  
  input: {type: mongoose.Schema.Types.Mixed, required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true }); 

inspectionFormSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
inspectionFormSchema.set("toJSON", { virtuals: true });

export const InspectionFormModel = mongoose.model("InspectionForm", inspectionFormSchema);