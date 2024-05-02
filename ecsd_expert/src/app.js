import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";
import {
  messageRoutes, expertRoutes
} from "./routes/index.js";
import path from "path";

import passportJWT from "passport-jwt";

const JWTStrategy = passportJWT.Strategy;

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
const app = express();

const whitelist = [process.env.APP_URL_CLIENT];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin ){
      callback(null, true);
    } else if(whitelist.indexOf(origin) !== -1 ){
      callback(null, true);
    } else if (process.env.NODE_ENV==="development"){
      console.log("No CORS in DEV MODE ", origin);
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};



app.use(cors(corsOptions));
//app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));
app.use(express.json());
app.get("/", function (req, res) {
  //const __dirname = fs.realpathSync(".");
  try {
    res.sendFile(path.join(__dirname, "landing/index.html"));
  } catch (error) { 
    res.status(404).send('Not found');
  }
});

app.use("/messages", messageRoutes);
app.use("/expert", expertRoutes);

//app.listen(PORT, () => console.log(`Server listening to port ${PORT}`));

export default app;