import { InspectionTemplateModel } from "../../schemas/inspectionTemplate.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
import eq from "lodash";

export const getInspectionTemplatesRoute = async (req, res) => {
  let inspectionTemplatesObjectArray = [];
  let jsonArrayInspectionTemplates = {};

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
  let fieldsInspectionTemplate;
  if (req.query.fields) {
    if (req.query.fields.categories) {
      fieldsInspectionTemplate = req.query.fields.inspectionTemplates.split(",");
    }
  }

  const allInspectionTemplates = await InspectionTemplateModel
    .find(filters)
    .select(fieldsInspectionTemplate)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  inspectionTemplatesObjectArray = allInspectionTemplates.map((element) => {
    let jsonObj = {
      type: "inspectionTemplates",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayInspectionTemplates = { ...jsonArrayInspectionTemplates, ...jsonObj });
  });

  const sentData = { data: [...inspectionTemplatesObjectArray] };
  return res.status(200).send(sentData);
};

export const getInspectionTemplateRoute = async (req, res) => {
  const inspectionTemplateId = req.params.id;

  let fieldsInspectionTemplate;
  if (req.query.fields) {
    if (req.query.fields.inspectionTemplates) {
      fieldsInspectionTemplate = req.query.fields.inspectionTemplates.split(",");
    }
  }

  const foundInspectionTemplate = await InspectionTemplateModel.findOne({ _id: inspectionTemplateId }).select(fieldsInspectionTemplate);
  if (!foundInspectionTemplate) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspectionTemplate can not be found" }] });
  }

  const sentData = {
    data: {
      type: "inspectionTemplates",
      id: foundInspectionTemplate.id,
      attributes: {
        ...foundInspectionTemplate._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createInspectionTemplateRoute = async (req, res) => {
    
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

  /* const existingInspectionTemplate = await inspectionTemplateModel.findOne({ name: name });
  if (existingInspectionTemplate) {
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

  //Check Owner already has THIS inspectionTemplate
  const existingInspectionTemplate = await InspectionTemplateModel.findOne({ owner: owner._id , name: name });
  if (existingInspectionTemplate) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a inspectionTemplate by this name" }] });
  }
  
  const newInspectionTemplate = new InspectionTemplateModel({
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
  newInspectionTemplate.save();
  const sentData = {
    data: {
      type: "inspectionTemplates",
      id: newInspectionTemplate.id,
      attributes: {
        ...newInspectionTemplate._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editInspectionTemplateRoute = async (req, res) => {
  const inspectionTemplateId = req.params.id;
  const {  name, status, address, owner, primary_contact, people,  } = req.body.data.attributes;

  const foundInspectionTemplate = await InspectionTemplateModel.findById(inspectionTemplateId);
  if (!foundInspectionTemplate) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No copmany was found" }] });
  }
  /* 
  if(!eq(foundInspectionTemplate.owner._id, req.user._id)) {
    return res
    .status(401)
    .json({ errors: [{ detail: "Only owners can update the inspectionTemplate" }] });
  } */

 
 /*  const existingCopmaniesWithName = await InspectionTemplateModel.find({ name: name, _id: { $ne: inspectionTemplateId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a inspectionTemplate with this name" }],
    });
  }
  */

  const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  const updatedInspectionTemplate = await InspectionTemplateModel.updateOne(
    { _id: inspectionTemplateId },
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
      type: "inspectionTemplates",
      id: inspectionTemplateId,
      attributes: {
        ...updatedInspectionTemplate._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteInspectionTemplateRoute = async (req, res) => {
  const toDeleteInspectionTemplate = await InspectionTemplateModel.findOne({ _id: req.params.id});

  if (!toDeleteInspectionTemplate /* || String(toDeleteInspectionTemplate.owner._id) != String(req.user._id) */) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspectionTemplate does not exist" }] });
  }

  try {
    await InspectionTemplateModel.deleteOne({_id: toDeleteInspectionTemplate._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};
