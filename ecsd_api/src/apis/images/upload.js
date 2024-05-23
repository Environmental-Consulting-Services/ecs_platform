import  {uploadFilesMiddleware}  from "./middleware/upload.js";
import {dbConfig}  from "./config/db.js";
import { ObjectId } from 'bson';

import {MongoClient, GridFSBucket}  from "mongodb"; //.MongoClient;
//import GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;

const baseUrl = "http://localhost:8080/public/images/files/";

const mongoClient = new MongoClient(url);

export const uploadFiles = async (req, res) => {
  try {
    await uploadFilesMiddleware(req, res);
   // console.log(req.files);

    if (req.files.length <= 0) {
      return res
        .status(400)
        .send({ message: "You must select at least 1 file." });
    }

    var filesArray = [];
    req.files.forEach((file) => {
      filesArray.push({
          type: "files",
          id: file.id,
          attributes: {
            id: file.id,
            filename: file.filename
          },
      });
    });

    const sentData = {
      data: [
        ...filesArray
      ]
    };

    return res.status(200).send(
        sentData
      );

    // console.log(req.file);

    // if (req.file == undefined) {
    //   return res.send({
    //     message: "You must select a file.",
    //   });
    // }

    // return res.send({
    //   message: "File has been uploaded.",
    // });
  } catch (error) {
   // console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).send({
        message: "Too many files to upload.",
      });
    }
    return res.status(500).send({
      message: `Error when trying upload many files: ${error}`,
    });

    // return res.send({
    //   message: "Error when trying upload image: ${error}",
    // });
  }
};

export const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const images = database.collection(dbConfig.imgBucket + ".files");

    const cursor = images.find({});

    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
        id: doc._id,
        contentType: doc.contentType
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

export const downloadBase64 = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

/* 
    const images = database.collection(dbConfig.imgBucket + ".files");
    const cursor = images.find({"_id": new ObjectId(req.params.id)});

 */

    let downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
    let data = '';
    downloadStream.on('data', (chunk) => {
      data += chunk.toString('base64')
  })

    /* downloadStream.on("data",  (data) => {
      return res.status(200).write(data);
    }); */

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.send(data);
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};


export const download = async (req, res) => {

  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

/* 
    const images = database.collection(dbConfig.imgBucket + ".files");
    const cursor = images.find({"_id": new ObjectId(req.params.id)});

 */

    let downloadStream = bucket.openDownloadStream(new ObjectId(req.params.id));
    let data = '';
    downloadStream.on('data', (chunk) => {
      data += chunk
  })

    /* downloadStream.on("data",  (data) => {
      return res.status(200).write(data);
    }); */

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.send(data);
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};