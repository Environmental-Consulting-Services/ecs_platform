import { ObjectId } from "mongodb";
import { CompanyModel } from "../companies/schema/company.schema";
import { PersonModel } from "../person/schema/person.schema";
import { AddressModel } from "../schemas/address.schema";
import { UserModel } from "../users/schema/user.schema";
import { ProjectModel } from "./schema/project.schema";

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
    if (req.query.fields.projects) {
      fieldsProject = req.query.fields.projects.split(",");
    }
  }

  filters = {
    ...filters,
    $or: [
      {
        "people.member": req.user._id,
      },
      {
        owner: req.user._id,
      },
    ],
  };

  const allProjects = await ProjectModel.find(filters)
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

  const foundProject = await ProjectModel.findOne({ _id: projectId }).select(
    fieldsProject,
  );
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
  try {
    const { name, status, address, owner, company } = req.body.data.attributes;
    const ownerId = owner?._id || owner;
    const companyId = company?._id || company;

    if (!name) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The name is required" }] });
    }

    if (!ownerId) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The owner is required" }] });
    }

    if (!companyId) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The company is required" }] });
    }

    const ownerUser = await UserModel.findById(ownerId);
    if (!ownerUser) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The owner user does not exist" }] });
    }

    const foundCompany = await CompanyModel.findById(companyId);
    if (!foundCompany) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The company does not exist" }] });
    }

    const existingProject = await ProjectModel.findOne({
      owner: ownerId,
      name: name,
    });
    if (existingProject) {
      return res
        .status(400)
        .send({
          errors: [{ detail: "The owner already has a project by this name" }],
        });
    }

    const projectAddress = address || {};
    const newProject = new ProjectModel({
      name: name,
      status: status || "inactive",
      address: new AddressModel({
        street_one: projectAddress.street_one,
        street_two: projectAddress.street_two,
        city: projectAddress.city,
        state: projectAddress.state,
        zip_code: projectAddress.zip_code,
      }),
      owner: ownerId,
      company: companyId,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    const savedProject = await newProject.save();
    const sentData = {
      data: {
        type: "projects",
        id: savedProject.id,
        attributes: {
          ...savedProject._doc,
        },
      },
    };
    return res.status(201).send(sentData);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ errors: [{ detail: "Internal Server Error" }] });
  }
};

export const editProjectRoute = async (req, res) => {
  const projectId = req.params.id;
  const { name, status, address, owner, primary_contact, people, site_maps } =
    req.body.data.attributes;

  try {
    const foundProject = await ProjectModel.findById(projectId);
    if (!foundProject) {
      return res
        .status(400)
        .json({ errors: [{ detail: "No copmany was found" }] });
    }

    const newPrimaryContact =
      primary_contact !== null && primary_contact !== ""
        ? UserModel({ id: primary_contact })
        : null;

    if (name != null && name != "") {
      foundProject.name = name;
    }
    if (status != null && status != "") {
      foundProject.status = status;
    }
    if (address != null) {
      foundProject.address = new AddressModel({
        street_one: address.street_one,
        street_two: address.street_two,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
      });
    }

    if (owner != null && owner._id != null && owner._id != "") {
      foundProject.owner = { _id: owner };
    }
    if (owner != null && owner._id != null && owner._id != "") {
      foundProject.primary_contact = newPrimaryContact;
    }
    if (people != null) {
      foundProject.people = people.map((person) => person._id);
    }
    if (site_maps != null) {
      foundProject.site_maps = {
        update_date: Date.now(),
        site_map: site_maps[0].site_map.id,
      };
    }

    foundProject.updated_at = Date.now();
    const updatedProject = await foundProject.save();

    const sentData = {
      data: {
        type: "projects",
        id: projectId,
        attributes: {
          ...updatedProject._doc,
        },
      },
    };

    return res.status(200).send(sentData);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ errors: [{ detail: "Internal Server Error" }] });
  }
};

export const editProjectSiteMapRoute = async (req, res) => {
  const projectId = req.params.id;
  const id = req.body.data.attributes.site_maps[0].site_map;

  const foundProject = await ProjectModel.findById(projectId);
  if (!foundProject) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No company was found" }] });
  }

  foundProject.site_maps.unshift({
    update_date: Date.now(),
    site_map: ObjectId(id),
  });
  const updatedProject = await foundProject.save();

  const sentData = {
    data: {
      type: "projects",
      id: projectId,
      attributes: {
        ...foundProject._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteProjectRoute = async (req, res) => {
  const toDeleteProject = await ProjectModel.findOne({ _id: req.params.id });

  if (
    !toDeleteProject ||
    String(toDeleteProject.owner._id) != String(req.user._id)
  ) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The project does not exist" }] });
  }

  try {
    await ProjectModel.deleteOne({ _id: toDeleteProject._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

export const getProjectPeopleRoute = async (req, res) => {
  const projectId = req.params.id;
  let personsObjectArray = [];
  let jsonArrayPersons = {};

  let fieldsProject;
  if (req.query.fields) {
    if (req.query.fields.projects) {
      fieldsProject = req.query.fields.projects.split(",");
    }
  }

  const foundProject = await ProjectModel.findOne({ _id: projectId });

  if (!foundProject) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The project can not be found" }] });
  }
  //console.log(foundProject)
  var listOfPeople = [];
  if (foundProject.people != null) {
    foundProject.people = foundProject.people.forEach((person) => {
      //(person);
      listOfPeople.push(person.member);
    });
  }
  //var obj_ids = listOfPoeple.map(function(id) { return ObjectId(id); });
  //(listOfPeople);
  var listOfPeopleDoc = await PersonModel.find({ _id: { $in: listOfPeople } });

  personsObjectArray = listOfPeopleDoc.map((element) => {
    let jsonObj = {
      type: "persons",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayPersons = { ...jsonArrayPersons, ...jsonObj });
  });

  const sentData = { data: [...personsObjectArray] };

  return res.status(200).send(sentData);
};
