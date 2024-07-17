import { Router } from "express";
import  initSocket  from '../services/sockets.js';
import ProductsManager from "../controllers/products.manager.js";
//import { CartManagerMongoDb } from "../controllers/CartManagerMongoDb.js";
import CartsManager from "../controllers/carts.manager.js";
import { handlePolicies } from "../services/utils.js";


const views = Router();
const PMMDB = new ProductsManager()
const CMMDB = new CartsManager ()


const socket = initSocket();
socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
});


views.get('/', async (req,res)=>{

    try{

        const productsFile = await PMMDB.getPaginated()
        const productsList = JSON.parse(JSON.stringify(productsFile.docs));
       
        const data = {data : productsList}
        res.status(200).render('home', data)
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/realtimeproducts', async (req,res)=>{
    try{        
        const productsFile = await PMMDB.getPaginated()
        
        const productsList = JSON.parse(JSON.stringify(productsFile.docs));
        const data = {data : productsList}
        res.status(200).render('realtimeproducts', data)

    }catch (error){
        console.error('Error al cargar el producto:', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/chat', handlePolicies (['USER']), async (req,res)=>{

    try{
        
        res.status(200).render('chat', {})
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});

views.get('/products', async (req,res)=>{

  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt (req.query.limit) || 5;
    const sort = 1;
    const query = "";

    try{
        
        const products = await PMMDB.getPaginated(query, limit, page, sort);
        const productsString = JSON.parse(JSON.stringify(products));
        res.status(200).render('products', {
            products: productsString.docs,
            totalPages: productsString.totalPages,
            currentPage: page,
            showPrev: page > 1,
            showNext: page < productsString.totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < productsString.totalPages ? page + 1 : null,
            userJWT: req.user._doc ? req.user._doc : req.user
        });
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});


views.get('/cart/:cid', async (req,res)=>{

    try{
          
        const cid = req.params.cid;
        let cartProducts = await CMMDB.getOne(cid);
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
        if (req.user) return res.redirect('/api/views/products')
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
        if(!req.user) return res.redirect('/api/views/login');
        res.status(200).render('profile', { user: req.user });
    
    }catch (error){
        console.error('Error cargar el chat', error);
        res.status(500).send('Error del servidor');
    }
});


export default views;