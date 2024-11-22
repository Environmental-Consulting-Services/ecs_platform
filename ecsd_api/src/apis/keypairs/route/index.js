import express from "express";
import passport from "passport";
import { createKeyRoute, deleteKeyRoute, editKeyRoute, getKeyPairRoute, getKeyPairsRoute } from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getKeyPairRoute(req, res); 
});

// router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {

router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getKeyPairsRoute(req, res); 
});

router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createKeyRoute(req, res);
});


router.patch('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editKeyRoute(req, res);
});

router.delete('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteKeyRoute(req, res);
});

export default router;