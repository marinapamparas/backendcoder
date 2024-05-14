import express from 'express';
import config from './config.js';
import products from './routes/products.routes.js';
import carts from './routes/carts.routes.js';
import views from './routes/views.routes.js'
import handlebars from "express-handlebars";
import initSocket from './sockets.js';
import mongoose from 'mongoose';

//Instancio el framework y la clase
const app = express ();

//parseo de las url:
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

//como aplicar handlebars en nuestra app, con estos metodos en app:
app.engine('handlebars', handlebars.engine());
app.set('views', `${config.DIRNAME}/views`);
app.set ('view engine', 'handlebars');

//la redireccion a las rutas:
app.use('/api/products', products);
app.use('/api/carts', carts);
app.use('/api/views', views)

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
