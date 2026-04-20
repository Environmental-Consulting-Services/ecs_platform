import bcrypt from "bcrypt";
import { permissionModel } from "../permissions/schema/permission.schema";
import { roleModel } from "../roles/schema/role.schema";
import { UserModel } from "./schema/user.schema";

//dotenv.config();

const validateEmail = (inputText) => {
  var mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (inputText.match(mailformat)) {
    return true;
  } else {
    return false;
  }
};

export const getUsersRoute = async (req, res) => {
  let usersObjectArray = [];
  let rolesObjectArray = [];
  let permissionsObjectArray = [];
  let options = [];

  if (req.query.include) {
    options = req.query.include.split(",");
  }

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

  //sorting
  let sortValue;
  if (req.query.sort) {
    sortValue = req.query.sort;
  }

  // choose fields
  let fieldsUser;
  let fieldsRole;
  let fieldsPerms;
  if (req.query.fields) {
    if (req.query.fields.users) {
      fieldsUser = req.query.fields.users.split(",");
    }
    if (req.query.fields.roles) {
      fieldsRole = req.query.fields.roles.split(",");
    }
    if (req.query.fields.permissions) {
      fieldsPerms = req.query.fields.permissions.split(",");
    }
  }

  const allUsers = await UserModel
    .find(filters)
    .populate("role")
    .select(fieldsUser)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  let jsonArrayUsers = {};
  usersObjectArray = await Promise.all(
    allUsers.map(async (element) => {
      const role = await roleModel.findOne({ _id: element.role });
      let relObj = {};
      if(role != null) {
        relObj = {
          roles: {
            data: [
              {
                type: "roles",
                id: role.id,
              },
            ],
          },
        };
      }
      let jsonObj = {
        type: "users",
        id: element.id,
        attributes: {
          ...element._doc,
        },
        relationships: relObj,
      };
      delete jsonObj.attributes.password;
      return (jsonArrayUsers = { ...jsonArrayUsers, ...jsonObj });
    })
  );

  if (options.length > 0) {
    if (options.find((el) => el == "roles")) {
      const allRoles = await roleModel.find().select(fieldsRole);
      let jsonArrayRoles = {};
      rolesObjectArray = allRoles.map((element) => {
        let jsonObj = {
          type: "roles",
          id: element.id,
          attributes: {
            ...element._doc,
          },
        };
        return (jsonArrayRoles = { ...jsonArrayRoles, ...jsonObj });
      });
    }
    if (options.find((el) => el == "roles.permissions")) {
      const allPermissions = await permissionModel.find().select(fieldsPerms);
      let jsonArrayRoles = {};
      permissionsObjectArray = allPermissions.map((element) => {
        let jsonObj = {
          type: "permissions",
          id: element.id,
          attributes: {
            ...element.doc,
          },
        };
        return (jsonArrayRoles = { ...jsonArrayRoles, ...jsonObj });
      });
    }
  }

  const sentData = {
    data: [...usersObjectArray],
    included: [...rolesObjectArray, ...permissionsObjectArray],
  };
  res.status(200).send(sentData);
};

export const getUserRoute = async (req, res) => {
  let includedDataRoles;
  let includedDataPermissions = [];
  let options = [];

  const userId = req.params.id;
  if (req.query.include) {
    options = req.query.include.split(",");
  }

  let fieldsUser;
  let fieldsRole;
  let fieldsPerms;
  let fieldObj = {};
  if (req.query.fields) {
    if (req.query.fields.users) {
      fieldsUser = req.query.fields.users.split(",");
    }
    if (req.query.fields.roles) {
      fieldsRole = req.query.fields.roles.split(",");
    }
    if (req.query.fields.permissions) {
      fieldsPerms = req.query.fields.permissions.split(",");
    }
  }

  const user = await UserModel
    .findById(userId)
    .populate("role")
    .select(fieldsUser);

  if (!user) {
    return res.status(400).json({ errors: [{ detail: "The user does not exist" }] });
  } 

    const role = await roleModel
      .findOne({ _id: user.role })
      .populate("permissions")
      .select(fieldsRole);
    
   
    let userPermissions = await permissionModel
    .find({ _id: { $in: role["permissions"] } })
    .select(fieldsPerms);
    
    if (fieldsRole) {
      fieldObj = {
        links: {
          self: `${process.env.APP_URL_API}/${role.id}/relationships/roles`,
          related: `${process.env.APP_URL_API}/${role.id}/roles`,
        },
      };
    }


  let sentData = {
    type: "users",
    id: userId,
    attributes: {
      ...user._doc,
    },
  };
  delete sentData.attributes.password;

  if (options.length > 0) {
    if (options.find((el) => el == "roles" &&  typeof role !== 'undefined')) {
      sentData = {
        ...sentData,
        relationships: {
          roles: {
            data: [
              {
                type: "roles",
                id: role.id,
              },
            ],
          },
        },
      };
      includedDataRoles = {
        type: "roles",
        id: role.id,
        attributes: {
          ...role._doc,
        },
      };
    }
    if (options.find((el) => el == "roles.permissions") && typeof userPermissions !== 'undefined') {
      let jsonArray = {};
      includedDataPermissions = userPermissions.map((element) => {
        let jsonObj = {
          type: "permissions",
          id: element.id,
          attributes: {
            name: element.name,
            ...element._doc,
          },
        };
        return (jsonArray = { ...jsonArray, ...jsonObj });
      });
    }
  }
  const finalData = {
    data: { ...sentData },
    relationships: { ...fieldObj },
    included: [{ ...includedDataRoles }, ...includedDataPermissions],
  };
  return res.status(200).send(finalData);
};

export const createUserRoute = async (req, res) => {
  
  const { type, first_name, last_name, email, profile_image, password, phone, address, password_confirmation } =
    req.body.data.attributes;
  const roleId = req.body.data.relationships.roles.data[0].id;
  if (!type) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The type field is required" }] });
  }
  if (!first_name) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The first_name field is required" }] });
  }
  if (!last_name) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The last_name field is required" }] });
  }
  if (!email) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The email field is required" }] });
  }
  if (!roleId) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The role field is required" }] });
  }
  if (!password) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The password field is required" }] });
  }
  if (validateEmail(email) === false) {
    return res
      .status(400)
      .json({ errors: [{ detail: "The email is not valid" }] });
  }

  let foundUser = await UserModel.findOne({ email: email });
  if (foundUser) {
    return res
      .status(400)
      .json({ message: "The email has already been taken" });
  }

  // check password to exist and be at least 8 characters long
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
  }
  if (password != password_confirmation) {
    return res
      .status(400)
      .json({ message: "Password and password confirmation must match" });
  }

  // hash password to save in db
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const role = await roleModel.findOne({ _id: roleId });
  const normalizedProfileImage = profile_image
    ? `${process.env.APP_URL_API}${profile_image}`
    : null;

  const newUser = new UserModel({
    first_name: first_name,
    last_name: last_name,
    phone: phone,
    address: address,
    type: type,
    email: email,
    password: hashPassword,
    profile_image: normalizedProfileImage,
    created_at: Date.now(),
    updated_at: Date.now(),
    role: roleId,
  });
  await newUser.save();

  await roleModel.updateOne(
    { _id: role._id },
    { users: [...role.users, newUser._id] }
  );

  const setData = {
    data: {
      type: "users",
      id: newUser.id,
      attributes: {
        ...newUser._doc,
      },
      relationships: {
        roles: {
          links: {
            self: `${process.env.APP_URL_API}/${roleId}/relationships/roles`,
            related: `${process.env.APP_URL_API}/${roleId}/roles`,
          },
        },
      },
    },
  };
  return res.status(201).send(setData);
};

export const editUserRoute = async (req, res) => {
  const foundUser = await UserModel.findById(req.params.id);

  const { first_name, last_name, type, phone, address, email, profile_image } = req.body.data.attributes;
  let roleId;
  let oldRole = await roleModel.findOne({ _id: foundUser.role });
  if (req.body.data.relationships) {
    roleId = await req.body.data.relationships.roles.data[0].id;
  } else {
    roleId = oldRole._id;
  }

  if (!foundUser) {
    return res.status(400).json({ errors: [{ detail: "Wrong route" }] });
  }

  let foundUserWithEmail = await UserModel.findOne({ email: email });
  if (foundUserWithEmail && foundUserWithEmail.id !== foundUser.id) {
    return res
      .status(400)
      .json({ errors: [{detail: "The email has already been taken"}] });
  }

  const updatedUser = await UserModel.updateOne(
    { _id: foundUser._id },
    { first_name: first_name, last_name: last_name, type: type, phone: phone, address: address, email: email, profile_image: profile_image, role: roleId }
  );

  if (oldRole._id != roleId) {
    // the role was changed
    // remove the user from the oldRole
    const results = oldRole.users.filter(
      (value) => !value.equals(foundUser._id)
    );
    await roleModel.updateOne({ _id: oldRole._id }, { users: [...results] });
    // update new role with users
    const newRole = await roleModel.findById(roleId);
    await roleModel.updateOne(
      { _id: roleId },
      { users: [...newRole.users, foundUser._id] }
    );
  }

  const sentData = {
    data: "users",
    id: foundUser.id,
    attributes: {
      ...updatedUser._doc,
    },
  };
  return res.status(200).send(sentData);
};

export const deleteUserRoute = async (req, res) => {
  // here should be verification if demo and other stuff?
  const toDeleteUser = await UserModel.findById(req.params.id);

  if (!toDeleteUser) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The user does not exist" }] });
  } else {
    try {
      const role = await roleModel.findById(toDeleteUser.role);
      if(role) {
        const results = role.users.filter(
          (value) => !value.equals(toDeleteUser._id)
        );
        await roleModel.updateOne({ _id: role._id }, { users: [...results] });
      }
      await UserModel.deleteOne({ _id: toDeleteUser._id });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
    }
  }
};
