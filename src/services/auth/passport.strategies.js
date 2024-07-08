import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import UsersManager from '../../controllers/UsersManagerMongoDB.js';
import { CartManagerMongoDb } from '../../controllers/CartManagerMongoDb.js';
import GitHubStrategy from 'passport-github2';
import config from '../../config.js';
import { createHash } from '../utils.js';


const localStrategy = local.Strategy;
const jwtStrategy = jwt.Strategy;
const jwtExtractor = jwt.ExtractJwt;
const UMMDB = new UsersManager();
const CMMDB = new CartManagerMongoDb();

//extractor de cookie porque passport no recupera por si mismo las cookies, es para recuperar el token
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) token = req.cookies[`${config.APP_NAME}_cookie`];
    
    return token;
}



const initAuthStrategies = () => {
    passport.use ('login', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            try {
                
                const foundUser = await UMMDB.autenticationUser(username, password);

                if (foundUser) {
                    const { password, ...filteredFoundUser } = foundUser;
                    return done(null, filteredFoundUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));

    //Estrategia tipo local para register
    passport.use ('register', new localStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            try {

                const { firstName, lastName, age } = req.body;
                

                const newCart = await CMMDB.createCart();
                
                const user = {
                    firstName : firstName,
                    lastName : lastName,
                    age : age,
                    email : username,
                    password : createHash(password),
                    _cart_id: newCart._id 
                }

                const foundUser = await UMMDB.createUser(user);

                if (foundUser) {
                    const { password, ...filteredFoundUser } = foundUser;
                    console.log('filteredFoundUser en passport', filteredFoundUser)
                    return done(null, filteredFoundUser);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));



    // Estrategia de autenticacion con GitHub
    passport.use('ghlogin', new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                
                
        
                        
        
                        

                const emailsList = profile.emails || null;
                let email = profile._json?.email || null;
                const password = null;
                
                if (!emailsList && !email) {
        
                    const response = await fetch('https://api.github.com/user/emails', {

                        headers: {

                            'Authorization': `token ${accessToken}`,

                            'User-Agent': config.APP_NAME

                        }

                    });
                    const emails = await response.json();
                    email = emails.filter(email => email.verified).map(email => ({ value: email.email }));
                }
                if (email) {
                    
                    const foundUser = await UMMDB.autenticationUser( email , password);
                    
                    if (!foundUser) {
                        const user = {
                            firstName: profile._json.name.split(' ')[0],
                            lastName: profile._json.name.split(' ')[1],
                            email: email,
                            password: 'none'
                        }

                        const process = await UMMDB.createUser(user);

                        return done(null, process);
                    } else {
                        if (foundUser) {
                            const { _id, password, ...filteredFoundUser } = foundUser;
                            return done(null, filteredFoundUser);
                        }
                    }
                } else {
                    return done(new Error('Faltan datos de perfil, email no publico'), null);
                }
            } catch (err) {
                return done(err, false);
            }
        }
    ));


    // Estrategia para verificación de token vía cookie
    passport.use('current', new jwtStrategy(
        {
            // Aquí llamamos al extractor de cookie
            jwtFromRequest: jwtExtractor.fromExtractors([cookieExtractor]),
            secretOrKey: config.SECRET
        },
        async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload);
            } catch (err) {
                return done(err);
            }
        }
    ));

    //funciones internas de passport que permiten que funcione bien, no tocar:
    
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

}


export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, function (err, user, info) {
            if (err) return next(err);
            
            if (!user) return res.status(401).send({ origin: config.SERVER, payload: null, error: 'Usuario no autenticado' });

            req.user = user;
            next();
        })(req, res, next);
    }
};

export default initAuthStrategies;