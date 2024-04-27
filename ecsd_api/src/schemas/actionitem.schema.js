import mongoose from "mongoose";

const actionItemSchema = new mongoose.Schema({
  name: { required: true, type: String },
  notes: [{ required: false, type: String }],
  description: { required: false, type: String },
  status: {
    type: String,
    enum: ["open", "closed", "cancelled"],
    default: "open",  
  },
  source: { type: String },
  control: { type: String },
  location: { type: String },
  date_initiated: { type: Date },
  date_resolved: { type: Date },
  created_at: { type: Date },
  updated_at: { type: Date },
  inspection: { type: mongoose.Schema.Types.ObjectID, ref: "Inspection" },
});

export const ActionItemModel = mongoose.model("ActionItem", actionItemSchema);
