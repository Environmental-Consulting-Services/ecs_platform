import mongoose from "mongoose";
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

let myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

export const dbConnect = () => {
  console.log(process.env.CHAT_DATABASE_URL);  
   mongoose.connection.once("open", () => console.log("DB connection"));
  return mongoose.connect(
    `${process.env.CHAT_DATABASE_URL}&retryWrites=true&w=majority`,
    { useNEWUrlParser: true,
      keepAlive: true }
  );
};
