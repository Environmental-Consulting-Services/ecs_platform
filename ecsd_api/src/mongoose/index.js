import mongoose from "mongoose";
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

let myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

export const dbConnect = () => {
  console.log(process.env.DATABASE_URL);  
   mongoose.connection.once("open", () => console.log("DB connection"));
   mongoose.set('strictQuery', false)
   return mongoose.connect(
    `${process.env.DATABASE_URL}&retryWrites=true&w=majority`,
    { useNEWUrlParser: true,
      keepAlive: true ,}
  );
};

