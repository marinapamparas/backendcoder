import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config, {errorsDictionary} from '../config.js';
import { faker } from '@faker-js/faker';
import CustomError from './CustomError.class.js';


export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

export const isValidPassword = async (user, password) => {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  };

//la duracion de expiresIn se puede poner como string '1h' es 1 hora, '5m' son 5 minutos
export const createToken = (payload, duration) => jwt.sign(payload, config.SECRET, { expiresIn: duration });

//verificamos que haya un token en header, cookie o por query:
export const verifyToken = (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1]: undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`]: undefined;
    const queryToken = req.query.access_token ? req.query.access_token: undefined;
    const receivedToken = headerToken || cookieToken || queryToken;

    if (!receivedToken) throw new CustomError(errorsDictionary.INVALID_AUTENTICATION) //return res.status(401).send({ origin: config.SERVER, payload: 'Se requiere token' });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        
        if (err) throw new CustomError(errorsDictionary.INVALID_AUTENTICATION)
            //return res.status(403).send({ origin: config.SERVER, payload: 'Token no válido' });
        req.user = payload;
        next();
    });
}


export const verifyRequiredBody = (requiredFields) =>{
    return (req, res, next) => {
        const allOk = requiredFields.every ( field =>
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined);
        if (!allOk) throw new CustomError(errorsDictionary.FEW_PARAMETERS)
            //return res.status(400).send({origin: config.SERVER, payload: 'Faltan propiedades', requiredFields});
        next();
    };
};


export const verifyMongoDBId = (id) => {
    return (req, res, next) => {
        if (!config.MONGODB_ID_REGEX.test(req.params.id)) {
            throw new CustomError(errorsDictionary.INVALID_MONGOID_FORMAT)
            //return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
        }
    
        next();
    }
}


//middleware para controlar si tiene session
// const adminAuth = (req, res, next) => {
    
//     if(!req.session.user  || req.session.user.role !== 'admin'){
//         return res.status(200).send({origin: config.SERVER, payload: 'Acceso no autorizado'})} 
//         next();
// }
//middleware para controlar rol para acceso a private
// const verifyAuthorization = role => {
//     return async (req, res, next) => {
//         if (!req.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        
//         if (req.user._doc.role !== role) return res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
//         next();
//     }
// }

export const handlePolicies = policies => {
    return async (req, res, next) => {
        if (policies[0]=== "PUBLIC") return next();
        if(!req.user) throw new CustomError(errorsDictionary.INVALID_AUTENTICATION)
            //return res.status(401).send({status:"error", error: "Usuario no autenticado"});
       
        if(!policies.includes(req.user._doc.role)) throw new CustomError(errorsDictionary.INVALID_AUTHORIZATION)
            //return res.status(403).send({error: "Usuario no autorizado"});
        next();   
    }
}

export const generateFakeProducts = async (qty) => {
    const products = [];
    // const mongoObjectId = () =>{
    //     return (Array(12).fill(0).map(() => (Math.floor(Math.random() * 256)).toString(16).padStart(2, '0'))).join('');
    //   }

    for (let i = 0; i < qty; i++) {
        const _id = faker.database.mongodbObjectId();
        const title = faker.commerce.product()
        const description = faker.commerce.productDescription()
        const price = faker.commerce.price({ min: 100, max: 5000, dec: 0, symbol: '$' })
        const code = Math.floor(1000 + Math.random() * 9000)
        const stock = 10
        const status = true
        const category = faker.commerce.department()
 
        products.push({ _id, title, description, price, code, stock, status, category});
    }

    return products;
}