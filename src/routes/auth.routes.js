import { Router } from "express";
import config from "../config.js";
//import UsersManager from "../controllers/UsersManagerMongoDB.js";
import UsersManager from "../controllers/users.manager.js";
import session from "express-session";
import { createHash, verifyRequiredBody, createToken, verifyToken } from "../services/utils.js";
import initAuthStrategies, { passportCall } from "../services/auth/passport.strategies.js";
import passport from "passport";


const auth = Router();
const UMMDB = new UsersManager ();
initAuthStrategies();


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

//middleware para controlar las politicas de autorizacion de los clientes en base a sus roles
const handlePolicies = policies => {
    return async (req, res, next) => {
        if (policies[0]=== "PUBLIC") return next();
        if(!req.user) return res.status(401).send({status:"error", error: "Usuario no autenticado"});
       
        if(!policies.includes(req.user._doc.role.toUpperCase())) return res.status(403).send({error: "Usuario no autorizado"});
        next();   
    }
}




// auth.get('/counter', async (req, res) => {
//     try{
//         if (req.session.counter){
//             req.session.counter++
//             res.status(200).send({origin: config.SERVER, payload: `Visitas: ${req.session.counter}`});
//         }else{
//             req.session.counter = 1;
//             res.status(200).send({origin: config.SERVER, payload: 'Bienvenido!'});
//         }

//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// })


//para crear contraseñas hasheadas 
// auth.get('/hash/:password', async (req, res) => {
//     res.status(200).send({ payload: createHash (req.params.password) });
// })

auth.get('/current', passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`}), async (req, res) => {
    const currentToken = req.user._doc;
    res.status(200).send({ payload: currentToken });
})

//passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`})

// auth.post('/login', verifyRequiredBody(['email', 'password']), async (req, res) => {
//     try{
//         const {email, password} = req.body;
//         //corroboramos con la base de datos que ese email y password coincidan
        
//         const userVerificado = await UMMDB.autenticationUser(email, password)

//         if(!userVerificado){
            
//             return res.status(400).send({ payload: 'El usuario es incorrecto o no existe, por favor corrige tus datos o registrate' });
//         }
       

//         req.session.user = { firstName: userVerificado.firstName, lastName: userVerificado.lastName, email: userVerificado.email, role: userVerificado.role, age: userVerificado.age };

//         req.session.save(err =>{
//             if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

//             res.redirect('/api/views/products');
//         })


//         // res.status(200).send({origin: config.SERVER, payload: 'Bienvenido!'})
        
    
//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// })

// auth.post('/sessionlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `http://localhost:8080/api/views/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
//     try{
//         req.session.user = req.user;
        
//         req.session.save(err => {
//             if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

//         res.redirect('/api/views/products');

//         })
    
//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// })

auth.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        // Passport inyecta los datos del done en req.user
        // Creamos un token (una nueva credencial) para enviarle al usuario
        const token = createToken(req.user, '1h');
        
        // Notificamos al navegador para que almacene el token en una cookie
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        res.redirect('/api/views/products');

        // res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado'});

        // También podemos retornar el token en la respuesta, en este caso el cliente tendrá
        // que almacenar manualmente el token.
        // res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado', token: token });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


auth.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user:email']}), async (req, res) => {
}); 


auth.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        // req.session.user = req.user 
        // req.session.save(err => {
        //     if (err) return res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
        
        const token = createToken(req.user, '1h');
        
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        res.redirect('/api/views/products');
        
        // });
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});



// //endpoint para chequear a mano el token
// auth.get('/private', verifyToken, verifyAuthorization ('admin'), async (req, res) => {
//     try{
        
//         res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido admin!' })
//         // res.redirect ('/api/views/profile')
//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// })

//endpoint para chequear a traves de passport el token
auth.get('/ppprivate', passportCall('jwtlogin'), handlePolicies (['ADMIN', 'PREMIUM']), async (req, res) => {
    try{
        console.log(req.user._doc.role)
        res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido, tenes token con autorización!' })
        // res.redirect ('/api/views/profile')
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

// auth.post('/register', verifyRequiredBody(['firstName','lastName','email', 'password']), async (req, res) => {
//     try{
//         // const userData = req.body;
//         const { firstName, lastName, age, email, password} = req.body

//         const user = {
//             firstName : firstName,
//             lastName : lastName,
//             age : age,
//             email : email,
//             password : createHash(password)
//         }

//         const crearUser = await UMMDB.createUser(user)
                
//         if(!crearUser){
//             res.status(400).send({origin:config.SERVER, payload:'El mail que ingresaste ya esta registrado'})
//         }
//         res.redirect('/api/views/login');
    
//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// });

// auth.post('/sessionregister', verifyRequiredBody(['firstName','lastName','email', 'password']),passport.authenticate('register', { failureRedirect: `http://localhost:8080/api/views/register?error=${encodeURI('No se pudo hacer el registro exitosamente')}`}), async (req, res) => {
//     try{
 
//         req.session.user = req.user;
        
//         req.session.save(err => {
//             if (err) return res.status(500).send({origin:config.SERVER, payload: null, error: err.message});

//         res.redirect('/api/views/login');

//         })
    
    
//     } catch (err){
//         res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
//     }
// });

auth.post('/jwtregister', verifyRequiredBody(['firstName','lastName','email', 'password']),passport.authenticate('register', { failureRedirect: `http://localhost:8080/api/views/register?error=${encodeURI('No se pudo hacer el registro exitosamente')}`}), async (req, res) => {
    try{
 
        res.redirect('/api/views/login');

    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
});

auth.get('/logout', async (req, res) => {
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



export default auth;