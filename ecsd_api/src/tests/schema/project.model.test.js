
import { describe, test, expect } from "@jest/globals";
import { connectDB, dropDB, dropCollections } from "../db.js";
import dotenv from "dotenv"
import { ProjectModel } from "../../schemas/project.schema.js";
//import dummy from "mongoose-dummy";


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

describe("Project Model", () => {
    it("should create a project successfully", async () => {

   /*  const newProject = ProjectModel;
 
    const randomObject = dummy(newProject, {
        ignore: ignoredFields,
        returnDate: true
    })
    console.log(randomObject); */

      //const newCompany = await CompanyModel(testCompany);
      //await newCompany.save();
      //expect(newCompany._id).toBeDefined();
      /* expect(newCompany.name).toBe(CreateCompany.name);
      expect(newCompany.status).toBe(CreateCompany.status); */
    });
  });

