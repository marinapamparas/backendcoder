import express from 'express';
import config from './config.js';
import products from './routes/products.routes.js';
import carts from './routes/carts.routes.js';
import views from './routes/views.routes.js'
import handlebars from "express-handlebars";
import initSocket from './services/sockets.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import auth from './routes/auth.routes.js'
import users from './routes/users.routes.js';
//import TestRouter from './routes/test.routes.js';
import passport from 'passport';
import MongoSingleton from './services/mongo.singleton.js';
import cors from 'cors';
import errorsHandler from './services/errors.handler.js';
import addLogger from './services/logger.js';

//Instancio el framework y la clase
const app = express ();

//parseo de las url:
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(cookieParser(config.SECRET));
app.use(session({
    //store: new fileStorage({path:'./sessions', ttl:100, retries:0}),
    store: MongoStore.create({
        mongoUrl: config.MONGODB_URI,
        ttl: 600
    }),
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

//politica de cors abierto
app.use(cors({
    origin: '*'
}));

//como aplicar handlebars en nuestra app, con estos metodos en app:
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set ('view engine', 'handlebars');

//la redireccion a las rutas:
app.use(addLogger)
app.use('/api/products', products);
app.use('/api/carts', carts);
app.use('/api/views', views);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use(errorsHandler);

//app.use('/api/test', new TestRouter().getRouter());
//la parte estatica que se muestra:
// app.use('/', express.static('src/public'));



//Escucha Http
const expressInstance = app.listen(config.PORT, async () => {

    // await mongoose.connect(config.MONGODB_URI);
    MongoSingleton.getInstance();
    console.log(`Servidor activo en puerto ${config.PORT} PID ${process.pid} enlazada a bbdd ${config.MONGODB_URI}`)
    
});

//Escucha Socket
const socketServer = initSocket(expressInstance);
app.set('socketServer', socketServer);
