import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "./index.js";
import { UserModel } from "../apis/users/schema/user.schema.js";
import { permissionModel } from "../apis/permissions/schema/permission.schema.js";
import { roleModel } from "../apis/roles/schema/role.schema.js";

import dotenv from 'dotenv';
import { CompanyModel } from "../apis/companies/schema/company.schema.js";
import { ProjectModel } from "../apis/projects/schema/project.schema.js";
import { InspectionModel } from "../apis/inspections/schema/inspection.schema.js";
import { ActionItemModel } from "../apis/actionitems/schema/actionitem.schema.js";
import { PersonModel } from "../apis/person/schema/person.schema.js";
dotenv.config();


async function seedDB() {
  //connect do db
  dbConnect();

  // crypt default password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash("secret", salt);
  const admin = new UserModel({
    _id: mongoose.Types.ObjectId(1),
    first_name: "Admin",
    last_name: "User",
    type: "user",
    email: "admin@ecscompliance.com",
    phone: "123456789",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
  });
  const creator = new UserModel({
    _id: mongoose.Types.ObjectId(2),
    first_name: "Creator",
    last_name: "User",
    type: "user",
    email: "creator@ecscompliance.com",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/creator.jpg`,
  });
  const member = new UserModel({
    _id: mongoose.Types.ObjectId(3),
    first_name: "Member",
    last_name: "User",
    type: "user",
    email: "member@ecscompliance.com",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/member.jpg`,
  });

  // user permission
  const perm1 = await permissionModel({ created_at: new Date(), name: "view users" });
  const perm2 = await permissionModel({ created_at: new Date(), name: "create users" });
  const perm3 = await permissionModel({ created_at: new Date(), name: "edit users" });
  const perm4 = await permissionModel({ created_at: new Date(), name: "delete users" });
  // role permission
  const perm5 = await permissionModel({ created_at: new Date(), name: "view roles" });
  const perm6 = await permissionModel({ created_at: new Date(), name: "create roles" });
  const perm7 = await permissionModel({ created_at: new Date(), name: "edit roles" });
  const perm8 = await permissionModel({ created_at: new Date(), name: "delete roles" });
  // permission permissions
  const perm9 = await permissionModel({ created_at: new Date(), name: "view permissions" });
   // company permissions
   const perm22 = await permissionModel({ created_at: new Date(), name: "view companies" });
   const perm23 = await permissionModel({ created_at: new Date(), name: "create companies" });
   const perm24 = await permissionModel({ created_at: new Date(), name: "edit companies" });
   const perm25 = await permissionModel({ created_at: new Date(), name: "delete companies" });


   // project permissions
   const perm26 = await permissionModel({ created_at: new Date(), name: "view projects" });
   const perm27 = await permissionModel({ created_at: new Date(), name: "create projects" });
   const perm28 = await permissionModel({ created_at: new Date(), name: "edit projects" });
   const perm29 = await permissionModel({ created_at: new Date(), name: "delete projects" });



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
    perm22,
    perm23,
    perm24,
    perm25,
    perm26,
    perm27,
    perm28,
    perm29,
  ]);

  const roleAdmin = new roleModel({ _id:  mongoose.Types.ObjectId(1), name: "admin", created_at: new Date(), users: [admin], permissions: [perm1._id, perm2._id, perm3._id, perm4._id, perm5._id, perm6._id, perm7._id, perm8._id, 
    ,perm22._id, perm23._id, perm24._id, perm25._id,perm26._id, perm27._id, perm28._id, perm29._id] });
  await roleAdmin.save();
  admin.role = roleAdmin._id;
  await admin.save();
  const roleCreator = new roleModel({  _id: mongoose.Types.ObjectId(2), name: "creator", created_at: new Date(), users: [creator], permissions: [perm22._id, perm23._id, perm24._id, perm25._id,perm26._id, perm27._id, perm28._id, perm29._id] });
  await roleCreator.save();
  creator.role = roleCreator._id;
  await creator.save();
  const roleMember = new roleModel({  _id:  mongoose.Types.ObjectId(3),  name: "member", created_at: new Date(), users: [member], permissions: [] });
  await roleMember.save();
  member.role = roleMember._id;
  await member.save();

    const person1 = new PersonModel({first_name: "Person 1", last_name: "LastName1",  email: "scott@test.com", phone: "123456789"});
    person1.save();
    const person2 = new PersonModel({first_name: "Person 2", last_name: "LastName2",  email: "scott@test.com", phone: "123456789"});
    person2.save();
    const person3 = new PersonModel({first_name: "Person 3", last_name: "LastName3",  email: "scott@test.com", phone: "123456789"});
    person3.save();
   

  const company = new CompanyModel({ _id: mongoose.Types.ObjectId(1), name: "Test Company 1", status: "active", owner: admin,  created_at: new Date() });
  const project = new ProjectModel({ _id: mongoose.Types.ObjectId(2), name: "Project 1", status: "active", company: company, owner: admin, created_at: new Date() });
  const inspection = new InspectionModel({ _id: mongoose.Types.ObjectId(3), name: "Inspection 1", project: project, created_at: new Date() });
  const actionItem = new  ActionItemModel({ _id: mongoose.Types.ObjectId(4), name: "Action Item 1", inspection: inspection, project: project, created_at: new Date() });

   const company2 = new CompanyModel({ _id: mongoose.Types.ObjectId(1), name: "Test Company 2", status: "active", owner: admin,  created_at: new Date() });
   const project2 = new ProjectModel({ _id: mongoose.Types.ObjectId(2), name: "Project 2", status: "active", company: company2, owner: admin, created_at: new Date() });
   const inspection2 = new InspectionModel({ _id: mongoose.Types.ObjectId(3), name: "Inspection 1", project: project2, created_at: new Date() });
   const actionItem2 = new  ActionItemModel({ _id: mongoose.Types.ObjectId(4), name: "Action Item 1", inspection: inspection2, project: project2, created_at: new Date() });
 
    project.people.push({"role":"member", "member": person1});
    project.people.push({"role":"member", "member": person3});

    project2.people.push({"role":"member", "member": person1});
    project2.people.push({"role":"member", "member": person2}); 


   await company.save();
   await project.save();
   await inspection.save();
   await actionItem.save();



    await company2.save();
    await project2.save();
    await inspection2.save();
    await actionItem2.save();
 
 
 






  console.log("DB seeded");
}

seedDB().then(() => {
  mongoose.connection.close();
});
