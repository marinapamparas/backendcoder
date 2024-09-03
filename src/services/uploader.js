import multer from 'multer';
import config from '../config.js';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        const subFolder = path.basename(req.path)
        cb(null, `${config.DIRNAME}/uploads/${subFolder}/`)
        
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

export const uploader = multer({ storage: storage });
