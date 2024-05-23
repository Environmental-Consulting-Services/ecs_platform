import express from "express";
import passport from "passport";
import { createPersonRoute, deletePersonRoute, editPersonRoute, getPersonRoute,getPersonsRoute } from "../"
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await getPersonsRoute(req, res);
})

router.post("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await createPersonRoute(req, res);
})

router.get("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await getPersonRoute(req, res);
});

router.patch("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await editPersonRoute(req, res);
});

router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await deletePersonRoute(req, res);
});

export default router;
