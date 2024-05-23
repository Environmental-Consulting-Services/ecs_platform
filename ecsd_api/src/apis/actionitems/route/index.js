import express from "express";
import passport from "passport";
import { deleteActionItemNoteRoute, createActionItemRoute, deleteActionItemRoute, editActionItemRoute, getActionItemsRoute, getActionItemRoute, getActionItemNotesRoute, createActionItemNoteRoute } from "../";
import jwt from 'jsonwebtoken';
const router = express.Router();

// get all categories
router.get('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getActionItemsRoute(req, res); 
});

// create a category
router.post('/', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createActionItemRoute(req, res);
});

// get selected category
router.get('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getActionItemRoute(req, res);
});

// edit selected category
router.patch('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await editActionItemRoute(req, res);
});

// delete category
router.delete('/:id', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteActionItemRoute(req, res);
});


router.post('/:id/notes', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await createActionItemNoteRoute(req, res);
});


router.get('/:id/notes', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await getActionItemNotesRoute(req, res);
});

router.delete('/:id/notes/:noteid', passport.authenticate('jwt',{session: false}), async (req, res) => {
    await deleteActionItemNoteRoute(req, res);
});

export default router;