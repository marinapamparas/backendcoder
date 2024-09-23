import express from 'express';
import config from './config.js';
import products from './routes/products.routes.js';
import carts from './routes/carts.routes.js';
import views from './routes/views.routes.js';
import uploadRouter from './routes/uploads.routes.js';
import handlebars from "express-handlebars";
import initSocket from './services/sockets.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import auth from './routes/auth.routes.js'
import users from './routes/users.routes.js';
import test from './routes/test.routes.js';
//import TestRouter from './routes/test.routes.js';
import passport from 'passport';
import MongoSingleton from './services/mongo.singleton.js';
import cors from 'cors';
import errorsHandler from './services/errors.handler.js';
import { logger, addLogger } from './services/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import cluster from 'cluster';
import { cpus } from 'os';



// if(cluster.isPrimary){
//     for (let i=0; i < cpus().length; i++) cluster.fork();
// }else{
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
    
    const hbs = handlebars.create({
        helpers: {
            eq: function (a, b) {
                return a === b;
            }
        }
    });

    app.engine('handlebars', hbs.engine);
    app.set('views', `${config.DIRNAME}/views`);
    app.set ('view engine', 'handlebars');
    
    //la redireccion a las rutas:
    app.use(addLogger)
    app.use('/api/products', products);
    app.use('/api/carts', carts);
    app.use('/', views);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/test', test);
    app.use('/api/uploads', uploadRouter);

    app.use(errorsHandler);
    
    // Ruta para redirigir a /products
    app.get('/', (req, res) => {
        res.redirect('/products');
    });
    app.get('/favicon.ico', (req, res) => res.status(204));


    //app.use('/api/test', new TestRouter().getRouter());
    //la parte estatica que se muestra:
    app.use('/', express.static('src/public'));
    
    // Generamos objeto base config Swagger y levantamos endpoint para servir la documentación
    const swaggerOptions = {
        definition: {
            openapi: '3.0.1',
            info: {
                title: 'Documentación',
                description: 'Esta documentación cubre toda la API habilitada para Pamparas - Ecommerce',
                version: '1.0.0'
            },
        },
        apis: ['src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
    };

    const specs = swaggerJSDoc(swaggerOptions);
    app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

    //Escucha Http
    const expressInstance = app.listen(config.PORT, async () => {
    
        // await mongoose.connect(config.MONGODB_URI);
        MongoSingleton.getInstance();
        console.log(`Servidor activo en puerto ${config.PORT} PID ${process.pid} enlazada a bbdd ${config.MONGODB_URI}`)
        
    });
    
    //Escucha Socket
    const socketServer = initSocket(expressInstance);
    app.set('socketServer', socketServer);


 
    
    

// }


