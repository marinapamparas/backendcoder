import { Router } from "express";
import config from "../config.js";
import UsersManager from "../dao/UsersManagerMongoDB.js";
import session from "express-session";
import { createHash, verifyRequiredBody } from "../utils.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import passport from "passport";


const sessions = Router();
const UMMDB = new UsersManager ();
initAuthStrategies();

sessions.get('/counter', async (req, res) => {
    try{
        if (req.session.counter){
            req.session.counter++
            res.status(200).send({origin: config.SERVER, payload: `Visitas: ${req.session.counter}`});
        }else{
            req.session.counter = 1;
            res.status(200).send({origin: config.SERVER, payload: 'Bienvenido!'});
        }

    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

sessions.get('/hash/:password', async (req, res) => {
    res.status(200).send({ payload: createHash (req.params.password) });
})

sessions.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
    try{
        const {email, password} = req.body;
        //corroboramos con la base de datos que ese email y password coincidan
        
        const userVerificado = await UMMDB.autenticationUser(email, password)

        if(!userVerificado){
            
            return res.status(400).send({ payload: 'El usuario es incorrecto o no existe, por favor corrige tus datos o registrate' });
        }
       

        req.session.user = { firstName: userVerificado.firstName, lastName: userVerificado.lastName, email: userVerificado.email, role: userVerificado.role, age: userVerificado.age };

        req.session.save(err =>{
            if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

            res.redirect('/api/views/products');
        })


        // res.status(200).send({origin: config.SERVER, payload: 'Bienvenido!'})
        
    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

sessions.post('/pplogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `http://localhost:8080/api/views/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try{
        req.session.user = req.user;
        
        req.session.save(err => {
            if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

        res.redirect('/api/views/products');

        })
    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

sessions.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user']}), async (req, res) => {
}); 


sessions.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        req.session.user = req.user 
        req.session.save(err => {
            if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
            res.redirect('/api/views/products');
        });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});

const adminAuth = (req, res, next) => {
    
    if(!req.session.user  || req.session.user.role !== 'admin'){
        return res.status(200).send({origin: config.SERVER, payload: 'Acceso no autorizado'})} 
        next();
}

sessions.get('/private', adminAuth, async (req, res) => {
    try{
        res.redirect ('/api/views/profile')
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

sessions.post('/register', verifyRequiredBody(['firstName','lastName','email', 'password']), async (req, res) => {
    try{
        // const userData = req.body;
        const { firstName, lastName, age, email, password} = req.body

        const user = {
            firstName : firstName,
            lastName : lastName,
            age : age,
            email : email,
            password : createHash(password)
        }

        const crearUser = await UMMDB.createUser(user)
        // console.log('crearUSer:', crearUser)
        
        // if(crearUser.message){
        //     return crearUser.message;
        // }
        
        if(!crearUser){
            res.status(400).send({origin:config.SERVER, payload:'El mail que ingresaste ya esta registrado'})
        }
        res.redirect('/api/views/login');
    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
});

sessions.post('/ppregister', verifyRequiredBody(['firstName','lastName','email', 'password']),passport.authenticate('register', { failureRedirect: `http://localhost:8080/api/views/register?error=${encodeURI('No se pudo hacer el registro exitosamente')}`}), async (req, res) => {
    try{
        // const userData = req.body;
        // const { firstName, lastName, age, email, password} = req.body

        // const user = {
        //     firstName : firstName,
        //     lastName : lastName,
        //     age : age,
        //     email : email,
        //     password : createHash(password)
        // }

        // const crearUser = await UMMDB.createUser(user)
        // console.log('crearUSer:', crearUser)
        
        // if(crearUser.message){
        //     return crearUser.message;
        // }
        
        // if(!crearUser){
        //     res.status(400).send({origin:config.SERVER, payload:'El mail que ingresaste ya esta registrado'})
        // }
        // res.redirect('/api/views/login');
        console.log('req.user en sessions routes:', req.user)
        req.session.user = req.user;
        
        req.session.save(err => {
            if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

        res.redirect('/api/views/login');

        })
    
    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
});

sessions.get('/logout', async (req, res) => {
    try{
        req.session.destroy((err) =>{
            if(err) return res.status(500).send({origin: config.SERVER, payload: 'Error al ejecutar el logout'});
            res.redirect('/api/views/login');
            // res.status(200).send({origin:config.SERVER, payload: 'Usuario desconectado'});
        })
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})



export default sessions;