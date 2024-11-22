import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "./index.js";
import { UserModel } from "../apis/users/schema/user.schema.js";
import { permissionModel } from "../apis/permissions/schema/permission.schema.js";
import { roleModel } from "../apis/roles/schema/role.schema.js";

import dotenv from 'dotenv';
import { CompanyModel } from "../apis/companies/schema/company.schema.js";
import { ProjectModel } from "../apis/projects/schema/project.schema.js";
import { InspectionModel } from "../apis/inspections/schema/inspection.schema.js";
import { ActionItemModel } from "../apis/actionitems/schema/actionitem.schema.js";
import { PersonModel } from "../apis/person/schema/person.schema.js";
import { createActionItemNoteRoute } from "../apis/actionitems/index.js";
import { InspectionTemplateModel } from "../apis/inspectiontemplates/schema/inspectionTemplate.schema";
import { InspectionFormModel } from "../apis/inspectionforms/schema/inspectionForm.schema";

dotenv.config();


async function dbUtil() {
  //connect do db
   dbConnect();

   //await createProject();

    //await createActionItemNote();

    //await createInspectionTemplate();

    await setupInspection();

  console.log("DB seeded");
}

await dbUtil().then(() => {
  mongoose.connection.close();
});


async function setupInspection() {

/* 
  var project = await ProjectModel.findOne();
  var inspectionTemplate = await InspectionTemplateModel.findOne();

  var inspection = await InspectionModel.findOne();
  inspection.template = inspectionTemplate;

  var inspectionForm = InspectionFormModel();

  inspectionForm.inspection = inspection;
  inspectionForm.template = inspectionTemplate;
  

  await inspection.save();
  await inspectionForm.save();
   */

}

async function createInspectionTemplate() {


  var project = await ProjectModel.findOne();

  var inspectionTemplate = new InspectionTemplateModel({
    type: "suveryjs",
    status: "active",
    name: "Test Template",
    items: 
    {
      "title": "NPS Survey Question",
      "completedHtml": "<h3>Thank you for your feedback</h3>",
      "completedHtmlOnCondition": [
       {
        "expression": "{nps_score} >= 9",
        "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you love our product. Your ideas and suggestions will help us make it even better.</h4>"
       },
       {
        "expression": "{nps_score} >= 6  and {nps_score} <= 8",
        "html": "<h3>Thank you for your feedback</h3> <h4>We are glad that you shared your ideas with us. They will help us make our product better.</h4>"
       }
      ],
      "pages": [
       {
        "name": "page1",
        "elements": [
         {
          "type": "rating",
          "name": "nps_score",
          "title": "On a scale of zero to ten, how likely are you to recommend our product to a friend or colleague?",
          "isRequired": true,
          "rateCount": 11,
          "rateMin": 0,
          "rateMax": 10,
          "minRateDescription": "(Most unlikely)",
          "maxRateDescription": "(Most likely)"
         },
         {
          "type": "checkbox",
          "name": "promoter_features",
          "visibleIf": "{nps_score} >= 9",
          "title": "Which of the following features do you value the most?",
          "description": "Please select no more than three features.",
          "isRequired": true,
          "validators": [
           {
            "type": "answercount",
            "text": "Please select no more than three features.",
            "maxCount": 3
           }
          ],
          "choices": [
           "Performance",
           "Stability",
           "User interface",
           "Complete functionality",
           "Learning materials (documentation, demos, code examples)",
           "Quality support"
          ],
          "showOtherItem": true,
          "otherText": "Other features:",
          "colCount": 2
         },
         {
          "type": "comment",
          "name": "passive_experience",
          "visibleIf": "{nps_score} >= 7  and {nps_score} <= 8",
          "title": "What can we do to make your experience more satisfying?"
         },
         {
          "type": "comment",
          "name": "disappointing_experience",
          "visibleIf": "{nps_score} <= 6",
          "title": "Please let us know why you had such a disappointing experience with our product"
         }
        ]
       }
      ],
      "showQuestionNumbers": "off"
     }
    ,
    project: project,
  
  });



  await inspectionTemplate.save();

}



async function createProject() {

  var company = await CompanyModel.findOne();
  var admin = await UserModel.findOne();
  const project = new ProjectModel({ name: "Project 1", status: "active", company: company, owner: admin, created_at: new Date() });

  await project.save();

}


async function createActionItemNote(){
  var actionItemId = "00000004475b6056b571cd94";

  const note = {  
    created_at: new Date(),
    note: "This is a note",
    user: "6636ad6e475b6056b571cd8b"
  };

  await ActionItemModel.findOneAndUpdate({ _id: actionItemId }, {"$push": { "notes": note }});

}