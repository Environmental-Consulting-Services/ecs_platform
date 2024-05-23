import express from "express";
import passport from "passport";
import { createManagementPlanRoute, getManagementPlanRoute, getManagementPlansRoute, deleteManagementPlanRoute, editManagementPlanRoute } from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

// get all categories
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getCompaniesRoute(req, res); 
});

// create a category
router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createCompanyRoute(req, res);
});

// get selected category
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getCompanyRoute(req, res);
});

// edit selected category
router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editCompanyRoute(req, res);
});

// delete category
router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteCompanyRoute(req, res);
});

export default router;