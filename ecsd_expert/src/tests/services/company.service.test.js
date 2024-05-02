import bcrypt from "bcrypt";
import { describe, test, expect } from "@jest/globals";
import { connectDB, dropDB, dropCollections } from "../db.js"
import {reqaddCompany , requpdateCompany} from "../data/service.test.data.js"
import app from "../../app.js"
import request from "supertest"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const token = "{YOUR TOKEN}" 

beforeAll(async () => {
    await connectDB();

});

afterAll(async () => {
await dropDB();
});

afterEach(async () => {
await dropCollections();
});


function authenticate(){

    const salt  =  bcrypt.genSalt(10);
    const hashPassword =  bcrypt.hash("secret", salt);

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

    request(app)
      .post('/register')
      //.send(JSON.stringify(requestData))
      .send(requestData)
      .then((response) => {
        const { body, status } = response;
        if (status === 200) {
            token = body.token_type + ' ' + body.access_token;
        } else {
            console.log('Error: ', body);
        }
      });
}



describe("Base Test", () => {
    test("should test this suite is active", async () => {
        expect(true).toBe(true);
    });
});

describe("PUT /companies", () => {
    test("should return all companies", async () => {

        /* await mongoose.connection.collection('users').insertOne(testUser);

        const myData = {data: {
        type: "token",
        attributes: {   ...testUser  }},};

        return request(app)
            .post("/companies")
            // .expect('Content-Type', /json/)
            .expect(200) */
    });
});
 

/* 
describe("GET /companies", () => {
    test("should return all companies", async () => {
    return request(app)
            .get("/companies")
           // .expect('Content-Type', /json/)
            .expect(200)
    });
});
 */





//Create Product Test 
/* 
describe("POST //create", () => {
    test("should create a product", async () => {
        return request(app)
            .post("/api/product/create")
            .set('Authorization',  `Bearer ${token}`)
            .send(reqaddProduct)
            .expect(201)
            .then(({ body })=>{
                productId = body.data.productId
            })

    });
});
 */

/* describe("GET /companies", () => {
    test("should return all companies", async () => {
    return request(app)
            .get("/companies")
            .expect('Content-Type', /json/)
            .expect(200)
    });
});
 */


/* 
describe("GET /api/product/show/:id", () => {
    test('should return all products', async () => {
        return request(app)
            .get(`/api/product/show/${productId}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    });
})
 */

/* 
describe("PUT /api/product/update/:id", () => {
    test("should update a product", async () => {
        return request(app)
            .put(`/api/product/update/${productId}`)
            .set('Authorization',  `Bearer ${token}`)
            .send(requpdateProduct)
            .expect(201)
    });
});
 */


/* 
describe("Checking authorization middleware", () => {
    test("should create a product", async () => {
        return request(app)
            .post("/api/product/create")
            .send(reqaddProduct)
            .expect(401)
    });
}); */


/* 
describe("DELETE /api/product/delete/:id", () => {
    test("should create a product", async () => {
        return request(app)
            .delete(`/api/product/delete/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(410)
    });
}); */