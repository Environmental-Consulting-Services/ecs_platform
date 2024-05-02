import { ProjectModel } from "../../schemas/project.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
import eq from "lodash";

export const getProjectsRoute = async (req, res) => {
  let projectsObjectArray = [];
  let jsonArrayProjects = {};

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
  let fieldsProject;
  if (req.query.fields) {
    if (req.query.fields.categories) {
      fieldsProject = req.query.fields.projects.split(",");
    }
  }

  const allProjects = await ProjectModel
    .find(filters)
    .select(fieldsProject)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  projectsObjectArray = allProjects.map((element) => {
    let jsonObj = {
      type: "projects",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayProjects = { ...jsonArrayProjects, ...jsonObj });
  });

  const sentData = { data: [...projectsObjectArray] };
  return res.status(200).send(sentData);
};


export const getProjectRoute = async (req, res) => {
  const projectId = req.params.id;

  let fieldsProject;
  if (req.query.fields) {
    if (req.query.fields.projects) {
      fieldsProject = req.query.fields.projects.split(",");
    }
  }

  const foundProject = await ProjectModel.findOne({ _id: projectId }).select(fieldsProject);
  if (!foundProject) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The project can not be found" }] });
  }

  const sentData = {
    data: {
      type: "projects",
      id: foundProject.id,
      attributes: {
        ...foundProject._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createProjectRoute = async (req, res) => {
  
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

  /* const existingProject = await projectModel.findOne({ name: name });
  if (existingProject) {
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

  //Check Owner already has THIS project
  const existingProject = await ProjectModel.findOne({ owner: owner._id , name: name });
  if (existingProject) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a project by this name" }] });
  }
  
  const newProject = new ProjectModel({
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
  newProject.save();
  const sentData = {
    data: {
      type: "projects",
      id: newProject.id,
      attributes: {
        ...newProject._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editProjectRoute = async (req, res) => {
  const projectId = req.params.id;
  const {  name, status, address, owner, primary_contact, people,  } = req.body.data.attributes;

  const foundProject = await ProjectModel.findById(projectId);
  if (!foundProject) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No copmany was found" }] });
  }
  /* 
  if(!eq(foundProject.owner._id, req.user._id)) {
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

  const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  const updatedProject = await ProjectModel.updateOne(
    { _id: projectId },
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
      type: "projects",
      id: projectId,
      attributes: {
        ...updatedProject._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteProjectRoute = async (req, res) => {
  const toDeleteProject = await ProjectModel.findOne({ _id: req.params.id});

  if (!toDeleteProject || String(toDeleteProject.owner._id) != String(req.user._id)) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The project does not exist" }] });
  }

  try {
    await ProjectModel.deleteOne({_id: toDeleteProject._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};
