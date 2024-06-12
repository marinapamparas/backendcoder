import passport from 'passport';
import local from 'passport-local';
import UsersManager  from "../dao/UsersManagerMongoDB.js";
import GitHubStrategy from 'passport-github2';
import config from '../config.js';
import { createHash } from '../utils.js';

const localStrategy = local.Strategy;
const UMMDB = new UsersManager();


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

                const user = {
                    firstName : firstName,
                    lastName : lastName,
                    age : age,
                    email : username,
                    password : createHash(password)
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
                
                const email = profile._json?.email || null;
                const password = null;
                console.log('email:', email)
                
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
                        return done(null, foundUser);
                    }
                } else {
                    return done(new Error('Faltan datos de perfil'), null);
                }
            } catch (err) {
                return done(err, false);
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

export default initAuthStrategies;