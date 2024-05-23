import { ActionItemModel } from "./schema/actionitem.schema.js";
import { AddressModel } from "../schemas/address.schema.js";
import { UserModel } from "../users/schema/user.schema.js";
import eq from "lodash";



export const getActionItemsRoute = async (req, res) => {
  let actionItemsObjectArray = [];
  let jsonArrayActionItems = {};

  // pagination
  let paginationSize = null;
  let pageNumber = null;
  if (req.query.page) {
    if (req.query.page.number) {
      pageNumber = +req.query.page.number;
    }
    if (req.query.page.size) {
      paginationSize = +req.query.page.size;
    }
  }

  // filtering
  let filters = {};
  if (req.query.filter) {
    filters = req.query.filter;
  }

  // sorting
  let sortValue;
  if (req.query.sort) {
    sortValue = req.query.sort;
  }

  // choose fields
  let fieldsActionItems;
  if (req.query.fields) {
    if (req.query.fields.ActionItems) {
      fieldsActionItems = req.query.fields.ActionItems.split(",");
    }
  }

  const allActionItems = await ActionItemModel
    .find(filters)
    .select(fieldsActionItems)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

    actionItemsObjectArray = allActionItems.map((element) => {
    let jsonObj = {
      type: "actionitems",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayActionItems = { ...jsonArrayActionItems, ...jsonObj });
  });

  const sentData = { data: [...actionItemsObjectArray] };
  return res.status(200).send(sentData);
};

export const getActionItemRoute = async (req, res) => {
  const actionItemId = req.params.id;

  let fieldsActionItem;
  if (req.query.fields) {
    if (req.query.fields.actionItems) {
      fieldsActionItem = req.query.fields.actionItems.split(",");
    }
  }

  const foundActionItem = await ActionItemModel.findOne({ _id: actionItemId }).select(fieldsActionItem);
  if (!foundActionItem) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The actionItem can not be found" }] });
  }

  const sentData = {
    data: {
      type: "actionitems",
      id: foundActionItem.id,
      attributes: {
        ...foundActionItem._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createActionItemRoute = async (req, res) => {
  
  const {name, project, inspection, notes, description, status, source, control, location, date_initiated, date_resolved, due_date, assigned_to } = req.body.data.attributes;

  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  }

  var newActionItemData = {}

  if(name != null)
    newActionItemData.name =  name;
  if(project != null && project != "" && project != "null")
    newActionItemData.project =  project;
  if(inspection != null && inspection != "" && inspection != "null")
    newActionItemData.inspection =  inspection;
  if(notes != null && notes != "" && notes != "null" && notes.length > 0)
    newActionItemData.notes =  notes;
  if(description != null)
    newActionItemData.description =  description;
  if(status != null && status != "" && status != "null")
    newActionItemData.status =  status;
  if(source != null)
    newActionItemData.source =  source;
  if(control != null)
    newActionItemData.control =  control;
  if(location != null)
    newActionItemData.location =  location;
  if(date_initiated != null || date_initiated != "null") {
      var date = Date.parse(date_initiated);
      if (isNaN(date)) {
      } else {
        newActionItemData.date_initiated =  date_initiated;
      }
  }   
  if(date_resolved != null || date_resolved != "null") {
      var date = Date.parse(date_resolved);
      if (isNaN(date)) {
      } else {
        newActionItemData.date_resolved =  date_resolved;
      }
  }
  if(due_date != null || due_date != "null"){
    var date = Date.parse(due_date);
    if (isNaN(date)) {
    } else {
      newActionItemData.due_date =  due_date;
    }
  } 
  if(assigned_to != null && assigned_to != "" && assigned_to != "null")
    newActionItemData.assigned_to =  assigned_to;
  
    newActionItemData.created_at = Date.now();
    newActionItemData.updated_at = Date.now();

/* 
  const newActionItem = new ActionItemModel({
    ...newActionItemData
  });
   */
  var newActionItemDoc = await ActionItemModel.create(newActionItemData);

  const sentData = {
    data: {
      type: "actionitems",
      id: newActionItemDoc.id,
      attributes: {
        ...newActionItemDoc._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editActionItemRoute = async (req, res) => {
  const actionItemId = req.params.id;
  const {   name, project, inspection, notes, description, status, source, control, location, date_initiated, date_resolved, due_date, assigned_to } = req.body.data.attributes;

  const foundActionItem = await ActionItemModel.findById(actionItemId);
  if (!foundActionItem) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No actionItem was found" }] });
  }
  /* 
  if(!eq(foundActionItem.owner._id, req.user._id)) {
    return res
    .status(401)
    .json({ errors: [{ detail: "Only owners can update the actionItem" }] });
  }
 */
 
 /*  const existingCopmaniesWithName = await ActionItemModel.find({ name: name, _id: { $ne: actionItemId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a actionItem with this name" }],
    });
  }
  */

  //const newOwner = owner !== null ? UserModel({id: owner}): null;

  //const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;

/*   var updateActionItemData = {}
 */
  if(name != null)
    foundActionItem.name =  name;
if(project != null)
  foundActionItem.project =  project;
if(inspection != null && inspection != "" && inspection != "null")
  foundActionItem.inspection =  inspection;
if(notes != null)
  foundActionItem.notes =  [];
  notes.map((note) => {
    if(note._id == null || note._id == "" || note._id == "null"){ 
      note.created_at = Date.now();
      note.user = req.user._id;
      foundActionItem.notes.push(note);
    }else{
      foundActionItem.notes.push(note);
    }
  });
  //foundActionItem.notes =  notes;
if(description != null)
  foundActionItem.description =  description;
if(status != null && status != "" && status != "null")
  foundActionItem.status =  status;
if(source != null)
  foundActionItem.source =  source;
if(control != null)
  foundActionItem.control =  control;
if(location != null)
  foundActionItem.location =  location;
if(date_initiated != null || date_initiated != "null") {
    var date = Date.parse(date_initiated);
    if (isNaN(date)) {
    } else {
      foundActionItem.date_initiated =  date_initiated;
    }
}   
if(date_resolved != null || date_resolved != "null") {
    var date = Date.parse(date_resolved);
    if (isNaN(date)) {
    } else {
      foundActionItem.date_resolved =  date_resolved;
    }
}
if(due_date != null || due_date != "null"){
  var date = Date.parse(due_date);
  if (isNaN(date)) {
  } else {
    foundActionItem.due_date =  due_date;
  }
} 
if(assigned_to != null && assigned_to != "" && assigned_to != "null")
  foundActionItem.assigned_to =  assigned_to;

foundActionItem.updated_at = Date.now();


delete foundActionItem["notes"];

foundActionItem.save();

/* 
var jsonActionItem = foundActionItem.toJSON()

delete jsonActionItem["notes"];

const updatedActionItem = await ActionItemModel.updateOne(jsonActionItem);
 */
  /* const updatedActionItem = await ActionItemModel.updateOne(
    { _id: actionItemId },
    updateActionItemData
  ); */

  const sentData = {
    data: {
      type: "actionitems",
      id: actionItemId,
      attributes: {
        ...foundActionItem._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteActionItemRoute = async (req, res) => {
  const toDeleteActionItem = await ActionItemModel.findOne({ _id: req.params.id});

  if (!toDeleteActionItem || String(toDeleteActionItem.owner._id) != String(req.user._id)) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The actionItem does not exist" }] });
  }

  try {
    await ActionItemModel.deleteOne({_id: toDeleteActionItem._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

export const getActionItemNotesRoute = async (req, res) => {
  const actionItemId = req.params.id;
  let notesObjectArray = [];
  let jsonArrayNotes = {};

  const foundActionItem = await ActionItemModel.findOne({ _id: actionItemId });

  if (!foundActionItem) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The action item can not be found" }] });
  }

  if(foundActionItem.notes != null && foundActionItem.notes.length > 0){
    notesObjectArray = foundActionItem.notes.map((note) => {
      let jsonObj = {
        type: "notes",
        id: note.id,
        attributes: {
          ...note._doc,
        },
      };
     
      return (jsonArrayNotes = { ...jsonArrayNotes, ...jsonObj });
    
    }
    );
  }else { 
    notesObjectArray = [];
  }
  const sentData = { data: [...notesObjectArray] };

  return res.status(200).send(sentData);
};


export const getActionItemNoteRoute = async (req, res) => {
  const actionItemNoteId = req.params.id;
  let jsonArrayNotes = {};

  const foundActionItem = await ActionItemNote.findOne({ _id: actionItemNoteId });

  if (!foundActionItem) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The action item can not be found" }] });
  }

  if(foundActionItem.notes != null && foundActionItem.notes.length > 0){
    notesObjectArray = foundActionItem.notes.map((note) => {
      let jsonObj = {
        type: "notes",
        id: note.id,
        attributes: {
          ...note._doc,
        },
      };
     
      return (jsonArrayNotes = { ...jsonArrayNotes, ...jsonObj });
    
    }
    );
  }else { 
    notesObjectArray = [];
  }
  const sentData = { data: [...notesObjectArray] };

  return res.status(200).send(sentData);
};
export const deleteActionItemNoteRoute = async (req, res) => {
  const actionItemId = req.params.id;
  const noteId = req.params.noteid;
  const toDeleteActionItem = await ActionItemModel.findOne({ _id: req.params.id});

  try {


    ActionItemModel.updateOne(
      { _id: req.params.id }, 
      { $pull: { "notes": {"_id": noteId} } },
      function (err, docs) {
        if (err){
            console.log(err)
        }
      });

    //await ActionItemModel.deleteOne({_id: toDeleteActionItem._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

export const createActionItemNoteRoute = async (req, res) => {
  const actionItemId = req.params.id;

  const { note, user, type} = req.body.data.attributes;

  if (!note) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The note is required" }] });
  }

  var newActionItemNoteData = {}

  if(note != null)
    newActionItemNoteData.note =  note;
  
  newActionItemNoteData.user =  req.user._id;

  if(type != null && type != "" && type != "null")
    newActionItemNoteData.type =  type;

    newActionItemNoteData.created_at = Date.now();

  var savedNoteDoc = await ActionItemModel.findOneAndUpdate({ _id: actionItemId }, {"$push": { "notes": newActionItemNoteData }}, {new: true,});

  const sentData = {
    data: {
      type: "actionitemnotes",
      id: savedNoteDoc.id,
      attributes: {
        ...savedNoteDoc._doc
      },
    },
  };
  return res.status(201).send(sentData);
};