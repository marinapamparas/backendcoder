import bcrypt from 'bcrypt';


export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);


export const verifyRequiredBody = (requiredFields) =>{
    return (req, res, next) => {
        const allOk = requiredFields.every ( field =>
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined);
        if (!allOk) return res.status(400).send({origin: config.SERVER, payload: 'Faltan propiedades', requiredFields});
        next();
    };
};