import { Router } from "express";

import { UsersManager } from "../dao/UsersManagerMongoDB.js";


const users = Router();

const UMMDB = new UsersManager ()



users.get('/:cid', async (req,res)=>{
    try{ 
        const cid= req.params.cid;
        
        const CartsId = await CMMDB.getCartById(cid)
        
        res.status(200).send({payload: CartsId})

    }catch (error){
        console.error('Error, the cart doesnt exists:', error);
        res.status(500).send('Server error');
    }
});


users.post('/createUser', async (req,res)=>{
    try{

        const userData = req.body;

        const addUser = await UMMDB.createUser(userData)           

        res.status(200).send({payload: addUser})

       
    }catch (error){
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error del servidor');
    }
});





export default users;