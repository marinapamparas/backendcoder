import { Router } from "express";
import config from "../config.js";
import { UsersManager } from "../dao/UsersManagerMongoDB.js";

const sessions = Router();
const UMMDB = new UsersManager ()

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


sessions.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        //corroboramos con la base de datos que ese email y password coincidan
        
        const userVerificado = await UMMDB.autenticationUser(email, password)

        if(!userVerificado){
            
            return res.status(400).send({ payload: 'El usuario no existe, por favor registrate' });
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

sessions.post('/register', async (req, res) => {
    try{
        const userData = req.body;

        const crearUser = await UMMDB.createUser(userData)
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