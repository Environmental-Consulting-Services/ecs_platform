import { InspectionFormModel } from "../../schemas/inspectionForm.schema";

import eq from "lodash";

export const getInspectionFormsRoute = async (req, res) => {
  let inspectionFormsObjectArray = [];
  let jsonArrayInspectionForms = {};

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
  let fieldsInspectionForms;
  if (req.query.fields) {
    if (req.query.fields.inspectionForms) {
      fieldsInspectionForms = req.query.fields.inpectionForms.split(",");
    }
  }

  const allInspectionForms = await InspectionFormModel
    .find(filters)
    .select(fieldsInspectionForms)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

    inspectionFormsObjectArray = allInspectionForms.map((element) => {
    let jsonObj = {
      type: "inspectionForms",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayInspectionForms = { ...jsonArrayInspectionForms, ...jsonObj });
  });

  const sentData = { data: [...inspectionFormsObjectArray] };
  return res.status(200).send(sentData);
};

export const getInspectionFormRoute = async (req, res) => {
  const inspectionFormId = req.params.id;

  let fieldsInspectionForm;
  if (req.query.fields) {
    if (req.query.fields.inspectionForms) {
      fieldsInspectionForm = req.query.fields.inspectionForms.split(",");
    }
  }

  const foundInspectionForm = await InspectionFormModel.findOne({ _id: inspectionFormId }).select(fieldsInspectionForm);
  if (!foundInspectionForm) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The project can not be found" }] });
  }

  const sentData = {
    data: {
      type: "inspectionForms",
      id: foundInspectionForm.id,
      attributes: {
        ...foundInspectionForm._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createInspectionFormRoute = async (req, res) => {
    
  const {  
    scheduled_date,
    type,
    status,
    items,
    project,
    company,
    created_at,
    updated_at,} = req.body.data.attributes;
/* 
 
  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  }
 */
  /* const existingProject = await projectModel.findOne({ name: name });
  if (existingProject) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The copmany already exists" }] });
  }
   */

  //Check Users Exist
 /*  const ownerUser = await UserModel.findById(owner._id);
  if (!ownerUser) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner user does not exist" }] });
  }
 */
  //Check Owner already has THIS project
 /*  const existingProject = await ProjectModel.findOne({ owner: owner._id , name: name });
  if (existingProject) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a project by this name" }] });
  }
   */
  const newInspectionForm = new InspectionFormModel({
    scheduled_date,
    type,
    status,
    items,
    project,
    company,
    created_at,
    updated_at,
  });

  newInspectionForm.save();
  const sentData = {
    data: {
      type: "inspectionForms",
      id: newInspectionForm.id,
      attributes: {
        ...newInspectionForm._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editInspectionFormRoute = async (req, res) => {
  const inspectionFormId = req.params.id;
  const {   scheduled_date,
    type,
    status,
    items,
    project,
    company,
    created_at,
    updated_at,  } = req.body.data.attributes;

  const foundInspectionForm = await InspectionFormModel.findById(inspectionFormId);
  if (!foundInspectionForm) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No inspection form was found" }] });
  }
  /* if(!eq(foundProject.owner._id, req.user._id)) {
    return res
    .status(401)
    .json({ errors: [{ detail: "Only owners can update the project" }] });
  }
 */
 
 /*  const existingCopmaniesWithName = await ProjectModel.find({ name: name, _id: { $ne: projectId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a project with this name" }],
    });
  }
  */

  //const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  
  const updatedInspectionForm = await InspectionFormModel.updateOne(
    { _id: inspectionFormId },
    {
    scheduled_date,
    type,
    status,
    items,
    project,
    company,
    created_at,
    updated_at,
    });

  const sentData = {
    data: {
      type: "inspectionForms",
      id: inspectionFormId,
      attributes: {
        ...updatedInspectionForm._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteInspectionFormRoute = async (req, res) => {
  const toDeleteInspectionForm = await InspectionFormModel.findOne({ _id: req.params.id});

  if (!toDeleteInspectionForm) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection form does not exist" }] });
  }

  try {
    await InspectionFormModel.deleteOne({_id: toDeleteInspectionForm._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};
