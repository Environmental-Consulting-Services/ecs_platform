import express from "express";
import passport from "passport";
import { createThreadRoute, createExpertMessageRoute, addMessage, runAssistant, checkingStatus } from "../../services/chatgpt";
import jwt from 'jsonwebtoken';
import { UserModel } from "../../schemas/user.schema";
const router = express.Router();

let pollingInterval;

// Get or open a thread for a user
router.get("/thread", passport.authenticate("jwt", { session: false }), async (req, res) => {
   await createThreadRoute(req, res);
});

router.post("/message", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { message } =
    req.body.data.attributes;

  var userId = req.user._id

  var result = await createExpertMessageRoute(message, userId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  } else {
    return res.status(200).send(result);
  }

});




/* 
router.post("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await askExpertRoute(req, res);
});
 */
/* 
router.get("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await getMessageRoute(req, res);
});

router.patch("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await editMessageRoute(req, res);
});

router.delete("/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await deleteMessageRoute(req, res);
}); */

export default router;