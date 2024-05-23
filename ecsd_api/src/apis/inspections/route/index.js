import express from "express";
import passport from "passport";
import { getInspectionPDFRoute, createInspectionRoute, deleteInspectionRoute, editInspectionRoute, getInspectionsRoute, getInspectionRoute, getInspectionTemplateForInspectionRoute} from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionsRoute(req, res); 
});

router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createInspectionRoute(req, res);
});

router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionRoute(req, res);
});

router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editInspectionRoute(req, res);
});

router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteInspectionRoute(req, res);
});

router.get('/:id/inspectiontemplate', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionTemplateForInspectionRoute(req, res);
});

router.get('/:id/pdf', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionPDFRoute(req, res);
});

export default router;