import { Router } from "express";
import { ProductManager } from '../ProductManager.js';
import { uploader } from "../uploader.js";

const products = Router();
const PME = new ProductManager ("Products.json")


products.get('/', async (req,res)=>{
    try{
        const productsFile = await PME.getProducts()

        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

        let limitedProducts = productsFile;
        if (limit && !isNaN(limit)) {
            limitedProducts = limitedProducts.slice(0, limit);
        }

        res.status(200).send({payload: limitedProducts})
    
    }catch (error){
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error del servidor');
    }
});

products.get('/:pid', async (req,res)=>{
    
    try{ 
        const pid= parseInt(req.params.pid);
        
        const productsId = await PME.getProductById(pid)
        
        res.status(200).send({payload: productsId})

    }catch (error){
        console.error('Error, no se encontro el producto:', error);
        res.status(500).send('Error del servidor');
    }
});

products.post('/', uploader.single('thumbnail'), async (req,res)=>{
    try{
        const {
            title,
            description,
            price,
            thumbnail= [req.file.path],
            code,
            stock,
            category
        } = req.body;

        const addProduct = await PME.addProduct(title, description,  price, thumbnail, code, stock, category)
        res.status(200).send({payload: addProduct})
    
    }catch (error){
        console.error('Error al cargar el producto:', error);
        res.status(500).send('Error del servidor');
    }
});

products.put('/:pid', async (req,res)=>{
    try{
        const pid = parseInt(req.params.pid);
        
        const update = req.body;

        const modificacion = await PME.updateProduct(pid, update)
        res.status(200).send(modificacion)
    
    }catch (error){
        console.error('Error al modificar el productos', error);
        res.status(500).send('Error del servidor');
    }
});

products.delete('/:pid', async (req,res)=>{
    try{
        const pid= parseInt(req.params.pid);
        const productsId = await PME.deleteProductById(pid)
        res.status(200).send({payload: productsId})

    }catch (error){
        console.error('Error, no se pude borrar el producto:', error);
        res.status(500).send('Error del servidor');
    }
});









export default products;