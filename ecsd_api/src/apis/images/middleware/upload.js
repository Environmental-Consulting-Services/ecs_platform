import util  from "util";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import {dbConfig} from "../config/db.js";

var storage = new GridFsStorage({
  url: dbConfig.url + dbConfig.database,
  
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {  
      // if you are using a separate collection to store data 
      // there is no need to save this information on the metadata
      // because you'll probably never use it
      /* const match = ["image/png", "image/jpeg"];
      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-img-${file.originalname}`;
        return filename;
      }
  
      return {
        bucketName: dbConfig.imgBucket,
        filename: `${Date.now()}-img-${file.originalname}`
      };
 */

      const filename = `${Date.now()}-img-${file.originalname}`;
      //const filename = req.body.fileName + path.extname(file.originalname);
      const fileInfo = {
        filename: filename,
        bucketName: dbConfig.imgBucket,
      }
      resolve(fileInfo);
    });
   
  }
});

var uploadFiles = multer({ storage: storage }).array("file", 10);
// var uploadFiles = multer({ storage: storage }).single("file");
export const uploadFilesMiddleware = util.promisify(uploadFiles);
//module.exports = uploadFilesMiddleware;
