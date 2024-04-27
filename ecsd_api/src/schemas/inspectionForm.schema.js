import mongoose from "mongoose";

// Define schema for Project
const inspectionFormSchema = new mongoose.Schema({
  scheduled_date: { type: Date},
  type: { type: String, required: false },
  status: {
    type: String,
    required: false,
    enum: ["active","inactive", ],
    default: "inactive",
  },
  items: [{type: mongoose.Schema.Types.Mixed, required: false }],
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

inspectionFormSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
inspectionFormSchema.set("toJSON", { virtuals: true });

export const InspectionFormModel = mongoose.model("InspectionForm", inspectionFormSchema);