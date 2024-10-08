import { Router } from "express";
import config from "../config.js";
import UsersManager from "../controllers/users.manager.js";
import { handlePolicies, verifyRequiredBody, createToken, verifyToken, isValidPassword, createHash } from "../services/utils.js";
import initAuthStrategies, { passportCall } from "../services/auth/passport.strategies.js";
import passport from "passport";
import nodemailer from "nodemailer";
import moment from "moment";




const auth = Router();
const UMMDB = new UsersManager ();
initAuthStrategies();


//configuracion de un transporte para mailing:
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
        const date = moment().toDate();
        
        await UMMDB.update(req.user._doc._id, { last_connection: date });

        res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });
        
        req.logger.info(`Se ha loggueado exitosamente ${req.user._doc.firstName} ${date}`)
        
        //normalmente haria un redirect a otra plantilla de handlebars, pero para que funcione el supertest y reciba un payload y no un {} vacio, voy a comentar el redirect y dejar este res.status: 
        
        //res.status(200).send({ origin: config.SERVER, payload: 'El usuario se ha logueado exitosamente' })
        res.redirect('/products');

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

        res.redirect('/products');
        
        
    } catch (err) {
        res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
});



auth.get('/ppprivate', passportCall('jwtlogin'), handlePolicies (['ADMIN', 'PREMIUM']), async (req, res) => {
    try{
        console.log(req.user._doc.role)
        if(req.user._doc.role === 'ADMIN' || req.user._doc.role === 'ADMIN' ){

            res.status(200).send({ origin: config.SERVER, payload: 'Bienvenido, tenes token con autorización!' })
        }else{
            res.status(404).send({ origin: config.SERVER, payload: 'No tenes autorizacion' })
        }
        
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})


auth.post('/jwtregister', verifyRequiredBody(['firstName','lastName','email', 'password', 'age']),passport.authenticate('register', { failureRedirect: `http://localhost:8080/register?error=${encodeURI('No se pudo hacer el registro exitosamente')}`}), async (req, res) => {
    try{
        const date = moment().toDate();
        
        req.logger.info(`Se ha registrado exitosamente un usuario ${date}`);
        await transport.sendMail({
            from: `no-reply <${config.GMAIL_APP_USER}>`, 
            to: `${req.user._doc.email}`,
            subject: 'Registro exitoso',
            html: '<div><img src="cid:logo1" width="50" height="50"></img><h2>Bienvenido!</h2><h3>Te registraste exitosamente a mi ecommerce!</h3><br><p>Gracias por formar parte de nuestro sistema</p> <br><p>Esperamos recibir muchas compras de tu parte</p> <br><p>por favor no responder este mail, es automático</p></div>',
            
        });
        res.redirect('/login')
        //hago un redirect a otra plantilla de handlebars para una mejor experiencia de usuario, 
        //pero para que funcione el supertest y reciba un payload y no un {} vacio, voy a dejar este res.status: 
        
        // res.status(200).send({ origin: config.SERVER, payload: 'El usuario se registro exitosamente' })

    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
});

auth.post('/restorepassword', async (req, res) => {
    try{
        
        const email = req.body.email
       
        const user = await UMMDB.autenticationUser(email, "")
        
        if(user){

            const { _id, _cart_id, ...filteredFoundUser } = user;
           
            const token = createToken(filteredFoundUser, '1h');

            
            res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 60 * 60 * 1000, httpOnly: true });


            await transport.sendMail({
                from: `no-reply <${config.GMAIL_APP_USER}>`, 
                to: `${user.email}`,
                subject: 'Recupero de contraseña',
                html: `<div><h2>¿Olvidaste tu contraseña?</h2><h3>Para restaurarla ingresa a este link:</h3><p>https://almacenonline.onrender.com/restore?temp_token=${token}</p><br><p>por favor no responder este mail, es automático</p></div>`
                
            });
            res.redirect('/emailrecoverysend')

        }else{
            res.redirect('/passwordrecovery');

        }




        
    } catch (err){
        
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

auth.post('/restorepassword2', verifyToken, async (req, res) => {
    try{

        if(!verifyToken){
            res.redirect('/passwordrecovery')
        }
        const user = req.user._doc
        const password = req.body.password
        const repeatPassword = req.body.repeatPassword
        
        if(password === repeatPassword){
            
            if (await isValidPassword(user, password) === false){
                const newPassword = createHash(password)
                await UMMDB.update(user._id, {"password": newPassword})
                res.status(200).send({origin:config.SERVER, payload: "La contraseña ha sido modificada exitosamente"})
            } else {
                res.status(400).send({origin:config.SERVER, payload:"La contraseña ingresada no puede ser igual a la que tenías previamente."})
            }
        }
        
    } catch (err){
        console.log(err)
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})

auth.get('/logout', async (req, res) => {
    try{
        const date = moment().format('DD-MM-YYYY HH:mm:ss');
        req.logger.info(`Se ha desconectado ${req.user._doc.firstName} ${date}`);
        req.session.destroy((err) =>{
            if(err) return res.status(500).send({origin: config.SERVER, payload: 'Error al ejecutar el logout'});

            res.redirect('/login');
            // res.status(200).send({origin:config.SERVER, payload: 'Usuario desconectado'});
        })
    } catch (err){
        res.status(500).send({origin:config.SERVER, payload:null, error: err.messages})
    }
})



export default auth;