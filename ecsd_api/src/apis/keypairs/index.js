import { KeyPairModel } from "./schema/keyPairs.schema";
import { AddressModel } from "../schemas/address.schema";
import { UserModel } from "../users/schema/user.schema";
import eq from "lodash";
import { PersonModel } from "../person/schema/person.schema";
import { ObjectId } from "mongodb";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import { ProjectModel } from "../projects/schema/project.schema";
>>>>>>> Stashed changes
=======
import { ProjectModel } from "../projects/schema/project.schema";
>>>>>>> Stashed changes

export const getKeyPairRoute = async (req, res) => {
    const key = req.params.key;
  
    let fieldsKeyPair;
    if (req.query.fields) {
      if (req.query.fields.keypairs) {
        fieldsKeyPair = req.query.fields.projects.split(",");
      }
    }
  
    const foundKeyPair = await KeyPairModel.findOne({key: key}).select(fieldsKeyPair);
    if (!foundKeyPair) {
      return res
        .status(400)
        .send({ errors: [{ detail: "The key pair can not be found" }] });
    }
  
    const sentData = {
      data: {
        type: "keypairs",
        id: foundKeyPair.key,
        attributes: {
          ...foundKeyPair._doc,
        },
      },
    };
    return res.status(200).send(sentData);
  };

  export const getKeyPairsRoute = async (req, res) => {
    const projectId = req.params.project;
    let keysObjectArray = [];
    let jsonArrayKeys = {};
  
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  let filters = {};
=======
  let filters = {projectId};
>>>>>>> Stashed changes
=======
  let filters = {projectId};
>>>>>>> Stashed changes
  if (req.query.filter) {
    filters = req.query.filter;
  }

  // sorting
  let sortValue;
  if (req.query.sort) {
    sortValue = req.query.sort;
  }

  let fieldsKeyPair;
    if (req.query.fields) {
      if (req.query.fields.keypairs) {
        fieldsKeyPair = req.query.fields.keypairs.split(",");
      }
    }

    const allKeys = await KeyPairModel
    .find(filters)
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    .select(fieldsProject)
=======
    .select(fieldsKeyPair)
>>>>>>> Stashed changes
=======
    .select(fieldsKeyPair)
>>>>>>> Stashed changes
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);
  
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    keysObjectArray = allProjects.map((element) => {
=======
    keysObjectArray = allKeys.map((element) => {
>>>>>>> Stashed changes
=======
    keysObjectArray = allKeys.map((element) => {
>>>>>>> Stashed changes
      let jsonObj = {
        type: "keypairs",
        id: element.id,
        attributes: {
          ...element._doc,
        },
      };
      return (jsonArrayKeys = { ...jsonArrayKeys, ...jsonObj });
    });
  
    const sentData = { data: [...keysObjectArray] };
    return res.status(200).send(sentData);
  };

  export const createKeyRoute = async(req, res) => {
    const {
      key,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      value
=======
      value,
      projectId
>>>>>>> Stashed changes
=======
      value,
      projectId
>>>>>>> Stashed changes
    } = req.body.data.attributes;

    if (!key) {
      return res
      .status(400)
      .send({ errors: [{ detail: "The key is required"}]});
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

  const existingKey = await KeyPairModel.findOne({ key: key });
=======
=======
>>>>>>> Stashed changes
    //

  const existingKey = await KeyPairModel.findOne({ key: key }); 
  if (existingKey) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The Key already exists" }] });
  };

  // Change for project
  const existingProject = await ProjectModel.findOne({ _id: projectId }); 
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  if (existingKey) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The Key already exists" }] });
  };

  const newKey = new KeyPairModel({
    key: key,
    value: value,
    dateCreated: Date.now(),
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    owner: {_id: owner.id}
=======
    owner: {_id: req.user._id},
    project: existingProject // {_id: req.projectId} 
>>>>>>> Stashed changes
=======
    owner: {_id: req.user._id},
    project: existingProject // {_id: req.projectId} 
>>>>>>> Stashed changes
  });
  newKey.save();
  const sentData = {
    data: {
      type: "keypairs",
      id: newKey.key,
      attributes: {
        ...newKey._doc,
      },
    },
  };
  return res.status(201).send(sentData);
};
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes

export const editKeyRoute = async(req, res) => {
  const key = req.params.key;
  const {value} = req.body.data.attributes;

  try {
    const foundKey = await KeyPairModel.findOne({ key: key });
    if (!foundKey) {
      return res
        .status(400)
        .json({ errors: [{ detail: "No copmany was found" }] });
    }

    if (value != null && value != "")
      {
        foundKey.value = value;
      }
      foundKey.dateCreated = Date.now();
    const updatedKey = await foundKey.save();

    const sentData = {
      data: {
        type: "keypairs",
        id: foundKey.key,
        attributes: {
          ...updatedKey._doc
        },
      },
    };
    return res.status(200).send(sentData);

  } catch (err) {
    console.error(err);
    return res.status(500).send({ errors: [{ detail: "Internal Server Error" }] });
  } 
};

export const deleteKeyRoute = async(req,res) => {
  const keyToDelete = req.params.key;
  const toDeleteKey = await KeyPairModel.findOne({key: keyToDelete });
  if (!toDeleteKey || String(toDeleteKey.owner._id) != String(req.user._id)) {
    return res
    .status(400)
    .send({errors: [{detial: "The key does not exist, or you are not allowed"}]});
  }

  try {
    await KeyPairModel.deleteOne({key: toDeleteKey.key});
    res.sendStatus(204);
  }
  catch (err) {
    console.error(err);
  }
  };

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
