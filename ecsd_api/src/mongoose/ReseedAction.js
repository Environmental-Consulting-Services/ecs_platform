import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "./index.js";

import { UserModel } from "../apis/users/schema/user.schema";
import { roleModel } from "../apis/roles/schema/role.schema";
import { permissionModel } from "../apis/permissions/schema/permission.schema";

import dotenv from "dotenv";
dotenv.config();

const ReseedAction = () => {
  async function clear() {
    dbConnect();
    await roleModel.deleteMany({});
    await permissionModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("DB cleared");
  }

  async function seedDB() {
    // first clear DB
    await clear();

    // crypt default password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("secret", salt);
    const admin = new UserModel({
      _id: mongoose.Types.ObjectId(1),
      first_name: "Admin",
      last_name: "User",
      type: "user",
      email: "admin@jsonapi.com",
      password: hashPassword,
      created_at: new Date(),
      profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
    });
    const creator = new UserModel({
      _id: mongoose.Types.ObjectId(2),
      first_name: "Creator",
      last_name: "User",
      type: "user",
      email: "creator@jsonapi.com",
      password: hashPassword,
      created_at: new Date(),
      profile_image: `${process.env.APP_URL_API}/public/images/creator.jpg`,
    });
    const member = new UserModel({
      _id: mongoose.Types.ObjectId(3),
      first_name: "Member",
      last_name: "User",
      type: "user",
      email: "member@jsonapi.com",
      password: hashPassword,
      created_at: new Date(),
      profile_image: `${process.env.APP_URL_API}/public/images/member.jpg`,
    });

    // user permission
    const perm1 = await permissionModel({
      created_at: new Date(),
      name: "view users",
    });
    const perm2 = await permissionModel({
      created_at: new Date(),
      name: "create users",
    });
    const perm3 = await permissionModel({
      created_at: new Date(),
      name: "edit users",
    });
    const perm4 = await permissionModel({
      created_at: new Date(),
      name: "delete users",
    });
    // role permission
    const perm5 = await permissionModel({
      created_at: new Date(),
      name: "view roles",
    });
    const perm6 = await permissionModel({
      created_at: new Date(),
      name: "create roles",
    });
    const perm7 = await permissionModel({
      created_at: new Date(),
      name: "edit roles",
    });
    const perm8 = await permissionModel({
      created_at: new Date(),
      name: "delete roles",
    });
    // permission permissions
    const perm9 = await permissionModel({
      created_at: new Date(),
      name: "view permissions",
    });
    // tag permissions
    const perm10 = await permissionModel({
      created_at: new Date(),
      name: "view tags",
    });
    const perm11 = await permissionModel({
      created_at: new Date(),
      name: "create tags",
    });
    const perm12 = await permissionModel({
      created_at: new Date(),
      name: "edit tags",
    });
    const perm13 = await permissionModel({
      created_at: new Date(),
      name: "delete tags",
    });
    // category permissions
    const perm14 = await permissionModel({
      created_at: new Date(),
      name: "view categories",
    });
    const perm15 = await permissionModel({
      created_at: new Date(),
      name: "create categories",
    });
    const perm16 = await permissionModel({
      created_at: new Date(),
      name: "edit categories",
    });
    const perm17 = await permissionModel({
      created_at: new Date(),
      name: "delete categories",
    });
    // items permissions
    const perm18 = await permissionModel({
      created_at: new Date(),
      name: "view items",
    });
    const perm19 = await permissionModel({
      created_at: new Date(),
      name: "create items",
    });
    const perm20 = await permissionModel({
      created_at: new Date(),
      name: "edit items",
    });
    const perm21 = await permissionModel({
      created_at: new Date(),
      name: "delete items",
    });
    await permissionModel.insertMany([
      perm1,
      perm2,
      perm3,
      perm4,
      perm5,
      perm6,
      perm7,
      perm8,
      perm9,
      perm10,
      perm11,
      perm12,
      perm13,
      perm14,
      perm15,
      perm16,
      perm17,
      perm18,
      perm19,
      perm20,
      perm21,
    ]);

    const roleAdmin = new roleModel({
      _id: mongoose.Types.ObjectId(1),
      name: "admin",
      created_at: new Date(),
      users: [admin],
      permissions: [
        perm1._id,
        perm2._id,
        perm3._id,
        perm4._id,
        perm5._id,
        perm6._id,
        perm7._id,
        perm8._id,
        perm9._id,
        perm10._id,
        perm11._id,
        perm12._id,
        perm13._id,
        perm14._id,
        perm15._id,
        perm16._id,
        perm17._id,
        perm18._id,
        perm19._id,
        perm20._id,
        perm21._id,
      ],
    });
    await roleAdmin.save();
    admin.role = roleAdmin._id;
    await admin.save();
    const roleCreator = new roleModel({
      _id: mongoose.Types.ObjectId(2),
      name: "creator",
      created_at: new Date(),
      users: [creator],
      permissions: [
        perm10._id,
        perm11._id,
        perm12._id,
        perm13._id,
        perm14._id,
        perm15._id,
        perm16._id,
        perm17._id,
        perm18._id,
        perm19._id,
        perm20._id,
        perm21._id,
      ],
    });
    await roleCreator.save();
    creator.role = roleCreator._id;
    await creator.save();
    const roleMember = new roleModel({
      _id: mongoose.Types.ObjectId(3),
      name: "member",
      created_at: new Date(),
      users: [member],
      permissions: [perm10._id, perm11._id, perm15._id, perm18._id],
    });
    await roleMember.save();
    member.role = roleMember._id;
    await member.save();

    console.log("DB seeded");
  }

  seedDB();
};

export default ReseedAction;
