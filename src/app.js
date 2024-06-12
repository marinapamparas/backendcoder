import express from 'express';
import config from './config.js';
import products from './routes/products.routes.js';
import carts from './routes/carts.routes.js';
import views from './routes/views.routes.js'
import handlebars from "express-handlebars";
import initSocket from './sockets.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import sessions from './routes/sessions.routes.js'
import users from './routes/users.routes.js';
import passport from 'passport';


//Instancio el framework y la clase
const app = express ();

//parseo de las url:
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(cookieParser(config.SECRET));
app.use(session({
    //store: new fileStorage({path:'./sessions', ttl:100, retries:0}),
    store: MongoStore.create({
        mongoUrl: config.MONGOSDB_URI,
        ttl: 600
    }),
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

//como aplicar handlebars en nuestra app, con estos metodos en app:
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set ('view engine', 'handlebars');

//la redireccion a las rutas:
app.use('/api/products', products);
app.use('/api/carts', carts);
app.use('/api/views', views);
app.use('/api/users', users);
app.use('/api/sessions', sessions);
//la parte estatica que se muestra:
// app.use('/', express.static('src/public'));



//Escucha Http
const expressInstance = app.listen(config.PORT, async () => {

    await mongoose.connect(config.MONGOSDB_URI);
    console.log(`Servidor activo en puerto ${config.PORT} enlazada a bbdd`)
});

//Escucha Socket
const socketServer = initSocket(expressInstance);
app.set('socketServer', socketServer);
