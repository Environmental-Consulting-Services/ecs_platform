import { InspectionModel } from "./schema/inspection.schema";
import { AddressModel } from "../schemas/address.schema";
import { UserModel } from "../users/schema/user.schema";
import eq from "lodash";
import { InspectionTemplateModel } from "../inspectiontemplates/schema/inspectionTemplate.schema";
import { SurveyPDF } from "survey-pdf";
//import { dbConnect } from "../../mongoose";
import { MongoClient, GridFSBucket}  from "mongodb"; //.MongoClient;
import mongoose from "mongoose";
import {Readable } from 'stream';
import {dbConfig}  from "../images/config/db.js";
import React from "react";
import str  from 'string-to-stream';
import CrudService from "../../services/cruds-service";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const APP_URL_API = process.env.APP_URL_API;
const mail_api_host = process.env.MAIL_API_HOST;
const mail_api_port = process.env.MAIL_API_PORT;


const url = dbConfig.url;
const baseUrl = APP_URL_API+"/public/images/files/";
const mongoClient = new MongoClient(url);

import { setLicenseKey } from "survey-core";
import crudsService from "../../services/cruds-service.js";

/* 
import pkg from 'survey-core';
const { setLicenseKey } = pkg;
 */

export const getInspectionsRoute = async (req, res) => {
  let inspectionsObjectArray = [];
  let jsonArrayInspections = {};

  // pagination
  let paginationSize = null;
  let pageNumber = null;
  if (req.query.page) {
    if (req.query.page.number) {
      pageNumber = +req.query.page.number;
    }
    if (req.query.page.size) {
      paginationSize = +req.query.page.size;
    }
  }

  // filtering
  let filters = {};
  if (req.query.filter) {
    filters = req.query.filter;
  }

  // sorting
  let sortValue;
  if (req.query.sort) {
    sortValue = req.query.sort;
  }

  // choose fields
  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const allInspections = await InspectionModel
    .find(filters)
    .select(fieldsInspection)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  inspectionsObjectArray = allInspections.map((element) => {
    let jsonObj = {
      type: "inspections",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayInspections = { ...jsonArrayInspections, ...jsonObj });
  });

  const sentData = { data: [...inspectionsObjectArray] };
  return res.status(200).send(sentData);
};

export const getInspectionRoute = async (req, res) => {
  const inspectionId = req.params.id;

  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const foundInspection = await InspectionModel.findOne({ _id: inspectionId }).select(fieldsInspection);
  if (!foundInspection) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection can not be found" }] });
  }

  const sentData = {
    data: {
      type: "inspections",
      id: foundInspection.id,
      attributes: {
        ...foundInspection._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const shareInspectionPDFRoute = async (req, res) => {
  const inspectionId = req.params.id;

  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const foundInspection = await InspectionModel.findOne({ _id: inspectionId }).select(fieldsInspection);
  if (!foundInspection) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection can not be found" }] });
  }




  const foundInspectionTemplate = await InspectionTemplateModel.findOne({ _id: foundInspection.template });

  const { window } = new JSDOM(`...`);
  global.window = window;
  global.document = window.document;
   
      const surveyModel = foundInspectionTemplate.items[0];

      const pdfWidth = /* !!surveyModel && surveyModel.pdfWidth ? surveyModel.pdfWidth :  */210;
      const pdfHeight = /* !!surveyModel && surveyModel.pdfHeight ? surveyModel.pdfHeight : */ 297;
      const options = {
        haveCommercialLicense: true,
          fontSize: 10,
          htmlRenderAs: "standard",
          applyImageFit: true,

          imageFit: "true",
         margins: {
              left: 10,
              right: 10,
              top: 10,
              bot: 10
          },
          format: "letter",
          tagboxSelectedChoicesOnly: true,
          compress: true
      };

      surveyModel.pages[0].visible = true;
      const surveyPDF = new SurveyPDF( surveyModel, options);
      surveyPDF.mode = "display";

      setLicenseKey(
        "NzMyNjcyZDctM2RlNC00ZTU3LTkzODctMThhMzcyYTU5MWUyOzE9MjAyNS0wNS0xNSwyPTIwMjUtMDUtMTUsND0yMDI1LTA1LTE1"
      );

      if (surveyPDF) {
         surveyPDF.data = foundInspection.formdata;
      }

      var timeStamp = Math.floor(Date.now() / 1000);
      var filename = "inspection_report_"+ foundInspection.id + "_"+timeStamp+".pdf";

      
      var fileId = await surveyPDF.save('./files/'+filename).then(async (blob) => {  
        
        return 1234;

      });

      const formData = new FormData();
      formData.append("to", "scott@llamalogic.com");
      formData.append("subject", "Sent from API to Mailer");
      formData.append("message", "Sent from API to Mailer about : <a href='"+APP_URL_API+"/inspections/"+foundInspection.id+"/pdf/"+timeStamp+"'>Inspection "+foundInspection.id+"</a> " );
      
      CrudService.sendMail(formData, inspectionId).then((response) => {
        const sentData = {
          data: {
            type: "inspections",
            id: foundInspection.id,
            attributes: {
              ...foundInspection._doc,
            },
          },
        };
        return res.status(200);
      });
    
      delete global.window;
      delete global.html2pdf;
      delete global.navigator;
      delete global.btoa;

  const sentData = {
    data: {
      type: "inspections",
      id: foundInspection.id,
      attributes: {
        pdf_file_ts: timeStamp,
        filname: filename,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const getInspectionPDFRoute = async (req, res) => {
  const inspectionId = req.params.id;
  const fileTS = req.params.ts;

  //const inspectionId  = fileId.split("_")[2];
  //const timeStamp = fileId.split("_")[3];
   

  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }


  const foundInspection = await InspectionModel.findOne({ _id: inspectionId }).select(fieldsInspection);
  if (!foundInspection) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection can not be found" }] });
  }

  const foundInspectionTemplate = await InspectionTemplateModel.findOne({ _id: foundInspection.template });

  const { window } = new JSDOM(`...`);
  global.window = window;
  global.document = window.document;
   
      const surveyModel = foundInspectionTemplate.items[0];

      const pdfWidth = /* !!surveyModel && surveyModel.pdfWidth ? surveyModel.pdfWidth :  */210;
      const pdfHeight = /* !!surveyModel && surveyModel.pdfHeight ? surveyModel.pdfHeight : */ 297;
      const options = {
        haveCommercialLicense: true,
        htmlRenderAs: "standard",
        fontSize: 10,
        imageFit: "true",
        applyImageFit: true,

        margins: {
              left: 10,
              right: 10,
              top: 10,
              bot: 10
        },
        format: "letter",
        tagboxSelectedChoicesOnly: true,
        compress: true
      };

      surveyModel.pages[0].visible = true;
      const surveyPDF = new SurveyPDF( surveyModel, options);
      surveyPDF.mode = "display";

      setLicenseKey(
        "NzMyNjcyZDctM2RlNC00ZTU3LTkzODctMThhMzcyYTU5MWUyOzE9MjAyNS0wNS0xNSwyPTIwMjUtMDUtMTUsND0yMDI1LTA1LTE1"
      );

      if (surveyPDF) {
         surveyPDF.data = foundInspection.formdata;
      }

      var fileLoc = './files/';
      var filename = "inspection_report_"+ foundInspection.id + "_"+fileTS+".pdf";
      
      var fileSaveData = await surveyPDF.save(fileLoc+filename).then(async (blob) => {  
       
        delete global.window;
        delete global.html2pdf;
        delete global.navigator;
        delete global.btoa;

        return res.download(fileLoc+filename);

      } );

      
  /* const sentData = {
    data: {
      type: "inspections",
      id: foundInspection.id,
      attributes: {
        pdf_file_ts: timeStamp,
        filname: filename,
      },
    },
  };
  return res.download(fileLoc+filename); */
};





export const createInspectionRoute = async (req, res) => {
  
  const { 
    scheduled_date,
    type,
    status,
    template,
    actions,
    living_narratives,
    project,
    company,
    created_at,
    updated_at,

  } = req.body.data.attributes;

 /* 
  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  } */

  /* const existingProject = await projectModel.findOne({ name: name });
  if (existingProject) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The copmany already exists" }] });
  }
   */

  //Check Users Exist
/*   const ownerUser = await UserModel.findById(owner._id);
  if (!ownerUser) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner user does not exist" }] });
  } */

  //Check Owner already has THIS project
 /*  const existingProject = await ProjectModel.findOne({ owner: owner._id , name: name });
  if (existingProject) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a project by this name" }] });
  } */
  
  
  let existingTemplate = await InspectionTemplateModel.findOne({ project: project });

    
  const newInspection = new InspectionModel({
    scheduled_date : scheduled_date,
    type: type,
    status: status,
    template: (template)?template: (existingTemplate)?existingTemplate._id:null,
    actions : actions,
    living_narratives : living_narratives,
    project : project,
    company : (company=="")?null:company,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  newInspection.save();
  const sentData = {
    data: {
      type: "inspections",
      id: newInspection.id,
      attributes: {
        ...newInspection._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editInspectionRoute = async (req, res) => {
  const inspectionId = req.params.id;
  const {  
    type,
    status,
    living_narratives,
    project,
    company,
    template,
    actions,
    formdata,
    scheduled_date,
    conducted_on,
    completed_on,
    created_at,
    updated_at,
  } = req.body.data.attributes;

  const foundInspection = await InspectionModel.findById(inspectionId);
  if (!foundInspection) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No inspection was found" }] });
  }
  
  if (scheduled_date) {
    foundInspection.scheduled_date = scheduled_date;
  }
  if (type) {
    foundInspection.type = type;
  }
  if (status) {
    foundInspection.status = status;
  }
  if (template) {
    foundInspection.template = template;
  }
  if (actions) {
    foundInspection.actions = actions;
  }
  if (living_narratives) {
    foundInspection.living_narratives = living_narratives;
  }
  if (project) {
    foundInspection.project = project;
  }
  if (company) {
    foundInspection.company = company;
  }
  if (conducted_on) {
    foundInspection.conducted_on = conducted_on;
  }
  if (completed_on) {
    foundInspection.completed_on = completed_on;
  }
  if (formdata) {
    foundInspection.formdata = formdata;  
  }
  
  foundInspection.updated_at = Date.now();  

  var updatedInspection = foundInspection.save();

  const sentData = {
    data: {
      type: "inspections",
      id: inspectionId,
      attributes: {
        ...updatedInspection._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteInspectionRoute = async (req, res) => {
  const toDeleteInspection = await InspectionModel.findOne({ _id: req.params.id});

  if (!toDeleteInspection /* || String(toDeleteInspection.owner._id) != String(req.user._id) */) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection does not exist" }] });
  }

  try {
    await InspectionModel.deleteOne({_id: toDeleteInspection._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};


export const getInspectionTemplateForInspectionRoute = async (req, res) => {
  const inspectionId = req.params.id;

  let fieldsInspection;
  if (req.query.fields) {
    if (req.query.fields.inspections) {
      fieldsInspection = req.query.fields.inspections.split(",");
    }
  }

  const foundInspection = await InspectionModel.findOne({ _id: inspectionId }).select(fieldsInspection);
  if (!foundInspection) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection template can not be found" }] });
  }

  const foundInspectionTemplate = await InspectionTemplateModel.findOne({ _id: foundInspection.template }).select(fieldsInspection);

  if (!foundInspectionTemplate) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The inspection template can not be found" }] });
  }

  const sentData = {
    data: {
      type: "inspectiontemplates",
      id: foundInspectionTemplate.id,
      attributes: {
        ...foundInspectionTemplate._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

