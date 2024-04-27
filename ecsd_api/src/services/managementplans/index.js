import { ManagementPlanModel } from "../../schemas/managementplan.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
import eq from "lodash";

export const getManagementPlansRoute = async (req, res) => {
  let managementPlansObjectArray = [];
  let jsonArrayManagementPlans = {};

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
  let fieldsManagementPlan;
  if (req.query.fields) {
    if (req.query.fields.categories) {
      fieldsManagementPlan = req.query.fields.managementPlans.split(",");
    }
  }

  const allManagementPlans = await ManagementPlanModel
    .find(filters)
    .select(fieldsManagementPlan)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  managementPlansObjectArray = allManagementPlans.map((element) => {
    let jsonObj = {
      type: "managementplans",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayManagementPlans = { ...jsonArrayManagementPlans, ...jsonObj });
  });

  const sentData = { data: [...managementPlansObjectArray] };
  return res.status(200).send(sentData);
};

export const getManagementPlanRoute = async (req, res) => {
  const managementPlanId = req.params.id;

  let fieldsManagementPlan;
  if (req.query.fields) {
    if (req.query.fields.managementPlans) {
      fieldsManagementPlan = req.query.fields.managementPlans.split(",");
    }
  }

  const foundManagementPlan = await ManagementPlanModel.findOne({ _id: managementPlanId }).select(fieldsManagementPlan);
  if (!foundManagementPlan) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The managementPlan can not be found" }] });
  }

  const sentData = {
    data: {
      type: "managementplans",
      id: foundManagementPlan.id,
      attributes: {
        ...foundManagementPlan._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createManagementPlanRoute = async (req, res) => {
    
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

  /* const existingManagementPlan = await managementPlanModel.findOne({ name: name });
  if (existingManagementPlan) {
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

  //Check Owner already has THIS managementPlan
  const existingManagementPlan = await ManagementPlanModel.findOne({ owner: owner._id , name: name });
  if (existingManagementPlan) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a managementPlan by this name" }] });
  }
  
  const newManagementPlan = new ManagementPlanModel({
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
  newManagementPlan.save();
  const sentData = {
    data: {
      type: "managementplans",
      id: newManagementPlan.id,
      attributes: {
        ...newManagementPlan._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editManagementPlanRoute = async (req, res) => {
  const managementPlanId = req.params.id;
  const {  name, status, address, owner, primary_contact, people,  } = req.body.data.attributes;

  const foundManagementPlan = await ManagementPlanModel.findById(managementPlanId);
  if (!foundManagementPlan) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No copmany was found" }] });
  }
  /* 
  if(!eq(foundManagementPlan.owner._id, req.user._id)) {
    return res
    .status(401)
    .json({ errors: [{ detail: "Only owners can update the managementPlan" }] });
  }
 */
 
 /*  const existingCopmaniesWithName = await ManagementPlanModel.find({ name: name, _id: { $ne: managementPlanId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a managementPlan with this name" }],
    });
  }
  */

  const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  const updatedManagementPlan = await ManagementPlanModel.updateOne(
    { _id: managementPlanId },
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
      type: "managementplans",
      id: managementPlanId,
      attributes: {
        ...updatedManagementPlan._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteManagementPlanRoute = async (req, res) => {
  const toDeleteManagementPlan = await ManagementPlanModel.findOne({ _id: req.params.id});

  if (!toDeleteManagementPlan /* || String(toDeleteManagementPlan.owner._id) != String(req.user._id) */) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The managementPlan does not exist" }] });
  }

  try {
    await ManagementPlanModel.deleteOne({_id: toDeleteManagementPlan._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};
