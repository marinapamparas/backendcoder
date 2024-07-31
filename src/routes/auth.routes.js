import { Router } from "express";
import config from "../config.js";
//import UsersManager from "../controllers/UsersManagerMongoDB.js";
import UsersManager from "../controllers/users.manager.js";
import session from "express-session";
import { handlePolicies, verifyRequiredBody, createToken, verifyToken } from "../services/utils.js";
import initAuthStrategies, { passportCall } from "../services/auth/passport.strategies.js";
import passport from "passport";
import nodemailer from "nodemailer";
import moment from "moment";




const auth = Router();
const UMMDB = new UsersManager ();
initAuthStrategies();


//configuracion de un transporte:
const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});


auth.get('/current', passport.authenticate('current', { failureRedirect: `/current?error=${encodeURI('No hay un token registrado')}`}), async (req, res) => {
    const currentToken = req.user._doc;
    const { password, role, _id, ...filteredCurrent } = currentToken;

    res.status(200).send({ payload: filteredCurrent });
})


auth.post('/jwtlogin', verifyRequiredBody(['email', 'password']), passport.authenticate('login', { failureRedirect: `/login?error=${encodeURI('Usuario o clave no válidos')}`}), async (req, res) => {
    try {
        const token = createToken(req.user, '1h');
        const date = moment().format('DD-MM-YYYY HH:mm:ss');
        
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        req.logger.info(`Se ha loggueado exitosamente ${req.user._doc.firstName} ${date}`)
        res.redirect('/api/views/products');

    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


auth.get('/ghlogin', passport.authenticate('ghlogin', {scope: ['user:email']}), async (req, res) => {
}); 


auth.get('/ghlogincallback', passport.authenticate('ghlogin', {failureRedirect: `/login?error=${encodeURI('Error al identificar con Github')}`}), async (req, res) => {
    try {
        
        const token = createToken(req.user, '1h');
        
        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        res.redirect('/api/views/products');
        
        
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});


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



auth.post('/jwtregister', verifyRequiredBody(['firstName','lastName','email', 'password']),passport.authenticate('register', { failureRedirect: `http://localhost:8080/api/views/register?error=${encodeURI('No se pudo hacer el registro exitosamente')}`}), async (req, res) => {
    try{
        const date = moment().format('DD-MM-YYYY HH:mm:ss');
        req.logger.info(`Se ha registrado exitosamente un usuario ${date}`);
        await transport.sendMail({
            from: `no-reply <${config.GMAIL_APP_USER}>`, 
            to: `${req.user._doc.email}`,
            subject: 'Registro exitoso',
            html: '<div><img src="cid:logo1" width="50" height="50"></img><h2>Bienvenido!</h2><h3>Te registraste exitosamente a mi ecommerce!</h3><br><p>Gracias por formar parte de nuestro sistema</p> <br><p>Esperamos recibir muchas compras de tu parte</p> <br><p>por favor no responder este mail, es automático</p></div>',
            // attachments:[{
            //     filename:'logo.jpeg',
            //     path:__dirname+'public/img/logo.jpeg',
            //     cid:'logo1'
            // }]
        });
        
        res.redirect('/api/views/login');

    
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
});

auth.get('/logout', async (req, res) => {
    try{
        const date = moment().format('DD-MM-YYYY HH:mm:ss');
        req.logger.info(`Se ha desconectado ${req.user._doc.firstName} ${date}`);
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