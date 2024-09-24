import { Router } from "express";
import  initSocket  from '../services/sockets.js';
import ProductsManager from "../controllers/products.manager.js";
import CartsManager from "../controllers/carts.manager.js";
import { handlePolicies, verifyToken } from "../services/utils.js";
import CustomError from "../services/CustomError.class.js";
import { errorsDictionary } from "../config.js";
import UsersManager from "../controllers/users.manager.js";


const views = Router();
const PMMDB = new ProductsManager()
const CMMDB = new CartsManager ()
const UMMDB = new UsersManager ()


const socket = initSocket();
socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
});

views.get('/', async (req,res)=>{

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt (req.query.limit) || 5;
    const sort = 1;
    const query = "";

    try{
        
        const products = await PMMDB.getPaginated(query, limit, page, sort);
        const productsString = JSON.parse(JSON.stringify(products));
        res.status(200).render('home', {
            products: productsString.docs,
            totalPages: productsString.totalPages,
            currentPage: page,
            showPrev: page > 1,
            showNext: page < productsString.totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < productsString.totalPages ? page + 1 : null
        });
        
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR);
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
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/chat', handlePolicies (['USER']), async (req,res)=>{

    try{
        
        res.status(200).render('chat', {})
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
        
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
            userJWT: req.user._doc ? req.user._doc : req.user,
            cartId: JSON.parse(JSON.stringify(req.user._doc._cart_id._id))
        });
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/cart/:cid', async (req,res)=>{

    try{
          
        const cid = req.params.cid;
        let cartProducts = await CMMDB.getOne(cid);
        cartProducts = JSON.parse(JSON.stringify(cartProducts)); 
        const data = {  products: cartProducts.products, 
                        cartId: cid
        };
        
        res.status(200).render('cart', data);


    }catch (error){
        console.error('Error al recuperar el carrito:', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
        
    }
});

views.get('/login', async (req,res)=>{

    try{
        
        res.status(200).render('login', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/register', async (req,res)=>{

    try{
        
        res.status(200).render('register', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/profile', async (req,res)=>{

    try{
        
        if(!req.user) return res.redirect('/api/views/login');
        const user = req.user._doc ? req.user._doc : req.user

        res.status(200).render('profile', { user: user });
    
    }catch (error){
        console.error('Error:', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/passwordrecovery', async (req,res)=>{

    try{
        
        res.status(200).render('passwordrecovery', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/emailrecoverysend', async (req,res)=>{

    try{
        
        res.status(200).render('emailrecoverysend', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/restore', async (req,res)=>{

    try{
        
        res.status(200).render('restore', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/premiumDocs', async (req,res)=>{

    try{
        
        res.status(200).render('premiumDocs', {});
    
    }catch (error){
        console.error('Error cargar el chat', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

views.get('/administration', verifyToken, handlePolicies (['ADMIN']), async (req,res)=>{

    try{
        const users = await UMMDB.getAll();
        const usersList = JSON.parse(JSON.stringify(users));
        const data = {data : usersList}
        
        res.status(200).render('administration', data);
    
    }catch (error){
        console.error("Error en la ruta /administration: ", error);
        throw new CustomError(errorsDictionary.INVALID_AUTHORIZATION)
    }
});


export default views;