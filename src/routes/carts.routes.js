import { Router } from "express";
import CartsManager from '../controllers/carts.manager.js';
import { verifyToken } from "../services/utils.js";
import passport from "passport";
import { checkOwnership } from "./products.routes.js";
import config, {errorsDictionary} from "../config.js";
import CustomError from "../services/CustomError.class.js";
import nodemailer from "nodemailer";

const carts = Router();
const CMMDB = new CartsManager ()

//configuracion de un transporte:
const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});

carts.get('/:cid', async (req,res)=>{
    try{ 
        const cid= req.params.cid;
        
        const CartsId = await CMMDB.getOne(cid)

        res.status(200).send({payload: CartsId})

    }catch (error){
        throw new CustomError(errorsDictionary.INTERNAL_ERROR)
    }
});


carts.post('/:cid/purchase', passport.authenticate('current', { failureRedirect: `/purchase?error=${encodeURI('No hay un token registrado')}`}), async (req,res)=>{
    try{ 
    const cid = req.params.cid
    
    const user =  req.user._doc;  

    if (!user) {
        throw new Error('No se pudo recuperar el usuario');
    }
    
    const purchaseResponse = await CMMDB.validationPurchase(cid, user)
    
    const ticketHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                .ticket {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #2c3e50;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <h2>Hola!</h2>
                <p>¡Realizaste exitosamente una compra en nuestro almacén!</p>
                <p><strong>Detalles del Ticket:</strong></p>
                <ul>
                    <li><strong>Monto:</strong> $${purchaseResponse.amount}</li>
                    <li><strong>Comprador:</strong> ${purchaseResponse.purchaser}</li>
                    <li><strong>ID de compra:</strong> ${purchaseResponse._id}</li>
                    <li><strong>Código:</strong> ${purchaseResponse.code}</li>
                    <li><strong>Fecha de compra:</strong> ${new Date(purchaseResponse.purchase_datetime).toLocaleString()}</li>
                </ul>
                <p class="footer">Este es un email automático, por favor no responder.</p>
            </div>
        </body>
        </html>
    `;

    //mando mail con el ticket de compra:
    await transport.sendMail({
        from: `no-reply <${config.GMAIL_APP_USER}>`, 
        to: `${req.user._doc.email}`,
        subject: 'Compra exitosa!',
        html: ticketHTML,
    });

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

carts.post('/:cid/product/:pid', verifyToken, async (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid= req.params.pid;
        const email = req.user._doc.email; 

        let dontAddProduct = false;
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

carts.delete('/:cid/product/:pid', async (req,res)=>{
    try{
        const cid= req.params.cid;
        const pid= req.params.pid;
       
        const result = await CMMDB.deleteProduct(cid, pid); 

        if (result && result.success) {
            res.status(200).json(result); // Envía el objeto de resultado como respuesta JSON
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }

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


export default carts;