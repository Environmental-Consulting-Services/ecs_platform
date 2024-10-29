
import { describe, test, expect } from "@jest/globals";
import { connectDB, dropDB, dropCollections } from "../db.js";
import {  CreateCompany, TestUser, MyData, UpdateCompany  } from "../data/company.test.data.js";
import {app} from "../../app.js"
import request from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { CompanyModel } from "../../schemas/company.schema.js";
import { UserModel } from "../../schemas/user.schema.js";
import bcrypt from "bcrypt";
import { makeString } from "../../utils/StringUtils.js";

//dotenv.config();

/* import userRoutes from './users';
import itemRoutes from './items';
import meRoutes from './me';
import authRoutes from './auth';
import roleRoutes from './roles';
import uploadRoutes from './uploads';
import companyRoutes from './companies';
import categoryRoutes from './categories';
import tagRoutes from './tags';
import permissionRoutes from './permissions';
import imageRoutes from './images';
 */

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

        const salt  = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(makeString(8), salt);

        const testUser = {
            first_name: "TestUserFirst",
            last_name: "TestUserLast",
            type: "user",
            email: "",
            phone: "123456789",
            password: hashPassword
        };

        const testPerson = {
            first_name: "TestPersonFirst",
            last_name: "TestPersonLast",
            type: "person",
            email: "",
            password: hashPassword
        };

        const testCompany = {
            name: "TestCompany",
            status: "active",
            address: {
                street_one: "123 Test St.",
                street_two: "test suite",
                city: "Denver",
                state: "CO",
                zip_code: "80202",
            },
            owner: new mongoose.mongo.ObjectId(),
            primary_contact: new mongoose.mongo.ObjectId(),
        };

      const newCompany = await CompanyModel(testCompany);
      await newCompany.save();
      expect(newCompany._id).toBeDefined();
      /* expect(newCompany.name).toBe(CreateCompany.name);
      expect(newCompany.status).toBe(CreateCompany.status); */
    });
  });

