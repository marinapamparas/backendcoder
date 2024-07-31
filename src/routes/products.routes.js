import { Router } from "express";
import { ProductManager } from '../controllers/ProductManager.js';
import { uploader } from "../services/uploader.js";
import ProductsManager from "../controllers/products.manager.js";
//import { ProductManagerMongoDb } from "../controllers/ProductManagerMongoDb.js";
import initSocket from '../services/sockets.js';
import { handlePolicies, generateFakeProducts, verifyRequiredBody } from "../services/utils.js";
import config, {errorsDictionary} from "../config.js";
import CustomError from "../services/CustomError.class.js";




const products = Router();
//const PME = new ProductManager ("Products.json")
const PMMDB = new ProductsManager()
const io = initSocket();



products.param('pid', async (req, res, next, pid) =>{
    
    if (!config.MONGODB_ID_REGEX.test(pid)) {

        req.logger.error(`El ID no contiene un formato válido de MongoDB LOGGER`)
        const error = new CustomError(errorsDictionary.INVALID_MONGOID_FORMAT)
        return next (error);
        //return res.status(400).send({ origin: config.SERVER, payload: null, error: 'Id no válido' });
    }

    next();
    
});

products.get('/mockingproducts', async (req,res)=>{
    try{                
        const mockProducts = await generateFakeProducts(100)
        
        res.status(200).send({payload: mockProducts})
        
    }catch (error){
        //console.error('Error al crear mock de productos:', error);
        
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

products.get('/', async (req,res)=>{
    try{                
        
        const queryHtml = req.query.query;        
        const limitHtml = parseInt(req.query.limit);
        const pageHtml = parseInt(req.query.page);
        const sortHtml = parseInt(req.query.sort);
               
        const productsFile = await PMMDB.getPaginated(queryHtml, limitHtml, pageHtml, sortHtml);                 

        res.status(200).send({payload: productsFile})

    }catch (error){
       // console.error('Error al cargar los productos:', error);
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
        //res.status(500).send('Error del servidor');
    }
});

//GET ALL WITH FILE SYSTEM
// products.get('/', async (req,res)=>{
//     try{
//         const productsFile = await PME.getProducts()

//         const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

//         let limitedProducts = productsFile;
//         if (limit && !isNaN(limit)) {
//             limitedProducts = limitedProducts.slice(0, limit);
//         }

//         res.status(200).send({payload: limitedProducts})
    
//     }catch (error){
//         console.error('Error al leer el archivo de productos:', error);
//         res.status(500).send('Error del servidor');
//     }
// });

products.get('/:pid', async (req,res)=>{
    
    try{ 
    
        const pid= req.params.pid;
        const productsId = await PMMDB.getOne(pid)
        res.status(200).send({payload: productsId})        
        
    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
        //console.error('Error, no se encontro el producto:', error);
    }
});

//GET BY ID WITH FILE SYSTEM
// products.get('/:pid', async (req,res)=>{
    
//     try{ 
//         const pid= parseInt(req.params.pid);
        
//         const productsId = await PME.getProductById(pid)
        
//         res.status(200).send({payload: productsId})

//     }catch (error){
//         console.error('Error, no se encontro el producto:', error);
//         res.status(500).send('Error del servidor');
//     }
// });

// 

products.post('/', handlePolicies (['ADMIN']), verifyRequiredBody(["title", "description", "price", "code", "category"]), uploader.single('thumbnail'), async (req,res)=>{
    try{
        
        // Obtenemos la instancia global del objeto socketServer
        const socketServer = req.app.get('socketServer');
        

        const productData = req.body;

        const addProduct = await PMMDB.add(productData)           

        res.status(200).send({payload: addProduct})

        //emito el evento productsChanged
        socketServer.emit('productsChanged', 'Se cargo un nuevo producto' );
    
    }catch (error){
        //console.error('Error al cargar el producto:', error);
        //res.status(500).send('Error del servidor');
        throw new CustomError(errorsDictionary.RECORD_CREATION_ERROR)
    }
});

//ADD WITH FILE SYSTEM
// products.post('/', uploader.single('thumbnail'), async (req,res)=>{
//     try{
        
//         // Obtenemos la instancia global del objeto socketServer
//         const socketServer = req.app.get('socketServer');
        

//         const {
//             title,
//             description,
//             price,
//             thumbnail,
//             code,
//             stock,
//             category
//         } = req.body;

//         const addProduct = await PME.addProduct(title, description,  price, thumbnail, code, stock, category)           

//         res.status(200).send({payload: addProduct})

//         //emito el evento productsChanged
//         socketServer.emit('productsChanged', 'Se cargo un nuevo producto' );
    
//     }catch (error){
//         console.error('Error al cargar el producto:', error);
//         res.status(500).send('Error del servidor');
//     }
// });

products.put('/:pid', handlePolicies (['ADMIN']), async (req,res)=>{
    try{
        const pid = req.params.pid;
        
        const updateRequest = req.body;
        
        const options = {new : true};

        const update = await PMMDB.update(pid, updateRequest, options)

        res.status(200).send(update)
    
    }catch (error){
        
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

//UPDATE WITH FILE SYSTEM
// products.put('/:pid', async (req,res)=>{
//     try{
//         const pid = parseInt(req.params.pid);
        
//         const update = req.body;

//         const modificacion = await PME.updateProduct(pid, update)
//         res.status(200).send(modificacion)
    
//     }catch (error){
//         console.error('Error al modificar el productos', error);
//         res.status(500).send('Error del servidor');
//     }
// });

products.delete('/:pid', handlePolicies (['ADMIN']), async (req,res)=>{
    try{
        // Obtenemos la instancia global del objeto socketServer
        const socketServer = req.app.get('socketServer');

        const pid = req.params.pid;
        const productsId = await PMMDB.delete(pid)
        res.status(200).send({payload: productsId})

        //emito el evento productsChanged
        socketServer.emit('productsChanged', 'Se elimino un producto' );

    }catch (error){
        
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});


//DELETE WITH FILE SYSTEM
// products.delete('/:pid', async (req,res)=>{
//     try{
//         // Obtenemos la instancia global del objeto socketServer
//         const socketServer = req.app.get('socketServer');

//         const pid= parseInt(req.params.pid);
//         const productsId = await PME.deleteProductById(pid)
//         res.status(200).send({payload: productsId})

//         //emito el evento productsChanged
//         socketServer.emit('productsChanged', 'Se elimino un producto' );

//     }catch (error){
//         console.error('Error, no se pude borrar el producto:', error);
//         res.status(500).send('Error del servidor');
//     }
// });

products.all('*', async(req,res)=>{
    throw new CustomError(errorsDictionary.ROUTING_ERROR)
    //res.status(404).send({ origin: config.SERVER, payload: null, error: 'No se encuentra la ruta solicitada'});
});









export default products;