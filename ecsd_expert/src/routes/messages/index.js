import express from "express";
import passport from "passport";
import { getMessagesRoute, getMessageRoute, editMessageRoute, createMessageRoute, deleteMessageRoute, } from "../../services/messages";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await getMessagesRoute(req, res);
})

router.post("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { from,to,message, delivered, read, } =
    req.body.data.attributes;

    var userId = req.user.id

  var result = await createMessageRoute(userId, from,to,message, delivered, read,);
  res.status((result.error)?400:200).send(result);

})

router.get("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await getMessageRoute(req, res);
});

router.patch("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await editMessageRoute(req, res);
});

router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await deleteMessageRoute(req, res);
});

export default router;