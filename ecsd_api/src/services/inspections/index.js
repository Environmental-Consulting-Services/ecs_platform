import { InspectionModel } from "../../schemas/inspection.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
import eq from "lodash";

export const getInspectionsRoute = async (req, res) => {
  let inspectionsObjectArray = [];
  let jsonArrayInspections = {};

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
  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const allInspections = await InspectionModel
    .find(filters)
    .select(fieldsInspection)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  inspectionsObjectArray = allInspections.map((element) => {
    let jsonObj = {
      type: "inspections",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayInspections = { ...jsonArrayInspections, ...jsonObj });
  });

  const sentData = { data: [...inspectionsObjectArray] };
  return res.status(200).send(sentData);
};

export const getInspectionRoute = async (req, res) => {
  const inspectionId = req.params.id;

  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const foundInspection = await InspectionModel.findOne({ _id: inspectionId }).select(fieldsInspection);
  if (!foundInspection) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection can not be found" }] });
  }

  const sentData = {
    data: {
      type: "inspections",
      id: foundInspection.id,
      attributes: {
        ...foundInspection._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createInspectionRoute = async (req, res) => {
  
  const { 
    scheduled_date,
    type,
    status,
    template,
    actions,
    living_narratives,
    project,
    company,
    created_at,
    updated_at,

  } = req.body.data.attributes;

 /* 
  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  } */

  /* const existingProject = await projectModel.findOne({ name: name });
  if (existingProject) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The copmany already exists" }] });
  }
   */

  //Check Users Exist
/*   const ownerUser = await UserModel.findById(owner._id);
  if (!ownerUser) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner user does not exist" }] });
  } */

  //Check Owner already has THIS project
 /*  const existingProject = await ProjectModel.findOne({ owner: owner._id , name: name });
  if (existingProject) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a project by this name" }] });
  } */
  
  const newInspection = new InspectionModel({
    scheduled_date : scheduled_date,
    type: type,
    status: status,
    template: template,
    actions : actions,
    living_narratives : living_narratives,
    project : project,
    company : company,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  newInspection.save();
  const sentData = {
    data: {
      type: "inspections",
      id: newInspection.id,
      attributes: {
        ...newInspection._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editInspectionRoute = async (req, res) => {
  const inspectionId = req.params.id;
  const {  scheduled_date,
    type,
    status,
    template,
    actions,
    living_narratives,
    project,
    company,
    created_at,
    updated_at,
  } = req.body.data.attributes;

  const foundInspection = await InspectionModel.findById(inspectionId);
  if (!foundInspection) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No inspection was found" }] });
  }
  //need to check the project roles/etc.
  //if(!eq(foundInspection.owner._id, req.user._id)) {
  //  return res
  //  .status(401)
  //  .json({ errors: [{ detail: "Only owners can update the project" }] });
  //}

 
 /*  const existingCopmaniesWithName = await ProjectModel.find({ name: name, _id: { $ne: projectId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a project with this name" }],
    });
  }
  */

  //const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  
  const updatedInspection = await InspectionModel.updateOne(
    { _id: inspectionId },
    {
      scheduled_date : scheduled_date,
      type: type,
      status: status,
      template: template,
      actions : actions,
      living_narratives : living_narratives,
      project : project,
      company : company,
      updated_at: Date.now(),
    }
  );

  const sentData = {
    data: {
      type: "inspections",
      id: inspectionId,
      attributes: {
        ...updatedInspection._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteInspectionRoute = async (req, res) => {
  const toDeleteInspection = await InspectionModel.findOne({ _id: req.params.id});

  if (!toDeleteInspection /* || String(toDeleteInspection.owner._id) != String(req.user._id) */) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection does not exist" }] });
  }

  try {
    await InspectionModel.deleteOne({_id: toDeleteInspection._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};
