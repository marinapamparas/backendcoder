import { Router } from "express";
import { uploader } from "../services/uploader.js";

const uploadRouter = Router();


uploadRouter.post('/products', uploader.array('productImages', 3), (req, res) => {
    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas', files: req.files });
});

uploadRouter.post('/profile', uploader.array('profileImage', 2), (req, res) => {
    
    res.status(200).send({ status: 'OK', payload: 'Imágenes subidas exitosamente!', files: req.files });
});





export default uploadRouter;

