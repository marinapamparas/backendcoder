import { Router } from "express";
import { CartManager } from "../CartManager.js";


const carts = Router();
const CME = new CartManager ("Carts.json")


carts.get('/:cid', async (req,res)=>{
    try{ 
        const cid= parseInt(req.params.cid);
        
        const CartsId = await CME.getCartById(cid)
        
        res.status(200).send({payload: CartsId})

    }catch (error){
        console.error('Error, the cart doesnt exists:', error);
        res.status(500).send('Server error');
    }
});

carts.post('/', async (req,res)=>{
    try{
        await CME.createCart()

        res.status(200).send('The cart has been created succesfully')

    }catch (error){
        console.error('Error, the cart has not been created', error);
        res.status(500).send('Server error');
    }

});

carts.post('/:cid/product/:pid', (req,res)=>{
    try{
        const cid= parseInt(req.params.cid);
        const pid= parseInt(req.params.pid);

        CME.addProduct(cid, pid)

        res.status(200).send('Success')

    }catch (error){
        console.error('Error, the product has not been created', error);
        res.status(500).send('Server error');
    }
});











export default carts;