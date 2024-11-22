import express from "express";
import passport from "passport";
import { createKeyRoute, deleteKeyRoute, editKeyRoute, getKeyPairRoute, getKeyPairsRoute } from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getKeyPairRoute(req, res); 
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
=======
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
>>>>>>> Stashed changes
=======
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
>>>>>>> Stashed changes
    await getKeyPairsRoute(req, res); 
});

router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createKeyRoute(req, res);
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
router.patch('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editKeyRoute(req, res);
});

router.delete('/:key', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteKeyRoute(req, res);
});
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
export default router;