import { InspectionModel } from "./schema/inspection.schema";
import { AddressModel } from "../schemas/address.schema";
import { UserModel } from "../users/schema/user.schema";
import eq from "lodash";
import { InspectionTemplateModel } from "../inspectiontemplates/schema/inspectionTemplate.schema";
import { SurveyPDF } from "survey-pdf";
import { MongoClient, GridFSBucket}  from "mongodb"; //.MongoClient;
import mongoose from "mongoose";
import {Readable } from 'stream';
import React from "react";
import str  from 'string-to-stream';
import CrudService from "../../services/cruds-service";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const APP_URL_API = process.env.APP_URL_API;
const mail_api_host = process.env.MAIL_API_HOST;
const mail_api_port = process.env.MAIL_API_PORT;


const url = process.env.FILES_DB_URL;
const baseUrl = APP_URL_API+"/public/images/files/";
const mongoClient = new MongoClient(url);

import { setLicenseKey } from "survey-core";
import crudsService from "../../services/cruds-service.js";

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

      surveyPDF.onRender
      
      Header.add(async function (_, canvas) {
        await canvas.drawImage(
            { base64: "data:image/png;base64,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",
            horizontalAlign: "left",
            width: (canvas.rect.yBot - canvas.rect.yTop) * 3,
            height: (canvas.rect.yBot - canvas.rect.yTop) * 1.5,
            margins: { left: (canvas.rect.yBot - canvas.rect.yTop) * 0.2 }
        });
    });


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

