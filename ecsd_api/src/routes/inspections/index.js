import express from "express";
import passport from "passport";
import { createInspectionRoute, deleteInspectionRoute, editInspectionRoute, getInspectionsRoute, getInspectionRoute } from "../../services/inspections";
import jwt from 'jsonwebtoken';
const router = express.Router();

// get all categories
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionsRoute(req, res); 
});

// create a category
router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createInspectionRoute(req, res);
});

// get selected category
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getInspectionRoute(req, res);
});

// edit selected category
router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editInspectionRoute(req, res);
});

// delete category
router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteInspectionRoute(req, res);
});

export default router;