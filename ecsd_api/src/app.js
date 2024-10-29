import express from "express";
const { json, urlencoded } = require("body-parser");
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";
import {
  userRoutes,
  meRoutes,
  authRoutes,
  roleRoutes,
  uploadRoutes,
  companyRoutes,
  permissionRoutes,
  imageRoutes,
  projectRoutes,
  inspectionRoutes,
  inspectionFormRoutes,
  managementPlanRoutes,
  actionItemRoutes,
  inspectionTemplateRoutes,
  peopleRoutes
    
} from "./apis/index.js";
import path from "path";

import cron from "node-cron";
//import ReseedAction from "./mongoose/ReseedAction.js";

import passportJWT from "passport-jwt";

const JWTStrategy = passportJWT.Strategy;

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
const app = express();


app.use(json({ limit: '30mb' }))
app.use(urlencoded({ limit: '30mb', extended: true }))

const whitelist = [process.env.APP_URL_CLIENT];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin ){
      callback(null, true);
    } else if(whitelist.indexOf(origin) !== -1 ){
      callback(null, true);
    } else if (process.env.NODE_ENV==="dev"){
      //console.log("No CORS in DEV MODE ", origin);
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(express.urlencoded({ extended: true }));
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

app.use("/", authRoutes);
app.use("/me", meRoutes);
app.use("/uploads", uploadRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/companies", companyRoutes);
app.use("/permissions", permissionRoutes);
app.use("/public/images", imageRoutes);
app.use("/projects", projectRoutes);
app.use("/inspections",inspectionRoutes);
app.use("/inspectionforms",inspectionFormRoutes);
app.use("/managementplans",managementPlanRoutes);
app.use("/actionitems",actionItemRoutes);
app.use("/inspectiontemplates",inspectionTemplateRoutes);
app.use("/people", peopleRoutes);

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}

app.use(errorHandler);

process.on('uncaughtException', (err) => {
  console.log('FATAL ERROR: ', err);
});

export default app;