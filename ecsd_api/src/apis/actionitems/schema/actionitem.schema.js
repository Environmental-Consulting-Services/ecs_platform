import mongoose from "mongoose";
import sequenceGenerator from "../../../mongoose/mongoose_utils.js";


const actionItemSchema = new mongoose.Schema({
  name: { required: true, type: String },
  number: { type: String  },
  notes: [{ 
    note: {type: String, required: true}, 
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, 
    type:  {type: String, default: "text"},
    created_at: { type: Date },
  }],
  description: { required: false, type: String },
  status: {
    type: String,
    enum: ["inprogress", "cantdo", "complete", "todo"],
    default: "todo",  
  },
  source: { type: String },
  control: { type: String },
  location: { type: String },
  date_initiated: { type: Date },
  date_resolved: { type: Date },
  due_date: { type: Date },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Person'},
  created_at: { type: Date },
  updated_at: { type: Date },
  inspection: { type: mongoose.Schema.Types.ObjectID, ref: "Inspection" },
  project: { type: mongoose.Schema.Types.ObjectID, ref: "Project" },  
});

actionItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
actionItemSchema.set("toJSON", { virtuals: true });


// sequence instance
var sequence = sequenceGenerator('actionitems');
// I make sure this is the last pre-save middleware (just in case)
actionItemSchema.pre('save', function(next) {
  var doc = this;
  // get the next sequence
  if (doc.isNew) { 
    sequence.next(function(nextSeq){
      doc.number = nextSeq;
      next();
    });
  } else { next(); } 
});




export const ActionItemModel = mongoose.model("ActionItem", actionItemSchema);
