import bcrypt from "bcrypt";
import { describe, test, expect } from "@jest/globals";
import { connectDB, dropDB, dropCollections } from "../db.js"
import {reqaddCompany , requpdateCompany} from "../data/service.test.data.js"
import app from "../../app.js"
import request from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

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



const token = "{YOUR TOKEN>}" 



describe("Base Test", () => {
    test("should test this suite is active", async () => {
        expect(true).toBe(true);
    });
});


describe("Root Test", () => {
    test("The app is responding", async () => {
        return request(app)
        .get("/")
        .expect(200)    
    });
});

describe("reg Test", () => {
    test("register a user", async () => {
        return request(app)
        .post("/register")
        .expect(401);    
    });
});

describe('User Routes Test', () => {
      test('200 Success register - should create new User', async () => {
 
        const salt  = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash("secret", salt);

        const testUser = {
            type: "user", 
            first_name: "first", 
            last_name: "last", 
            email: "admin@jsonapi.com", 
            password: hashPassword
        };

        const requestData = {
            data: {
                type: "users",
                attributes: {
                    ...testUser
                },
            },
        };

        return request(app)
          .post('/register')
          //.send(JSON.stringify(requestData))
          .send(requestData)
          .then((response) => {
          const { body, status } = response;
          expect(status).toBe(200)
          expect(body).toHaveProperty("token_type", "Bearer");
          expect(body).toHaveProperty("expires_in", "24h");
          expect(body).toHaveProperty("access_token", expect.any(String))
          expect(body).toHaveProperty("refresh_token", expect.any(String))
          });                
        });
    });

/* 
    describe('POST /login - user login', () => {
      test('200 Success login - should return access_token', (done) => {
        request(app)
          .post('/login')
          .send(userData)
          .then((response) => {
            const { body, status } = response;
            expect(status).toBe(200);
            expect(body).toHaveProperty('access_token', expect.any(String));
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
      // Add more tests for login errors
    });
  });
 */
