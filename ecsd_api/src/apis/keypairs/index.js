import { KeyPairModel } from "./schema/keyPairs.schema";
import { AddressModel } from "../schemas/address.schema";
import { UserModel } from "../users/schema/user.schema";
import eq from "lodash";
import { PersonModel } from "../person/schema/person.schema";
import { ObjectId } from "mongodb";

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
  let filters = {};
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
    .select(fieldsProject)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);
  
    keysObjectArray = allProjects.map((element) => {
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
      value
    } = req.body.data.attributes;

    if (!key) {
      return res
      .status(400)
      .send({ errors: [{ detail: "The key is required"}]});
    }

  const existingKey = await KeyPairModel.findOne({ key: key });
  if (existingKey) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The Key already exists" }] });
  };

  const newKey = new KeyPairModel({
    key: key,
    value: value,
    dateCreated: Date.now(),
    owner: {_id: owner.id}
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
