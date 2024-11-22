import express from "express";
import passport from "passport";
import { createKeyRoute, deleteKeyRoute, editKeyRoute, getKeyPairRoute, getKeyPairsRoute } from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getKeyPairRoute(req, res); 
});

router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getKeyPairsRoute(req, res); 
});

router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createKeyRoute(req, res);
});

export default router;