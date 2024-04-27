import express from "express";
import passport from "passport";
import { createInspectionTemplateRoute, deleteInspectionTemplateRoute, editInspectionTemplateRoute, getInspectionTemplatesRoute, getInspectionTemplateRoute } from "../../services/inspectiontemplates";
import jwt from 'jsonwebtoken';
const router = express.Router();

// get all categories
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionTemplatesRoute(req, res); 
});

// create a category
router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createInspectionTemplateRoute(req, res);
});

// get selected category
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionTemplateRoute(req, res);
});

// edit selected category
router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editInspectionTemplateRoute(req, res);
});

// delete category
router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteInspectionTemplateRoute(req, res);
});

export default router;