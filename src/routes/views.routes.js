import { Router } from "express";
import { ProductManager } from '../dao/ProductManager.js';
import  initSocket  from '../sockets.js';
import { ProductManagerMongoDb } from "../dao/ProductManagerMongoDb.js";

import { CartManagerMongoDb } from "../dao/CartManagerMongoDb.js";
import modelProducts from '../dao/models/products.models.js';


const views = Router();
//const PME = new ProductManager ("Products.json")
const PMMDB = new ProductManagerMongoDb()
const CMMDB = new CartManagerMongoDb ()


const socket = initSocket();
socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
});


views.get('/', async (req,res)=>{

    try{

        const productsFile = await PMMDB.getAllProducts()
        const data = {data : productsFile}
        res.status(200).render('home', data)
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/realtimeproducts', async (req,res)=>{
    try{        
        const productsFile = await PMMDB.getAllProducts()
        const data = {data : productsFile}

        res.status(200).render('realtimeproducts', data)

    }catch (error){
        console.error('Error al cargar el producto:', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/chat', async (req,res)=>{

    try{
        
        res.status(200).render('chat', {})
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/products', async (req,res)=>{

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt (req.query.limit) || 5,
        lean: true
    };
    
    const query = {};

    try{
        const products = await modelProducts.paginate(query, options);

        res.status(200).render('products', {
            products: products.docs,
            totalPages: products.totalPages,
            currentPage: options.page,
            showPrev: options.page > 1,
            showNext: options.page < products.totalPages,
            prevPage: options.page > 1 ? options.page - 1 : null,
            nextPage: options.page < products.totalPages ? options.page + 1 : null,
            userSession: req.session.user
        });
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});


views.get('/cart/:cid', async (req,res)=>{

    try{
          
        const cid = req.params.cid;
        let cartProducts = await CMMDB.getCartById(cid);
        cartProducts = JSON.parse(JSON.stringify(cartProducts)); // Elimina propiedades del prototipo porque sino handlebars por seguridad no las muestra
        const data = { cart: cartProducts };
        res.status(200).render('cart', data);


    }catch (error){
        console.error('Error al recuperar el carrito:', error);
        res.status(500).send('Error del servidor');
    }
});


views.get('/login', async (req,res)=>{

    try{
        if (req.session.user) return res.redirect('/api/views/products')
        res.status(200).render('login', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});
views.get('/register', async (req,res)=>{

    try{
        
        res.status(200).render('register', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/profile', async (req,res)=>{

    try{
        if(!req.session.user) return res.redirect('/api/views/login');
        res.status(200).render('profile', { user: req.session.user });
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});


export default views;