import express from "express";
import {
  forgotPasswordRouteHandler,
  loginRouteHandler,
  registerRouteHandler,
  resetPasswordRouteHandler,
  tokeRouteHandler,
} from "../";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body.data.attributes;
  await loginRouteHandler(req, res, email, password);
});

router.post("/logout", (req, res) => {
  return res.sendStatus(204);
});



router.post("/register", async (req, res) => {
  try {
    const {type, first_name, last_name, email, password, profile_image, phone, address, role, } = req.body.data.attributes;
    await registerRouteHandler(req, res, type, first_name, last_name, email, password, profile_image, phone, address, role,);
  }catch (e) {
    return res.status(401).json({ message: "Invalid request" });
  }
  
});

router.post("/password-forgot", async (req, res) => {
  const { email } = req.body.data.attributes;
  await forgotPasswordRouteHandler(req, res, email);
});

router.post("/password-reset", async (req, res) => {
  await resetPasswordRouteHandler(req, res);
});

export default router;
