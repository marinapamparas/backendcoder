import { Router } from "express";
import { uploader } from "../services/uploader.js";
import ProductsManager from "../controllers/products.manager.js";
import initSocket from '../services/sockets.js';
import { handlePolicies, verifyRequiredBody, verifyMongoDBId, verifyToken } from "../services/utils.js";
import config, {errorsDictionary} from "../config.js";
import CustomError from "../services/CustomError.class.js";
import nodemailer from "nodemailer";



const products = Router();
const PMMDB = new ProductsManager()
const io = initSocket();

//configuracion de un transporte:
const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});


products.param('pid', verifyMongoDBId())

export const checkOwnership = async (pid, email) => {
    const product = await PMMDB.getOne(pid);
    if (!product) return false;
    return product.owner === email;
}


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


products.post('/', handlePolicies (['ADMIN', 'PREMIUM']), verifyRequiredBody(["title", "description", "price", "code", "category", "status"]), uploader.single('thumbnail'), async (req,res)=>{
    try{
        
        // Obtenemos la instancia global del objeto socketServer
        const socketServer = req.app.get('socketServer');
        
        
        const productData = req.body;
        
        const product = { ...productData, owner: req.user._doc.email };
        
        const added = await PMMDB.add(product)           
        
        res.status(200).send({payload: "Se creo el producto exitosamente"})

        //emito el evento productsChanged
        socketServer.emit('productsChanged', 'Se cargo un nuevo producto' );
    
    }catch (error){
        console.error('Error al cargar el producto:', error);
        throw new CustomError(errorsDictionary.RECORD_CREATION_ERROR)
    }
});

products.put('/:pid', verifyToken, handlePolicies (['ADMIN', 'PREMIUM']), async (req,res)=>{
    try{
        const pid = req.params.pid;
        
        const updateRequest = req.body;
        const email = req.user._doc.email;
        const options = {new : true};

        let proceedWithUpdate = true;
        if (req.user._doc.role === 'PREMIUM') proceedWithUpdate = await checkOwnership(pid, email);


        if (proceedWithUpdate) {
            // Ejecutar llamada a método para modificar el producto
            await PMMDB.update(pid, updateRequest, options)
          
            res.status(200).send({ origin: config.SERVER, payload: 'Producto modificado' });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: 'No tiene permisos para modificar el producto' });
        }

        
    
    }catch (error){
        
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

products.delete('/:pid', verifyToken, handlePolicies (['ADMIN', 'PREMIUM']), async (req,res)=>{
    try{
        // Obtenemos la instancia global del objeto socketServer
        const socketServer = req.app.get('socketServer');

        const pid = req.params.pid;
        const email = req.user._doc.email;
        let proceedWithDelete = true;
        if (req.user._doc.role === 'PREMIUM') proceedWithDelete = await checkOwnership(pid, email);

        if (proceedWithDelete) {
            // Ejecutar llamada a método para borrar producto
            await PMMDB.delete(pid)
            //mando mail avisando que elimino un producto:
            await transport.sendMail({
                from: `no-reply <${config.GMAIL_APP_USER}>`, 
                to: `${req.user._doc.email}`,
                subject: 'Eliminaste un producto',
                html: '<div><h2>Hola!</h2><br><p>Eliminaste un producto que te pertenece, si fue un error podes volver a cargarlo desde tu perfil</p><br><p>Este es un email automático, por favor no responder</p></div>',
            });

            
            //emito el evento productsChanged
            socketServer.emit('productsChanged', 'Se elimino un producto' );

            res.status(200).send({ origin: config.SERVER, payload: 'Producto borrado' });
        } else {
            res.status(200).send({ origin: config.SERVER, payload: 'No tiene permisos para borrar el producto' });
        }

    }catch (error){
        
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

products.all('*', async(req,res)=>{
    throw new CustomError(errorsDictionary.ROUTING_ERROR)
});


export default products;