import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';


export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

//la duracion de expiresIn se puede poner como string '1h' es 1 hora, '5m' son 5 minutos
export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

//verificamos que haya un token en header, cookie o por query:
export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`]: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere token' });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        
        if (err) return res.status(403).send({ origin: config.SERVER, payload: 'Token no válido' });
        req.user = payload;
        next();
    });
}


export const verifyRequiredBody = (requiredFields) =>{
    return (req, res, next) => {
        const allOk = requiredFields.every ( field =>
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined);
        if (!allOk) return res.status(400).send({origin: config.SERVER, payload: 'Faltan propiedades', requiredFields});
        next();
    };
};