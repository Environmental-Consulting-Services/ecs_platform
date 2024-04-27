import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "../../mongoose/index.js";

import { UserModel } from "../../schemas/user.schema.js";
import { CompanyModel } from "../../schemas/company.schema.js";
import { AddressModel } from "../../schemas/address.schema.js";
import { makeString } from "../../utils/StringUtils.js";

import dotenv from 'dotenv';
dotenv.config();

async function test() {
  //connect do db
  dbConnect();

  // crypt default password
  
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(makeString(8), salt);
  
  const testUser = new UserModel({
    //_id: mongoose.Types.ObjectId(1),
    first_name: "TestUserFirst",
    last_name: "TestUserLast",
    type: "user",
    email: "testuser@test.com",
    phone: "123456789",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
  });

  const testPerson = new UserModel({
    //_id: mongoose.Types.ObjectId(2),
    first_name: "TestPersonFirst",
    last_name: "TestPersonLast",
    type: "person",
    email: "testperson@test.com",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/creator.jpg`,
  });
  
  testUser.save();
  testPerson.save();

  const testCompany = new CompanyModel({
    //_id: mongoose.Types.ObjectId(3),
    name: "TestCompany",
    status: "active" ,
    address: new AddressModel({
      street_one: "123 Test St.",
      street_two: "test suite",
      city: "Denver",
      state: "CO",
      zip_code: "80202",
    }),
    owner: testUser,
    primary_contact:testPerson,
    created_at: new Date(),
    updated_at: new Date(), 
  });

  testCompany.people.push(testUser);
  await testCompany.save();
  console.log("CompanyModel Tested");
}

test().then(() => {
  mongoose.connection.close();
});


export { test };