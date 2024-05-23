import express from "express";
import passport from "passport";
import { createInspectionFormRoute, 
    getInspectionFormRoute,
    getInspectionFormsRoute,
    editInspectionFormRoute,
    deleteInspectionFormRoute} from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionFormsRoute(req, res); 
});

router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createInspectionFormRoute(req, res);
});

router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionFormRoute(req, res);
});

router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editInspectionFormRoute(req, res);
});

router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteInspectionFormRoute(req, res);
});

export default router;