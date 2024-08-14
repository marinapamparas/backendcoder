import { Router } from "express";
//import { CartManager } from "../dao/CartManager.js";
//import { CartManagerMongoDb } from "../controllers/CartManagerMongoDb.js";
import CartsManager from '../controllers/carts.manager.js';
import { handlePolicies, verifyToken } from "../services/utils.js";
import passport from "passport";
import { checkOwnership } from "./products.routes.js";
import config, {errorsDictionary} from "../config.js";
import CustomError from "../services/CustomError.class.js";


const carts = Router();
// const CME = new CartManager ("Carts.json")
const CMMDB = new CartsManager ()



carts.get('/:cid', async (req,res)=>{
    try{ 
        const cid= req.params.cid;
        
        const CartsId = await CMMDB.getOne(cid)

        res.status(200).send({payload: CartsId})

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

//passport.authenticate('current', { failureRedirect: `/:cid/purchase?error=${encodeURI('No se pudo recuperar el usuario')}`})

carts.get('/:cid/purchase', passport.authenticate('current', { failureRedirect: `/purchase?error=${encodeURI('No hay un token registrado')}`}), async (req,res)=>{
    try{ 
    const cid = req.params.cid
    
    const user =  req.user._doc;  // Recuperar el usuario autenticado

    if (!user) {
        throw new Error('No se pudo recuperar el usuario');
    }
    
    const purchaseResponse = await CMMDB.validationPurchase(cid, user)
    

    // res.redirect('/api/views/ticket')
    res.status(200).send({payload: purchaseResponse})
    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});


carts.post('/', async (req,res)=>{
    try{
        await CMMDB.add()

        res.status(200).send('The cart has been created succesfully')

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }

});
//handlePolicies (['USER']),
carts.post('/:cid/product/:pid', async (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid= req.params.pid;
        const email = req.user._doc.email; 
        
        let dontAddProduct = true;
        if (req.user._doc.role === 'PREMIUM') dontAddProduct = await checkOwnership(pid, email);

        if (dontAddProduct) {
           
            res.status(200).send({ origin: config.SERVER, payload: 'No puede cargar este producto a su carrito porque le pertenece' });

        } else {

            await CMMDB.addProduct(cid, pid)

            res.status(200).send({ origin: config.SERVER, payload: 'Producto agregado al carrito exitosamente' });
        }

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

carts.delete('/:cid/product/:pid', (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid= req.params.pid;

        CMMDB.deleteProduct(cid, pid)

        res.status(200).send('Success')

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

carts.delete('/:cid', (req,res)=>{
    try{
        const cid= req.params.cid;
       

        CMMDB.deleteAllProducts(cid)

        res.status(200).send('Success')

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});

carts.put('/:cid/product/:pid/:qty', async (req,res)=>{
    try{ 
        const cid= req.params.cid;
        const pid= req.params.pid;
        const qty = req.params.qty;

        const CartsId = await CMMDB.updateProduct(cid, pid, qty)
        
        res.status(200).send({payload: CartsId})

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});






//ENDPOINTS CON FILE SYSTEM
// carts.get('/:cid', async (req,res)=>{
//     try{ 
//         const cid= parseInt(req.params.cid);
        
//         const CartsId = await CME.getCartById(cid)
        
//         res.status(200).send({payload: CartsId})

//     }catch (error){
//         console.error('Error, the cart doesnt exists:', error);
//         res.status(500).send('Server error');
//     }
// });

// carts.post('/', async (req,res)=>{
//     try{
//         await CME.createCart()

//         res.status(200).send('The cart has been created succesfully')

//     }catch (error){
//         console.error('Error, the cart has not been created', error);
//         res.status(500).send('Server error');
//     }

// });

// carts.post('/:cid/product/:pid', (req,res)=>{
//     try{
//         const cid= parseInt(req.params.cid);
//         const pid= parseInt(req.params.pid);

//         CME.addProduct(cid, pid)

//         res.status(200).send('Success')

//     }catch (error){
//         console.error('Error, the product has not been created', error);
//         res.status(500).send('Server error');
//     }
// });











export default carts;