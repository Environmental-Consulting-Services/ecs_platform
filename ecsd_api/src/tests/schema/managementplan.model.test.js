
import { describe, test, expect } from "@jest/globals";
import { connectDB, dropDB, dropCollections } from "../db.js";
//import {  CreateCompany, TestUser, MyData, UpdateCompany  } from "../data/company.test.data.js";
import {app} from "../../app.js"
import request from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { ManagementPlanModel } from "../../schemas/managementplan.schema.js";
import { UserModel } from "../../schemas/user.schema.js";
import bcrypt from "bcrypt";
import { makeString } from "../../utils/StringUtils.js";

const ignoredFields = ['_id','created_at', '__v', /detail.*_info/];


dotenv.config();

beforeAll(async () => {
await connectDB();
});

afterAll(async () => {
await dropDB();
});

afterEach(async () => {
await dropCollections();
});

describe("Company Model", () => {
    it("should create a company successfully", async () => {

    /* const newProject = ManagementPlanModel;
 
    const randomObject = dummy(newProject, {
        ignore: ignoredFields,
        returnDate: true
    }) */
    //console.log(randomObject);


      //const newCompany = await CompanyModel(testCompany);
      //await newCompany.save();
      //expect(newCompany._id).toBeDefined();
      /* expect(newCompany.name).toBe(CreateCompany.name);
      expect(newCompany.status).toBe(CreateCompany.status); */
    });
  });

