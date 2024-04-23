import { Router } from "express";
import { ProductManager } from '../ProductManager.js'


const carts = Router();
const PME = new ProductManager ("Carts.json")


// products.get('/:cid', (req,res)=>{
//     res.status(200).send({status: 'OK', payload: data})
// });

// products.post('/', (req,res)=>{
//     res.status(200).send({status: 'OK', payload: data})
// });

// products.post('/:cid/product/:pid', (req,res)=>{
//     res.status(200).send({status: 'OK', payload: data})
// });











export default carts;