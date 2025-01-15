import util  from "util";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

var storage = new GridFsStorage({
  url: process.env.FILES_DB_URL,
  
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {  


      const filename = `${Date.now()}-img-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: process.env.IMG_BUCKET,
      }
      resolve(fileInfo);
    });
   
  }
});

var uploadFiles = multer({ storage: storage }).array("file", 10);
export const uploadFilesMiddleware = util.promisify(uploadFiles);
