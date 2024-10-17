import mongoose from "mongoose";
import { LivingNarrativeSchema } from "../../managementplans/schema/managementplan.schema.js";
import sequenceGenerator from "../../../mongoose/mongoose_utils.js";


// Define schema for Project
const inspectionSchema = new mongoose.Schema({
  type: { type: String, required: false },
  status: {
    type: String,
    required: false,
    enum: ["unscheduled","scheduled", "started", "conducted", "completed"],
    default: "unscheduled",
  },
  number: { type: String },
  template: {
    type: mongoose.Schema.Types.ObjectId, ref: 'InspectionTemplate', required: false
  },
  formdata: {type: mongoose.Schema.Types.Mixed, required: false },
  actions: [{type: mongoose.Schema.Types.ObjectId, ref: 'ActionItem', required: false }],
  living_narratives: [{type:LivingNarrativeSchema, required: false }],
  project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  scheduled_date: { type: Date},
  conducted_on: { type: Date },
  completed_on: { type: Date },
  created_at: { type: Date },
  updated_at: { type: Date },
}, { timestamps: true });

inspectionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
inspectionSchema.set("toJSON", { virtuals: true });


// sequence instance
var sequence = sequenceGenerator('inspections');
// I make sure this is the last pre-save middleware (just in case)
inspectionSchema.pre('save', function(next) {
  var doc = this;
  // get the next sequence
  if (doc.isNew) { 
    sequence.next(function(nextSeq){
      doc.number = nextSeq;
      next();
    });
  } else { next(); } 
});



export const InspectionModel = mongoose.model("Inspection", inspectionSchema);