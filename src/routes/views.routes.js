import { Router } from "express";
import { ProductManager } from '../dao/ProductManager.js';
import  initSocket  from '../sockets.js';
import { ProductManagerMongoDb } from "../dao/ProductManagerMongoDb.js";
import { MessagesManager } from "../dao/MessagesManager.js";




const views = Router();
//const PME = new ProductManager ("Products.json")
const PMMDB = new ProductManagerMongoDb()



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

    try{

        const productsFile = await PMMDB.getAllProducts()
        const data = {data : productsFile}
        res.status(200).render('home', data)
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});

export default views;