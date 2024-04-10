import express from 'express';
import { ProductManager } from './ProductManager.js';

//Instancio el framework y la clase
const app = express ();
const PME = new ProductManager ()


//Endpoint con query
app.get('/products', async (req,res)=>{
    try{
        const productsFile = await PME.getProducts()

        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

        let limitedProducts = productsFile;
        if (limit && !isNaN(limit)) {
            limitedProducts = limitedProducts.slice(0, limit);
        }

        res.send({status:1, payload: limitedProducts})
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
})


//Endpoint con params
app.get('/products/:pid', async (req,res)=>{
    
    try{ 
        const pid= parseInt(req.params.pid);
        
        const productsId = await PME.getProductById(pid)
        
        res.send({status:1, payload: productsId})

    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
    
})

//Escucha
app.listen (8080, ()=>{
    console.log('Servidor activo en puerto 8080')
})