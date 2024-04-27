import { ActionItemModel } from "../../schemas/actionitem.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
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
      fieldsActionItem = req.query.fields.ActionItems.split(",");
    }
  }

  const allActionItems = await ActionItemModel
    .find(filters)
    .select(fieldsActionItem)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  actionItemssObjectArray = allActionItems.map((element) => {
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
  
  const {  name,
    status,
    address,
    owner ,
    primary_contact} = req.body.data.attributes;

 
  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  }

  /* const existingActionItem = await actionItemModel.findOne({ name: name });
  if (existingActionItem) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The copmany already exists" }] });
  }
   */

  //Check Users Exist
  const ownerUser = await UserModel.findById(owner._id);
  if (!ownerUser) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner user does not exist" }] });
  }

  //Check Owner already has THIS actionItem
  const existingActionItem = await ActionItemModel.findOne({ owner: owner._id , name: name });
  if (existingActionItem) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a actionItem by this name" }] });
  }
  
  const newActionItem = new ActionItemModel({
    name: name,
    status:  "active",
    address: new AddressModel({
      street_one: address.street_one,
      street_two: address.street_two,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    }),
    owner: {_id: owner._id},
    //primary_contact: primary_contact, 
    //people: people.map(person => person._id),
    created_at: Date.now(),
    updated_at: Date.now(),
  });
  newActionItem.save();
  const sentData = {
    data: {
      type: "actionitems",
      id: newActionItem.id,
      attributes: {
        ...newActionItem._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editActionItemRoute = async (req, res) => {
  const actionItemId = req.params.id;
  const {  name, status, address, owner, primary_contact, people,  } = req.body.data.attributes;

  const foundActionItem = await ActionItemModel.findById(actionItemId);
  if (!foundActionItem) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No copmany was found" }] });
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

  const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  const updatedActionItem = await ActionItemModel.updateOne(
    { _id: actionItemId },
    {
      name : name, 
      status: status, 
      address: address, 
      owner : {_id: owner._id}, 
      primary_contact : newPrimaryContact,     
     //people: people.map(person => person._id),
      created_at: Date.now(),
      updated_at: Date.now(),
    }
  );

  const sentData = {
    data: {
      type: "actionitems",
      id: actionItemId,
      attributes: {
        ...updatedActionItem._doc
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
