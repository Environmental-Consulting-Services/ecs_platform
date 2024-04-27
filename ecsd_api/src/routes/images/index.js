import express from "express";
import passport from "passport";
import fs from 'fs';
import path from "path";

const router = express.Router();

router.get('/users/:id/:name', (req, res) => {
    const id = req.params.id;
    const fileName = req.params.name;
    streamImage(`./public/images/users/${id}/${fileName}`, res);            
});

router.get('/items/:id/:name', (req, res) => {
    const id = req.params.id;
    const fileName = req.params.name;
    streamImage(`./public/images/items/${id}/${fileName}`, res);
});


router.get('/:name', (req, res) => {
    const fileName = req.params.name;
    streamImage(`./public/images/${fileName}`, res);
    
});

function streamImage(imagePath, res) {
    res.setHeader('Content-Type', 'image/*');
    const rs = fs.createReadStream(path.resolve(process.cwd(), imagePath));
    rs.on('error', (err) => {    
        res.status(404).send('Not found');
    });
    rs.pipe(res)
}



export default router;
