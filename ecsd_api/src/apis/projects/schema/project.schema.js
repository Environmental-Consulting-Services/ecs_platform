import mongoose from "mongoose";
import {AddressModel} from "../../schemas/address.schema.js";
import {PersonModel } from "../../person/schema/person.schema.js";
import sequenceGenerator from "../../../mongoose/mongoose_utils.js";


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
  name: {type: String, required: true },
  number: { type: String  },
  status: { type: String, required: true  },
  address: {
    street_one: {type:String},
    street_two: {type:String},
    city: {type:String},
    state: {type:String},
    zip_code: {type:String},
  },
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
  type: { type: String },
  company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  primary_contact:{type: mongoose.Schema.Types.ObjectId, ref: 'Person'},
  site_maps: [
    {
      upate_date: {type:Date}, 
      site_map: {type: mongoose.Schema.Types.ObjectId, required: false },
    }
  ],
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


// sequence instance
var sequence = sequenceGenerator('projects');
// I make sure this is the last pre-save middleware (just in case)
projectSchema.pre('save', function(next) {
  var doc = this;
  // get the next sequence
  if (doc.isNew) { 
    sequence.next(function(nextSeq){
      doc.number = nextSeq;
      next();
    });
  } else { next(); } 
});



export const ProjectModel = mongoose.model("Project", projectSchema);