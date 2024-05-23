import express from "express";
import passport from "passport";
import { editProjectSiteMapRoute,createProjectRoute, deleteProjectRoute, editProjectRoute, getProjectsRoute, getProjectRoute, getProjectPeopleRoute } from "../";
const router = express.Router();

// get all categories
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getProjectsRoute(req, res); 
});

// create a category
router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createProjectRoute(req, res);
});

// get selected category
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getProjectRoute(req, res);
});

// edit selected category
router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editProjectRoute(req, res);
});

// delete category
router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteProjectRoute(req, res);
});

// get selected category
router.get('/:id/people', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getProjectPeopleRoute(req, res);
});

// edit selected category
router.patch('/:id/sitemaps', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editProjectSiteMapRoute(req, res);
});


export default router;