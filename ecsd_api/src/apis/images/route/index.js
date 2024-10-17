import {uploadFiles, getListFiles, download, downloadBase64} from "../upload.js";
import express from "express";
import passport from "passport";

const router = express.Router();

  //router.post("/upload", uploadFiles);
  router.post("/upload", passport.authenticate("jwt", { session: false }), async (req, res) => {
    await uploadFiles(req, res);
  })
  //router.get("/files", getListFiles);
  router.get("/files", passport.authenticate("jwt", { session: false }), async (req, res) => {
    await getListFiles(req, res);
  })
  
  //router.get("/files/:name", download);
  router.get("/files/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
    await download(req, res);
  })

  //router.get("/files/:name", download);
  router.get("/files/:id/base64", passport.authenticate("jwt", { session: false }), async (req, res) => {
    await downloadBase64(req, res);
  })

  //router.get("/files/:name", download);
  router.get("/files/:id/pdf", passport.authenticate("jwt", { session: false }), async (req, res) => {
    res.setHeader('Content-Type', 'application/pdf');
    await downloadBase64(req, res);
  })


  export default router;