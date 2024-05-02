import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "./index.js";

import { UserModel } from "../schemas/user.schema.js";


import dotenv from 'dotenv';
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
    email: "admin@jsonapi.com",
    phone: "123456789",
    password: hashPassword,
    created_at: new Date(),
    profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
  });
  
  console.log("DB seeded");
}

seedDB().then(() => {
  mongoose.connection.close();
});
